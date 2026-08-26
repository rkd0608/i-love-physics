"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CAP = 150;
const HOT = 1;
const COLD = 0;
const BOOK_EVERY = 15;
const TRACERS = 5;
const MARGIN = 14;
const DOOR_FRAC = 0.26;
const HALO_R = 11;
const CORE_R = 2.5;
const TAU = Math.PI * 2;
const LN4 = Math.log(4);

const HOT_RGB = "255,210,122";
const COLD_RGB = "83,214,242";
const HOT_CORE = "#ffd27a";
const COLD_CORE = "#53d6f2";
const HOT_TRACER = "#ffe9c4";
const COLD_TRACER = "#bdf0ff";
const GATE_FILL = "rgba(167,139,250,";
const GATE_BAR = "rgba(196,181,253,";
const WALL_COLOR = "rgba(139,147,184,0.55)";
const BORDER_COLOR = "rgba(139,147,184,0.28)";
const SLOT_DASH = "rgba(139,147,184,0.35)";
const LABEL_COLOR = "rgba(139,147,184,0.5)";
const MONO_LABEL = "600 13px ui-monospace, SFMono-Regular, Menlo, monospace";

interface Gas {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  cls: Uint8Array;
}

interface Stats {
  ratio: number;
  nl: number;
  nr: number;
  smix: number;
}

const BINS = new Int32Array(4);

function makeGas(): Gas {
  return {
    x: new Float32Array(CAP),
    y: new Float32Array(CAP),
    vx: new Float32Array(CAP),
    vy: new Float32Array(CAP),
    cls: new Uint8Array(CAP),
  };
}

function shuffle(
  g: Gas,
  count: number,
  w: number,
  h: number,
  vh: number,
  vc: number,
  tracer: Uint8Array
): void {
  const bw = Math.max(w - 2 * MARGIN, 1);
  const bh = Math.max(h - 2 * MARGIN, 1);
  const half = count >> 1;
  for (let i = 0; i < count; i++) {
    const hot = i < half;
    g.cls[i] = hot ? HOT : COLD;
    const ang = Math.random() * TAU;
    const sp = hot ? vh : vc;
    g.vx[i] = Math.cos(ang) * sp;
    g.vy[i] = Math.sin(ang) * sp;
    g.x[i] = MARGIN + Math.random() * bw;
    g.y[i] = MARGIN + Math.random() * bh;
  }
  tracer.fill(0);
  let placed = 0;
  while (placed < TRACERS) {
    const k = (Math.random() * count) | 0;
    if (!tracer[k]) {
      tracer[k] = 1;
      placed++;
    }
  }
}

function rescale(g: Gas, count: number, vh: number, vc: number): void {
  for (let i = 0; i < count; i++) {
    const target = g.cls[i] === HOT ? vh : vc;
    const sp = Math.hypot(g.vx[i], g.vy[i]);
    if (sp > 0) {
      const s = target / sp;
      g.vx[i] *= s;
      g.vy[i] *= s;
    }
  }
}

function bookkeep(
  g: Gas,
  count: number,
  cx: number,
  setStats: (s: Stats) => void
): Stats {
  BINS.fill(0);
  let ql = 0;
  let qr = 0;
  let nl = 0;
  let nr = 0;
  for (let i = 0; i < count; i++) {
    const q = g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i];
    if (g.x[i] < cx) {
      ql += q;
      nl++;
      BINS[g.cls[i]]++;
    } else {
      qr += q;
      nr++;
      BINS[2 + g.cls[i]]++;
    }
  }
  let s = 0;
  for (let b = 0; b < 4; b++) {
    const p = BINS[b] / count;
    if (p > 0) s -= p * Math.log(p);
  }
  const tl = nl > 0 ? ql / nl : NaN;
  const tr = nr > 0 ? qr / nr : NaN;
  const st: Stats = { ratio: tl / tr, nl, nr, smix: (s / LN4) * 100 };
  setStats(st);
  return st;
}

export default function MaxwellDemonLab() {
  const [{ n, vh, vc, sort }, updateParams] = useSimParams<{
    n: number;
    vh: number;
    vc: number;
    sort: boolean;
  }>({ n: 80, vh: 170, vc: 55, sort: true });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [seq, setSeq] = useState(0);
  const [stats, setStats] = useState<Stats>({
    ratio: NaN,
    nl: 0,
    nr: 0,
    smix: 100,
  });

  const gasRef = useRef<Gas | null>(null);
  const nRef = useRef(n);
  const vhRef = useRef(vh);
  const vcRef = useRef(vc);
  const sortRef = useRef(sort);
  const pausedRef = useRef(paused);
  const frameRef = useRef(0);
  const flashRef = useRef(-100);
  const tracerRef = useRef<Uint8Array>(new Uint8Array(CAP));
  const dimRef = useRef({ w: 640, h: 360 });

  useEffect(() => {
    if (!gasRef.current) gasRef.current = makeGas();
  }, []);

  useEffect(() => {
    nRef.current = n;
    vhRef.current = vh;
    vcRef.current = vc;
    sortRef.current = sort;
    pausedRef.current = paused;
  });

  useEffect(() => {
    const g = gasRef.current;
    if (!g) return;
    const id = requestAnimationFrame(() => {
      shuffle(
        g,
        nRef.current,
        dimRef.current.w,
        dimRef.current.h,
        vhRef.current,
        vcRef.current,
        tracerRef.current
      );
      frameRef.current = 0;
      bookkeep(g, nRef.current, dimRef.current.w / 2, setStats);
    });
    return () => cancelAnimationFrame(id);
  }, [n, seq]);

  useEffect(() => {
    const g = gasRef.current;
    if (!g) return;
    rescale(g, nRef.current, vh, vc);
  }, [vh, vc]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    dt: number
  ): void => {
    dimRef.current.w = w;
    dimRef.current.h = h;
    const g = gasRef.current;
    if (!g) return;
    const count = nRef.current;
    const sorting = sortRef.current;
    const m = MARGIN;
    const cx = w / 2;
    const cy = h / 2;
    const doorHalf = (DOOR_FRAC * (h - 2 * m)) / 2;
    const span = doorHalf * 2;

    if (!pausedRef.current && count > 0) {
      for (let i = 0; i < count; i++) {
        const ox = g.x[i];
        let nx = ox + g.vx[i] * dt;
        let ny = g.y[i] + g.vy[i] * dt;
        if (ny < m) {
          ny = 2 * m - ny;
          g.vy[i] = -g.vy[i];
        } else if (ny > h - m) {
          ny = 2 * (h - m) - ny;
          g.vy[i] = -g.vy[i];
        }
        if ((ox - cx) * (nx - cx) < 0) {
          const inBand = ny >= cy - doorHalf && ny <= cy + doorHalf;
          const dirRight = g.vx[i] > 0;
          const allowed =
            !sorting || (g.cls[i] === HOT ? dirRight : !dirRight);
          if (inBand && allowed) {
            flashRef.current = t;
          } else {
            nx = 2 * cx - nx;
            g.vx[i] = -g.vx[i];
          }
        }
        if (nx < m) {
          nx = 2 * m - nx;
          g.vx[i] = -g.vx[i];
        } else if (nx > w - m) {
          nx = 2 * (w - m) - nx;
          g.vx[i] = -g.vx[i];
        }
        if (nx < m) nx = m;
        else if (nx > w - m) nx = w - m;
        if (ny < m) ny = m;
        else if (ny > h - m) ny = h - m;
        g.x[i] = nx;
        g.y[i] = ny;
      }
      frameRef.current++;
      if (frameRef.current % BOOK_EVERY === 0) {
        bookkeep(g, count, cx, setStats);
      }
    }

    paintSky(ctx, w, h);

    const dtf = t - flashRef.current;
    const glow = dtf < 3 ? Math.exp(-dtf * 4) : 0;

    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);

    ctx.font = MONO_LABEL;
    ctx.fillStyle = LABEL_COLOR;
    ctx.textAlign = "left";
    ctx.fillText("L", m + 8, m + 18);
    ctx.textAlign = "right";
    ctx.fillText("R", w - m - 8, m + 18);
    ctx.textAlign = "left";

    if (sorting) {
      ctx.fillStyle = `${GATE_FILL}${0.16 + 0.5 * glow})`;
      ctx.fillRect(cx - 3, cy - doorHalf, 6, span);
      const bars = 3;
      const gapY = span / bars;
      const off = (t * 22) % gapY;
      ctx.strokeStyle = `${GATE_BAR}${0.5 + 0.5 * glow})`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let k = 0; k <= bars; k++) {
        const yy = cy - doorHalf + ((off + k * gapY) % span);
        ctx.moveTo(cx - 9, yy);
        ctx.lineTo(cx + 9, yy);
      }
      ctx.stroke();
    } else {
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = SLOT_DASH;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - doorHalf);
      ctx.lineTo(cx, cy + doorHalf);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth = 3;
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(cx, m);
    ctx.lineTo(cx, cy - doorHalf);
    ctx.moveTo(cx, cy + doorHalf);
    ctx.lineTo(cx, h - m);
    ctx.stroke();

    const hotHalo = ctx.createRadialGradient(0, 0, 0, 0, 0, HALO_R);
    hotHalo.addColorStop(0, `rgba(${HOT_RGB},0.85)`);
    hotHalo.addColorStop(1, `rgba(${HOT_RGB},0)`);
    const coldHalo = ctx.createRadialGradient(0, 0, 0, 0, 0, HALO_R);
    coldHalo.addColorStop(0, `rgba(${COLD_RGB},0.85)`);
    coldHalo.addColorStop(1, `rgba(${COLD_RGB},0)`);

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.translate(g.x[i], g.y[i]);
      ctx.fillStyle = g.cls[i] === HOT ? hotHalo : coldHalo;
      ctx.beginPath();
      ctx.arc(0, 0, HALO_R, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";

    for (let i = 0; i < count; i++) {
      if (g.cls[i] !== HOT) continue;
      ctx.fillStyle = HOT_CORE;
      ctx.beginPath();
      ctx.arc(g.x[i], g.y[i], CORE_R, 0, TAU);
      ctx.fill();
    }
    for (let i = 0; i < count; i++) {
      if (g.cls[i] !== COLD) continue;
      ctx.fillStyle = COLD_CORE;
      ctx.beginPath();
      ctx.arc(g.x[i], g.y[i], CORE_R, 0, TAU);
      ctx.fill();
    }

    const tracer = tracerRef.current;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < count; i++) {
      if (!tracer[i]) continue;
      const ph = t * 4 + i * 1.7;
      const pulse = 0.5 + 0.5 * Math.sin(ph);
      ctx.strokeStyle = g.cls[i] === HOT ? HOT_TRACER : COLD_TRACER;
      ctx.globalAlpha = 0.25 + 0.3 * pulse;
      ctx.beginPath();
      ctx.arc(g.x[i], g.y[i], 6 + 1.8 * pulse, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
      glowDot(ctx, g.x[i], g.y[i], 3.4, g.cls[i] === HOT ? HOT_CORE : COLD_CORE);
    }
  };

  const canvasRef = useSimLoop(draw);

  const hot = stats.ratio < 0.85 || stats.ratio > 1.18;

  return (
    <SimFrame
      title="Two-Chamber Molecular Gate"
      subtitle="The demon’s policy: hot passes left→right, cold passes right→left"
      controls={
        <>
          <Slider
            label="Particles"
            value={n}
            min={20}
            max={150}
            step={10}
            onChange={(v) => updateParams({ n: v })}
          />
          <Slider
            label="Hot speed"
            value={vh}
            min={60}
            max={260}
            step={10}
            unit="px/s"
            onChange={(v) => updateParams({ vh: v })}
          />
          <Slider
            label="Cold speed"
            value={vc}
            min={20}
            max={120}
            step={5}
            unit="px/s"
            onChange={(v) => updateParams({ vc: v })}
          />
          <Toggle
            label="Demon sorting"
            checked={sort}
            onChange={(v) => updateParams({ sort: v })}
          />
          <ActionButton onClick={() => setSeq((s) => s + 1)}>
            Reset shuffle
          </ActionButton>
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
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`T \propto \langle v^2 \rangle`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">T_L/T_R = </span>
            <span className="text-accent">{fmt(stats.ratio, 2)}</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">chambers L/R = </span>
            <span className="text-accent">
              {stats.nl}/{stats.nr}
            </span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">S_mix = </span>
            <span className="text-accent">{fmt(stats.smix, 1)}%</span>
            <span className="text-muted"> of max</span>
          </span>
          <span className={hot ? "font-mono text-xs text-accent" : "font-mono text-xs text-muted"}>
            {hot ? "violating 2nd law?" : "mixed"}
          </span>
          <p className="w-full text-xs leading-relaxed">
            The slot spans 26% of chamber height; switch “Demon sorting” off and
            every molecule crosses freely in both directions.
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark two-chamber box of glowing molecules, amber hot and cyan cold, divided by a central wall whose violet gate lets fast molecules through only left-to-right and slow ones right-to-left, heating the right chamber while the left chills; five traced molecules pulse brighter as they move"
      />
    </SimFrame>
  );
}
