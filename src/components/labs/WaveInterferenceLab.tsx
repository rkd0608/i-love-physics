"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const TWO_PI = Math.PI * 2;
const CELL = 4;
const SIN_N = 2048;
const SIN_MASK = SIN_N - 1;
const SIN_K = SIN_N / TWO_PI;
const SIN_OFF = 1 << 21;
const LUT_LAST = 1023;
const MAX_AMP = Math.SQRT1_2;
const INV_NORM = 1 / MAX_AMP;

const CYAN = "#53d6f2";
const GREEN = "#7ef0b0";
const S1_LABEL = "S₁";
const S2_LABEL = "S₂";
const S1_FILL = "#bff1ff";
const S2_FILL = "#ccffe4";
const MONO_FONT = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";

interface RampStop {
  p: number;
  r: number;
  g: number;
  b: number;
}

const WAVE_STOPS: RampStop[] = [
  { p: 0.0, r: 45, g: 58, b: 148 },
  { p: 0.22, r: 24, g: 34, b: 92 },
  { p: 0.38, r: 13, g: 19, b: 48 },
  { p: 0.5, r: 7, g: 12, b: 28 },
  { p: 0.62, r: 9, g: 32, b: 44 },
  { p: 0.74, r: 18, g: 106, b: 118 },
  { p: 0.86, r: 83, g: 214, b: 242 },
  { p: 1.0, r: 222, g: 255, b: 236 },
];

const GREEN_STOPS: RampStop[] = [
  { p: 0.0, r: 2, g: 5, b: 10 },
  { p: 0.35, r: 10, g: 58, b: 36 },
  { p: 0.7, r: 47, g: 174, b: 102 },
  { p: 1.0, r: 126, g: 240, b: 176 },
];

function buildRamp(stops: RampStop[]): Uint8Array {
  const lut = new Uint8Array((LUT_LAST + 1) * 3);
  for (let i = 0; i <= LUT_LAST; i++) {
    const u = i / LUT_LAST;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (u >= stops[s].p && u <= stops[s + 1].p) {
        a = stops[s];
        b = stops[s + 1];
        break;
      }
    }
    const span = b.p - a.p;
    const f = span > 0 ? (u - a.p) / span : 0;
    const o = i * 3;
    lut[o] = a.r + (b.r - a.r) * f;
    lut[o + 1] = a.g + (b.g - a.g) * f;
    lut[o + 2] = a.b + (b.b - a.b) * f;
  }
  return lut;
}

function buildSinLut(): Float32Array {
  const lut = new Float32Array(SIN_N);
  for (let i = 0; i < SIN_N; i++) lut[i] = Math.sin((i / SIN_N) * TWO_PI);
  return lut;
}

interface FieldCache {
  gw: number;
  gh: number;
  dUsed: number;
  r1: Float32Array;
  r2: Float32Array;
  w1: Float32Array;
  w2: Float32Array;
  img: ImageData;
  off: HTMLCanvasElement;
  offCtx: CanvasRenderingContext2D | null;
}

export default function WaveInterferenceLab() {
  const [{ d, lam: lambda, spd: speed, int: intensity }, updateParams] = useSimParams<{
    d: number;
    lam: number;
    spd: number;
    int: boolean;
  }>({ d: 160, lam: 48, spd: 1, int: false });
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setPlaying(false));
    return () => cancelAnimationFrame(id);
  }, []);

  const phaseRef = useRef(0);
  const cacheRef = useRef<FieldCache | null>(null);
  const sinRef = useRef<Float32Array | null>(null);
  const waveLutRef = useRef<Uint8Array | null>(null);
  const greenLutRef = useRef<Uint8Array | null>(null);

  if (!sinRef.current || !waveLutRef.current || !greenLutRef.current) {
    sinRef.current = buildSinLut();
    waveLutRef.current = buildRamp(WAVE_STOPS);
    greenLutRef.current = buildRamp(GREEN_STOPS);
  }

  const draw = useSimLoop(
    (ctx, w, h, _t, dt) => {
      const sinLut = sinRef.current;
      const waveLut = waveLutRef.current;
      const greenLut = greenLutRef.current;
      if (!sinLut || !waveLut || !greenLut) return;

      if (playing && speed > 0) {
        phaseRef.current = (phaseRef.current + dt * speed * TWO_PI) % TWO_PI;
      }
      const phase = phaseRef.current;

      const gw = Math.ceil(w / CELL);
      const gh = Math.ceil(h / CELL);

      let c = cacheRef.current;
      if (!c || c.gw !== gw || c.gh !== gh) {
        const off = document.createElement("canvas");
        off.width = gw;
        off.height = gh;
        c = {
          gw,
          gh,
          dUsed: NaN,
          r1: new Float32Array(gw * gh),
          r2: new Float32Array(gw * gh),
          w1: new Float32Array(gw * gh),
          w2: new Float32Array(gw * gh),
          img: new ImageData(gw, gh),
          off,
          offCtx: off.getContext("2d"),
        };
        cacheRef.current = c;
      }
      const cache = c;
      if (!cache.offCtx) return;

      if (cache.dUsed !== d) {
        const cx = w / 2;
        const cy = h / 2;
        const s1x = cx - d / 2;
        const s2x = cx + d / 2;
        let i = 0;
        for (let gy = 0; gy < gh; gy++) {
          const dy = gy * CELL - cy;
          const dy2 = dy * dy;
          for (let gx = 0; gx < gw; gx++, i++) {
            const px = gx * CELL;
            const dx1 = px - s1x;
            const dx2 = px - s2x;
            const q1 = Math.sqrt(dx1 * dx1 + dy2);
            const q2 = Math.sqrt(dx2 * dx2 + dy2);
            cache.r1[i] = q1;
            cache.r2[i] = q2;
            cache.w1[i] = 1 / Math.sqrt(Math.max(q1, 8));
            cache.w2[i] = 1 / Math.sqrt(Math.max(q2, 8));
          }
        }
        cache.dUsed = d;
      }

      const k = TWO_PI / lambda;
      const kd = k * SIN_K;
      const pd = phase * SIN_K;
      const cmap = intensity ? greenLut : waveLut;
      const data = cache.img.data;
      const r1 = cache.r1;
      const r2 = cache.r2;
      const w1 = cache.w1;
      const w2 = cache.w2;

      let p = 0;
      let i = 0;
      for (let gy = 0; gh > gy; gy++) {
        for (let gx = 0; gw > gx; gx++, i++, p += 4) {
          const s =
            w1[i] * sinLut[(kd * r1[i] - pd + SIN_OFF) & SIN_MASK] +
            w2[i] * sinLut[(kd * r2[i] - pd + SIN_OFF) & SIN_MASK];
          let ci: number;
          if (intensity) {
            let q = s * INV_NORM;
            if (q > 1) q = 1;
            else if (q < -1) q = -1;
            ci = (q * q * LUT_LAST) | 0;
          } else {
            let v = s * INV_NORM;
            if (v > 1) v = 1;
            else if (v < -1) v = -1;
            ci = ((v + 1) * (LUT_LAST * 0.5 + 0.5)) | 0;
          }
          const o = ci * 3;
          data[p] = cmap[o];
          data[p + 1] = cmap[o + 1];
          data[p + 2] = cmap[o + 2];
          data[p + 3] = 255;
        }
      }

      cache.offCtx.putImageData(cache.img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(cache.off, 0, 0, gw, gh, 0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const pulse = Math.sin(phase * 0.37) * 0.9;
      glowDot(ctx, cx - d / 2, cy, 6 + pulse, CYAN);
      glowDot(ctx, cx + d / 2, cy, 6 - pulse, GREEN);
      ctx.font = MONO_FONT;
      ctx.fillStyle = S1_FILL;
      ctx.fillText(S1_LABEL, cx - d / 2 + 10, cy - 12);
      ctx.fillStyle = S2_FILL;
      ctx.fillText(S2_LABEL, cx + d / 2 + 10, cy - 12);
    }
  );

  return (
    <SimFrame
      title="Two-Source Interference"
      subtitle="Every pixel sums two circular waves"
      controls={
        <>
          <Slider
            label="Separation d"
            value={d}
            min={40}
            max={300}
            unit="px"
            onChange={(v) => updateParams({ d: v })}
          />
          <Slider
            label="Wavelength λ"
            value={lambda}
            min={16}
            max={90}
            unit="px"
            onChange={(v) => updateParams({ lam: v })}
          />
          <Slider
            label="Speed"
            value={speed}
            min={0}
            max={2}
            step={0.05}
            onChange={(v) => updateParams({ spd: v })}
          />
          <Toggle
            label="Intensity view"
            checked={intensity}
            onChange={(v) => updateParams({ int: v })}
          />
          <ActionButton onClick={() => setPlaying((v) => !v)}>
            {playing ? "Pause" : "Play"}
          </ActionButton>
          <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3 text-xs text-muted">
            <TeX tex={String.raw`\Delta = \left|r_1 - r_2\right|`} />
            <TeX tex={String.raw`d\sin\theta = m\lambda`} />
            <span className="font-mono">
              fringes ≈ ⌊2d/λ⌋ = {fmt((2 * d) / lambda, 0)}
            </span>
          </div>
        </>
      }
      footnote="Bright antinodes mark paths where Δ equals a whole number of wavelengths; nodes fall halfway between. Lower λ to pack fringes tighter."
    >
      <canvas
        ref={draw}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark field with two pulsing wave sources emitting circular waves whose overlap paints radial interference fringes in blue and green"
      />
    </SimFrame>
  );
}
