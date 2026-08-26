"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { drawArrow, glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const GAMMA = 5 / 3;
const RGAS = 8.314;
const CVGAS = 1.5 * RGAS;
const NPTS = 512;
const V_BASE = 1;
const CYCLE_RATE = 1 / 9;

const GOLD = "#f59e0b";
const GOLD_DIM = "rgba(245,158,11,0.35)";
const AREA_FILL = "rgba(217,119,6,0.12)";
const SWEEP_FILL = "rgba(217,119,6,0.1)";
const TRACE = "#fbbf24";
const HOT = "#fb923c";
const COLD = "#60a5fa";
const MUTED = "#8b93b8";
const SILVER = "#e6ebff";

const STROKE_NAMES = [
  "isothermal expansion",
  "adiabatic expansion",
  "isothermal compression",
  "adiabatic compression",
];

const DASH_GUIDE = [3, 5];

const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

type Geom = {
  key: string;
  V: Float64Array;
  P: Float64Array;
  T: Float64Array;
  vb: number;
  vc: number;
  vd: number;
  pa: number;
  pb: number;
  pc: number;
  pd: number;
  th: number;
  tc: number;
  rTcTh: number;
  rThTc: number;
  q1: number;
  q3: number;
  w2: number;
  wNet: number;
  qIn: number;
  eta: number;
  cenV: number;
  cenP: number;
  labQ: [string, string, string, string];
  labW: [string, string, string, string];
};

let gKey = "";
let gCache: Geom | null = null;

const CUR = new Float64Array(3);

function kJ(j: number): string {
  return `${fmt(j / 1000, 2)} kJ`;
}

function strokeCum(g: Geom, s: number, f: number): number {
  if (s === 0) return g.q1 * f;
  if (s === 1) return CVGAS * g.th * (1 - Math.pow(g.rTcTh, f));
  if (s === 2) return g.q3 * f;
  return CVGAS * g.tc * (1 - Math.pow(g.rThTc, f));
}

function workBetween(g: Geom, a: number, b: number): number {
  let tot = 0;
  let x = a;
  let guard = 0;
  while (x < b - 1e-12 && guard < 6) {
    guard += 1;
    const s = Math.floor(x);
    const e = Math.min(b, s + 1);
    tot += strokeCum(g, s, e - s) - strokeCum(g, s, x - s);
    x = e;
  }
  return tot;
}

function qInBetween(g: Geom, a: number, b: number): number {
  let tot = 0;
  let x = a;
  let guard = 0;
  while (x < b - 1e-12 && guard < 6) {
    guard += 1;
    const s = Math.floor(x);
    const e = Math.min(b, s + 1);
    if (s === 0) tot += (e - x) * g.q1;
    x = e;
  }
  return tot;
}

function ensureGeom(th: number, tc: number, cr: number): Geom {
  const key = `${th}|${tc}|${cr}`;
  if (gKey === key && gCache) return gCache;
  const tau = Math.pow(th / tc, 1 / (GAMMA - 1));
  const va = V_BASE;
  const vb = va * cr;
  const vc = vb * tau;
  const vd = va * tau;
  const V = new Float64Array(NPTS);
  const P = new Float64Array(NPTS);
  const T = new Float64Array(NPTS);
  for (let i = 0; i < NPTS; i += 1) {
    const u = (4 * i) / (NPTS - 1);
    const s = Math.min(3, Math.floor(u));
    const f = u - s;
    let v: number;
    let t: number;
    if (s === 0) {
      v = va * Math.pow(cr, f);
      t = th;
    } else if (s === 1) {
      v = vb * Math.pow(tau, f);
      t = th * Math.pow(tc / th, f);
    } else if (s === 2) {
      v = vc * Math.pow(1 / cr, f);
      t = tc;
    } else {
      v = vd * Math.pow(1 / tau, f);
      t = tc * Math.pow(th / tc, f);
    }
    V[i] = v;
    T[i] = t;
    P[i] = (RGAS * t) / v;
  }
  let area6 = 0;
  let cxSum = 0;
  let cySum = 0;
  for (let i = 0; i < NPTS; i += 1) {
    const j = (i + 1) % NPTS;
    const cross = V[i] * P[j] - V[j] * P[i];
    area6 += cross;
    cxSum += (V[i] + V[j]) * cross;
    cySum += (P[i] + P[j]) * cross;
  }
  const area = area6 / 2;
  const q1 = RGAS * th * Math.log(cr);
  const q3 = -RGAS * tc * Math.log(cr);
  const w2 = CVGAS * (th - tc);
  const wNet = RGAS * (th - tc) * Math.log(cr);
  gCache = {
    key,
    V,
    P,
    T,
    vb,
    vc,
    vd,
    pa: (RGAS * th) / va,
    pb: (RGAS * th) / vb,
    pc: (RGAS * tc) / vc,
    pd: (RGAS * tc) / vd,
    th,
    tc,
    rTcTh: tc / th,
    rThTc: th / tc,
    q1,
    q3,
    w2,
    wNet,
    qIn: q1,
    eta: wNet / q1,
    cenV: cxSum / (6 * area),
    cenP: cySum / (6 * area),
    labQ: [`Q_in ${kJ(q1)}`, "Q 0", `Q_out ${kJ(-q3)}`, "Q 0"],
    labW: [`W ${kJ(q1)}`, `W ${kJ(w2)}`, `W ${kJ(q3)}`, `W ${kJ(-w2)}`],
  };
  gKey = key;
  return gCache;
}

function sampleCur(g: Geom, u: number): void {
  const uu = u - 4 * Math.floor(u / 4);
  const x = (uu / 4) * (NPTS - 1);
  const i0 = Math.floor(x);
  const i1 = Math.min(i0 + 1, NPTS - 1);
  const fr = x - i0;
  CUR[0] = g.V[i0] + (g.V[i1] - g.V[i0]) * fr;
  CUR[1] = g.P[i0] + (g.P[i1] - g.P[i0]) * fr;
  CUR[2] = g.T[i0] + (g.T[i1] - g.T[i0]) * fr;
}

const tintCache = new Map<number, string>();

function tempTint(tNorm: number): string {
  const lvl = Math.max(0, Math.min(48, Math.round(tNorm * 48)));
  let c = tintCache.get(lvl);
  if (c === undefined) {
    const f = lvl / 48;
    const r = Math.round(59 + (239 - 59) * f);
    const gch = Math.round(130 + (68 - 130) * f);
    const b = Math.round(246 + (68 - 246) * f);
    c = `rgb(${r},${gch},${b})`;
    tintCache.set(lvl, c);
  }
  return c;
}

export default function CarnotCycleLab() {
  const [
    { th, tc, cr, ts, labels },
    updateParams,
  ] = useSimParams<{
    th: number;
    tc: number;
    cr: number;
    ts: number;
    labels: boolean;
  }>({
    th: 600,
    tc: 300,
    cr: 4,
    ts: 1,
    labels: true,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  const thRef = useRef(th);
  const tcRef = useRef(tc);
  const crRef = useRef(cr);
  const tsRef = useRef(ts);
  const pausedRef = useRef(paused);

  useEffect(() => {
    thRef.current = th;
    tcRef.current = tc;
    crRef.current = cr;
    tsRef.current = ts;
    pausedRef.current = paused;
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const uRef = useRef(0);
  const cyclesRef = useRef(0);
  const wAccRef = useRef(0);
  const qAccRef = useRef(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      uRef.current = 0;
      cyclesRef.current = 0;
      wAccRef.current = 0;
      qAccRef.current = 0;
    });
    return () => cancelAnimationFrame(id);
  }, [th, tc, cr]);

  const TH = Math.max(th, tc + 10);
  const TC = Math.min(tc, TH - 10);
  const etaFormula = 1 - TC / TH;
  const wNetNow = RGAS * (TH - TC) * Math.log(cr);

  const canvasRef = useSimLoop((ctx, w, h, t, dt) => {
    const g = ensureGeom(thRef.current, tcRef.current, crRef.current);

    if (!pausedRef.current && tsRef.current > 0) {
      const adv = dt * tsRef.current * CYCLE_RATE;
      const u0 = uRef.current;
      const end = u0 + adv;
      if (end >= 4) {
        wAccRef.current +=
          workBetween(g, u0, 4) + workBetween(g, 0, end - 4);
        qAccRef.current +=
          qInBetween(g, u0, 4) + qInBetween(g, 0, end - 4);
        cyclesRef.current += 1;
        uRef.current = end - 4;
      } else {
        wAccRef.current += workBetween(g, u0, end);
        qAccRef.current += qInBetween(g, u0, end);
        uRef.current = end;
      }
    }

    const u = uRef.current;
    const s = Math.min(3, Math.floor(u));
    sampleCur(g, u);
    const vCur = CUR[0];
    const pCur = CUR[1];
    const tCur = CUR[2];
    const tNorm =
      g.th - g.tc > 1e-9 ? (tCur - g.tc) / (g.th - g.tc) : 0.5;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = "rgba(139,147,184,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(w * 0.5) + 0.5, 14);
    ctx.lineTo(Math.round(w * 0.5) + 0.5, h - 14);
    ctx.stroke();

    ctx.font = MONO_LABEL;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillStyle = GOLD;
    ctx.fillText(STROKE_NAMES[s], 18, 24);
    ctx.fillStyle = MUTED;
    ctx.fillText(`T = ${fmt(tCur, 0)} K`, 18, 42);
    ctx.fillText(`P = ${fmt(pCur / 1000, 2)} kPa`, 18, 58);
    ctx.fillText(`V = ${fmt(vCur, 2)} m³`, 18, 74);

    const hw = w * 0.5;
    const cx = hw * 0.52;
    const cylW = Math.min(hw * 0.36, h * 0.62);
    const yBot = h * 0.82;
    const yTravel = h * 0.56;
    const vMin = g.V[0];
    const vMax = g.vc;
    const fV = Math.max(
      0,
      Math.min(1, (vCur - vMin) / (vMax - vMin))
    );
    const pistonY = yBot - fV * yTravel;

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - cylW / 2, pistonY - 26);
    ctx.lineTo(cx - cylW / 2, yBot);
    ctx.moveTo(cx + cylW / 2, pistonY - 26);
    ctx.lineTo(cx + cylW / 2, yBot);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    for (let yy = pistonY - 20; yy < yBot; yy += 18) {
      ctx.moveTo(cx - cylW / 2, yy);
      ctx.lineTo(cx - cylW / 2 - 8, yy - 8);
      ctx.moveTo(cx + cylW / 2, yy);
      ctx.lineTo(cx + cylW / 2 + 8, yy - 8);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const gasTop = pistonY + 9;
    ctx.fillStyle = tempTint(tNorm);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(cx - cylW / 2 + 2, gasTop, cylW - 4, yBot - gasTop);
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#2a3153";
    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(cx - cylW / 2, pistonY, cylW, 9);
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 1; k < 5; k += 1) {
      const xo = cx - cylW / 2 + (cylW * k) / 5;
      ctx.moveTo(xo - 4, pistonY + 9);
      ctx.lineTo(xo + 4, pistonY);
    }
    ctx.stroke();

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, pistonY);
    ctx.lineTo(cx, pistonY - 30);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, pistonY - 32);
    ctx.lineTo(cx + 16, pistonY - 32);
    ctx.stroke();

    const barColor =
      s === 0 ? HOT : s === 2 ? COLD : "rgba(139,147,184,0.35)";
    ctx.fillStyle = barColor;
    ctx.fillRect(cx - cylW / 2, yBot, cylW, 5);

    if (s === 0 || s === 2) {
      const col = s === 0 ? HOT : COLD;
      for (let i = 0; i < 3; i += 1) {
        const ax = cx + (i - 1) * cylW * 0.28;
        const pulse = 0.55 + 0.35 * Math.sin(t * 6 - i * 1.3);
        ctx.globalAlpha = pulse;
        if (s === 0) drawArrow(ctx, ax, yBot + 40, ax, yBot + 10, col, 2.5);
        else drawArrow(ctx, ax, yBot + 10, ax, yBot + 40, col, 2.5);
      }
      ctx.globalAlpha = 1;
      ctx.font = MONO_LABEL;
      ctx.fillStyle = col;
      ctx.textAlign = "center";
      ctx.fillText(s === 0 ? "Q in" : "Q out", cx, yBot + 54);
    }

    const rx0 = hw + 44;
    const rx1 = w - 24;
    const ryTop = 34;
    const ryBot = h - 34;
    const vLo = vMin * 0.94;
    const vHi = g.vc * 1.05;
    const pHi = g.pa * 1.12;
    const mx = (v: number): number =>
      rx0 + ((v - vLo) / (vHi - vLo)) * (rx1 - rx0);
    const my = (p: number): number => ryBot - (p / pHi) * (ryBot - ryTop);

    ctx.setLineDash(DASH_GUIDE);
    ctx.strokeStyle = "rgba(139,147,184,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx0 + 0.5, ryTop);
    ctx.lineTo(rx0 + 0.5, ryBot + 0.5);
    ctx.lineTo(rx1, ryBot + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.fillText("V (m³)", (rx0 + rx1) / 2, ryBot + 20);
    ctx.save();
    ctx.translate(rx0 - 30, (ryTop + ryBot) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("P (kPa)", 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(mx(g.V[0]), my(g.P[0]));
    for (let i = 4; i < NPTS; i += 4) {
      ctx.lineTo(mx(g.V[i]), my(g.P[i]));
    }
    ctx.closePath();
    ctx.fillStyle = AREA_FILL;
    ctx.fill();
    ctx.strokeStyle = GOLD_DIM;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const kCur = Math.round((u / 4) * (NPTS - 1));
    if (kCur > 1) {
      ctx.beginPath();
      ctx.moveTo(mx(g.V[0]), my(g.P[0]));
      for (let i = 2; i <= kCur; i += 2) {
        ctx.lineTo(mx(g.V[i]), my(g.P[i]));
      }
      ctx.lineTo(mx(g.V[kCur]), my(g.P[kCur]));
      ctx.closePath();
      ctx.fillStyle = SWEEP_FILL;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(mx(g.V[0]), my(g.P[0]));
      for (let i = 2; i <= kCur; i += 2) {
        ctx.lineTo(mx(g.V[i]), my(g.P[i]));
      }
      ctx.strokeStyle = TRACE;
      ctx.lineWidth = 2.25;
      ctx.shadowColor = GOLD;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.font = MONO_SMALL;
    ctx.fillStyle = SILVER;
    ctx.globalAlpha = 0.85;
    ctx.textAlign = "right";
    ctx.fillText("A", mx(g.V[0]) - 6, my(g.pa) + 3);
    ctx.textAlign = "center";
    ctx.fillText("B", mx(g.vb), my(g.pb) - 6);
    ctx.fillText("C", mx(g.vc) + 2, my(g.pc) - 6);
    ctx.textAlign = "left";
    ctx.fillText("D", mx(g.vd) + 6, my(g.pd) + 12);
    ctx.globalAlpha = 1;

    glowDot(ctx, mx(vCur), my(pCur), 5, TRACE);

    if (labels) {
      const offs: [number, number, CanvasTextAlign][] = [
        [0, -30, "center"],
        [34, 4, "left"],
        [0, 34, "center"],
        [-34, 4, "right"],
      ];
      for (let st = 0; st < 4; st += 1) {
        const mi = st * 128 + 64;
        const lx = mx(g.V[mi]) + offs[st][0];
        const ly = my(g.P[mi]) + offs[st][1];
        ctx.textAlign = offs[st][2];
        ctx.font = MONO_SMALL;
        ctx.fillStyle =
          st === 0 ? HOT : st === 2 ? COLD : MUTED;
        ctx.fillText(g.labQ[st], lx, ly);
        ctx.fillStyle = SILVER;
        ctx.globalAlpha = 0.85;
        ctx.fillText(g.labW[st], lx, ly + 13);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = GOLD;
      ctx.textAlign = "center";
      ctx.fillText(`W = ${kJ(g.wNet)}`, mx(g.cenV), my(g.cenP) + 4);
    }

    ctx.font = MONO_SMALL;
    ctx.textAlign = "right";
    const etaRun =
      qAccRef.current > 1e-9
        ? wAccRef.current / qAccRef.current
        : Number.NaN;
    ctx.fillStyle = MUTED;
    ctx.fillText(
      `cycle ${cyclesRef.current} · η_run ${
        Number.isFinite(etaRun) ? `${fmt(etaRun * 100, 1)}%` : "—"
      }`,
      w - 16,
      22
    );
    ctx.textAlign = "left";
  });

  return (
    <SimFrame
      title="Carnot Cycle"
      subtitle="Two isotherms, two adiabats · monatomic gas, γ = 5/3, n = 1 mol"
      controls={
        <>
          <Slider
            label="Hot temp T_h"
            value={th}
            min={400}
            max={900}
            step={10}
            unit="K"
            onChange={(v) => updateParams({ th: v })}
          />
          <Slider
            label="Cold temp T_c"
            value={tc}
            min={200}
            max={350}
            step={5}
            unit="K"
            onChange={(v) => updateParams({ tc: v })}
          />
          <Slider
            label="Compression ratio"
            value={cr}
            min={2}
            max={6}
            step={0.1}
            onChange={(v) => updateParams({ cr: v })}
          />
          <Slider
            label="Time scale"
            value={ts}
            min={0}
            max={3}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ ts: v })}
          />
          <Toggle
            label="Labels"
            checked={labels}
            onChange={(v) => updateParams({ labels: v })}
          />
          {reduced ? (
            <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
              {paused ? "Play" : "Pause"}
            </ActionButton>
          ) : null}
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`\eta = 1 - \tfrac{T_c}{T_h} = ${fmt(etaFormula * 100, 1)}\,\%`}
            className="text-sm"
          />
          <TeX
            tex={String.raw`W = \oint P\,dV`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">= </span>
            <span className="text-accent">{fmt(wNetNow, 0)}</span>
            <span className="text-muted"> J</span>
          </span>
          <span className="rounded border border-accent/40 px-1.5 py-0.5 text-xs text-accent">
            η_Carnot
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Carnot engine: a piston compressing and expanding monatomic gas beside a live pressure-volume loop whose shaded enclosed area equals the net work, with heat-flow arrows during the isotherms, per-stroke heat and work labels, and a running cycle counter with efficiency"
      />
    </SimFrame>
  );
}
