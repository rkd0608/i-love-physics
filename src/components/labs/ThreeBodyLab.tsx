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

const PALETTE = ["#53d6f2", "#b48cf2", "#ffd27a", "#4ade80", "#f9a8d4", "#7ef0b0"];
const P1_COLOR = "#ffd27a";
const P2_COLOR = "#53d6f2";
const LP_COLOR = "#f97316";
const LP_TEXT = "rgba(230, 235, 255, 0.72)";
const LP_NAMES = ["L1", "L2", "L3", "L4", "L5"];
const DRAG_COLOR = "#ffd27a";
const GRID_COLOR = "rgba(249, 115, 22, 0.05)";
const DT_SUB = 1 / 240;
const MAX_SUBSTEPS = 16;
const MAX_BODIES = 6;
const TRAIL_MAX = 400;
const ALPHA_BANDS = 6;
const EPS2 = 1e-6;
const BISECT_ITERS = 60;
const LAUNCH_RATE = 1.2;
const SPEED_CAP = 3;
const MIN_DRAG_PX = 8;
const VEL_PX = 30;
const ARROW_MAX_PX = 46;
const PRIMARY_SCALE = 11;
const STAT_INTERVAL = 0.15;

type Body = {
  slot: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  c0: number;
  color: string;
  count: number;
};

type ViewSize = { w: number; h: number; cx: number; cy: number; scale: number };

type Backdrop = { key: string; canvas: HTMLCanvasElement | null };

type DragState = { active: boolean; id: number; x0: number; y0: number; x1: number; y1: number };

type Stats = { has: boolean; c: number; drift: number };

const NO_STATS: Stats = { has: false, c: 0, drift: 0 };

const trailBuf = new Float32Array(MAX_BODIES * TRAIL_MAX * 2);
const accVec = { x: 0, y: 0 };
const stBuf = new Float64Array(4);
const tmpBuf = new Float64Array(4);
const k1Buf = new Float64Array(4);
const k2Buf = new Float64Array(4);
const k3Buf = new Float64Array(4);
const k4Buf = new Float64Array(4);

function gradOmega(x: number, y: number, mu: number): void {
  const dx1 = x + mu;
  const dx2 = x - 1 + mu;
  const r1 = Math.sqrt(dx1 * dx1 + y * y + EPS2);
  const r2 = Math.sqrt(dx2 * dx2 + y * y + EPS2);
  const c1 = (1 - mu) / (r1 * r1 * r1);
  const c2 = mu / (r2 * r2 * r2);
  accVec.x = x - c1 * dx1 - c2 * dx2;
  accVec.y = y - c1 * y - c2 * y;
}

function omegaVal(x: number, y: number, mu: number): number {
  const dx1 = x + mu;
  const dx2 = x - 1 + mu;
  const r1 = Math.sqrt(dx1 * dx1 + y * y + EPS2);
  const r2 = Math.sqrt(dx2 * dx2 + y * y + EPS2);
  return (1 - mu) / r1 + mu / r2 + 0.5 * (x * x + y * y);
}

function jacobi(x: number, y: number, vx: number, vy: number, mu: number): number {
  return 2 * omegaVal(x, y, mu) - (vx * vx + vy * vy);
}

function deriv(s: Float64Array, mu: number, out: Float64Array): void {
  gradOmega(s[0], s[1], mu);
  out[0] = s[2];
  out[1] = s[3];
  out[2] = 2 * s[3] + accVec.x;
  out[3] = -2 * s[2] + accVec.y;
}

function rk4(h: number, mu: number): void {
  const s = stBuf;
  deriv(s, mu, k1Buf);
  for (let i = 0; i < 4; i++) tmpBuf[i] = s[i] + 0.5 * h * k1Buf[i];
  deriv(tmpBuf, mu, k2Buf);
  for (let i = 0; i < 4; i++) tmpBuf[i] = s[i] + 0.5 * h * k2Buf[i];
  deriv(tmpBuf, mu, k3Buf);
  for (let i = 0; i < 4; i++) tmpBuf[i] = s[i] + h * k3Buf[i];
  deriv(tmpBuf, mu, k4Buf);
  for (let i = 0; i < 4; i++) {
    s[i] += (h / 6) * (k1Buf[i] + 2 * k2Buf[i] + 2 * k3Buf[i] + k4Buf[i]);
  }
}

function stepBody(b: Body, h: number, mu: number): void {
  stBuf[0] = b.x;
  stBuf[1] = b.y;
  stBuf[2] = b.vx;
  stBuf[3] = b.vy;
  rk4(h, mu);
  b.x = stBuf[0];
  b.y = stBuf[1];
  b.vx = stBuf[2];
  b.vy = stBuf[3];
}

function collinearF(x: number, mu: number): number {
  const dx1 = x + mu;
  const dx2 = x - 1 + mu;
  const r1 = Math.sqrt(dx1 * dx1 + EPS2);
  const r2 = Math.sqrt(dx2 * dx2 + EPS2);
  return x - ((1 - mu) * dx1) / (r1 * r1 * r1) - (mu * dx2) / (r2 * r2 * r2);
}

function bisect(a: number, b: number, mu: number): number {
  let lo = a;
  let hi = b;
  let fLo = collinearF(lo, mu);
  for (let i = 0; i < BISECT_ITERS; i++) {
    const mid = 0.5 * (lo + hi);
    const fMid = collinearF(mid, mu);
    if ((fLo < 0) === (fMid < 0)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  return 0.5 * (lo + hi);
}

function solveCollinear(mu: number): [number, number, number] {
  return [
    bisect(-mu + 1e-9, 1 - mu - 1e-9, mu),
    bisect(1 - mu + 1e-9, 2, mu),
    bisect(-2, -mu - 1e-9, mu),
  ];
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
  p: Body,
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

function drawMarker(
  ctx: CanvasRenderingContext2D,
  s: ViewSize,
  wx: number,
  wy: number,
  rad: number,
  name: string
): void {
  const sx = s.cx + wx * s.scale;
  const sy = s.cy - wy * s.scale;
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = LP_COLOR;
  ctx.beginPath();
  ctx.arc(sx, sy, rad, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = LP_TEXT;
  ctx.fillText(name, sx, sy - rad - 3);
}

export default function ThreeBodyLab() {
  const [
    { mu, ts: timeScale, tr: trailLen, lag: showMarkers, vec: showVectors },
    updateParams,
  ] = useSimParams<{ mu: number; ts: number; tr: number; lag: boolean; vec: boolean }>({
    mu: 0.12,
    ts: 1,
    tr: 200,
    lag: true,
    vec: false,
  });
  const [paused, setPaused] = useState(false);
  const [rm, setRm] = useState(false);
  const [stats, setStats] = useState<Stats>(NO_STATS);

  const cfg = useRef({
    mu: 0.12,
    timeScale: 1,
    trailLen: 200,
    showMarkers: true,
    showVectors: false,
    paused: false,
  });

  useEffect(() => {
    const c = cfg.current;
    c.mu = mu;
    c.timeScale = timeScale;
    c.trailLen = trailLen;
    c.showMarkers = showMarkers;
    c.showVectors = showVectors;
    c.paused = paused;
  });

  const bodiesRef = useRef<Body[]>([]);
  const accTime = useRef(0);
  const statClock = useRef(0);
  const colorIdx = useRef(0);
  const slotIdx = useRef(0);
  const hadStats = useRef(false);
  const size = useRef<ViewSize>({ w: 0, h: 0, cx: 0, cy: 0, scale: 0 });
  const bg = useRef<Backdrop>({ key: "", canvas: null });
  const drag = useRef<DragState>({ active: false, id: -1, x0: 0, y0: 0, x1: 0, y1: 0 });
  const colRef = useRef<[number, number, number]>(solveCollinear(0.12));
  const colMu = useRef(0.12);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setRm(true);
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const clearAll = useCallback(() => {
    bodiesRef.current.length = 0;
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
    const bodies = bodiesRef.current;
    if (bodies.length >= MAX_BODIES) bodies.shift();
    bodies.push({
      slot: slotIdx.current,
      x: wx,
      y: wy,
      vx,
      vy,
      c0: jacobi(wx, wy, vx, vy, cfg.current.mu),
      color: PALETTE[colorIdx.current % PALETTE.length],
      count: 0,
    });
    colorIdx.current++;
    slotIdx.current = (slotIdx.current + 1) % MAX_BODIES;
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
      const s = size.current;
      if (s.w !== w || s.h !== h) {
        s.w = w;
        s.h = h;
        s.cx = w / 2;
        s.cy = h / 2;
        s.scale = Math.min(w, h) / 4;
      }
      const backdrop = ensureBackdrop(bg.current, w, h, s.cx, s.cy, s.scale);
      ctx.drawImage(backdrop, 0, 0, w, h);

      const c = cfg.current;
      const bodies = bodiesRef.current;

      if (colMu.current !== c.mu) {
        colMu.current = c.mu;
        colRef.current = solveCollinear(c.mu);
      }

      let acc = accTime.current + dt * c.timeScale;
      if (acc > MAX_SUBSTEPS * DT_SUB) acc = MAX_SUBSTEPS * DT_SUB;
      const ticks = Math.floor(acc / DT_SUB);
      accTime.current = acc - ticks * DT_SUB;

      if (!c.paused && ticks > 0) {
        for (let bi = 0; bi < bodies.length; bi++) {
          const p = bodies[bi];
          for (let k = 0; k < ticks; k++) stepBody(p, DT_SUB, c.mu);
          const base = p.slot * TRAIL_MAX * 2;
          const m = (p.count % TRAIL_MAX) * 2;
          trailBuf[base + m] = p.x;
          trailBuf[base + m + 1] = p.y;
          p.count++;
        }
        let write = 0;
        for (let bi = 0; bi < bodies.length; bi++) {
          const p = bodies[bi];
          if (Number.isFinite(p.x + p.y + p.vx + p.vy)) bodies[write++] = p;
        }
        bodies.length = write;
      }

      glowDot(ctx, s.cx - c.mu * s.scale, s.cy, PRIMARY_SCALE * Math.cbrt(1 - c.mu), P1_COLOR);
      glowDot(ctx, s.cx + (1 - c.mu) * s.scale, s.cy, PRIMARY_SCALE * Math.cbrt(c.mu), P2_COLOR);

      if (c.showMarkers) {
        const col = colRef.current;
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.lineWidth = 1.25;
        for (let li = 0; li < 3; li++) drawMarker(ctx, s, col[li], 0, 5, LP_NAMES[li]);
        drawMarker(ctx, s, 0.5 - c.mu, Math.sqrt(3) / 2, 8, LP_NAMES[3]);
        drawMarker(ctx, s, 0.5 - c.mu, -Math.sqrt(3) / 2, 8, LP_NAMES[4]);
      }

      for (let bi = 0; bi < bodies.length; bi++) {
        const p = bodies[bi];
        const sx = s.cx + p.x * s.scale;
        const sy = s.cy - p.y * s.scale;
        drawTrail(ctx, p, s, c.trailLen);
        glowDot(ctx, sx, sy, 4.5, p.color);
        if (c.showVectors) {
          const gx = p.vx * VEL_PX;
          const gy = -p.vy * VEL_PX;
          const gl = Math.hypot(gx, gy);
          if (gl > 2) {
            const cl = Math.min(gl, ARROW_MAX_PX);
            drawArrow(ctx, sx, sy, sx + (gx / gl) * cl, sy + (gy / gl) * cl, p.color, 1.5);
          }
        }
      }

      const d = drag.current;
      if (d.active && s.scale > 0) {
        drawArrow(ctx, d.x0, d.y0, d.x1, d.y1, DRAG_COLOR, 2);
        glowDot(ctx, d.x0, d.y0, 3, DRAG_COLOR);
      }

      statClock.current += dt;
      if (statClock.current >= STAT_INTERVAL) {
        statClock.current = 0;
        if (bodies.length > 0) {
          const p = bodies[bodies.length - 1];
          const cj = jacobi(p.x, p.y, p.vx, p.vy, c.mu);
          setStats({
            has: true,
            c: cj,
            drift: (Math.abs(cj - p.c0) / Math.max(Math.abs(p.c0), 1e-9)) * 1000,
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
        label="Mass ratio μ"
        value={mu}
        min={0.05}
        max={0.5}
        step={0.01}
        onChange={(v) => updateParams({ mu: v })}
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
      <Slider
        label="Trail length"
        value={trailLen}
        min={20}
        max={400}
        step={10}
        onChange={(v) => updateParams({ tr: v })}
      />
      <Toggle
        label="Lagrange markers"
        checked={showMarkers}
        onChange={(v) => updateParams({ lag: v })}
      />
      <Toggle
        label="Velocity vectors"
        checked={showVectors}
        onChange={(v) => updateParams({ vec: v })}
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
      <TeX block={false} tex="\ddot{x} = 2\dot{y} + \Omega_x,\quad \ddot{y} = -2\dot{x} + \Omega_y" />
      <TeX block={false} tex="C = 2\Omega - v^2" />
      <span>
        μ = <span className="font-mono text-accent">{fmt(mu, 2)}</span>
      </span>
      {stats.has ? (
        <>
          <span>
            C = <span className="font-mono text-accent">{fmt(stats.c, 4)}</span>
          </span>
          <span>
            drift{" "}
            <span className="font-mono text-accent">{fmt(stats.drift, 2)}‰</span>
          </span>
        </>
      ) : (
        <span>drag to launch a test mass and watch its Jacobi constant</span>
      )}
    </span>
  );

  return (
    <SimFrame
      title="Rotating-Frame Sandbox"
      subtitle="Drag anywhere to launch a test mass between two fixed suns"
      controls={controls}
      footnote={liveRow}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
        role="img"
        aria-label="Interactive restricted three-body simulation: two primaries locked in a rotating frame with five Lagrange point markers, where dragging launches test masses whose trails and Jacobi constant reveal chaotic motion"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      />
    </SimFrame>
  );
}
