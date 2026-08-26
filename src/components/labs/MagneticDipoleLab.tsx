"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const DT = 1 / 120;
const COLS = 12;
const ROWS = 7;
const N = COLS * ROWS;
const KAPPA = 36;
const KAPPA_MIN = KAPPA * 0.2;
const KAPPA_MAX = KAPPA * 3;
const DAMP_SCALE = 12;
const MAX_SUBSTEPS = 6;
const LINE_SEEDS = 12;
const LINE_STEP = 6;
const LINE_MAX_STEPS = 700;
const LINE_STRIDE = LINE_MAX_STEPS + 1;
const LINE_MARGIN = 48;
const LINE_MIN_LOOP_STEPS = 24;
const READOUT_DT = 0.15;
const KICK = 9;

const ACCENT = "#d946ef";
const RED_N = "#ff5d5d";
const STEEL_S = "#aeb6cf";
const PIVOT = "#232b47";
const BAR_N = "#ff6b6b";
const BAR_S = "#53d6f2";
const LINE_COLOR = "rgba(217,70,239,0.32)";

let fx = 0;
let fy = 0;

function fieldNorm(dx: number, dy: number, ux: number, uy: number): void {
  const r2raw = dx * dx + dy * dy;
  const r2 = r2raw < 0.01 ? 0.01 : r2raw;
  const inv = 1 / (r2 * Math.sqrt(r2));
  const md = dx * ux + dy * uy;
  fx = inv * (3 * md * dx - ux);
  fy = inv * (3 * md * dy - uy);
}

interface Lattice {
  xs: Float32Array;
  ys: Float32Array;
  th: Float32Array;
  om: Float32Array;
  shade: Float32Array;
}

function buildLattice(w: number, h: number, ux: number, uy: number): Lattice {
  const xs = new Float32Array(N);
  const ys = new Float32Array(N);
  const th = new Float32Array(N);
  const om = new Float32Array(N);
  const shade = new Float32Array(N);
  const sx = w / (COLS + 1);
  const sy = h / (ROWS + 1);
  const cx = w / 2;
  const cy = h / 2;
  const L = h / 2;
  let bMin = Infinity;
  let bMax = 0;
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const idx = j * COLS + i;
      const x = (i + 1) * sx;
      const y = (j + 1) * sy;
      xs[idx] = x;
      ys[idx] = y;
      fieldNorm((x - cx) / L, (y - cy) / L, ux, uy);
      th[idx] = Math.atan2(fy, fx);
      const b = 1 / (((x - cx) / L) ** 2 + ((y - cy) / L) ** 2) ** 1.5;
      shade[idx] = b;
      if (b < bMin) bMin = b;
      if (b > bMax) bMax = b;
    }
  }
  if (bMax > bMin) {
    const span = Math.log(bMax) - Math.log(bMin);
    for (let idx = 0; idx < N; idx++) {
      shade[idx] = Math.min(
        Math.max((Math.log(shade[idx]) - Math.log(bMin)) / span, 0),
        1
      );
    }
  }
  return { xs, ys, th, om, shade };
}

interface Lines {
  pts: Float32Array;
  lens: Int32Array;
}

function buildLines(w: number, h: number, ux: number, uy: number): Lines {
  const pts = new Float32Array(LINE_SEEDS * LINE_STRIDE * 2);
  const lens = new Int32Array(LINE_SEEDS);
  const cx = w / 2;
  const cy = h / 2;
  const L = h / 2;
  const rs = Math.min(w, h) * 0.115;
  const closeR2 = (LINE_STEP * 1.35) ** 2;
  for (let s = 0; s < LINE_SEEDS; s++) {
    const a = (s / LINE_SEEDS) * Math.PI * 2;
    let x = cx + Math.cos(a) * rs;
    let y = cy + Math.sin(a) * rs;
    const seedX = x;
    const seedY = y;
    const base = s * LINE_STRIDE * 2;
    pts[base] = x;
    pts[base + 1] = y;
    let count = 1;
    for (let step = 0; step < LINE_MAX_STEPS; step++) {
      fieldNorm((x - cx) / L, (y - cy) / L, ux, uy);
      let len = Math.hypot(fx, fy);
      if (len === 0) break;
      const mx = x + (fx / len) * LINE_STEP * 0.5;
      const my = y + (fy / len) * LINE_STEP * 0.5;
      fieldNorm((mx - cx) / L, (my - cy) / L, ux, uy);
      len = Math.hypot(fx, fy);
      if (len === 0) break;
      x += (fx / len) * LINE_STEP;
      y += (fy / len) * LINE_STEP;
      pts[base + count * 2] = x;
      pts[base + count * 2 + 1] = y;
      count++;
      if (step > LINE_MIN_LOOP_STEPS) {
        const ddx = x - seedX;
        const ddy = y - seedY;
        if (ddx * ddx + ddy * ddy < closeR2) break;
      }
      if (
        x < -LINE_MARGIN ||
        x > w + LINE_MARGIN ||
        y < -LINE_MARGIN ||
        y > h + LINE_MARGIN
      )
        break;
    }
    lens[s] = count;
  }
  return { pts, lens };
}

export default function MagneticDipoleLab() {
  const [
    { tilt, damp, lines: linesOn, shade },
    updateParams,
  ] = useSimParams<{
    tilt: number;
    damp: number;
    lines: boolean;
    shade: boolean;
  }>({ tilt: 0, damp: 0.3, lines: true, shade: true });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [readout, setReadout] = useState<{ bm: number; tq: number } | null>(
    null
  );

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const latticeRef = useRef<Lattice | null>(null);
  const latWRef = useRef(0);
  const latHRef = useRef(0);
  const linesRef = useRef<Lines | null>(null);
  const lineTiltRef = useRef(NaN);
  const accRef = useRef(0);
  const kickRef = useRef(0);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const lastSyncRef = useRef(-1);
  const hadCursorRef = useRef(false);

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    dt: number
  ): void => {
    const phi = (tilt * Math.PI) / 180;
    const ux = Math.sin(phi);
    const uy = -Math.cos(phi);
    const cx = w / 2;
    const cy = h / 2;
    const L = h / 2;

    let lat = latticeRef.current;
    if (!lat || latWRef.current !== w || latHRef.current !== h) {
      lat = buildLattice(w, h, ux, uy);
      latticeRef.current = lat;
      latWRef.current = w;
      latHRef.current = h;
      lineTiltRef.current = NaN;
      accRef.current = 0;
    }

    if (kickRef.current > 0) {
      for (let i = 0; i < N; i++) {
        lat.om[i] += (Math.random() - 0.5) * 2 * kickRef.current;
      }
      kickRef.current = 0;
    }

    if (!pausedRef.current) {
      accRef.current += dt;
      let steps = 0;
      while (accRef.current >= DT && steps < MAX_SUBSTEPS) {
        accRef.current -= DT;
        steps++;
        for (let i = 0; i < N; i++) {
          fieldNorm((lat.xs[i] - cx) / L, (lat.ys[i] - cy) / L, ux, uy);
          const kap = Math.min(
            Math.max(KAPPA * Math.hypot(fx, fy), KAPPA_MIN),
            KAPPA_MAX
          );
          const thB = Math.atan2(fy, fx);
          let d = lat.th[i] - thB;
          d -= Math.PI * 2 * Math.round(d / (Math.PI * 2));
          lat.om[i] +=
            (-kap * Math.sin(d) - DAMP_SCALE * damp * lat.om[i]) * DT;
          lat.th[i] += lat.om[i] * DT;
        }
      }
      if (accRef.current > DT) accRef.current = 0;
    }

    paintSky(ctx, w, h);

    if (linesOn) {
      if (
        !linesRef.current ||
        lineTiltRef.current !== tilt ||
        latWRef.current !== w ||
        latHRef.current !== h
      ) {
        linesRef.current = buildLines(w, h, ux, uy);
        lineTiltRef.current = tilt;
      }
      const ln = linesRef.current;
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = 1.2;
      ctx.lineJoin = "round";
      for (let s = 0; s < LINE_SEEDS; s++) {
        const cnt = ln.lens[s];
        const base = s * LINE_STRIDE * 2;
        ctx.beginPath();
        ctx.moveTo(ln.pts[base], ln.pts[base + 1]);
        for (let k = 1; k < cnt; k++) {
          ctx.lineTo(ln.pts[base + k * 2], ln.pts[base + k * 2 + 1]);
        }
        ctx.stroke();
      }
    }

    const hl =
      (Math.min(w / (COLS + 1), h / (ROWS + 1)) * 0.66) / 2;
    ctx.lineCap = "round";
    ctx.lineWidth = 2;
    for (let i = 0; i < N; i++) {
      const th = lat.th[i];
      const ca = Math.cos(th);
      const sa = Math.sin(th);
      const x = lat.xs[i];
      const y = lat.ys[i];
      ctx.globalAlpha = shade ? 0.22 + 0.78 * lat.shade[i] : 0.95;
      ctx.strokeStyle = STEEL_S;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - ca * hl, y - sa * hl);
      ctx.stroke();
      ctx.strokeStyle = RED_N;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + ca * hl, y + sa * hl);
      ctx.stroke();
      ctx.fillStyle = PIVOT;
      ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    glowDot(ctx, cx, cy, 9, ACCENT);
    const bl = h * 0.085;
    ctx.lineWidth = 7;
    ctx.strokeStyle = BAR_S;
    ctx.beginPath();
    ctx.moveTo(cx - ux * bl, cy - uy * bl);
    ctx.lineTo(cx, cy);
    ctx.stroke();
    ctx.strokeStyle = BAR_N;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + ux * bl, cy + uy * bl);
    ctx.stroke();

    const cur = cursorRef.current;
    if (cur && lat) {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i < N; i++) {
        const dx = lat.xs[i] - cur.x;
        const dy = lat.ys[i] - cur.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bd) {
          bd = d2;
          best = i;
        }
      }
      fieldNorm((lat.xs[best] - cx) / L, (lat.ys[best] - cy) / L, ux, uy);
      const bm = Math.hypot(fx, fy);
      const thB = Math.atan2(fy, fx);
      let d = lat.th[best] - thB;
      d -= Math.PI * 2 * Math.round(d / (Math.PI * 2));
      const tq = bm * Math.sin(d);
      if (!hadCursorRef.current || t - lastSyncRef.current > READOUT_DT) {
        lastSyncRef.current = t;
        hadCursorRef.current = true;
        setReadout({ bm, tq });
      }
    } else if (hadCursorRef.current) {
      hadCursorRef.current = false;
      setReadout(null);
    }
  };

  const canvasRef = useSimLoop(draw);

  const onMove = (e: PointerEvent<HTMLCanvasElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    cursorRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onLeave = (): void => {
    cursorRef.current = null;
  };

  const perturb = (): void => {
    kickRef.current = KICK;
  };

  return (
    <SimFrame
      title="Magnetic Dipole"
      subtitle="A compass lattice reading one dipole’s field"
      controls={
        <>
          <Slider
            label="Dipole tilt"
            value={tilt}
            min={-90}
            max={90}
            step={1}
            unit="°"
            onChange={(v) => updateParams({ tilt: v })}
          />
          <Slider
            label="Needle damping"
            value={damp}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(v) => updateParams({ damp: v })}
          />
          <Toggle
            label="Field lines"
            checked={linesOn}
            onChange={(v) => updateParams({ lines: v })}
          />
          <Toggle
            label="Strength shading"
            checked={shade}
            onChange={(v) => updateParams({ shade: v })}
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
          <ActionButton onClick={perturb}>Perturb needles</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={
              "\\vec{B} = \\frac{\\mu_0}{4\\pi}\\,\\frac{3(\\vec{m}\\cdot\\hat{r})\\hat{r} - \\vec{m}}{r^3}"
            }
            className="text-sm"
          />
          <TeX tex={"\\tau = mB\\sin\\theta"} className="text-sm" />
          <p className="font-mono text-xs">
            <span className="text-muted">|B| at cursor </span>
            <span className="text-accent">{fmt(readout ? readout.bm : NaN, 3)}</span>
            <span className="text-muted"> · τ nearest needle </span>
            <span className="text-accent">{fmt(readout ? readout.tq : NaN, 3)}</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark navy plane with a bar magnet at the center surrounded by a twelve by seven grid of compass needles whose red north tips align along glowing fuchsia dipole field loops that close from the magnet’s north pole back to its south pole"
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      />
    </SimFrame>
  );
}
