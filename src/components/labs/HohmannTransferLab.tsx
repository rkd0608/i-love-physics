"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const TAU = Math.PI * 2;
const STAR_COLOR = "#ffd27a";
const INNER_COLOR = "#53d6f2";
const OUTER_COLOR = "#b48cf2";
const TRANSFER_COLOR = "#a5b4fc";
const MARK_COLOR = "#facc15";
const CRAFT_COLOR = "#7ef0b0";
const LABEL_FONT = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
const TIME_K = 600;
const APO_WINDOW = 0.15;
const KEPLER_ITERS = 6;
const STAT_INTERVAL = 0.15;
const COS45 = Math.SQRT1_2;
const DASH_GUIDE = [5, 7];
const DASH_NONE: number[] = [];

type Phase = "inner" | "transfer" | "outer";

type Machine = {
  phase: Phase;
  phi: number;
  mAnom: number;
  thetaIn: number;
  thetaOut: number;
  armed: boolean;
};

type Geo = {
  key: number;
  a: number;
  e: number;
  b: number;
  c: number;
  n: number;
  vc1: number;
  vp: number;
  va: number;
  vc2: number;
  dv1: number;
  dv2: number;
};

type Ledger = { dv1: number | null; dv2: number | null };

type Stats = { has: boolean; v: number; r: number; a: number };

const NO_STATS: Stats = { has: false, v: 0, r: 0, a: 0 };
const NO_LEDGER: Ledger = { dv1: null, dv2: null };

function wrap(x: number): number {
  return ((x % TAU) + TAU) % TAU;
}

function setGeo(g: Geo, r1: number, r2: number): void {
  const at = (r1 + r2) / 2;
  g.key = r1 + r2 * 4096;
  g.a = at;
  g.e = (r2 - r1) / (r2 + r1);
  g.b = at * Math.sqrt(1 - g.e * g.e);
  g.c = at * g.e;
  g.n = Math.sqrt(1 / (at * at * at));
  g.vc1 = Math.sqrt(1 / r1);
  g.vp = Math.sqrt(Math.max(2 / r1 - 1 / at, 0));
  g.va = Math.sqrt(Math.max(2 / r2 - 1 / at, 0));
  g.vc2 = Math.sqrt(1 / r2);
  g.dv1 = g.vp - g.vc1;
  g.dv2 = g.vc2 - g.va;
}

export default function HohmannTransferLab() {
  const [
    { r1, r2, ts: timeScale, pred },
    updateParams,
  ] = useSimParams<{ r1: number; r2: number; ts: number; pred: boolean }>({
    r1: 100,
    r2: 240,
    ts: 1,
    pred: true,
  });
  const [paused, setPaused] = useState(false);
  const [rm, setRm] = useState(false);
  const [ledger, setLedger] = useState<Ledger>(NO_LEDGER);
  const [armed, setArmed] = useState(false);
  const [phaseUI, setPhaseUI] = useState<Phase>("inner");
  const [stats, setStats] = useState<Stats>(NO_STATS);

  const cfg = useRef({ r1, r2, timeScale, pred, paused });
  useEffect(() => {
    const c = cfg.current;
    c.r1 = r1;
    c.r2 = r2;
    c.timeScale = timeScale;
    c.pred = pred;
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

  const machine = useRef<Machine>({
    phase: "inner",
    phi: 0,
    mAnom: 0,
    thetaIn: 0,
    thetaOut: 0,
    armed: false,
  });
  const geo = useRef<Geo>({
    key: 0,
    a: 1,
    e: 0,
    b: 1,
    c: 0,
    n: 1,
    vc1: 0,
    vp: 0,
    va: 0,
    vc2: 0,
    dv1: 0,
    dv2: 0,
  });
  const statClock = useRef(0);

  const budget = useMemo(() => {
    const at = (r1 + r2) / 2;
    const dv1 = Math.sqrt(Math.max(2 / r1 - 1 / at, 0)) - Math.sqrt(1 / r1);
    const dv2 = Math.sqrt(1 / r2) - Math.sqrt(Math.max(2 / r2 - 1 / at, 0));
    return { dv1, dv2, total: dv1 + dv2 };
  }, [r1, r2]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => {
      const c = cfg.current;
      const m = machine.current;
      const g = geo.current;
      if (g.key !== c.r1 + c.r2 * 4096) {
        setGeo(g, c.r1, c.r2);
        m.phase = "inner";
        m.phi = 0;
        m.mAnom = 0;
        m.armed = false;
        setPhaseUI("inner");
        setArmed(false);
        setLedger(NO_LEDGER);
        setStats(NO_STATS);
      }

      const cx = w / 2;
      const cy = h / 2;
      const s = Math.min(w, h) / (2 * c.r2 * 1.06);

      const adv = c.paused ? 0 : dt * c.timeScale * TIME_K;
      if (adv > 0) {
        if (m.phase === "inner") m.thetaIn = wrap(m.thetaIn + (g.vc1 / c.r1) * adv);
        else if (m.phase === "transfer") m.mAnom += g.n * adv;
        else m.thetaOut = wrap(m.thetaOut + (g.vc2 / c.r2) * adv);
      }

      const armNow =
        m.phase === "transfer" && Math.abs(wrap(m.mAnom) - Math.PI) <= APO_WINDOW;
      if (armNow !== m.armed) {
        m.armed = armNow;
        setArmed(armNow);
      }

      paintSky(ctx, w, h);

      ctx.setLineDash(DASH_GUIDE);
      ctx.lineWidth = 1.25;
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = INNER_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, c.r1 * s, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = OUTER_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, c.r2 * s, 0, TAU);
      ctx.stroke();
      ctx.setLineDash(DASH_NONE);
      ctx.globalAlpha = 1;

      ctx.font = LABEL_FONT;
      ctx.fillStyle = INNER_COLOR;
      ctx.fillText("r₁", cx + c.r1 * s * COS45 + 6, cy - c.r1 * s * COS45 - 4);
      ctx.fillStyle = OUTER_COLOR;
      ctx.fillText("r₂", cx + c.r2 * s * COS45 + 6, cy - c.r2 * s * COS45 - 4);

      glowDot(ctx, cx, cy, 14, STAR_COLOR);

      const phi = m.phase === "inner" ? m.thetaIn : m.phi;
      const planVisible = !(m.phase === "inner" && !c.pred);

      if (planVisible) {
        const cp = Math.cos(phi);
        const sp = Math.sin(phi);
        const dashed = m.phase === "inner";
        ctx.setLineDash(dashed ? DASH_GUIDE : DASH_NONE);
        ctx.globalAlpha = dashed ? 0.55 : 0.85;
        ctx.strokeStyle = TRANSFER_COLOR;
        ctx.lineWidth = dashed ? 1.25 : 1.5;
        ctx.beginPath();
        ctx.ellipse(
          cx - g.c * cp * s,
          cy + g.c * sp * s,
          g.a * s,
          g.b * s,
          -phi,
          0,
          TAU
        );
        ctx.stroke();
        ctx.setLineDash(DASH_NONE);
        ctx.globalAlpha = 1;

        const ringPhase = m.phase === "transfer" || dashed;
        if (ringPhase) {
          const p1x = cx + c.r1 * cp * s;
          const p1y = cy - c.r1 * sp * s;
          ctx.strokeStyle = MARK_COLOR;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p1x, p1y, 6, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = MARK_COLOR;
          ctx.fillText("①", p1x + 9, p1y - 6);
          const p2x = cx - c.r2 * cp * s;
          const p2y = cy + c.r2 * sp * s;
          const pr = 7 + Math.sin(t * 5) * 1.5;
          ctx.strokeStyle = OUTER_COLOR;
          ctx.beginPath();
          ctx.arc(p2x, p2y, pr, 0, TAU);
          ctx.stroke();
          ctx.fillStyle = OUTER_COLOR;
          ctx.fillText("②", p2x + pr + 3, p2y + 4);
        }
      }

      let wx: number;
      let wy: number;
      let aConic: number;
      if (m.phase === "inner") {
        wx = c.r1 * Math.cos(m.thetaIn);
        wy = c.r1 * Math.sin(m.thetaIn);
        aConic = c.r1;
      } else if (m.phase === "transfer") {
        const M = wrap(m.mAnom);
        let E = M + g.e * Math.sin(M);
        for (let k = 0; k < KEPLER_ITERS; k++) {
          E -= (E - g.e * Math.sin(E) - M) / (1 - g.e * Math.cos(E));
        }
        const ox = g.a * (Math.cos(E) - g.e);
        const oy = g.b * Math.sin(E);
        const cp = Math.cos(m.phi);
        const sp = Math.sin(m.phi);
        wx = ox * cp - oy * sp;
        wy = ox * sp + oy * cp;
        aConic = g.a;
      } else {
        wx = c.r2 * Math.cos(m.thetaOut);
        wy = c.r2 * Math.sin(m.thetaOut);
        aConic = c.r2;
      }
      const rNow = Math.hypot(wx, wy);
      const vNow = Math.sqrt(Math.max(2 / rNow - 1 / aConic, 0));
      glowDot(ctx, cx + wx * s, cy - wy * s, 4.5, CRAFT_COLOR);

      statClock.current += dt;
      if (statClock.current >= STAT_INTERVAL) {
        statClock.current = 0;
        setStats({ has: true, v: vNow, r: rNow, a: aConic });
      }
    },
    []
  );

  const canvasRef = useSimLoop(draw);

  const burnOne = useCallback(() => {
    const m = machine.current;
    if (m.phase !== "inner") return;
    m.phi = m.thetaIn;
    m.mAnom = 0;
    m.phase = "transfer";
    m.armed = false;
    setPhaseUI("transfer");
    setArmed(false);
    setLedger({ dv1: geo.current.dv1, dv2: null });
  }, []);

  const burnTwo = useCallback(() => {
    const m = machine.current;
    if (m.phase !== "transfer" || !m.armed) return;
    m.thetaOut = wrap(m.phi + Math.PI);
    m.phase = "outer";
    m.armed = false;
    setPhaseUI("outer");
    setArmed(false);
    const dv1 = geo.current.dv1;
    const dv2 = geo.current.dv2;
    setLedger((prev) => ({ dv1: prev.dv1 ?? dv1, dv2 }));
  }, []);

  const controls = (
    <>
      <Slider
        label="Inner orbit r₁"
        value={r1}
        min={80}
        max={140}
        step={2}
        unit="px"
        onChange={(v) => updateParams({ r1: v })}
      />
      <Slider
        label="Outer orbit r₂"
        value={r2}
        min={160}
        max={320}
        step={5}
        unit="px"
        onChange={(v) => updateParams({ r2: v })}
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
      <Toggle
        label="Predicted transfer path"
        checked={pred}
        onChange={(v) => updateParams({ pred: v })}
      />
      {rm ? (
        <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
          {paused ? "Play" : "Pause"}
        </ActionButton>
      ) : null}
      <span className={phaseUI === "inner" ? "" : "pointer-events-none opacity-40"}>
        <ActionButton onClick={burnOne}>Burn ①</ActionButton>
      </span>
      <span
        className={
          phaseUI === "transfer" && armed
            ? "animate-pulse"
            : "pointer-events-none opacity-40"
        }
      >
        <ActionButton onClick={burnTwo}>Burn ②</ActionButton>
      </span>
    </>
  );

  const liveRow = (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <TeX
        block={false}
        tex={"v^2 = GM\\left(\\tfrac{2}{r} - \\tfrac{1}{a}\\right)"}
      />
      <span>
        Δv₁ = <span className="font-mono text-accent">{fmt(budget.dv1, 4)}</span>
      </span>
      <span>
        Δv₂ = <span className="font-mono text-accent">{fmt(budget.dv2, 4)}</span>
      </span>
      <span>
        ΣΔv = <span className="font-mono text-accent">{fmt(budget.total, 4)}</span>
      </span>
      {stats.has ? (
        <TeX
          block={false}
          tex={`v^2 = GM\\left(\\tfrac{2}{${fmt(stats.r, 0)}} - \\tfrac{1}{${fmt(stats.a, 1)}}\\right) \\Rightarrow v \\approx ${fmt(stats.v, 4)}`}
        />
      ) : null}
    </span>
  );

  return (
    <SimFrame
      title="Staged-Burn Transfer"
      subtitle="Press Burn ① anywhere on the inner circle; press Burn ② at apoapsis to circularize"
      controls={controls}
      footnote={liveRow}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full select-none"
        role="img"
        aria-label="Hohmann transfer simulation: a spacecraft circles the dashed inner orbit, burns prograde onto a transfer ellipse that kisses the dashed outer orbit, then circularizes; an amber star sits at the focus with delta-v markers at both burn points"
      />
      {ledger.dv1 !== null ? (
        <div className="absolute right-3 top-3 rounded-lg border border-line bg-[#060a17]/80 px-3 py-2 font-mono text-xs leading-relaxed">
          <div className="text-muted">Δv ledger</div>
          <div>Δv₁ {ledger.dv1 !== null ? fmt(ledger.dv1, 4) : "—"}</div>
          <div>Δv₂ {ledger.dv2 !== null ? fmt(ledger.dv2, 4) : "—"}</div>
          <div className="text-accent">
            Σ {((ledger.dv1 ?? 0) + (ledger.dv2 ?? 0)).toFixed(4)}
          </div>
        </div>
      ) : null}
    </SimFrame>
  );
}
