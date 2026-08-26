"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const PALETTE = ["#53d6f2", "#b48cf2", "#ffd27a", "#7ef0b0"];
const ESCAPE_RIM = "#7ef0b0";
const STAR_COLOR = "#ffd27a";
const DRAG_COLOR = "#ffd27a";
const GRID_COLOR = "rgba(83, 214, 242, 0.05)";
const GM = 1;
const EPS2 = 1e-8;
const DT_SUB = 1 / 240;
const MAX_SUBSTEPS = 16;
const MAX_PLANETS = 12;
const TRAIL_MAX = 400;
const ALPHA_BANDS = 6;
const PRED_STEPS = 300;
const PRED_DT = 1 / 60;
const LAUNCH_RATE = 0.9;
const SPEED_CAP = 3;
const MIN_DRAG_PX = 8;
const VECTOR_GAIN = 8;
const VECTOR_PX = 3;
const ARROW_MAX_PX = 46;
const STAT_INTERVAL = 0.15;

type Planet = {
  slot: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  escaper: boolean;
  color: string;
  count: number;
};

type ViewSize = { w: number; h: number; cx: number; cy: number; scale: number };

type Backdrop = { key: string; canvas: HTMLCanvasElement | null };

type DragState = { active: boolean; id: number; x0: number; y0: number; x1: number; y1: number };

type Stats = { has: boolean; r: number; v2: number; a: number; l: number };

const NO_STATS: Stats = { has: false, r: 0, v2: 0, a: 0, l: 0 };

const trailBuf = new Float32Array(MAX_PLANETS * TRAIL_MAX * 2);
const predBuf = new Float32Array((PRED_STEPS + 1) * 2);
const accVec = { x: 0, y: 0 };

function gravity(x: number, y: number): void {
  const r2 = x * x + y * y + EPS2;
  const inv = GM / (r2 * Math.sqrt(r2));
  accVec.x = -x * inv;
  accVec.y = -y * inv;
}

function stepBody(p: Planet, h: number): void {
  gravity(p.x, p.y);
  p.vx += accVec.x * h;
  p.vy += accVec.y * h;
  p.x += p.vx * h;
  p.y += p.vy * h;
}

function ensureBackdrop(
  store: Backdrop,
  w: number,
  h: number,
  cx: number,
  cy: number,
  scale: number
): HTMLCanvasElement {
  const key = `${w}x${h}`;
  if (store.canvas && store.key === key) return store.canvas;
  const oc = document.createElement("canvas");
  oc.width = Math.max(1, Math.round(w));
  oc.height = Math.max(1, Math.round(h));
  const o = oc.getContext("2d");
  if (o) {
    paintSky(o, w, h);
    o.strokeStyle = GRID_COLOR;
    o.lineWidth = 1;
    for (let i = 1; i <= 9; i++) {
      o.beginPath();
      o.arc(cx, cy, i * scale * 0.5, 0, Math.PI * 2);
      o.stroke();
    }
    const vg = o.createRadialGradient(cx, cy, Math.min(w, h) * 0.25, cx, cy, Math.hypot(cx, cy));
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0,0.45)");
    o.fillStyle = vg;
    o.fillRect(0, 0, w, h);
  }
  store.canvas = oc;
  store.key = key;
  return oc;
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  p: Planet,
  s: ViewSize,
  cap: number
): void {
  const span = Math.min(p.count, cap, TRAIL_MAX);
  if (span < 2) return;
  const kStart = p.count - span;
  const base = p.slot * TRAIL_MAX * 2;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = p.color;
  for (let b = 0; b < ALPHA_BANDS; b++) {
    const from = kStart + Math.floor((span * b) / ALPHA_BANDS);
    const rawTo = kStart + Math.floor((span * (b + 1)) / ALPHA_BANDS);
    const to = Math.min(rawTo, p.count - 1);
    if (to - from < 1) continue;
    ctx.globalAlpha = ((b + 0.5) / ALPHA_BANDS) * 0.72;
    ctx.beginPath();
    for (let k = from; k <= to; k++) {
      const i = base + (k % TRAIL_MAX) * 2;
      const px = s.cx + trailBuf[i] * s.scale;
      const py = s.cy - trailBuf[i + 1] * s.scale;
      if (k === from) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export default function OrbitsLab() {
  const [
    { ts: timeScale, tr: trailLen, vec: showVectors, pred: showPred },
    updateParams,
  ] = useSimParams<{ ts: number; tr: number; vec: boolean; pred: boolean }>({
    ts: 1,
    tr: 200,
    vec: true,
    pred: true,
  });
  const [paused, setPaused] = useState(false);
  const [rm, setRm] = useState(false);
  const [stats, setStats] = useState<Stats>(NO_STATS);

  const cfg = useRef({
    timeScale: 1,
    trailLen: 200,
    showVectors: true,
    showPred: true,
    paused: false,
  });

  useEffect(() => {
    const c = cfg.current;
    c.timeScale = timeScale;
    c.trailLen = trailLen;
    c.showVectors = showVectors;
    c.showPred = showPred;
    c.paused = paused;
  });

  const planetsRef = useRef<Planet[]>([]);
  const accTime = useRef(0);
  const statClock = useRef(0);
  const colorIdx = useRef(0);
  const slotIdx = useRef(0);
  const hadStats = useRef(false);
  const size = useRef<ViewSize>({ w: 0, h: 0, cx: 0, cy: 0, scale: 0 });
  const bg = useRef<Backdrop>({ key: "", canvas: null });
  const drag = useRef<DragState>({ active: false, id: -1, x0: 0, y0: 0, x1: 0, y1: 0 });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setRm(true);
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const clearAll = useCallback(() => {
    planetsRef.current.length = 0;
    accTime.current = 0;
    colorIdx.current = 0;
    slotIdx.current = 0;
    hadStats.current = false;
    setStats(NO_STATS);
  }, []);

  const spawnFromDrag = useCallback(() => {
    const s = size.current;
    const d = drag.current;
    if (s.scale <= 0) return;
    const dx = d.x1 - d.x0;
    const dy = d.y1 - d.y0;
    if (Math.hypot(dx, dy) < MIN_DRAG_PX) return;
    const halfMin = Math.max(Math.min(s.w, s.h) / 2, 1);
    let vx = (dx / halfMin) * LAUNCH_RATE;
    let vy = (-dy / halfMin) * LAUNCH_RATE;
    const sp = Math.hypot(vx, vy);
    if (sp > SPEED_CAP) {
      vx *= SPEED_CAP / sp;
      vy *= SPEED_CAP / sp;
    }
    const wx = (d.x0 - s.cx) / s.scale;
    const wy = (s.cy - d.y0) / s.scale;
    const r = Math.max(Math.hypot(wx, wy), 1e-6);
    const energy = 0.5 * (vx * vx + vy * vy) - GM / r;
    const planets = planetsRef.current;
    if (planets.length >= MAX_PLANETS) planets.shift();
    planets.push({
      slot: slotIdx.current,
      x: wx,
      y: wy,
      vx,
      vy,
      escaper: energy >= 0,
      color: PALETTE[colorIdx.current % PALETTE.length],
      count: 0,
    });
    colorIdx.current++;
    slotIdx.current = (slotIdx.current + 1) % MAX_PLANETS;
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
      const s = size.current;
      if (s.w !== w || s.h !== h) {
        s.w = w;
        s.h = h;
        s.cx = w / 2;
        s.cy = h / 2;
        s.scale = Math.min(w, h) / 5;
      }
      const backdrop = ensureBackdrop(bg.current, w, h, s.cx, s.cy, s.scale);
      ctx.drawImage(backdrop, 0, 0, w, h);

      const c = cfg.current;
      const planets = planetsRef.current;

      let acc = accTime.current + dt * c.timeScale;
      if (acc > MAX_SUBSTEPS * DT_SUB) acc = MAX_SUBSTEPS * DT_SUB;
      const ticks = Math.floor(acc / DT_SUB);
      accTime.current = acc - ticks * DT_SUB;

      if (!c.paused && ticks > 0) {
        for (let pi = 0; pi < planets.length; pi++) {
          const p = planets[pi];
          for (let k = 0; k < ticks; k++) stepBody(p, DT_SUB);
          const base = p.slot * TRAIL_MAX * 2;
          const m = (p.count % TRAIL_MAX) * 2;
          trailBuf[base + m] = p.x;
          trailBuf[base + m + 1] = p.y;
          p.count++;
        }
        let write = 0;
        for (let pi = 0; pi < planets.length; pi++) {
          const p = planets[pi];
          if (Number.isFinite(p.x + p.y + p.vx + p.vy)) planets[write++] = p;
        }
        planets.length = write;
      }

      glowDot(ctx, s.cx, s.cy, 14, STAR_COLOR);

      for (let pi = 0; pi < planets.length; pi++) {
        const p = planets[pi];
        const sx = s.cx + p.x * s.scale;
        const sy = s.cy - p.y * s.scale;
        drawTrail(ctx, p, s, c.trailLen);
        glowDot(ctx, sx, sy, 4.5, p.color);
        if (p.escaper) {
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = ESCAPE_RIM;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 7.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        if (c.showVectors) {
          const gx = p.vx * VECTOR_GAIN * VECTOR_PX;
          const gy = -p.vy * VECTOR_GAIN * VECTOR_PX;
          const gl = Math.hypot(gx, gy);
          if (gl > 2) {
            const cl = Math.min(gl, ARROW_MAX_PX);
            drawArrow(ctx, sx, sy, sx + (gx / gl) * cl, sy + (gy / gl) * cl, p.color, 1.5);
          }
        }
      }

      const d = drag.current;
      if (d.active && s.scale > 0) {
        if (c.showPred) {
          const wx0 = (d.x0 - s.cx) / s.scale;
          const wy0 = (s.cy - d.y0) / s.scale;
          const halfMin = Math.max(Math.min(s.w, s.h) / 2, 1);
          let pvx = ((d.x1 - d.x0) / halfMin) * LAUNCH_RATE;
          let pvy = ((d.y0 - d.y1) / halfMin) * LAUNCH_RATE;
          const psp = Math.hypot(pvx, pvy);
          if (psp > SPEED_CAP) {
            pvx *= SPEED_CAP / psp;
            pvy *= SPEED_CAP / psp;
          }
          let px = wx0;
          let py = wy0;
          predBuf[0] = px;
          predBuf[1] = py;
          for (let k = 1; k <= PRED_STEPS; k++) {
            gravity(px, py);
            pvx += accVec.x * PRED_DT;
            pvy += accVec.y * PRED_DT;
            px += pvx * PRED_DT;
            py += pvy * PRED_DT;
            predBuf[k * 2] = px;
            predBuf[k * 2 + 1] = py;
          }
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = DRAG_COLOR;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let k = 0; k <= PRED_STEPS; k++) {
            const qx = s.cx + predBuf[k * 2] * s.scale;
            const qy = s.cy - predBuf[k * 2 + 1] * s.scale;
            if (k === 0) ctx.moveTo(qx, qy);
            else ctx.lineTo(qx, qy);
          }
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        drawArrow(ctx, d.x0, d.y0, d.x1, d.y1, DRAG_COLOR, 2);
        glowDot(ctx, d.x0, d.y0, 3, DRAG_COLOR);
      }

      statClock.current += dt;
      if (statClock.current >= STAT_INTERVAL) {
        statClock.current = 0;
        if (planets.length > 0) {
          const p = planets[planets.length - 1];
          const r = Math.max(Math.hypot(p.x, p.y), 1e-6);
          const v2 = p.vx * p.vx + p.vy * p.vy;
          const denom = 2 / r - v2 / GM;
          const a = Math.abs(denom) > 1e-9 ? 1 / denom : NaN;
          setStats({
            has: true,
            r,
            v2,
            a,
            l: Math.abs(p.x * p.vy - p.y * p.vx),
          });
          hadStats.current = true;
        } else if (hadStats.current) {
          hadStats.current = false;
          setStats(NO_STATS);
        }
      }
    },
    []
  );

  const canvasRef = useSimLoop(draw);

  const localXY = (e: ReactPointerEvent<HTMLCanvasElement>): [number, number] => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!e.isPrimary) return;
    const d = drag.current;
    const pos = localXY(e);
    d.active = true;
    d.id = e.pointerId;
    d.x0 = pos[0];
    d.y0 = pos[1];
    d.x1 = d.x0;
    d.y1 = d.y0;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    const pos = localXY(e);
    d.x1 = pos[0];
    d.y1 = pos[1];
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const d = drag.current;
      if (!d.active || e.pointerId !== d.id) return;
      d.active = false;
      spawnFromDrag();
    },
    [spawnFromDrag]
  );

  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    d.active = false;
  }, []);

  const controls = (
    <>
      <Slider
        label="Time scale"
        value={timeScale}
        min={0}
        max={3}
        step={0.1}
        unit="×"
        onChange={(v) => updateParams({ ts: v })}
      />
      <Slider
        label="Trail length"
        value={trailLen}
        min={20}
        max={400}
        step={10}
        onChange={(v) => updateParams({ tr: v })}
      />
      <Toggle
        label="Velocity vectors"
        checked={showVectors}
        onChange={(v) => updateParams({ vec: v })}
      />
      <Toggle
        label="Predicted path"
        checked={showPred}
        onChange={(v) => updateParams({ pred: v })}
      />
      {rm ? (
        <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
          {paused ? "Play" : "Pause"}
        </ActionButton>
      ) : null}
      <ActionButton tone="ghost" onClick={clearAll}>
        Clear
      </ActionButton>
    </>
  );

  const liveRow = (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span>vis-viva:</span>
      {stats.has ? (
        <>
          <TeX
            block={false}
            tex={`v^2 = GM\\left(\\frac{2}{${fmt(stats.r, 2)}} - \\frac{1}{${fmt(stats.a, 2)}}\\right) \\approx ${fmt(stats.v2, 2)}`}
          />
          <span>ang. momentum:</span>
          <TeX
            block={false}
            tex={`L = \\lvert\\vec{r} \\times \\vec{v}\\rvert = ${fmt(stats.l, 2)}`}
          />
        </>
      ) : (
        <span>drag to launch a planet and see live values</span>
      )}
    </span>
  );

  return (
    <SimFrame
      title="Gravity Playground"
      subtitle="Drag anywhere to launch a planet into orbit"
      controls={controls}
      footnote={liveRow}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
        role="img"
        aria-label="Interactive gravity sandbox: drag from any point to launch planets around a central star, showing orbital trails, velocity vectors and escape trajectories"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </SimFrame>
  );
}
