"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const TWO_PI = Math.PI * 2;
const V_WAVE = 100;
const CAP = 64;
const GAP_N = 6;
const EMIT_GUARD = 8;
const STAT_INTERVAL = 0.2;
const START_X = 40;
const WRAP_PAD = 24;
const CULL_MARGIN = 40;

const CYAN = "#67e8f9";
const RED = "#ff6b6b";
const SOURCE_COLOR = "#ffd27a";
const OBSERVER_COLOR = "#e6ebff";
const CONE_LINE = "rgba(255, 210, 122, 0.55)";
const CONE_FILL = "rgba(255, 210, 122, 0.05)";
const LANE_COLOR = "rgba(103, 232, 249, 0.09)";
const MARKER_COLOR = "rgba(126, 240, 176, 0.12)";
const LABEL_FILL = "#8b93b8";
const MONO_FONT = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";

const crestX = new Float32Array(CAP);
const crestY = new Float32Array(CAP);
const crestR = new Float32Array(CAP);
const crestDone = new Uint8Array(CAP);
const gaps = new Float32Array(GAP_N);

type SimState = {
  sx: number;
  phase: number;
  simT: number;
  cnt: number;
  gi: number;
  gcnt: number;
  lastT: number;
  haveLast: boolean;
};

type Stats = { meas: number; theory: number };

const NO_STATS: Stats = { meas: NaN, theory: NaN };

type ViewSize = { w: number; h: number; cy: number };

type Backdrop = { key: string; canvas: HTMLCanvasElement | null };

function ensureBackdrop(
  store: Backdrop,
  w: number,
  h: number,
  cy: number
): HTMLCanvasElement {
  const key = `${w}x${h}`;
  if (store.canvas && store.key === key) return store.canvas;
  const oc = document.createElement("canvas");
  oc.width = Math.max(1, Math.round(w));
  oc.height = Math.max(1, Math.round(h));
  const o = oc.getContext("2d");
  if (o) {
    paintSky(o, w, h);
    o.strokeStyle = LANE_COLOR;
    o.lineWidth = 1;
    o.setLineDash([4, 8]);
    o.beginPath();
    o.moveTo(0, cy);
    o.lineTo(w, cy);
    o.stroke();
    o.strokeStyle = MARKER_COLOR;
    o.beginPath();
    o.moveTo(w * 0.76, 0);
    o.lineTo(w * 0.76, h);
    o.stroke();
    o.setLineDash([]);
  }
  store.canvas = oc;
  store.key = key;
  return oc;
}

function emitCrest(x: number, y: number, st: SimState): void {
  if (st.cnt >= CAP) {
    crestX.copyWithin(0, 1);
    crestY.copyWithin(0, 1);
    crestR.copyWithin(0, 1);
    crestDone.copyWithin(0, 1);
    st.cnt = CAP - 1;
  }
  const i = st.cnt++;
  crestX[i] = x;
  crestY[i] = y;
  crestR[i] = 0;
  crestDone[i] = 0;
}

export default function DopplerEffectLab() {
  const [
    { vs, yo, f, mach },
    updateParams,
  ] = useSimParams<{ vs: number; yo: number; f: number; mach: boolean }>({
    vs: 50,
    yo: 0,
    f: 1.5,
    mach: true,
  });
  const [paused, setPaused] = useState(false);
  const [rm, setRm] = useState(false);
  const [stats, setStats] = useState<Stats>(NO_STATS);

  const cfg = useRef({ vs: 50, yo: 0, f: 1.5, mach: true, paused: false });

  useEffect(() => {
    const c = cfg.current;
    c.vs = vs;
    c.yo = yo;
    c.f = f;
    c.mach = mach;
    c.paused = paused;
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setRm(true);
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const stRef = useRef<SimState | null>(null);
  if (stRef.current == null) {
    stRef.current = {
      sx: START_X,
      phase: 0,
      simT: 0,
      cnt: 0,
      gi: 0,
      gcnt: 0,
      lastT: 0,
      haveLast: false,
    };
  }

  const size = useRef<ViewSize>({ w: 0, h: 0, cy: 0 });
  const bg = useRef<Backdrop>({ key: "", canvas: null });
  const statClock = useRef(0);

  const reset = useCallback(() => {
    const st = stRef.current;
    if (!st) return;
    st.sx = START_X;
    st.phase = 0;
    st.simT = 0;
    st.cnt = 0;
    st.gi = 0;
    st.gcnt = 0;
    st.haveLast = false;
    statClock.current = STAT_INTERVAL;
    setStats(NO_STATS);
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
      const s = size.current;
      const st = stRef.current;
      if (!st) return;
      if (s.w !== w || s.h !== h) {
        s.w = w;
        s.h = h;
        s.cy = h / 2;
      }
      const backdrop = ensureBackdrop(bg.current, w, h, s.cy);
      ctx.drawImage(backdrop, 0, 0, w, h);

      const c = cfg.current;
      const ox = w * 0.76;
      const oy = s.cy + c.yo;
      const rMax = Math.hypot(w, h) + CULL_MARGIN;

      if (c.mach && c.vs >= V_WAVE) {
        const mu = Math.asin(Math.min(1, V_WAVE / c.vs));
        const exU = st.sx - w * Math.cos(mu);
        const exD = st.sx - w * Math.cos(mu);
        const eyU = s.cy - w * Math.sin(mu);
        const eyD = s.cy + w * Math.sin(mu);
        ctx.fillStyle = CONE_FILL;
        ctx.beginPath();
        ctx.moveTo(st.sx, s.cy);
        ctx.lineTo(exU, eyU);
        ctx.lineTo(exD, eyD);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = CONE_LINE;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(st.sx, s.cy);
        ctx.lineTo(exU, eyU);
        ctx.moveTo(st.sx, s.cy);
        ctx.lineTo(exD, eyD);
        ctx.stroke();
      }

      if (!c.paused) {
        st.simT += dt;
        st.sx += c.vs * dt;
        if (st.sx > w + WRAP_PAD) st.sx = -WRAP_PAD;
        const period = 1 / c.f;
        st.phase += dt;
        let guard = EMIT_GUARD;
        while (st.phase >= period && guard > 0) {
          st.phase -= period;
          emitCrest(st.sx, s.cy, st);
          guard--;
        }
        const n = st.cnt;
        let wri = 0;
        for (let i = 0; i < n; i++) {
          crestR[i] += V_WAVE * dt;
          const dx = crestX[i] - ox;
          const dy = crestY[i] - oy;
          if (
            crestDone[i] === 0 &&
            dx * dx + dy * dy <= crestR[i] * crestR[i]
          ) {
            crestDone[i] = 1;
            if (st.haveLast) {
              gaps[st.gi] = st.simT - st.lastT;
              st.gi = (st.gi + 1) % GAP_N;
              if (st.gcnt < GAP_N) st.gcnt++;
            }
            st.lastT = st.simT;
            st.haveLast = true;
          }
          if (crestR[i] <= rMax) {
            if (wri !== i) {
              crestX[wri] = crestX[i];
              crestY[wri] = crestY[i];
              crestR[wri] = crestR[i];
              crestDone[wri] = crestDone[i];
            }
            wri++;
          }
        }
        st.cnt = wri;
      }

      ctx.lineWidth = 1.5;
      for (let i = 0; i < st.cnt; i++) {
        if (crestR[i] < 0.5) continue;
        const fade = 1 - crestR[i] / rMax;
        ctx.globalAlpha = Math.max(0.06, 0.8 * fade * fade);
        ctx.strokeStyle = crestX[i] < ox ? CYAN : RED;
        ctx.beginPath();
        ctx.arc(crestX[i], crestY[i], crestR[i], 0, TWO_PI);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      glowDot(ctx, ox, oy, 6, OBSERVER_COLOR);
      glowDot(ctx, st.sx, s.cy, 7, SOURCE_COLOR);
      if (c.vs > 0) {
        drawArrow(ctx, st.sx + 16, s.cy, st.sx + 38, s.cy, SOURCE_COLOR, 2);
      }
      ctx.font = MONO_FONT;
      ctx.fillStyle = LABEL_FILL;
      ctx.fillText("S", st.sx + 6, s.cy - 12);
      ctx.fillText("O", ox + 10, oy - 10);

      statClock.current += dt;
      if (statClock.current >= STAT_INTERVAL) {
        statClock.current = 0;
        const dObs = Math.hypot(ox - st.sx, oy - s.cy);
        const cosT = dObs > 1 ? (ox - st.sx) / dObs : 1;
        const den = V_WAVE - c.vs * cosT;
        const theory = den < 1 ? NaN : (c.f * V_WAVE) / den;
        let meas = NaN;
        if (st.gcnt > 0) {
          let sum = 0;
          for (let k = 0; k < st.gcnt; k++) sum += gaps[k];
          meas = st.gcnt / sum;
        }
        setStats({ meas, theory });
      }
    },
    []
  );

  const canvasRef = useSimLoop(draw);

  const liveRow = (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <TeX
        tex={`f' = ${fmt(f, 1)}\\,\\frac{${fmt(V_WAVE, 0)}}{${fmt(V_WAVE, 0)} - ${fmt(vs, 0)}\\cos\\theta} \\approx ${fmt(stats.theory, 2)}\\,\\text{Hz}`}
      />
      <span className="font-mono">measured f′ = {fmt(stats.meas, 2)} Hz</span>
      <span className="font-mono">
        M = vₛ/v = {fmt(vs / V_WAVE, 2)}
        {vs >= V_WAVE ? ` · μ = ${fmt((Math.asin(Math.min(1, V_WAVE / vs)) * 180) / Math.PI, 1)}°` : ""}
      </span>
    </span>
  );

  return (
    <SimFrame
      title="Doppler Wavefronts"
      subtitle="A source sweeps the lane, emitting a crest every period"
      controls={
        <>
          <Slider
            label="Source speed vₛ"
            value={vs}
            min={0}
            max={160}
            step={2}
            unit="px/s"
            onChange={(v) => updateParams({ vs: v })}
          />
          <Slider
            label="Observer offset yₒ"
            value={yo}
            min={-120}
            max={120}
            step={5}
            unit="px"
            onChange={(v) => updateParams({ yo: v })}
          />
          <Slider
            label="Emission frequency f"
            value={f}
            min={0.5}
            max={3}
            step={0.1}
            unit="Hz"
            onChange={(v) => updateParams({ f: v })}
          />
          <Toggle label="Mach cone" checked={mach} onChange={(v) => updateParams({ mach: v })} />
          {rm ? (
            <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
              {paused ? "Play" : "Pause"}
            </ActionButton>
          ) : null}
          <ActionButton tone="ghost" onClick={reset}>
            Reset source
          </ActionButton>
        </>
      }
      footnote={liveRow}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark canvas where a moving source emits expanding circular wavefronts that bunch ahead of it and stretch behind, tinted cyan approaching and red receding, with a fixed observer dot measuring the detected frequency and a Mach cone appearing past the wave speed"
      />
    </SimFrame>
  );
}
