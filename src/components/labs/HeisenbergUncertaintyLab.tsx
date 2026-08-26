"use client";

import { useEffect, useMemo, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const VIOLET = "#818cf8";
const CYAN = "#53d6f2";
const MUTED = "#8b93b8";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

const GRID_N = 256;
const X_MIN = -10;
const X_SPAN = 20;
const DX = X_SPAN / GRID_N;
const DP = (2 * Math.PI) / (GRID_N * DX);

const BITREV = new Uint8Array(GRID_N);
const TWIDDLE = new Float32Array(GRID_N);

function initFftTables(): void {
  const bits = 8;
  for (let i = 0; i < GRID_N; i += 1) {
    let r = 0;
    for (let b = 0; b < bits; b += 1) {
      if (i & (1 << b)) r |= 1 << (bits - 1 - b);
    }
    BITREV[i] = r;
  }
  for (let k = 0; k < GRID_N >> 1; k += 1) {
    const ang = (-2 * Math.PI * k) / GRID_N;
    TWIDDLE[k * 2] = Math.cos(ang);
    TWIDDLE[k * 2 + 1] = Math.sin(ang);
  }
}
initFftTables();

function fftInPlace(wave: Float32Array): void {
  for (let i = 0; i < GRID_N; i += 1) {
    const j = BITREV[i];
    if (j > i) {
      const ar = wave[i * 2];
      const ai = wave[i * 2 + 1];
      wave[i * 2] = wave[j * 2];
      wave[i * 2 + 1] = wave[j * 2 + 1];
      wave[j * 2] = ar;
      wave[j * 2 + 1] = ai;
    }
  }
  for (let len = 2; len <= GRID_N; len <<= 1) {
    const halfLen = len >> 1;
    const tstep = GRID_N / len;
    for (let base = 0; base < GRID_N; base += len) {
      for (let j = 0; j < halfLen; j += 1) {
        const ti = j * tstep * 2;
        const wr = TWIDDLE[ti];
        const wi = TWIDDLE[ti + 1];
        const a = (base + j) * 2;
        const b = a + len;
        const br = wave[b];
        const bi = wave[b + 1];
        const vr = br * wr - bi * wi;
        const vi = br * wi + bi * wr;
        wave[b] = wave[a] - vr;
        wave[b + 1] = wave[a + 1] - vi;
        wave[a] += vr;
        wave[a + 1] += vi;
      }
    }
  }
}

const P_GRID = new Float64Array(GRID_N);
for (let i = 0; i < GRID_N; i += 1) {
  const f = i <= GRID_N >> 1 ? i : i - GRID_N;
  P_GRID[i] = f * DP;
}

const WAVE = new Float32Array(GRID_N * 2);
const PROB_X = new Float64Array(GRID_N);
const PROB_P = new Float64Array(GRID_N);

interface Moments {
  meanX: number;
  dx: number;
  meanP: number;
  dp: number;
  peakX: number;
  peakP: number;
}

function computeMoments(sx: number, alpha: number, k0: number): Moments {
  const inv4 = 1 / (4 * sx * sx);
  let normSq = 0;
  for (let i = 0; i < GRID_N; i += 1) {
    const x = X_MIN + i * DX;
    const env = Math.exp(-x * x * inv4);
    const ph = k0 * x + alpha * x * x;
    WAVE[i * 2] = env * Math.cos(ph);
    WAVE[i * 2 + 1] = env * Math.sin(ph);
    normSq += env * env;
  }
  const g = 1 / Math.sqrt(normSq * DX);
  let mx = 0;
  let mx2 = 0;
  let mtot = 0;
  let peakX = 0;
  for (let i = 0; i < GRID_N; i += 1) {
    WAVE[i * 2] *= g;
    WAVE[i * 2 + 1] *= g;
    const pr =
      (WAVE[i * 2] * WAVE[i * 2] + WAVE[i * 2 + 1] * WAVE[i * 2 + 1]) * DX;
    PROB_X[i] = pr;
    if (pr > peakX) peakX = pr;
    const x = X_MIN + i * DX;
    mtot += pr;
    mx += x * pr;
    mx2 += x * x * pr;
  }
  fftInPlace(WAVE);
  const phScale = (DX * DX) / (2 * Math.PI);
  let mp = 0;
  let mp2 = 0;
  let ptot = 0;
  let peakP = 0;
  for (let i = 0; i < GRID_N; i += 1) {
    const pr =
      phScale *
      (WAVE[i * 2] * WAVE[i * 2] + WAVE[i * 2 + 1] * WAVE[i * 2 + 1]);
    PROB_P[i] = pr;
    if (pr > peakP) peakP = pr;
    mp += P_GRID[i] * pr;
    mp2 += P_GRID[i] * P_GRID[i] * pr;
    ptot += pr;
  }
  const pInv = 1 / ptot;
  for (let i = 0; i < GRID_N; i += 1) PROB_P[i] *= pInv;
  const meanX = mx / mtot;
  const varX = Math.max(mx2 / mtot - meanX * meanX, 0);
  const meanP = mp * pInv;
  const varP = Math.max(mp2 * pInv - meanP * meanP, 0);
  return {
    meanX,
    dx: Math.sqrt(varX),
    meanP,
    dp: Math.sqrt(varP),
    peakX,
    peakP: peakP * pInv,
  };
}

const XFIFTH = [0, 0.25, 0.5, 0.75, 1];
const XTICKS = ["-10", "-5", "0", "5", "10"];
const LABEL_PSI = "|ψ(x)|²";
const LABEL_PHI = "|φ(p)|²";

const tickCache = new Map<number, string>();

function tickLabel(n: number): string {
  let s = tickCache.get(n);
  if (s === undefined) {
    s = String(n);
    tickCache.set(n, s);
  }
  return s;
}

export default function HeisenbergUncertaintyLab() {
  const [
    { sx, alpha, k0, shade },
    updateParams,
  ] = useSimParams<{ sx: number; alpha: number; k0: number; shade: boolean }>({
    sx: 1,
    alpha: 0,
    k0: 0,
    shade: true,
  });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setReduced(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const moments = useMemo(() => computeMoments(sx, alpha, k0), [sx, alpha, k0]);

  const canvasRef = useSimLoop((ctx, w, h, t) => {
    paintSky(ctx, w, h);
    const breathe = reduced ? 0 : Math.sin(t * 1.35);

    const split = w * 0.5;
    const top = 30;
    const bot = h - 32;
    const lL = 16;
    const lR = split - 18;
    const rL = split + 18;
    const rR = w - 16;

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(split) + 0.5, 12);
    ctx.lineTo(Math.round(split) + 0.5, h - 12);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lL, Math.round(bot) + 0.5);
    ctx.lineTo(lR, Math.round(bot) + 0.5);
    ctx.stroke();

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < 5; i += 1) {
      const px = lL + XFIFTH[i] * (lR - lL);
      ctx.fillRect(px - 0.5, bot, 1, 5);
      ctx.fillText(XTICKS[i], px, bot + 9);
    }
    ctx.globalAlpha = 1;

    const spanL = lR - lL;
    const bandL = ((moments.meanX - moments.dx - X_MIN) / X_SPAN) * spanL + lL;
    const bandR = ((moments.meanX + moments.dx - X_MIN) / X_SPAN) * spanL + lL;
    if (shade) {
      ctx.fillStyle = "rgba(129,140,248,0.09)";
      ctx.fillRect(bandL, top, bandR - bandL, bot - top);
      ctx.fillStyle = "rgba(129,140,248,0.30)";
      ctx.fillRect(bandL, top, 1, bot - top);
      ctx.fillRect(bandR - 1, top, 1, bot - top);
    }

    const yScaleL = ((bot - top) * 0.88) / Math.max(moments.peakX, 1e-12);
    ctx.beginPath();
    for (let i = 0; i < GRID_N; i += 1) {
      const px = lL + (i / (GRID_N - 1)) * spanL;
      const py = bot - PROB_X[i] * yScaleL;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineTo(lR, bot);
    ctx.lineTo(lL, bot);
    ctx.closePath();
    ctx.fillStyle = "rgba(129,140,248,0.16)";
    ctx.fill();

    ctx.strokeStyle = VIOLET;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.82 + 0.14 * breathe;
    ctx.beginPath();
    for (let i = 0; i < GRID_N; i += 1) {
      const px = lL + (i / (GRID_N - 1)) * spanL;
      const py = bot - PROB_X[i] * yScaleL;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const zxL = ((moments.meanX - X_MIN) / X_SPAN) * spanL + lL;
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(zxL) + 0.5, top);
    ctx.lineTo(Math.round(zxL) + 0.5, bot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const cyC = (top + bot) * 0.5;
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(rL, Math.round(cyC) + 0.5);
    ctx.lineTo(rR, Math.round(cyC) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const pHalf = Math.min(Math.max(Math.ceil(moments.dp * 3), 4), 36);
    const spanR = rR - rL;
    const sclP = ((bot - top) * 0.42) / Math.max(moments.peakP, 1e-12);

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rL, Math.round(bot) + 0.5);
    ctx.lineTo(rR, Math.round(bot) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const pStep = pHalf > 20 ? 10 : pHalf > 8 ? 5 : 2;
    const pStart = -Math.floor(pHalf / pStep) * pStep;
    for (let pv = pStart; pv <= pHalf; pv += pStep) {
      const px = rL + ((pv + pHalf) / (2 * pHalf)) * spanR;
      ctx.fillRect(px - 0.5, bot, 1, 5);
      ctx.fillText(tickLabel(pv), px, bot + 9);
    }

    ctx.beginPath();
    for (let i = 0; i < GRID_N; i += 1) {
      const rawPx = rL + ((P_GRID[i] + pHalf) / (2 * pHalf)) * spanR;
      const px = rawPx < rL ? rL : rawPx > rR ? rR : rawPx;
      const py = cyC - PROB_P[i] * sclP;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = GRID_N - 1; i >= 0; i -= 1) {
      const rawPx = rL + ((P_GRID[i] + pHalf) / (2 * pHalf)) * spanR;
      const px = rawPx < rL ? rL : rawPx > rR ? rR : rawPx;
      ctx.lineTo(px, cyC + PROB_P[i] * sclP);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(83,214,242,0.13)";
    ctx.fill();

    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.82 + 0.14 * breathe;
    ctx.beginPath();
    for (let i = 0; i < GRID_N; i += 1) {
      const rawPx = rL + ((P_GRID[i] + pHalf) / (2 * pHalf)) * spanR;
      const px = rawPx < rL ? rL : rawPx > rR ? rR : rawPx;
      const py = cyC - PROB_P[i] * sclP;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = CYAN;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    const pmClamped = Math.min(Math.max(moments.meanP, -pHalf), pHalf);
    const zp = rL + ((pmClamped + pHalf) / (2 * pHalf)) * spanR;
    ctx.moveTo(Math.round(zp) + 0.5, cyC - (bot - top) * 0.46);
    ctx.lineTo(Math.round(zp) + 0.5, cyC + (bot - top) * 0.46);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    ctx.font = MONO_LABEL;
    ctx.textBaseline = "top";
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.fillText(LABEL_PSI, lL, 10);
    ctx.textAlign = "right";
    ctx.fillText(LABEL_PHI, rR, 10);
  });

  const badgeClass =
    alpha === 0
      ? "rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-accent"
      : "rounded-full border border-accent-2/30 bg-accent-2/10 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-accent-2";

  return (
    <SimFrame
      title="Position–Momentum Uncertainty"
      subtitle="Chirped Gaussian wavepacket · live moments from a radix-2 FFT"
      controls={
        <>
          <Slider
            label="Position spread σx"
            value={sx}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(v) => updateParams({ sx: v })}
          />
          <Slider
            label="Chirp α"
            value={alpha}
            min={0}
            max={4}
            step={0.1}
            onChange={(v) => updateParams({ alpha: v })}
          />
          <Slider
            label="Momentum k₀"
            value={k0}
            min={-6}
            max={6}
            step={0.1}
            onChange={(v) => updateParams({ k0: v })}
          />
          <Toggle
            label="Shaded spreads"
            checked={shade}
            onChange={(v) => updateParams({ shade: v })}
          />
          <ActionButton
            onClick={() =>
              updateParams({ sx: 1, alpha: 0, k0: 0, shade: true })
            }
          >
            Reset
          </ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`\Delta x\,\Delta p \geq \frac{\hbar}{2}`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">Δx </span>
            <span className="text-fg">{fmt(moments.dx, 3)}</span>
            <span className="text-muted"> · Δp </span>
            <span className="text-fg">{fmt(moments.dp, 3)}</span>
            <span className="text-muted"> · ΔxΔp </span>
            <span className="text-accent">
              {fmt(moments.dx * moments.dp, 3)}
            </span>
            <span className="text-muted"> ≥ 0.500</span>
          </span>
          <span className={badgeClass}>{alpha === 0 ? "minimum" : "chirped"}</span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Heisenberg uncertainty explorer: a filled violet position probability density with a shaded one-sigma band on the left, and its mirrored cyan momentum spectrum on the right, which widens as the position spread narrows or the chirp steepens"
      />
    </SimFrame>
  );
}
