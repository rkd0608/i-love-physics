"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const K = 1;
const SOFT2 = 16;
const RING_PX = 14;
const STEP_PX = 6;
const MAX_STEPS = 300;
const SEEDS_PER_CHARGE = 24;
const MAX_CHARGES = 8;
const MAX_LINES = MAX_CHARGES * SEEDS_PER_CHARGE;
const LINE_STRIDE = (MAX_STEPS + 1) * 2;
const GRAB_R2 = 16 * 16;
const TERM_R2 = 7 * 7;
const EDGE_MARGIN = 20;
const CELL = 12;
const POT_LEVELS = 8;
const PROBE_INTERVAL = 0.12;
const FLOW_SPEED = 34;

const POS_COLOR = "#ffd27a";
const NEG_COLOR = "#53d6f2";
const LINE_COLOR = "rgba(240, 171, 252, 0.55)";
const POT_COLOR = "rgba(160, 170, 205, 0.3)";
const PROBE_COLOR = "#e6ebff";
const PROBE_RING = "rgba(230,235,255,0.7)";
const GLYPH_FONT = "bold 13px ui-monospace, SFMono-Regular, Menlo, monospace";
const DASH: number[] = [2.5, 8.5];

type Charge = { x: number; q: number; y: number };

type Vec2 = { x: number; y: number };

type ProbeStats = { mag: number; ang: number };

type PotStore = {
  gw: number;
  gh: number;
  data: Float32Array | null;
  paths: Path2D[];
};

type PresetKind = "dipole" | "two-pos" | "quad";

const EV: Vec2 = { x: 0, y: 0 };
const PT_A: Vec2 = { x: 0, y: 0 };
const PT_B: Vec2 = { x: 0, y: 0 };

const lineBuf = new Float32Array(MAX_LINES * LINE_STRIDE);
const lineLen = new Int32Array(MAX_LINES);

type Seg = readonly [number, number];

const MS_TABLE: readonly Seg[][] = [
  [],
  [[3, 2]],
  [[1, 2]],
  [[3, 1]],
  [[0, 1]],
  [
    [0, 3],
    [1, 2],
  ],
  [[0, 2]],
  [[0, 3]],
  [[0, 3]],
  [[0, 2]],
  [
    [0, 1],
    [3, 2],
  ],
  [[1, 2]],
  [[3, 1]],
  [[1, 2]],
  [[3, 2]],
  [],
];

function clampPx(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function fieldAt(chs: Charge[], x: number, y: number, out: Vec2): void {
  let fx = 0;
  let fy = 0;
  for (let i = 0; i < chs.length; i++) {
    const c = chs[i];
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy + SOFT2;
    const inv = (K * c.q) / (r2 * Math.sqrt(r2));
    fx += dx * inv;
    fy += dy * inv;
  }
  out.x = fx;
  out.y = fy;
}

function loadPreset(
  chs: Charge[],
  kind: PresetKind,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const cy = h / 2;
  const dx = Math.min(120, w * 0.28);
  const dy = Math.min(80, h * 0.24);
  const lx = clampPx(cx - dx, 30, w - 30);
  const rx = clampPx(cx + dx, 30, w - 30);
  const ty = clampPx(cy - dy, 30, h - 30);
  const by = clampPx(cy + dy, 30, h - 30);
  chs.length = 0;
  if (kind === "dipole") {
    chs.push({ x: lx, y: cy, q: 1 }, { x: rx, y: cy, q: -1 });
  } else if (kind === "two-pos") {
    chs.push({ x: lx, y: cy, q: 1 }, { x: rx, y: cy, q: 1 });
  } else {
    chs.push(
      { x: lx, y: ty, q: 1 },
      { x: rx, y: ty, q: -1 },
      { x: lx, y: by, q: -1 },
      { x: rx, y: by, q: 1 }
    );
  }
}

function rebuildLines(chs: Charge[], w: number, h: number): void {
  let li = 0;
  for (let ci = 0; ci < chs.length && li < MAX_LINES; ci++) {
    const src = chs[ci];
    const sgn = src.q >= 0 ? 1 : -1;
    for (let s = 0; s < SEEDS_PER_CHARGE && li < MAX_LINES; s++) {
      const a = ((s / SEEDS_PER_CHARGE) * Math.PI * 2) % (Math.PI * 2);
      let px = src.x + Math.cos(a) * RING_PX;
      let py = src.y + Math.sin(a) * RING_PX;
      const base = li * LINE_STRIDE;
      lineBuf[base] = px;
      lineBuf[base + 1] = py;
      let n = 1;
      for (let step = 0; step < MAX_STEPS; step++) {
        fieldAt(chs, px, py, EV);
        let m = Math.hypot(EV.x, EV.y);
        if (m < 1e-9) break;
        const hx = px + ((sgn * EV.x) / m) * (STEP_PX * 0.5);
        const hy = py + ((sgn * EV.y) / m) * (STEP_PX * 0.5);
        fieldAt(chs, hx, hy, EV);
        m = Math.hypot(EV.x, EV.y);
        if (m < 1e-9) break;
        px += ((sgn * EV.x) / m) * STEP_PX;
        py += ((sgn * EV.y) / m) * STEP_PX;
        lineBuf[base + n * 2] = px;
        lineBuf[base + n * 2 + 1] = py;
        n++;
        let hit = false;
        for (let qi = 0; qi < chs.length; qi++) {
          const c = chs[qi];
          const ddx = px - c.x;
          const ddy = py - c.y;
          if (ddx * ddx + ddy * ddy < TERM_R2) {
            hit = true;
            break;
          }
        }
        if (
          hit ||
          px < -EDGE_MARGIN ||
          px > w + EDGE_MARGIN ||
          py < -EDGE_MARGIN ||
          py > h + EDGE_MARGIN
        ) {
          break;
        }
      }
      lineLen[li] = n;
      li++;
    }
  }
  for (; li < MAX_LINES; li++) lineLen[li] = 0;
}

function msPoint(
  edge: number,
  x: number,
  y: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number,
  lvl: number,
  out: Vec2
): void {
  let t = 0.5;
  if (edge === 0) {
    const d = v1 - v0;
    if (Math.abs(d) > 1e-12) t = (lvl - v0) / d;
    out.x = x + t * CELL;
    out.y = y;
  } else if (edge === 1) {
    const d = v2 - v1;
    if (Math.abs(d) > 1e-12) t = (lvl - v1) / d;
    out.x = x + CELL;
    out.y = y + t * CELL;
  } else if (edge === 2) {
    const d = v2 - v3;
    if (Math.abs(d) > 1e-12) t = (lvl - v3) / d;
    out.x = x + t * CELL;
    out.y = y + CELL;
  } else {
    const d = v3 - v0;
    if (Math.abs(d) > 1e-12) t = (lvl - v0) / d;
    out.x = x;
    out.y = y + t * CELL;
  }
}

function rebuildPotentials(
  chs: Charge[],
  w: number,
  h: number,
  store: PotStore
): void {
  const gw = Math.floor(w / CELL) + 2;
  const gh = Math.floor(h / CELL) + 2;
  if (!store.data || store.gw !== gw || store.gh !== gh) {
    store.data = new Float32Array(gw * gh);
    store.gw = gw;
    store.gh = gh;
  }
  const data = store.data;
  let mn = Infinity;
  let mx = -Infinity;
  for (let j = 0; j < gh; j++) {
    const y = j * CELL;
    for (let i = 0; i < gw; i++) {
      const x = i * CELL;
      let v = 0;
      for (let qi = 0; qi < chs.length; qi++) {
        const c = chs[qi];
        v += (K * c.q) / Math.sqrt((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) + SOFT2);
      }
      data[j * gw + i] = v;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
  }
  const paths: Path2D[] = [];
  const span = mx - mn;
  for (let li = 0; li < POT_LEVELS; li++) {
    const lvl = mn + (span * (li + 0.5)) / POT_LEVELS;
    const path = new Path2D();
    for (let j = 0; j < gh - 1; j++) {
      const y = j * CELL;
      for (let i = 0; i < gw - 1; i++) {
        const v0 = data[j * gw + i];
        const v1 = data[j * gw + i + 1];
        const v2 = data[(j + 1) * gw + i + 1];
        const v3 = data[(j + 1) * gw + i];
        const mask =
          (v0 > lvl ? 8 : 0) |
          (v1 > lvl ? 4 : 0) |
          (v2 > lvl ? 2 : 0) |
          (v3 > lvl ? 1 : 0);
        const segs = MS_TABLE[mask];
        if (segs.length === 0) continue;
        const x = i * CELL;
        for (let si = 0; si < segs.length; si++) {
          msPoint(segs[si][0], x, y, v0, v1, v2, v3, lvl, PT_A);
          msPoint(segs[si][1], x, y, v0, v1, v2, v3, lvl, PT_B);
          path.moveTo(PT_A.x, PT_A.y);
          path.lineTo(PT_B.x, PT_B.y);
        }
      }
    }
    paths.push(path);
  }
  store.paths = paths;
}

export default function ElectricFieldLab() {
  const [{ lines: showLines, equi: showPot }, updateParams] = useSimParams<{
    lines: boolean;
    equi: boolean;
  }>({ lines: true, equi: false });
  const [rm, setRm] = useState(false);
  const [paused, setPaused] = useState(false);
  const [probe, setProbe] = useState<ProbeStats | null>(null);

  const linesRef = useRef(showLines);
  const potRef = useRef(showPot);
  const pausedRef = useRef(paused);

  useEffect(() => {
    linesRef.current = showLines;
    potRef.current = showPot;
    pausedRef.current = paused;
  });

  const chargesRef = useRef<Charge[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });
  const dirtyRef = useRef(true);
  const potStoreRef = useRef<PotStore>({ gw: 0, gh: 0, data: null, paths: [] });
  const probeRef = useRef({ x: 0, y: 0, on: false });
  const probeClockRef = useRef(0);
  const hadProbeRef = useRef(false);
  const flowRef = useRef(0);
  const dragRef = useRef({
    id: -1,
    idx: -1,
    x0: 0,
    y0: 0,
    moved: false,
    shift: false,
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setRm(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const runPreset = useCallback((kind: PresetKind) => {
    const s = sizeRef.current;
    const w = s.w > 0 ? s.w : 800;
    const h = s.h > 0 ? s.h : 450;
    loadPreset(chargesRef.current, kind, w, h);
    dirtyRef.current = true;
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, dt: number) => {
      const s = sizeRef.current;
      const resized = s.w !== w || s.h !== h;
      if (resized) {
        s.w = w;
        s.h = h;
      }
      const chs = chargesRef.current;
      if (chs.length === 0 && w > 0) loadPreset(chs, "dipole", w, h);
      if (dirtyRef.current || resized) {
        if (w > 0) {
          rebuildLines(chs, w, h);
          rebuildPotentials(chs, w, h, potStoreRef.current);
          dirtyRef.current = false;
        }
      }

      paintSky(ctx, w, h);

      if (potRef.current) {
        const paths = potStoreRef.current.paths;
        ctx.strokeStyle = POT_COLOR;
        ctx.lineWidth = 1;
        for (let i = 0; i < paths.length; i++) ctx.stroke(paths[i]);
      }

      if (linesRef.current) {
        if (!pausedRef.current) flowRef.current += dt * FLOW_SPEED;
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 1.4;
        ctx.setLineDash(DASH);
        ctx.lineDashOffset = -flowRef.current;
        ctx.beginPath();
        for (let li = 0; li < MAX_LINES; li++) {
          const n = lineLen[li];
          if (n < 2) continue;
          const base = li * LINE_STRIDE;
          ctx.moveTo(lineBuf[base], lineBuf[base + 1]);
          for (let k = 1; k < n; k++) {
            ctx.lineTo(lineBuf[base + k * 2], lineBuf[base + k * 2 + 1]);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;
      }

      for (let i = 0; i < chs.length; i++) {
        const c = chs[i];
        glowDot(ctx, c.x, c.y, 6, c.q >= 0 ? POS_COLOR : NEG_COLOR);
      }
      ctx.font = GLYPH_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#060a17";
      for (let i = 0; i < chs.length; i++) {
        const c = chs[i];
        ctx.fillText(c.q >= 0 ? "+" : "\u2212", c.x, c.y + 0.5);
      }

      const pp = probeRef.current;
      if (pp.on) {
        fieldAt(chs, pp.x, pp.y, EV);
        const mag = Math.hypot(EV.x, EV.y);
        if (mag > 1e-9) {
          const len = Math.min(16 + 9 * Math.log2(1 + mag), 46);
          drawArrow(
            ctx,
            pp.x,
            pp.y,
            pp.x + (EV.x / mag) * len,
            pp.y - (EV.y / mag) * len,
            PROBE_COLOR,
            2
          );
        }
        ctx.strokeStyle = PROBE_RING;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 4.5, 0, Math.PI * 2);
        ctx.stroke();

        probeClockRef.current += dt;
        if (probeClockRef.current >= PROBE_INTERVAL) {
          probeClockRef.current = 0;
          hadProbeRef.current = true;
          setProbe({
            mag,
            ang: (Math.atan2(-EV.y, EV.x) * 180) / Math.PI,
          });
        }
      } else if (hadProbeRef.current) {
        hadProbeRef.current = false;
        setProbe(null);
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
    const d = dragRef.current;
    const pos = localXY(e);
    let idx = -1;
    const chs = chargesRef.current;
    for (let i = chs.length - 1; i >= 0; i--) {
      const c = chs[i];
      const dx = pos[0] - c.x;
      const dy = pos[1] - c.y;
      if (dx * dx + dy * dy <= GRAB_R2) {
        idx = i;
        break;
      }
    }
    d.id = e.pointerId;
    d.idx = idx;
    d.x0 = pos[0];
    d.y0 = pos[1];
    d.moved = false;
    d.shift = e.shiftKey;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const pos = localXY(e);
    const pp = probeRef.current;
    pp.x = pos[0];
    pp.y = pos[1];
    pp.on = true;
    const d = dragRef.current;
    if (d.idx < 0 || e.pointerId !== d.id) return;
    if (Math.abs(pos[0] - d.x0) > 5 || Math.abs(pos[1] - d.y0) > 5) d.moved = true;
    const c = chargesRef.current[d.idx];
    if (c) {
      c.x = pos[0];
      c.y = pos[1];
      dirtyRef.current = true;
    }
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (e.pointerId !== d.id) return;
    if (d.idx < 0 && !d.moved) {
      const chs = chargesRef.current;
      if (chs.length < MAX_CHARGES) {
        chs.push({ x: d.x0, y: d.y0, q: d.shift ? 1 : -1 });
        dirtyRef.current = true;
      }
    }
    d.id = -1;
    d.idx = -1;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onPointerCancel = useCallback((e: ReactPointerEvent<HTMLCanvasElement>) => {
    const d = dragRef.current;
    if (e.pointerId !== d.id) return;
    d.id = -1;
    d.idx = -1;
  }, []);

  const onPointerLeave = useCallback(() => {
    probeRef.current.on = false;
  }, []);

  return (
    <SimFrame
      title="Electric Field Lab"
      subtitle="Drag charges; click empty space to add a negative (shift-click for positive)"
      controls={
        <>
          <Toggle
            label="Show field lines"
            checked={showLines}
            onChange={(v) => updateParams({ lines: v })}
          />
          <Toggle
            label="Equipotentials"
            checked={showPot}
            onChange={(v) => updateParams({ equi: v })}
          />
          {rm ? (
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
          <ActionButton tone="ghost" onClick={() => runPreset("dipole")}>
            Dipole
          </ActionButton>
          <ActionButton tone="ghost" onClick={() => runPreset("two-pos")}>
            Two positives
          </ActionButton>
          <ActionButton tone="ghost" onClick={() => runPreset("quad")}>
            Quadrupole
          </ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX tex={"E = \\frac{k\\,q}{r^2}"} className="text-sm" />
          {probe ? (
            <>
              <TeX
                tex={`\\left|\\vec{E}\\right| = ${fmt(probe.mag)}`}
                className="text-sm"
              />
              <p className="font-mono text-xs">
                <span className="text-muted">θ = </span>
                <span className="text-accent">{fmt(probe.ang, 1)}°</span>
              </p>
            </>
          ) : (
            <p className="font-mono text-xs text-muted">
              move the pointer across the field to probe it
            </p>
          )}
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-crosshair touch-none select-none"
        role="img"
        aria-label="Interactive electric field map: draggable positive and negative charges with traced field lines, equipotential contours and a live probe arrow showing field strength and direction"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
      />
    </SimFrame>
  );
}
