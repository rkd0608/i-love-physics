"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const DT = 1 / 240;
const C_PX = 100;
const TAU = Math.PI * 2;
const A_MAX = 2.5;
const MAX_CRESTS = 160;
const STRIDE = 5;
const GRID_GAP = 80;
const AMP = 9;
const OBS_X = 46;
const N_GAL = 30;
const LUT_N = 96;
const F_MAX = 2.5;
const READ_MS = 150;

const ROSE = "#e11d48";
const AMBER = "#ffd27a";
const CYAN = "#53d6f2";
const MUTED = "#8b93b8";
const GAL_PALETTE = ["#aebdf0", "#cdd8ff", "#8fa3e8"];
const GRID_LINE = "rgba(139,147,184,0.10)";
const GUIDE_LINE = "rgba(139,147,184,0.14)";

const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const WAVE_LUT: readonly string[] = Array.from({ length: LUT_N }, (_, i) => {
  const f = i / (LUT_N - 1);
  return `hsl(${(270 * (1 - f)).toFixed(1)} 90% 62%)`;
});

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SimInteg {
  t: number;
  acc: number;
  emitPhase: number;
  nextCrest: number;
  start: number;
  count: number;
}

interface Arrival {
  mp1: number;
  tp1: number;
}

interface Readout {
  tp1: number;
  mp1: number;
  agree: number;
  v: number;
}

const EMPTY_READOUT: Readout = { tp1: NaN, mp1: NaN, agree: NaN, v: 0 };

export default function RedshiftLab() {
  const [
    { h0, chi, lam, tscale, grid },
    updateParams,
  ] = useSimParams<{ h0: number; chi: number; lam: number; tscale: number; grid: boolean }>({
    h0: 0.05,
    chi: 400,
    lam: 20,
    tscale: 1,
    grid: true,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [readout, setReadout] = useState<Readout>(EMPTY_READOUT);

  const h0Ref = useRef(h0);
  const chiRef = useRef(chi);
  const lamRef = useRef(lam);
  const tscaleRef = useRef(tscale);
  const pausedRef = useRef(paused);

  useEffect(() => {
    h0Ref.current = h0;
    chiRef.current = chi;
    lamRef.current = lam;
    tscaleRef.current = tscale;
    pausedRef.current = paused;
  });

  const integRef = useRef<SimInteg | null>(null);
  const crestBufRef = useRef<Float32Array | null>(null);
  const fieldRef = useRef<Float32Array | null>(null);
  const arrivalRef = useRef<Arrival | null>(null);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const I = integRef.current;
      const arr = arrivalRef.current;
      const a = I ? 1 + h0Ref.current * I.t : 1;
      const v = h0Ref.current * a * chiRef.current;
      let agree = NaN;
      if (arr && Number.isFinite(arr.tp1) && arr.tp1 > 1e-9) {
        agree = 100 * (1 - Math.abs(arr.mp1 - arr.tp1) / arr.tp1);
        if (agree < 0) agree = 0;
        if (agree > 100) agree = 100;
      }
      setReadout({
        tp1: arr ? 1 + arr.tp1 : NaN,
        mp1: arr ? 1 + arr.mp1 : NaN,
        agree,
        v,
      });
    }, READ_MS);
    return () => window.clearInterval(id);
  }, []);

  const restart = (): void => {
    const I = integRef.current;
    if (I) {
      I.t = 0;
      I.acc = 0;
      I.emitPhase = 0;
      I.nextCrest = TAU;
      I.start = 0;
      I.count = 0;
    }
    arrivalRef.current = null;
    setReadout(EMPTY_READOUT);
  };

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    if (!crestBufRef.current) crestBufRef.current = new Float32Array(MAX_CRESTS * STRIDE);
    if (!integRef.current)
      integRef.current = { t: 0, acc: 0, emitPhase: 0, nextCrest: TAU, start: 0, count: 0 };
    if (!fieldRef.current) {
      const rng = mulberry32(0x51af1e);
      const field = new Float32Array(N_GAL * 2);
      const cyMid = h / 2;
      for (let i = 0; i < N_GAL; i += 1) {
        field[i * 2] = 40 + rng() * (w - OBS_X + 260);
        let y = 20 + rng() * (h - 40);
        let tries = 0;
        while (Math.abs(y - cyMid) < 28 && tries < 8) {
          y = 20 + rng() * (h - 40);
          tries += 1;
        }
        field[i * 2 + 1] = y;
      }
      fieldRef.current = field;
    }

    const I = integRef.current;
    const buf = crestBufRef.current;
    const Hp = h0Ref.current;
    const chiE = chiRef.current;
    const lamEm = lamRef.current;

    if (!pausedRef.current && tscaleRef.current > 0) {
      I.acc += dt * tscaleRef.current;
      let guard = 0;
      while (I.acc >= DT && guard < 64) {
        I.acc -= DT;
        guard += 1;
        I.t += DT;
        const a = 1 + Hp * I.t;
        const grow = 1 + (Hp * DT) / a;
        const drift = (C_PX / a) * DT;
        for (let k = 0; k < I.count; k += 1) {
          let p = I.start + k;
          if (p >= MAX_CRESTS) p -= MAX_CRESTS;
          buf[p * STRIDE] -= drift;
          buf[p * STRIDE + 1] *= grow;
        }
        I.emitPhase += (TAU * C_PX * DT) / lamEm;
        while (I.emitPhase >= I.nextCrest && I.count < MAX_CRESTS) {
          let p = I.start + I.count;
          if (p >= MAX_CRESTS) p -= MAX_CRESTS;
          buf[p * STRIDE] = chiE;
          buf[p * STRIDE + 1] = lamEm;
          buf[p * STRIDE + 2] = I.nextCrest;
          buf[p * STRIDE + 3] = I.t;
          buf[p * STRIDE + 4] = lamEm;
          I.nextCrest += TAU;
          I.count += 1;
        }
        while (I.count > 0 && buf[I.start * STRIDE] <= 0) {
          const lamObs = buf[I.start * STRIDE + 1];
          const lamAtE = buf[I.start * STRIDE + 4];
          const tauE = buf[I.start * STRIDE + 3];
          arrivalRef.current = {
            mp1: lamObs / lamAtE - 1,
            tp1: (1 + Hp * I.t) / (1 + Hp * tauE) - 1,
          };
          I.start += 1;
          if (I.start >= MAX_CRESTS) I.start = 0;
          I.count -= 1;
        }
        if (a >= A_MAX) {
          I.t = 0;
          I.acc = 0;
          I.emitPhase = 0;
          I.nextCrest = TAU;
          I.start = 0;
          I.count = 0;
          arrivalRef.current = null;
        }
      }
      if (guard >= 64) I.acc = 0;
    }

    const a = 1 + Hp * I.t;
    const cy = h / 2;
    const emitterX = OBS_X + a * chiE;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    if (grid) {
      ctx.strokeStyle = GRID_LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let g = 1; ; g += 1) {
        const gx = OBS_X + a * g * GRID_GAP;
        if (gx > w) break;
        ctx.moveTo(Math.round(gx) + 0.5, 10);
        ctx.lineTo(Math.round(gx) + 0.5, h - 10);
      }
      ctx.stroke();
    }

    const field = fieldRef.current;
    for (let i = 0; i < N_GAL; i += 1) {
      const gx = OBS_X + a * field[i * 2];
      if (gx > w + 24 || gx < -24) continue;
      const gy = field[i * 2 + 1];
      const yy = gy > h - 16 ? h - 16 : gy;
      glowDot(ctx, gx, yy, 1.8 + (i % 3), GAL_PALETTE[i % 3]);
    }

    ctx.strokeStyle = GUIDE_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(OBS_X, cy);
    ctx.lineTo(Math.min(emitterX, w), cy);
    ctx.stroke();

    if (I.count > 0) {
      const xStart = Math.max(OBS_X + 3, Math.ceil(OBS_X + a * buf[I.start * STRIDE]));
      const xEnd = Math.min(emitterX - 3, w - 3);
      let k = 0;
      let curIdx = -1;
      for (let x = xStart; x <= xEnd; x += 2) {
        const s = x - OBS_X;
        while (k + 1 < I.count) {
          let q = I.start + k + 1;
          if (q >= MAX_CRESTS) q -= MAX_CRESTS;
          if (OBS_X + a * buf[q * STRIDE] < s) k += 1;
          else break;
        }
        let pj = I.start + k;
        if (pj >= MAX_CRESTS) pj -= MAX_CRESTS;
        const sj = OBS_X + a * buf[pj * STRIDE];
        let theta: number;
        let lamLoc: number;
        if (k + 1 < I.count) {
          let qj = pj + 1;
          if (qj >= MAX_CRESTS) qj -= MAX_CRESTS;
          const sq = OBS_X + a * buf[qj * STRIDE];
          const u = (s - sj) / (sq - sj);
          theta = buf[pj * STRIDE + 2] + (buf[qj * STRIDE + 2] - buf[pj * STRIDE + 2]) * u;
          lamLoc = buf[pj * STRIDE + 1] + (buf[qj * STRIDE + 1] - buf[pj * STRIDE + 1]) * u;
        } else {
          theta = buf[pj * STRIDE + 2] + (TAU * (s - sj)) / lamEm;
          lamLoc = lamEm;
        }
        const f = lamLoc / lamEm;
        let idx = Math.round(((f - 1) / (F_MAX - 1)) * (LUT_N - 1));
        if (idx < 0) idx = 0;
        if (idx > LUT_N - 1) idx = LUT_N - 1;
        const y = cy - AMP * Math.sin(theta);
        if (idx !== curIdx) {
          if (curIdx >= 0) ctx.stroke();
          curIdx = idx;
          ctx.strokeStyle = WAVE_LUT[idx];
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      if (curIdx >= 0) ctx.stroke();

      const arr = arrivalRef.current;
      if (arr) {
        ctx.font = MONO_SMALL;
        ctx.fillStyle = CYAN;
        ctx.textAlign = "left";
        ctx.fillText(`λobs/λem = ${fmt(arr.mp1 + 1, 3)}`, OBS_X + 10, cy - 16);
      }
    }

    glowDot(ctx, OBS_X, cy, 4.5, AMBER);
    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.fillText("Milky Way", OBS_X, cy + 24);

    if (emitterX <= w + 24) {
      glowDot(ctx, emitterX, cy, 4, ROSE);
      ctx.font = MONO_SMALL;
      ctx.fillStyle = MUTED;
      ctx.textAlign = "center";
      ctx.fillText(`χ = ${fmt(chiE)} px`, emitterX, cy + 24);
    }

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.fillText(`a = ${fmt(a, 3)}`, 16, 22);
    ctx.fillText(`v = H₀d = ${fmt(Hp * a * chiE, 1)} px/s`, 16, 38);
  });

  return (
    <SimFrame
      title="Stretching Universe"
      subtitle="Photons crossing growing space pay a wavelength toll"
      controls={
        <>
          <Slider
            label="Hubble rate H₀"
            value={h0}
            min={0.02}
            max={0.12}
            step={0.005}
            unit="/s"
            onChange={(v) => updateParams({ h0: v })}
          />
          <Slider
            label="Emission distance χ"
            value={chi}
            min={200}
            max={600}
            step={10}
            unit="px"
            onChange={(v) => updateParams({ chi: v })}
          />
          <Slider
            label="Emitted wavelength λ"
            value={lam}
            min={12}
            max={40}
            step={1}
            unit="px"
            onChange={(v) => updateParams({ lam: v })}
          />
          <Slider
            label="Time scale"
            value={tscale}
            min={0}
            max={4}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ tscale: v })}
          />
          <Toggle
            label="Grid stretch"
            checked={grid}
            onChange={(v) => updateParams({ grid: v })}
          />
          <ActionButton tone="ghost" onClick={restart}>
            Restart
          </ActionButton>
          {reduced ? (
            <ActionButton
              onClick={() => {
                const np = !pausedRef.current;
                pausedRef.current = np;
                setPaused(np);
              }}
            >
              {paused ? "Play" : "Pause"}
            </ActionButton>
          ) : null}
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`1+z = \frac{a(t_{\text{obs}})}{a(t_{\text{em}})} = \frac{\lambda_{\text{obs}}}{\lambda_{\text{em}}}`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">1+z theory </span>
            <span className="text-accent">{Number.isFinite(readout.tp1) ? fmt(readout.tp1, 4) : "—"}</span>
            <span className="text-muted"> · measured </span>
            <span className="text-accent">{Number.isFinite(readout.mp1) ? fmt(readout.mp1, 4) : "—"}</span>
            <span className="text-muted"> · match </span>
            <span className="text-accent">{Number.isFinite(readout.agree) ? `${fmt(readout.agree, 2)}%` : "—"}</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">v = H₀d = </span>
            <span className="text-accent">{fmt(readout.v, 1)}</span>
            <span className="text-muted"> px/s ({fmt(readout.v / C_PX, 2)} c)</span>
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark expanding universe: a comoving grid of galaxies streams rightward away from the Milky Way observer at the left edge while a chosen emitter galaxy sends a continuous photon wave train along the center lane, its sinusoid visibly stretching and shifting from violet near the emitter to deep red near the observer, with scale factor and recession velocity labels in the corner"
      />
    </SimFrame>
  );
}
