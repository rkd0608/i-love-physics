"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const R0 = 40;
const DR = 34;
const TAU = Math.PI * 2;
const DF = DR;
const DENSITY_DIV = 2600;
const STARS_CAP = 1400;

const STAR_COLOR = "#e8f1ff";
const OBSERVER_COLOR = "#ffd27a";
const RING_LIT = "rgba(147,197,253,0.12)";
const RING_FAR = "rgba(139,147,184,0.45)";
const BAR_FILL = "rgba(147,197,253,0.9)";
const BAR_GHOST = "rgba(139,147,184,0.55)";
const BASELINE = "rgba(139,147,184,0.35)";
const LABEL_COLOR = "rgba(139,147,184,0.9)";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

const DIM_ALPHA = 0.95;
const FLAT_ALPHA = 0.85;
const STAR_SIZE = 2.1;
const MIN_STAR_SIZE = 0.7;
const TWINKLE_BASE = 0.74;
const TWINKLE_AMP = 0.26;
const TWINKLE_SPEED = 1.7;
const DF_PX = 3.2;
const BAR_PAD_X = 16;
const BAR_GAP = 3;

const starDx = new Float32Array(STARS_CAP);
const starDy = new Float32Array(STARS_CAP);
const starShell = new Uint8Array(STARS_CAP);
const starPhase = new Float32Array(STARS_CAP);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type SkyCache = { key: string; canvas: HTMLCanvasElement | null };

function ensureSky(store: SkyCache, w: number, h: number): HTMLCanvasElement {
  const key = `${w}x${h}`;
  if (store.canvas && store.key === key) return store.canvas;
  const oc = document.createElement("canvas");
  oc.width = Math.max(1, Math.round(w));
  oc.height = Math.max(1, Math.round(h));
  const o = oc.getContext("2d");
  if (o) paintSky(o, w, h);
  store.canvas = oc;
  store.key = key;
  return oc;
}

export default function OlbersParadoxLab() {
  const [
    { sc: shells, hr: horizon, dim, ts: timeScale },
    updateParams,
  ] = useSimParams<{ sc: number; hr: number; dim: boolean; ts: number }>({
    sc: 12,
    hr: 6,
    dim: true,
    ts: 1,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seed, setSeed] = useState(1);

  const shellsRef = useRef(shells);
  const horizonRef = useRef(horizon);
  const dimRef = useRef(dim);
  const timeScaleRef = useRef(timeScale);
  const pausedRef = useRef(paused);

  useEffect(() => {
    shellsRef.current = shells;
    horizonRef.current = horizon;
    dimRef.current = dim;
    timeScaleRef.current = timeScale;
    pausedRef.current = paused;
  });

  const countRef = useRef(0);
  const scaleRef = useRef(0);
  const sky = useRef<SkyCache>({ key: "", canvas: null });

  useEffect(() => {
    const rng = mulberry32((seed * 0x9e3779b9 + shells * 0x85ebca6b) >>> 0);
    let n = 0;
    for (let k = 0; k < shells; k++) {
      const r = R0 + k * DR;
      const count = Math.max(2, Math.round((r * r) / DENSITY_DIV));
      for (let i = 0; i < count && n < STARS_CAP; i++) {
        const th = rng() * TAU;
        starDx[n] = Math.cos(th) * r;
        starDy[n] = Math.sin(th) * r;
        starShell[n] = k;
        starPhase[n] = rng() * TAU;
        n++;
      }
    }
    countRef.current = n;
  }, [shells, seed]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const draw = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      _t: number,
      dt: number
    ): void => {
      const cShells = shellsRef.current;
      const cHr = Math.min(horizonRef.current, cShells);

      const fit =
        (0.94 * Math.min(w, h) * 0.5) /
        (R0 + Math.max(cShells - 1, 0) * DR);
      const target = Math.min(fit, 1.4);
      if (scaleRef.current <= 0) scaleRef.current = target;
      else scaleRef.current += (target - scaleRef.current) * 0.14;
      const scl = scaleRef.current;

      ctx.drawImage(ensureSky(sky.current, w, h), 0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2 - 10;

      if (!pausedRef.current) {
        const dph = dt * timeScaleRef.current * TWINKLE_SPEED;
        if (dph > 0) {
          for (let i = 0; i < countRef.current; i++) starPhase[i] += dph;
        }
      }

      ctx.lineWidth = 1;
      for (let k = 0; k < cShells; k++) {
        const lit = k < cHr;
        ctx.setLineDash(lit ? [] : [5, 6]);
        ctx.strokeStyle = lit ? RING_LIT : RING_FAR;
        ctx.beginPath();
        ctx.arc(cx, cy, (R0 + k * DR) * scl, 0, TAU);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.fillStyle = STAR_COLOR;
      const rMid = R0 + ((cShells - 1) * DR) / 2;
      const rMid2 = rMid * rMid;
      for (let i = 0; i < countRef.current; i++) {
        const k = starShell[i];
        if (k >= cHr) continue;
        let a: number;
        let s: number;
        if (dimRef.current) {
          const rr = R0 + k * DR;
          let wc = rMid2 / (rr * rr);
          if (wc > 1) wc = 1;
          a = DIM_ALPHA * wc;
          s = Math.max(STAR_SIZE * wc, MIN_STAR_SIZE);
        } else {
          a = FLAT_ALPHA;
          s = STAR_SIZE;
        }
        ctx.globalAlpha = a * (TWINKLE_BASE + TWINKLE_AMP * Math.sin(starPhase[i]));
        ctx.beginPath();
        ctx.arc(cx + starDx[i] * scl, cy + starDy[i] * scl, s, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      glowDot(ctx, cx, cy, 4.5, OBSERVER_COLOR);

      const y0 = h - 8;
      const bw = Math.max(
        (w - BAR_PAD_X * 2 - (cShells - 1) * BAR_GAP) / cShells,
        1
      );
      ctx.strokeStyle = BASELINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(BAR_PAD_X - 6, y0 + 0.5);
      ctx.lineTo(w - BAR_PAD_X + 6, y0 + 0.5);
      ctx.stroke();
      ctx.fillStyle = BAR_FILL;
      ctx.strokeStyle = BAR_GHOST;
      for (let j = 1; j <= cShells; j++) {
        const bh = j * DF_PX;
        const bx = BAR_PAD_X + (j - 1) * (bw + BAR_GAP);
        if (j <= cHr) {
          ctx.globalAlpha = 0.9;
          ctx.fillRect(bx, y0 - bh, bw, bh);
          ctx.globalAlpha = 1;
        } else {
          ctx.setLineDash([3, 3]);
          ctx.strokeRect(bx + 0.5, y0 - bh + 0.5, bw - 1, bh - 1);
        }
      }
      ctx.setLineDash([]);
      ctx.fillStyle = LABEL_COLOR;
      ctx.font = MONO_LABEL;
      ctx.textAlign = "left";
      ctx.fillText("cumulative flux F(k)", BAR_PAD_X, y0 - cShells * DF_PX - 8);
    },
    []
  );

  const canvasRef = useSimLoop(draw);

  const blinding = horizon >= shells;
  const ratio = Math.min(horizon, shells) / shells;

  const controls = (
    <>
      <Slider
        label="Shell count"
        value={shells}
        min={1}
        max={20}
        onChange={(v) => updateParams({ sc: v })}
      />
      <Slider
        label="Horizon radius"
        value={horizon}
        min={1}
        max={20}
        unit="shells"
        onChange={(v) => updateParams({ hr: v })}
      />
      <Toggle
        label="Apply 1/r² dimming"
        checked={dim}
        onChange={(v) => updateParams({ dim: v })}
      />
      <Slider
        label="Time scale"
        value={timeScale}
        min={0}
        max={3}
        step={0.1}
        unit="×"
        onChange={(v) => updateParams({ ts: v })}
      />
      {reduced ? (
        <ActionButton
          tone="ghost"
          onClick={() => {
            const np = !pausedRef.current;
            pausedRef.current = np;
            setPaused(np);
          }}
        >
          {paused ? "Play" : "Pause"}
        </ActionButton>
      ) : null}
      <ActionButton onClick={() => setSeed((s) => s + 1)}>
        Reshuffle stars
      </ActionButton>
    </>
  );

  const liveRow = (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <TeX
        block={false}
        tex={`\\Delta F_{\\text{shell}} = nL\\,\\Delta r = ${fmt(DF)}\\;\\text{(const)}`}
      />
      <TeX
        block={false}
        tex={`\\frac{F_{\\text{total}}}{F_{\\text{horizon}}} = ${fmt(ratio)}`}
      />
      <span className={blinding ? "font-medium text-accent" : "text-muted"}>
        {blinding ? "sky would be blinding" : "dark: horizon cuts the light"}
      </span>
    </span>
  );

  return (
    <SimFrame
      title="Olbers’ Shells"
      subtitle="Every shell pays the same flux — the horizon decides when the payments stop"
      controls={controls}
      footnote={liveRow}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Concentric shells of stars around a central observer: lit twinkling shells inside the horizon radius, dashed hollow shells beyond it where light has not yet arrived, and a cumulative flux bar chart along the bottom growing by the same step for every shell regardless of dimming"
      />
    </SimFrame>
  );
}
