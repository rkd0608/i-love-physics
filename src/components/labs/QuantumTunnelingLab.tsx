"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const N = 256;
const XMIN = -12;
const XMAX = 12;
const DX = (XMAX - XMIN) / N;
const TWO_PI = Math.PI * 2;
const DT = 1e-3;
const SIGMA = 1.5;
const PACKET_X0 = -6;
const EDGE_CELLS = 16;
const V_TOP = 21;
const P_FLOOR = 0.04;
const PEAK_EASE = 0.06;
const SPLIT_MIN_L = 0.01;
const SPLIT_MIN_R = 0.001;
const MEASURE_EVERY = 10;

const CYAN = "#53d6f2";
const CYAN_FILL = "rgba(83,214,242,0.16)";
const CYAN_SOFT = "rgba(83,214,242,0.4)";
const AMBER = "#ffd27a";
const AMBER_FILL = "rgba(255,210,122,0.12)";
const BASE_LINE = "rgba(139,147,184,0.45)";
const TICK_TEXT = "rgba(139,147,184,0.7)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const TICK_XS: readonly number[] = [-12, -6, 0, 6, 12];
const TICK_LABELS: readonly string[] = ["−12", "−6", "0", "6", "12"];

interface Stats {
  norm: number;
  absorbed: number;
  left: number;
  right: number;
  split: boolean;
}

function buildBitrev(): Uint8Array {
  const rev = new Uint8Array(N);
  let j = 0;
  for (let i = 1; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j |= bit;
    rev[i] = j;
  }
  return rev;
}

function buildTwiddles(): { c: Float32Array; s: Float32Array } {
  const half = N >> 1;
  const c = new Float32Array(half);
  const s = new Float32Array(half);
  for (let m = 0; m < half; m++) {
    const th = (TWO_PI * m) / N;
    c[m] = Math.cos(th);
    s[m] = Math.sin(th);
  }
  return { c, s };
}

function buildKGrid(): Float32Array {
  const k = new Float32Array(N);
  const base = TWO_PI / (N * DX);
  for (let m = 0; m < N; m++) {
    k[m] = m <= N >> 1 ? base * m : base * (m - N);
  }
  return k;
}

function buildDrift(k: Float32Array): { c: Float32Array; s: Float32Array } {
  const c = new Float32Array(N);
  const s = new Float32Array(N);
  for (let m = 0; m < N; m++) {
    const th = (k[m] * k[m] * DT) / 2;
    c[m] = Math.cos(th);
    s[m] = -Math.sin(th);
  }
  return { c, s };
}

function buildMask(): Float32Array {
  const mask = new Float32Array(N);
  for (let i = 0; i < N; i++) mask[i] = 1;
  for (let d = 0; d < EDGE_CELLS; d++) {
    const v = Math.cos((Math.PI / 2) * ((EDGE_CELLS - d) / EDGE_CELLS)) ** 4;
    mask[d] = v;
    mask[N - 1 - d] = v;
  }
  return mask;
}

const BITREV = buildBitrev();
const TW = buildTwiddles();
const DRIFT = buildDrift(buildKGrid());
const MASK = buildMask();
const INV_N_FFT = 1 / N;

const PSI_RE = new Float32Array(N);
const PSI_IM = new Float32Array(N);
const SCRATCH = new Float32Array(N * 2);
const KICK_C = new Float32Array(N);
const KICK_S = new Float32Array(N);

function fft(buf: Float32Array, inverse: boolean): void {
  for (let i = 0; i < N; i++) {
    const j = BITREV[i];
    if (j <= i) continue;
    const a = i << 1;
    const b = j << 1;
    const tr = buf[a];
    const ti = buf[a + 1];
    buf[a] = buf[b];
    buf[a + 1] = buf[b + 1];
    buf[b] = tr;
    buf[b + 1] = ti;
  }
  const sg = inverse ? 1 : -1;
  for (let len = 2; len <= N; len <<= 1) {
    const half = len >> 1;
    const step = N / len;
    for (let baseI = 0; baseI < N; baseI += len) {
      let tw = 0;
      for (let m = 0; m < half; m++) {
        const c = TW.c[tw];
        const s = sg * TW.s[tw];
        const pa = (baseI + m) << 1;
        const pb = pa + (half << 1);
        const br = buf[pb] * c - buf[pb + 1] * s;
        const bi = buf[pb] * s + buf[pb + 1] * c;
        buf[pb] = buf[pa] - br;
        buf[pb + 1] = buf[pa + 1] - bi;
        buf[pa] += br;
        buf[pa + 1] += bi;
        tw += step;
      }
    }
  }
  if (!inverse) return;
  for (let i = 0; i < N * 2; i++) buf[i] *= INV_N_FFT;
}

function rebuildKick(v0: number, w: number): void {
  const hw = w / 2;
  for (let i = 0; i < N; i++) {
    const x = XMIN + i * DX;
    const v = x >= -hw && x <= hw ? v0 : 0;
    const th = (v * DT) / 2;
    KICK_C[i] = Math.cos(th);
    KICK_S[i] = -Math.sin(th);
  }
}

function halfKick(): void {
  for (let i = 0; i < N; i++) {
    const c = KICK_C[i];
    const s = KICK_S[i];
    const r = PSI_RE[i];
    const im = PSI_IM[i];
    PSI_RE[i] = r * c - im * s;
    PSI_IM[i] = r * s + im * c;
  }
}

function applyDrift(): void {
  for (let m = 0; m < N; m++) {
    const a = SCRATCH[m << 1];
    const b = SCRATCH[(m << 1) + 1];
    const c = DRIFT.c[m];
    const s = DRIFT.s[m];
    SCRATCH[m << 1] = a * c - b * s;
    SCRATCH[(m << 1) + 1] = a * s + b * c;
  }
}

function substep(absorbedRef: { current: number }, normRef: { current: number }): void {
  halfKick();
  for (let i = 0; i < N; i++) {
    SCRATCH[i << 1] = PSI_RE[i];
    SCRATCH[(i << 1) + 1] = PSI_IM[i];
  }
  fft(SCRATCH, false);
  applyDrift();
  fft(SCRATCH, true);
  for (let i = 0; i < N; i++) {
    PSI_RE[i] = SCRATCH[i << 1];
    PSI_IM[i] = SCRATCH[(i << 1) + 1];
  }
  halfKick();
  let loss = 0;
  for (let d = 0; d < EDGE_CELLS; d++) {
    const li = d;
    const ri = N - 1 - d;
    const ml = MASK[d];
    const m2 = 1 - ml * ml;
    loss += (PSI_RE[li] * PSI_RE[li] + PSI_IM[li] * PSI_IM[li]) * m2;
    PSI_RE[li] *= ml;
    PSI_IM[li] *= ml;
    loss += (PSI_RE[ri] * PSI_RE[ri] + PSI_IM[ri] * PSI_IM[ri]) * m2;
    PSI_RE[ri] *= ml;
    PSI_IM[ri] *= ml;
  }
  absorbedRef.current += loss;
  normRef.current -= loss;
}

function initPacket(k0: number): void {
  let sum = 0;
  const g4 = 4 * SIGMA * SIGMA;
  for (let i = 0; i < N; i++) {
    const x = XMIN + i * DX;
    const env = Math.exp(-((x - PACKET_X0) * (x - PACKET_X0)) / g4);
    PSI_RE[i] = env * Math.cos(k0 * x);
    PSI_IM[i] = env * Math.sin(k0 * x);
    sum += env * env;
  }
  const sc = 1 / Math.sqrt(sum * DX);
  for (let i = 0; i < N; i++) {
    PSI_RE[i] *= sc;
    PSI_IM[i] *= sc;
  }
}

initPacket(4);

export default function QuantumTunnelingLab() {
  const [
    { k0, v0, w, steps },
    updateParams,
  ] = useSimParams<{ k0: number; v0: number; w: number; steps: number }>({
    k0: 4,
    v0: 10,
    w: 1,
    steps: 8,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [resetSeq, setResetSeq] = useState(0);
  const [stats, setStats] = useState<Stats>({
    norm: 1,
    absorbed: 0,
    left: NaN,
    right: NaN,
    split: false,
  });

  const k0Ref = useRef(k0);
  const v0Ref = useRef(v0);
  const wRef = useRef(w);
  const stepsRef = useRef(steps);
  const pausedRef = useRef(paused);

  useEffect(() => {
    k0Ref.current = k0;
    v0Ref.current = v0;
    wRef.current = w;
    stepsRef.current = steps;
    pausedRef.current = paused;
  });

  const normRawRef = useRef(1 / DX);
  const absorbedRawRef = useRef(0);
  const frameRef = useRef(0);
  const kickVRef = useRef(NaN);
  const kickWRef = useRef(NaN);
  const peakRef = useRef(1 / (SIGMA * Math.sqrt(TWO_PI)));
  const splitRef = useRef(false);

  const measure = (): void => {
    const hw = wRef.current / 2;
    let tot = 0;
    let left = 0;
    let right = 0;
    for (let i = 0; i < N; i++) {
      const p = PSI_RE[i] * PSI_RE[i] + PSI_IM[i] * PSI_IM[i];
      tot += p;
      const x = XMIN + i * DX;
      if (x < -hw) left += p;
      else if (x > hw) right += p;
    }
    normRawRef.current = tot;
    const lp = left * DX;
    const rp = right * DX;
    if (!splitRef.current && lp > SPLIT_MIN_L && rp > SPLIT_MIN_R) splitRef.current = true;
    setStats({
      norm: tot * DX,
      absorbed: absorbedRawRef.current * DX,
      left: lp,
      right: rp,
      split: splitRef.current,
    });
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    wCss: number,
    hCss: number
  ): void => {
    if (!pausedRef.current) {
      if (kickVRef.current !== v0Ref.current || kickWRef.current !== wRef.current) {
        kickVRef.current = v0Ref.current;
        kickWRef.current = wRef.current;
        rebuildKick(v0Ref.current, wRef.current);
      }
      const nSub = Math.max(1, Math.round(stepsRef.current));
      for (let s = 0; s < nSub; s++) {
        substep(absorbedRawRef, normRawRef);
      }
      frameRef.current++;
      if (frameRef.current % MEASURE_EVERY === 0) measure();
    }

    paintSky(ctx, wCss, hCss);
    ctx.textBaseline = "alphabetic";

    const pad = Math.max(34, wCss * 0.045);
    const sx = (wCss - pad * 2) / (XMAX - XMIN);
    const y0 = hCss * 0.84;
    const plotH = hCss * 0.6;

    ctx.strokeStyle = BASE_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y0);
    ctx.lineTo(wCss - pad, y0);
    ctx.stroke();

    const e = (k0Ref.current * k0Ref.current) / 2;
    const yE = y0 - (e / V_TOP) * plotH;
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = CYAN_SOFT;
    ctx.beginPath();
    ctx.moveTo(pad, yE);
    ctx.lineTo(wCss - pad, yE);
    ctx.stroke();
    ctx.setLineDash([]);

    const v = v0Ref.current;
    const hw = wRef.current / 2;
    const bx1 = pad + (-hw - XMIN) * sx;
    const bx2 = pad + (hw - XMIN) * sx;
    const vy = y0 - (v / V_TOP) * plotH;
    if (v > 0) {
      ctx.fillStyle = AMBER_FILL;
      ctx.fillRect(bx1, vy, bx2 - bx1, y0 - vy);
    }

    const pScale = plotH / peakRef.current;
    let maxP = 0;
    ctx.beginPath();
    ctx.moveTo(pad, y0);
    for (let i = 0; i < N; i++) {
      const p = PSI_RE[i] * PSI_RE[i] + PSI_IM[i] * PSI_IM[i];
      if (p > maxP) maxP = p;
      const cx = pad + i * DX * sx;
      ctx.lineTo(cx, y0 - p * pScale);
    }
    ctx.lineTo(wCss - pad, y0);
    ctx.closePath();
    ctx.fillStyle = CYAN_FILL;
    ctx.fill();
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = "round";
    ctx.stroke();

    const targetPeak = Math.max(maxP, P_FLOOR);
    peakRef.current += (targetPeak - peakRef.current) * PEAK_EASE;

    ctx.strokeStyle = AMBER;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx1, y0);
    ctx.lineTo(bx1, vy);
    ctx.lineTo(bx2, vy);
    ctx.lineTo(bx2, y0);
    ctx.stroke();

    ctx.font = MONO_SMALL;
    ctx.fillStyle = TICK_TEXT;
    ctx.textAlign = "center";
    for (let t = 0; t < TICK_XS.length; t++) {
      const tx = pad + (TICK_XS[t] - XMIN) * sx;
      ctx.fillRect(tx - 0.5, y0 + 3, 1, 5);
      ctx.fillText(TICK_LABELS[t], tx, y0 + 16);
    }
    if (v > 0) {
      ctx.fillStyle = AMBER;
      ctx.textAlign = "center";
      ctx.fillText("V₀", (bx1 + bx2) / 2, vy - 6);
    }
    ctx.fillStyle = CYAN_SOFT;
    ctx.textAlign = "left";
    ctx.fillText("E", wCss - pad + 5, yE + 3);

    ctx.fillStyle = CYAN;
    ctx.fillRect(pad + 2, 14, 10, 3);
    ctx.fillText("|ψ|²", pad + 16, 20);
    ctx.fillStyle = AMBER;
    ctx.fillRect(pad + 62, 14, 10, 3);
    ctx.fillText("V(x)", pad + 76, 20);
    ctx.textAlign = "left";
  };

  const canvasRef = useSimLoop(draw);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      initPacket(k0);
      normRawRef.current = 1 / DX;
      absorbedRawRef.current = 0;
      splitRef.current = false;
      setStats({ norm: 1, absorbed: 0, left: NaN, right: NaN, split: false });
    });
    return () => cancelAnimationFrame(id);
  }, [k0, resetSeq]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const energy = (k0 * k0) / 2;

  return (
    <SimFrame
      title="Quantum Tunneling"
      subtitle="Split-step Fourier propagation through a repulsive barrier"
      controls={
        <>
          <Slider
            label="Packet momentum k₀"
            value={k0}
            min={2}
            max={8}
            step={0.1}
            onChange={(val) => updateParams({ k0: val })}
          />
          <Slider
            label="Barrier height V₀"
            value={v0}
            min={0}
            max={20}
            step={0.5}
            onChange={(val) => updateParams({ v0: val })}
          />
          <Slider
            label="Barrier width"
            value={w}
            min={0.2}
            max={3}
            step={0.05}
            onChange={(val) => updateParams({ w: val })}
          />
          <Slider
            label="Steps per frame"
            value={steps}
            min={1}
            max={20}
            step={1}
            onChange={(val) => updateParams({ steps: val })}
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
          <ActionButton onClick={() => setResetSeq((s) => s + 1)}>
            Reset packet
          </ActionButton>
          <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-3 text-xs text-muted">
            <TeX tex={String.raw`|\psi|^2 \sim e^{-x^2/2\sigma^2},\quad \sigma = 1.5`} />
            <span className="font-mono">
              E = k₀²/2 = {fmt(energy, 2)} · κ ={" "}
              {fmt(
                energy < v0 ? Math.sqrt(2 * (v0 - energy)) : NaN,
                2
              )}
            </span>
          </div>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`i\hbar\frac{\partial\psi}{\partial t}=\left(-\frac{\hbar^2}{2m}\partial_x^2+V\right)\psi`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">E = k₀²/2 = </span>
            <span className="text-accent">{fmt(energy, 2)}</span>
            <span className="text-muted"> vs V₀ = </span>
            <span className="text-accent">{fmt(v0, 1)}</span>
            <span className="text-muted"> · </span>
            <span className={energy < v0 ? "text-accent" : "text-fg"}>
              {energy < v0 ? "tunneling" : "over-barrier"}
            </span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">Σ|ψ|² + absorbed = </span>
            <span className="text-accent">
              {fmt(stats.norm + stats.absorbed, 4)}
            </span>
          </span>
          {stats.split ? (
            <span className="font-mono text-xs">
              <span className="text-muted">R = </span>
              <span className="text-accent">{fmt(stats.left * 100, 1)}%</span>
              <span className="text-muted"> · T = </span>
              <span className="text-accent">{fmt(stats.right * 100, 1)}%</span>
            </span>
          ) : null}
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark simulation of a quantum wavepacket meeting a repulsive barrier: the cyan probability density splits into a reflected part and a transmitted part that leaks through the amber barrier outline, with a dashed line marking the packet energy and tick marks spanning minus twelve to twelve"
      />
    </SimFrame>
  );
}
