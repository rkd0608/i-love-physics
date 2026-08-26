"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const AMBER = "#ffd27a";
const CYAN = "#53d6f2";
const VIOLET = "#b48cf2";
const PIVOT_COLOR = "#8ea3c8";
const GUIDE_COLOR = "rgba(180, 140, 242, 0.07)";
const DASH: number[] = [4, 6];
const TWO_PI = Math.PI * 2;
const DT = 1 / 300;
const MAX_STEPS = 24;
const TRAIL_N = 600;
const TRAIL_BATCHES = 24;
const GHOST_EPS = 1e-3;
const TH1_0 = (120 * Math.PI) / 180;
const TH2_0 = (-10 * Math.PI) / 180;

type SimStore = {
  main: Float64Array;
  ghost: Float64Array;
  k1: Float64Array;
  k2: Float64Array;
  k3: Float64Array;
  k4: Float64Array;
  tmp: Float64Array;
  L: number;
  g: number;
  ts: number;
  ghostOn: boolean;
  trailOn: boolean;
  running: boolean;
  acc: number;
  uiT: number;
  delta: number;
  energy: number;
  e0: number;
  trailX: Float32Array;
  trailY: Float32Array;
  trailHead: number;
  trailLen: number;
};

function deriv(s: Float64Array, out: Float64Array, L: number, g: number): void {
  const d = s[0] - s[2];
  const sd = Math.sin(d);
  const cd = Math.cos(d);
  const den = L * (3 - Math.cos(2 * d));
  out[0] = s[1];
  out[1] =
    (-3 * g * Math.sin(s[0]) -
      g * Math.sin(s[0] - 2 * s[2]) -
      2 * sd * (s[3] * s[3] * L + s[1] * s[1] * L * cd)) /
    den;
  out[2] = s[3];
  out[3] =
    (2 * sd * (2 * s[1] * s[1] * L + 2 * g * Math.cos(s[0]) + s[3] * s[3] * L * cd)) /
    den;
}

function energyOf(s: Float64Array, L: number, g: number): number {
  const c = Math.cos(s[0] - s[2]);
  return (
    0.5 * L * L * (s[1] * s[1] + s[3] * s[3] + 2 * s[1] * s[3] * c) -
    g * L * (2 * Math.cos(s[0]) + Math.cos(s[2]))
  );
}

function rk4(
  s: Float64Array,
  h: number,
  L: number,
  g: number,
  k1: Float64Array,
  k2: Float64Array,
  k3: Float64Array,
  k4: Float64Array,
  tmp: Float64Array
): void {
  deriv(s, k1, L, g);
  for (let i = 0; i < 4; i++) tmp[i] = s[i] + 0.5 * h * k1[i];
  deriv(tmp, k2, L, g);
  for (let i = 0; i < 4; i++) tmp[i] = s[i] + 0.5 * h * k2[i];
  deriv(tmp, k3, L, g);
  for (let i = 0; i < 4; i++) tmp[i] = s[i] + h * k3[i];
  deriv(tmp, k4, L, g);
  for (let i = 0; i < 4; i++)
    s[i] += (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
}

function resetSim(st: SimStore): void {
  st.main[0] = TH1_0;
  st.main[1] = 0;
  st.main[2] = TH2_0;
  st.main[3] = 0;
  st.ghost[0] = TH1_0;
  st.ghost[1] = 0;
  st.ghost[2] = TH2_0 + GHOST_EPS;
  st.ghost[3] = 0;
  st.acc = 0;
  st.uiT = 1;
  st.delta = 0;
  st.e0 = energyOf(st.main, st.L, st.g);
  st.energy = st.e0;
  st.trailHead = 0;
  st.trailLen = 0;
}

function createSim(): SimStore {
  const st: SimStore = {
    main: new Float64Array(4),
    ghost: new Float64Array(4),
    k1: new Float64Array(4),
    k2: new Float64Array(4),
    k3: new Float64Array(4),
    k4: new Float64Array(4),
    tmp: new Float64Array(4),
    L: 1,
    g: 9.81,
    ts: 1,
    ghostOn: true,
    trailOn: true,
    running: true,
    acc: 0,
    uiT: 1,
    delta: 0,
    energy: 0,
    e0: 0,
    trailX: new Float32Array(TRAIL_N),
    trailY: new Float32Array(TRAIL_N),
    trailHead: 0,
    trailLen: 0,
  };
  resetSim(st);
  return st;
}

function integrate(st: SimStore, dt: number): void {
  st.acc += dt * st.ts;
  const cap = MAX_STEPS * DT;
  if (st.acc > cap) st.acc = cap;
  let n = 0;
  while (st.acc >= DT && n < MAX_STEPS) {
    rk4(st.main, DT, st.L, st.g, st.k1, st.k2, st.k3, st.k4, st.tmp);
    rk4(st.ghost, DT, st.L, st.g, st.k1, st.k2, st.k3, st.k4, st.tmp);
    st.acc -= DT;
    n++;
  }
}

export default function DoublePendulumLab() {
  const simRef = useRef<SimStore | null>(null);
  const [
    { L, g, ts, ghost: ghostOn, trail: trailOn },
    updateParams,
  ] = useSimParams<{
    L: number;
    g: number;
    ts: number;
    ghost: boolean;
    trail: boolean;
  }>({ L: 1, g: 9.81, ts: 1, ghost: true, trail: true });
  const [running, setRunning] = useState(true);
  const [readout, setReadout] = useState({ logDelta: -3, drift: 0 });

  const getSim = useCallback((): SimStore => {
    if (!simRef.current) simRef.current = createSim();
    return simRef.current;
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      getSim().running = false;
      setRunning(false);
    });
    return () => cancelAnimationFrame(id);
  }, [getSim]);

  const applyL = (v: number): void => {
    updateParams({ L: v });
    getSim().trailLen = 0;
  };

  const applyG = (v: number): void => {
    updateParams({ g: v });
  };

  const applyTs = (v: number): void => {
    updateParams({ ts: v });
  };

  useEffect(() => {
    const st = getSim();
    st.L = L;
    st.g = g;
    st.ts = ts;
    st.ghostOn = ghostOn;
    st.trailOn = trailOn;
    st.e0 = energyOf(st.main, L, g);
  }, [L, g, ts, ghostOn, trailOn, getSim]);

  const toggleGhost = (): void => {
    updateParams({ ghost: !ghostOn });
  };

  const toggleTrail = (): void => {
    updateParams({ trail: !trailOn });
  };

  const toggleRunning = (): void => {
    const st = getSim();
    st.running = !st.running;
    setRunning(st.running);
  };

  const resetAll = (): void => {
    resetSim(getSim());
    setReadout({ logDelta: -3, drift: 0 });
  };

  const nudge = (): void => {
    getSim().main[2] += GHOST_EPS;
  };

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    const st = getSim();
    paintSky(ctx, w, h);
    const scl = (Math.min(w, h) * 0.28) / st.L;
    const pvtX = w / 2;
    const pvtY = h * 0.42;

    if (st.running) {
      integrate(st, dt);
      if (st.trailOn) {
        const a1 = st.main[0];
        const a2 = st.main[2];
        st.trailX[st.trailHead] = (Math.sin(a1) + Math.sin(a2)) * st.L;
        st.trailY[st.trailHead] = (Math.cos(a1) + Math.cos(a2)) * st.L;
        st.trailHead = (st.trailHead + 1) % TRAIL_N;
        if (st.trailLen < TRAIL_N) st.trailLen++;
      }
    }
    if (!st.trailOn && st.trailLen > 0) st.trailLen = 0;

    ctx.save();
    ctx.setLineDash(DASH);
    ctx.strokeStyle = GUIDE_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pvtX, pvtY, 2 * st.L * scl, 0, TWO_PI);
    ctx.stroke();
    ctx.restore();

    if (st.ghostOn) {
      const gx1 = pvtX + Math.sin(st.ghost[0]) * st.L * scl;
      const gy1 = pvtY + Math.cos(st.ghost[0]) * st.L * scl;
      const gx2 = gx1 + Math.sin(st.ghost[2]) * st.L * scl;
      const gy2 = gy1 + Math.cos(st.ghost[2]) * st.L * scl;
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pvtX, pvtY);
      ctx.lineTo(gx1, gy1);
      ctx.lineTo(gx2, gy2);
      ctx.stroke();
      glowDot(ctx, gx1, gy1, 3.5, VIOLET);
      glowDot(ctx, gx2, gy2, 4.5, VIOLET);
      ctx.globalAlpha = 1;
    }

    if (st.trailLen > 1) {
      const n = st.trailLen;
      const batches = Math.min(TRAIL_BATCHES, n - 1);
      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let b = 0; b < batches; b++) {
        const i0 = Math.floor((b * n) / batches);
        const i1 = Math.floor(((b + 1) * n) / batches);
        ctx.globalAlpha = 0.8 * ((b + 1) / batches);
        ctx.beginPath();
        let idx = (st.trailHead - n + i0 + TRAIL_N) % TRAIL_N;
        ctx.moveTo(pvtX + st.trailX[idx] * scl, pvtY + st.trailY[idx] * scl);
        for (let i = i0 + 1; i <= i1; i++) {
          idx = (st.trailHead - n + i + TRAIL_N) % TRAIL_N;
          ctx.lineTo(pvtX + st.trailX[idx] * scl, pvtY + st.trailY[idx] * scl);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const m1x = pvtX + Math.sin(st.main[0]) * st.L * scl;
    const m1y = pvtY + Math.cos(st.main[0]) * st.L * scl;
    const m2x = m1x + Math.sin(st.main[2]) * st.L * scl;
    const m2y = m1y + Math.cos(st.main[2]) * st.L * scl;
    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pvtX, pvtY);
    ctx.lineTo(m1x, m1y);
    ctx.lineTo(m2x, m2y);
    ctx.stroke();
    glowDot(ctx, pvtX, pvtY, 4, PIVOT_COLOR);
    glowDot(ctx, m1x, m1y, 5, CYAN);
    glowDot(ctx, m2x, m2y, 7, AMBER);

    st.uiT += dt;
    if (st.uiT >= 0.12) {
      st.uiT = 0;
      const d = st.main[2] - st.ghost[2];
      const wrapped = d - TWO_PI * Math.round(d / TWO_PI);
      st.delta = Math.abs(wrapped);
      st.energy = energyOf(st.main, st.L, st.g);
      const ld = Math.log10(Math.max(st.delta, 1e-12));
      const drift = st.e0 !== 0 ? ((st.energy - st.e0) / Math.abs(st.e0)) * 100 : 0;
      setReadout({ logDelta: ld, drift });
    }
  });

  return (
    <SimFrame
      title="Double Pendulum"
      subtitle="Chaos, measured live"
      controls={
        <>
          <Slider
            label="Arm length L"
            value={L}
            min={0.5}
            max={2}
            step={0.05}
            unit="m"
            onChange={applyL}
          />
          <Slider
            label="Gravity"
            value={g}
            min={1}
            max={25}
            step={0.01}
            unit="m/s²"
            onChange={applyG}
          />
          <Slider
            label="Time scale"
            value={ts}
            min={0}
            max={3}
            step={0.1}
            unit="×"
            onChange={applyTs}
          />
          <Toggle label="Ghost twin" checked={ghostOn} onChange={toggleGhost} />
          <Toggle label="Tip trail" checked={trailOn} onChange={toggleTrail} />
          <ActionButton tone="ghost" onClick={toggleRunning}>
            {running ? "Pause" : "Play"}
          </ActionButton>
          <ActionButton onClick={resetAll}>Reset</ActionButton>
          <ActionButton onClick={nudge}>Nudge</ActionButton>
          <div className="flex w-full flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-1 text-xs text-muted">
            <TeX tex={String.raw`\ddot{\theta}_1 = f(\theta_1,\theta_2,\omega_1,\omega_2)`} />
            <TeX tex={String.raw`\delta\theta(t) \sim e^{\lambda t}`} />
            <span className="font-mono">
              log₁₀δ = {fmt(readout.logDelta, 1)} · ΔE = {fmt(readout.drift, 2)}%
            </span>
          </div>
        </>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Animated double pendulum with a nearly identical ghost twin diverging chaotically from the main arms"
      />
    </SimFrame>
  );
}
