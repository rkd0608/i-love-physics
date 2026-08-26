"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const ROSE = "#f2708a";
const CYAN = "#53d6f2";
const MUTED = "#8b93b8";

const N = 1024;
const SAMPLE_DT = 1 / 60;
const PX_PER_SAMPLE = 2;
const PX_PER_SEC = PX_PER_SAMPLE / SAMPLE_DT;
const SPRING_SEGS = 14;
const SPRING_AMP = 9;

function omega0(kk: number, mm: number): number {
  return Math.sqrt(kk / mm);
}

function effGamma(kk: number, mm: number, gg: number): number {
  return Math.min(gg, 0.98 * omega0(kk, mm));
}

function omegaPrime(kk: number, mm: number, gg: number): number {
  const g = effGamma(kk, mm, gg);
  return Math.sqrt(kk / mm - g * g);
}

function ampOf(xx: number, vv: number, kk: number, mm: number, gg: number): number {
  const wp = omegaPrime(kk, mm, gg);
  const ge = effGamma(kk, mm, gg);
  return Math.hypot(xx, (vv + ge * xx) / wp);
}

function displacement(
  t: number,
  xx: number,
  vv: number,
  beta: number,
  ge: number,
  wp: number
): number {
  return Math.exp(-ge * t) * (xx * Math.cos(wp * t) + beta * Math.sin(wp * t));
}

type SimState = {
  t: number;
  nextT: number;
  lastT: number;
  head: number;
  count: number;
  scale: number;
  buf: Float32Array;
};

const tickCache = new Map<number, string>();

function tickLabel(n: number): string {
  let s = tickCache.get(n);
  if (s === undefined) {
    s = `${n}s`;
    tickCache.set(n, s);
  }
  return s;
}

export default function HarmonicOscillatorLab() {
  const [
    { k, m, gamma, ghost },
    updateParams,
  ] = useSimParams<{ k: number; m: number; gamma: number; ghost: boolean }>({
    k: 10,
    m: 1,
    gamma: 0.35,
    ghost: false,
  });
  const [x0, setX0] = useState(1);
  const [v0, setV0] = useState(0);
  const [playing, setPlaying] = useState(true);

  const SRef = useRef<SimState>({
    t: 0,
    nextT: 0,
    lastT: 0,
    head: 0,
    count: 0,
    scale: 1.17,
    buf: new Float32Array(N),
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setPlaying(false));
    return () => cancelAnimationFrame(id);
  }, []);

  const restart = (nx: number, nv: number, nk: number, nm: number, ng: number): void => {
    const S = SRef.current;
    S.t = 0;
    S.nextT = 0;
    S.lastT = 0;
    S.head = 0;
    S.count = 0;
    S.scale = ampOf(nx, nv, nk, nm, ng) * 1.15 + 0.02;
  };

  const pluck = (): void => {
    const sign = Math.random() < 0.5 ? -1 : 1;
    const a = sign * (0.4 + Math.random() * 0.6);
    setX0(a);
    setV0(0);
    restart(a, 0, k, m, gamma);
  };

  const changeK = (v: number): void => {
    updateParams({ k: v });
    restart(x0, v0, v, m, gamma);
  };

  const changeM = (v: number): void => {
    updateParams({ m: v });
    restart(x0, v0, k, v, gamma);
  };

  const changeGamma = (v: number): void => {
    updateParams({ gamma: v });
    restart(x0, v0, k, m, v);
  };

  const w0 = omega0(k, m);
  const wp = omegaPrime(k, m, gamma);

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    const S = SRef.current;
    paintSky(ctx, w, h);

    const ge = effGamma(k, m, gamma);
    const beta = (v0 + ge * x0) / wp;

    if (playing) {
      S.t += dt;
      let guard = 0;
      while (S.nextT <= S.t && guard < 8) {
        S.buf[S.head] = displacement(S.nextT, x0, v0, beta, ge, wp);
        S.head = (S.head + 1) % N;
        if (S.count < N) S.count += 1;
        S.lastT = S.nextT;
        S.nextT += SAMPLE_DT;
        guard += 1;
      }
      if (guard >= 8) S.nextT = S.t + SAMPLE_DT;
    }

    const lw = w * 0.45;
    const cy = h * 0.5;
    const xNow = displacement(S.t, x0, v0, beta, ge, wp);

    const margin = Math.max(22, Math.round(lw * 0.07));
    const wxl = margin;
    const wxr = lw - margin;
    const eqX = lw * 0.5;
    const bw = 34;
    const bh = 26;
    const travel = eqX - wxl - bw * 0.5 - 16;
    const rigScale = travel / 1.15;
    const bx = eqX + xNow * rigScale;

    ctx.strokeStyle = MUTED;
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wxl, cy - 74);
    ctx.lineTo(wxl, cy + 74);
    ctx.moveTo(wxr, cy - 74);
    ctx.lineTo(wxr, cy + 74);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let j = 0; j < 7; j += 1) {
      const yy = cy - 66 + j * 22;
      ctx.moveTo(wxl, yy);
      ctx.lineTo(wxl - 9, yy - 9);
      ctx.moveTo(wxr, yy);
      ctx.lineTo(wxr + 9, yy - 9);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.setLineDash([4, 4]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(eqX + 0.5, cy - 30);
    ctx.lineTo(eqX + 0.5, cy + 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const sx0 = wxl + 4;
    const sx1 = bx - bw * 0.5;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(sx0, cy);
    for (let i = 1; i < SPRING_SEGS; i += 1) {
      const fx = sx0 + ((sx1 - sx0) * i) / SPRING_SEGS;
      ctx.lineTo(fx, cy + (i % 2 === 1 ? SPRING_AMP : -SPRING_AMP));
    }
    ctx.lineTo(sx1, cy);
    ctx.stroke();

    ctx.save();
    ctx.shadowColor = "rgba(242,112,138,0.85)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = ROSE;
    ctx.beginPath();
    ctx.roundRect(bx - bw * 0.5, cy - bh * 0.5, bw, bh, 7);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(lw * 0.5 + 4) + 0.5, 12);
    ctx.lineTo(Math.round(lw * 0.5 + 4) + 0.5, h - 12);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const chartL = lw + 16;
    const chartR = w - 18;
    const chartT = 20;
    const chartB = h - 32;
    const cyC = (chartT + chartB) * 0.5;
    const halfH = (chartB - chartT) * 0.5;
    const spanPx = chartR - chartL;

    const vis = Math.min(S.count, Math.floor(spanPx / PX_PER_SAMPLE) + 1);
    let peak = ghost ? Math.abs(x0) : 0;
    for (let a = 0; a < vis; a += 1) {
      const v = S.buf[(S.head - 1 - a + N) % N];
      const av = v < 0 ? -v : v;
      if (av > peak) peak = av;
    }
    const target = peak * 1.15 + 0.02;
    S.scale += (target - S.scale) * Math.min(1, dt * 3);
    const ppm = (halfH * 0.84) / S.scale;

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const zy = Math.round(cyC) + 0.5;
    ctx.moveTo(chartL, zy);
    ctx.lineTo(chartR, zy);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const refT = S.count > 0 ? S.lastT : S.t;
    const ncols = Math.floor(spanPx);

    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = MUTED;
    const tStart = refT - spanPx / PX_PER_SEC;
    for (let tk = Math.ceil(tStart); tk <= Math.floor(refT); tk += 1) {
      const px = chartR - (refT - tk) * PX_PER_SEC;
      if (px < chartL - 1) continue;
      ctx.fillRect(px - 0.5, chartB, 1, 5);
      ctx.fillText(tickLabel(tk), px, chartB + 8);
    }

    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 1.25;
    ctx.globalAlpha = 0.85;
    for (let sgn = -1; sgn <= 1; sgn += 2) {
      ctx.beginPath();
      for (let i = 0; i <= ncols; i += 1) {
        const px = chartR - i;
        let tt = refT - i / PX_PER_SEC;
        if (tt < 0) tt = 0;
        const e = ampOf(x0, v0, k, m, gamma) * Math.exp(-ge * tt);
        const py = cyC - sgn * e * ppm;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (ghost) {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (let i = 0; i <= ncols; i += 1) {
        const px = chartR - i;
        let tt = refT - i / PX_PER_SEC;
        if (tt < 0) tt = 0;
        const py = cyC - x0 * Math.cos(w0 * tt) * ppm;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.setLineDash([]);

    if (vis > 0) {
      ctx.strokeStyle = ROSE;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let a = vis - 1; a >= 0; a -= 1) {
        const px = chartR - a * PX_PER_SAMPLE;
        const val = S.buf[(S.head - 1 - a + N) % N];
        const py = cyC - val * ppm;
        if (a === vis - 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      glowDot(ctx, chartR, cyC - S.buf[(S.head - 1 + N) % N] * ppm, 3, ROSE);
    }
  });

  const qReadout = gamma === 0 ? "∞" : fmt(w0 / (2 * gamma), 1);

  return (
    <SimFrame
      title="Damped Oscillator"
      subtitle="Closed-form underdamped SHM + strip chart"
      controls={
        <>
          <Slider
            label="Stiffness k"
            value={k}
            min={1}
            max={50}
            step={0.5}
            unit="N/m"
            onChange={changeK}
          />
          <Slider
            label="Mass m"
            value={m}
            min={0.5}
            max={10}
            step={0.1}
            unit="kg"
            onChange={changeM}
          />
          <Slider
            label="Damping γ"
            value={gamma}
            min={0}
            max={2}
            step={0.01}
            onChange={changeGamma}
          />
          <Toggle
            label="Undamped ghost"
            checked={ghost}
            onChange={(v) => updateParams({ ghost: v })}
          />
          <ActionButton onClick={pluck}>Pluck</ActionButton>
          <ActionButton tone="ghost" onClick={() => setPlaying((p) => !p)}>
            {playing ? "Pause" : "Play"}
          </ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`x(t) = e^{-\gamma t}\left[x_0\cos(\omega' t) + \tfrac{v_0+\gamma x_0}{\omega'}\sin(\omega' t)\right]`}
            className="text-sm"
          />
          <span className="font-mono text-xs text-muted">{`ω₀=${fmt(w0, 2)} rad/s · ω′=${fmt(wp, 2)} · Q=${qReadout}`}</span>
          <span className="text-xs text-muted">
            γ is clamped to min(γ, 0.98 ω₀), keeping the closed form below critical.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Damped oscillator: mass between hatched walls on the left, scrolling displacement strip chart with decay envelope on the right"
      />
    </SimFrame>
  );
}
