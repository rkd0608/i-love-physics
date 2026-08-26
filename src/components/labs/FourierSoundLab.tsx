"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const ACCENT = "#e879f9";
const MUTED = "#8b93b8";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const BUF = 1024;
const WINDOW_S = 0.025;
const BARS = 12;
const SCROLL = BUF / 12;

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

const PHASES: Float64Array = (() => {
  const rnd = mulberry32(7);
  const out = new Float64Array(BARS);
  for (let i = 0; i < BARS; i += 1) out[i] = rnd() * Math.PI * 2;
  return out;
})();

const BAR_LABELS: string[] = [];
for (let i = 1; i <= BARS; i += 1) BAR_LABELS.push(String(i));

const LABEL_YT = "y(t)";
const LABEL_SPEC = "spectrum";

type FourierState = {
  phase: number;
  f: number;
  p: number;
  n: number;
  b: number;
  odd: boolean;
  norm: number;
  amps: Float32Array;
  buf: Float32Array;
};

function resample(
  S: FourierState,
  f: number,
  p: number,
  n: number,
  b: number,
  odd: boolean
): void {
  S.f = f;
  S.p = p;
  S.n = n;
  S.b = b;
  S.odd = odd;
  for (let i = 0; i < BARS; i += 1) {
    const harm = i + 1;
    S.amps[i] =
      harm > n || (odd && harm % 2 === 0) ? 0 : Math.pow(harm, -p);
  }
  const twoPi = Math.PI * 2;
  const dt = WINDOW_S / BUF;
  let peak = 0;
  for (let k = 0; k < BUF; k += 1) {
    const tt = k * dt;
    let y = 0;
    for (let i = 0; i < BARS; i += 1) {
      const a = S.amps[i];
      if (a === 0) continue;
      y += a * Math.sin(twoPi * f * (i + 1) * (1 + b * i) * tt + PHASES[i]);
    }
    S.buf[k] = y;
    const av = y < 0 ? -y : y;
    if (av > peak) peak = av;
  }
  S.norm = peak > 1e-6 ? peak : 1;
}

export default function FourierSoundLab() {
  const [
    { f, p, n, b, odd },
    updateParams,
  ] = useSimParams<{ f: number; p: number; n: number; b: number; odd: boolean }>({
    f: 220,
    p: 1,
    n: 8,
    b: 0,
    odd: false,
  });
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  const SRef = useRef<FourierState>({
    phase: 0,
    f: NaN,
    p: NaN,
    n: NaN,
    b: NaN,
    odd: false,
    norm: 1,
    amps: new Float32Array(BARS),
    buf: new Float32Array(BUF),
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const fN = f * n * (1 + b * (n - 1));
  const beatHint = (fN - n * f) / n;

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const S = SRef.current;
    if (S.f !== f || S.p !== p || S.n !== n || S.b !== b || S.odd !== odd) {
      resample(S, f, p, n, b, odd);
    }
    if (playing) {
      S.phase += dt * SCROLL;
      if (S.phase >= BUF) S.phase -= BUF;
    }

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const wl = w * 0.58;
    const margin = Math.max(18, Math.round(wl * 0.05));
    const wxl = margin;
    const wxr = wl - margin;
    const cyC = h * 0.5;
    const halfH = h * 0.5 - 26;

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(LABEL_YT, wxl, 8);

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const zy = Math.round(cyC) + 0.5;
    ctx.moveTo(wxl, zy);
    ctx.lineTo(wxr, zy);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const span = wxr - wxl;
    const steps = Math.max(2, Math.floor(span / 2));
    let lastY = cyC;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= steps; i += 1) {
      const px = wxl + (i * span) / steps;
      let u = S.phase + (i / steps) * BUF;
      u %= BUF;
      if (u < 0) u += BUF;
      const py = cyC - (S.buf[u | 0] / S.norm) * halfH;
      lastY = py;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    glowDot(ctx, wxr, lastY, 3, ACCENT);

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    const dvx = Math.round(wl) + 0.5;
    ctx.moveTo(dvx, 10);
    ctx.lineTo(dvx, h - 10);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const sx0 = wl + 24;
    const sx1 = w - 20;
    const baseY = h - 32;
    const maxBar = baseY - 40;
    const slotW = (sx1 - sx0) / BARS;
    const barW = Math.min(slotW * 0.55, 22);

    ctx.textAlign = "left";
    ctx.fillStyle = MUTED;
    ctx.fillText(LABEL_SPEC, sx0, 8);

    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    const by = Math.round(baseY) + 0.5;
    ctx.moveTo(sx0, by);
    ctx.lineTo(sx1, by);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    for (let i = 0; i < BARS; i += 1) {
      const cx = sx0 + slotW * (i + 0.5);
      const amp = S.amps[i];
      if (amp > 0) {
        const bh = amp * maxBar;
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = ACCENT;
        ctx.fillRect(cx - barW * 0.5, baseY - bh, barW, bh);
      } else {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = MUTED;
        ctx.fillRect(cx - barW * 0.5, baseY - 3, barW, 3);
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = MUTED;
      ctx.fillText(BAR_LABELS[i], cx, baseY + 7);
    }
  };

  const canvasRef = useSimLoop(draw);

  return (
    <SimFrame
      title="Additive Synthesizer"
      subtitle="Stacked harmonics: oscilloscope and spectrum"
      controls={
        <>
          <Slider
            label="Fundamental f"
            value={f}
            min={110}
            max={880}
            step={5}
            unit="Hz"
            onChange={(v) => updateParams({ f: v })}
          />
          <Slider
            label="Spectral tilt p"
            value={p}
            min={0}
            max={3}
            step={0.1}
            onChange={(v) => updateParams({ p: v })}
          />
          <Slider
            label="Harmonics N"
            value={n}
            min={1}
            max={12}
            step={1}
            onChange={(v) => updateParams({ n: v })}
          />
          <Slider
            label="Detune b"
            value={b}
            min={0}
            max={0.02}
            step={0.001}
            onChange={(v) => updateParams({ b: v })}
          />
          <Toggle
            label="Odd harmonics only"
            checked={odd}
            onChange={(v) => updateParams({ odd: v })}
          />
          {reduced ? (
            <ActionButton tone="ghost" onClick={() => setPlaying((q) => !q)}>
              {playing ? "Pause" : "Play"}
            </ActionButton>
          ) : null}
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`y(t) = \sum_{n=1}^{N} A_n \sin(2\pi n f t)`}
            className="text-sm"
          />
          <span className="font-mono text-xs text-muted">
            {`N=${n} · f₁=${fmt(f, 0)} Hz · f_N=${fmt(fN, 0)} Hz`}
          </span>
          {b > 0 ? (
            <span className="font-mono text-xs">
              <span className="text-muted">beat Δf_N/N ≈ </span>
              <span className="text-accent">{fmt(beatHint, 2)}</span>
              <span className="text-muted"> Hz</span>
            </span>
          ) : null}
          <span className="text-xs text-muted">
            Phases φₙ come from a seeded PRNG (seed 7), so the stack is identical on every load.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Additive synthesizer: scrolling waveform of stacked sine harmonics on the left, twelve-bar harmonic spectrum on the right with inactive harmonics dimmed to stubs when odd-harmonics-only is on or N is low"
      />
    </SimFrame>
  );
}
