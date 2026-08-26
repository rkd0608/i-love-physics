"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const ORANGE = "#ff9e64";
const CYAN = "#53d6f2";
const AMBER = "#ffd27a";
const MUTED = "#8b93b8";
const TICK_C = "rgba(139,147,184,0.75)";
const AXIS_C = "rgba(139,147,184,0.4)";
const CONE_C = "rgba(139,147,184,0.22)";
const PLANE_C = "rgba(255,158,100,0.14)";
const PLANE_NOW = "rgba(255,158,100,0.55)";
const HOME_GLOW = "rgba(83,214,242,0.12)";
const TRAVEL_GLOW = "rgba(255,158,100,0.12)";
const PANEL_C = "rgba(6,10,23,0.85)";
const LEG_LABEL = "rgba(255,158,100,0.85)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_HUD = "12px ui-monospace, SFMono-Regular, Menlo, monospace";

type Geo = {
  sig: number;
  gamma: number;
  tauOut: number;
  tTurn: number;
  xTurn: number;
  tEnd: number;
  home: Float32Array;
  travel: Float32Array;
  banner: string;
};

type HudCache = { key: number; str: string };

function makeGeo(): Geo {
  return {
    sig: -1,
    gamma: 1,
    tauOut: 0,
    tTurn: 0,
    xTurn: 0,
    tEnd: 0,
    home: new Float32Array(4),
    travel: new Float32Array(6),
    banner: "",
  };
}

function rebuildGeo(g: Geo, beta: number, tau: number): void {
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  g.sig = Math.round(beta * 100) * 4096 + tau;
  g.gamma = gamma;
  g.tauOut = tau;
  g.tTurn = gamma * tau;
  g.xTurn = beta * g.tTurn;
  g.tEnd = 2 * g.tTurn;
  g.home[0] = 0;
  g.home[1] = 0;
  g.home[2] = 0;
  g.home[3] = g.tEnd;
  g.travel[0] = 0;
  g.travel[1] = 0;
  g.travel[2] = g.xTurn;
  g.travel[3] = g.tTurn;
  g.travel[4] = 0;
  g.travel[5] = g.tEnd;
  g.banner = `Δage = ${fmt(2 * tau * (gamma - 1), 2)} yr — stay-home twin wins`;
}

const tickCache = new Map<number, string>();

function tickLabel(n: number): string {
  let s = tickCache.get(n);
  if (s === undefined) {
    if (tickCache.size > 512) tickCache.clear();
    s = String(n);
    tickCache.set(n, s);
  }
  return s;
}

function niceStep(span: number): number {
  const target = span / 7;
  if (target <= 1) return 1;
  if (target <= 2) return 2;
  if (target <= 5) return 5;
  if (target <= 10) return 10;
  if (target <= 20) return 20;
  return 50;
}

export default function TwinParadoxLab() {
  const [
    { beta, tau, speed, planes },
    updateParams,
  ] = useSimParams<{ beta: number; tau: number; speed: number; planes: boolean }>({
    beta: 0.8,
    tau: 10,
    speed: 1,
    planes: false,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [race, setRace] = useState({ home: 0, trip: 0 });

  const betaRef = useRef(beta);
  const tauRef = useRef(tau);
  const speedRef = useRef(speed);
  const planesRef = useRef(planes);
  const pausedRef = useRef(paused);
  const simTRef = useRef(0);
  const geoRef = useRef<Geo | null>(null);
  const homeKeyRef = useRef(-1);
  const tripKeyRef = useRef(-1);
  const hudHomeRef = useRef<HudCache>({ key: -1, str: "" });
  const hudTripRef = useRef<HudCache>({ key: -1, str: "" });
  const bannerRef = useRef({ sig: -1, wpx: 0 });

  useEffect(() => {
    betaRef.current = beta;
    tauRef.current = tau;
    speedRef.current = speed;
    planesRef.current = planes;
    pausedRef.current = paused;
  });

  useEffect(() => {
    simTRef.current = 0;
    homeKeyRef.current = -1;
    tripKeyRef.current = -1;
  }, [beta, tau]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const reset = (): void => {
    simTRef.current = 0;
    homeKeyRef.current = -1;
    tripKeyRef.current = -1;
    setRace({ home: 0, trip: 0 });
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const b = betaRef.current;
    const tu = tauRef.current;
    let g = geoRef.current;
    if (!g) {
      g = makeGeo();
      geoRef.current = g;
    }
    const sig = Math.round(b * 100) * 4096 + tu;
    if (g.sig !== sig) rebuildGeo(g, b, tu);

    if (!pausedRef.current && simTRef.current < g.tEnd) {
      simTRef.current = Math.min(g.tEnd, simTRef.current + dt * speedRef.current);
    }
    const simT = simTRef.current;

    let tripTau: number;
    let slope: number;
    let xe: number;
    if (simT <= g.tTurn) {
      tripTau = simT / g.gamma;
      slope = b;
      xe = b * simT;
    } else {
      const u = simT - g.tTurn;
      tripTau = tu + u / g.gamma;
      slope = -b;
      xe = g.xTurn - b * u;
    }

    const hk = Math.round(simT * 100);
    const tk = Math.round(tripTau * 100);
    const pushH = hk !== homeKeyRef.current;
    const pushT = tk !== tripKeyRef.current;
    if (pushH) homeKeyRef.current = hk;
    if (pushT) tripKeyRef.current = tk;
    if (pushH || pushT) setRace({ home: simT, trip: tripTau });

    const mL = 46;
    const mR = 16;
    const mT = 12;
    const mB = 32;
    const plotW = w - mL - mR;
    const plotH = h - mT - mB;
    const xMin = -0.35 * g.xTurn - 0.6;
    const xMax = g.xTurn * 1.25 + 0.6;
    const spanX = xMax - xMin;
    const spanT = g.tEnd * 1.06;
    const scl = Math.min(plotW / spanX, plotH / spanT);
    const ox = mL + (plotW - spanX * scl) / 2 - xMin * scl;
    const oy = mT + (plotH - spanT * scl) / 2 + g.tEnd * scl;
    const ry = oy - g.tEnd * scl;
    const tXp = ox + g.xTurn * scl;
    const tYp = oy - g.tTurn * scl;
    const done = simT >= g.tEnd - 1e-9;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = AXIS_C;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mL, oy + 0.5);
    ctx.lineTo(w - mR, oy + 0.5);
    ctx.moveTo(ox + 0.5, mT);
    ctx.lineTo(ox + 0.5, h - mB);
    ctx.stroke();

    ctx.font = MONO_SMALL;
    ctx.fillStyle = TICK_C;
    ctx.textAlign = "center";
    const stX = niceStep(spanX);
    for (let xv = Math.ceil(xMin / stX) * stX; xv <= xMax; xv += stX) {
      const px = ox + xv * scl;
      ctx.fillRect(px - 0.5, oy - 3, 1, 6);
      ctx.fillText(tickLabel(Math.round(xv)), px, oy + 14);
    }
    ctx.textAlign = "right";
    const stT = niceStep(g.tEnd);
    for (let cv = stT; cv <= g.tEnd; cv += stT) {
      const py = oy - cv * scl;
      ctx.fillRect(ox - 3, py - 0.5, 6, 1);
      ctx.fillText(tickLabel(Math.round(cv)), ox - 7, py + 3);
    }

    ctx.fillStyle = TICK_C;
    ctx.font = MONO_HUD;
    ctx.textAlign = "left";
    ctx.fillText("ct (yr)", 14, 20);
    ctx.font = MONO_SMALL;
    ctx.textAlign = "right";
    ctx.fillText("x (yr)", w - mR, h - 8);

    ctx.save();
    ctx.beginPath();
    ctx.rect(mL, mT, plotW, plotH);
    ctx.clip();

    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = CONE_C;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(mL, oy - (ox - mL));
    ctx.moveTo(ox, oy);
    ctx.lineTo(w - mR, oy - (w - mR - ox));
    ctx.moveTo(ox, ry);
    ctx.lineTo(mL, ry + (ox - mL));
    ctx.moveTo(ox, ry);
    ctx.lineTo(w - mR, ry + (w - mR - ox));
    ctx.stroke();
    ctx.setLineDash([]);

    if (planesRef.current) {
      const kMax = Math.floor(tu);
      ctx.strokeStyle = PLANE_C;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k <= kMax; k++) {
        const tauK = 2 * k;
        let et: number;
        let ex: number;
        let mm: number;
        if (tauK <= tu) {
          et = g.gamma * tauK;
          ex = b * et;
          mm = b;
        } else {
          const s = tauK - tu;
          et = g.tTurn + g.gamma * s;
          ex = g.xTurn - b * g.gamma * s;
          mm = -b;
        }
        const c = et - mm * ex;
        ctx.moveTo(ox + xMin * scl, oy - (mm * xMin + c) * scl);
        ctx.lineTo(ox + xMax * scl, oy - (mm * xMax + c) * scl);
      }
      ctx.stroke();

      const cNow = simT - slope * xe;
      ctx.strokeStyle = PLANE_NOW;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ox + xMin * scl, oy - (slope * xMin + cNow) * scl);
      ctx.lineTo(ox + xMax * scl, oy - (slope * xMax + cNow) * scl);
      ctx.stroke();

      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, oy - cNow * scl, 3.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = HOME_GLOW;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, ry);
    ctx.stroke();
    ctx.strokeStyle = TRAVEL_GLOW;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tXp, tYp);
    ctx.lineTo(ox, ry);
    ctx.stroke();

    ctx.strokeStyle = CYAN;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, ry);
    ctx.stroke();

    ctx.strokeStyle = ORANGE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(tXp, tYp);
    ctx.lineTo(ox, ry);
    ctx.stroke();

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.moveTo(tXp + 4, tYp);
    ctx.arc(tXp, tYp, 4, 0, Math.PI * 2);
    ctx.moveTo(ox + 5, ry);
    ctx.arc(ox, ry, done ? 5 : 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = MONO_SMALL;
    ctx.fillStyle = TICK_C;
    ctx.textAlign = "right";
    ctx.fillText("departure", ox - 8, oy - 6);
    ctx.fillText("reunion", ox - 8, ry - 6);
    ctx.textAlign = "left";
    ctx.fillText("turnaround", tXp + 8, tYp - 8);

    const midX = ox + (g.xTurn * scl) / 2;
    const midY = oy - (g.tTurn * scl) / 2;
    ctx.save();
    ctx.translate(midX, midY);
    ctx.rotate(Math.atan2(-1, b));
    ctx.fillStyle = LEG_LABEL;
    ctx.textAlign = "center";
    ctx.fillText("traveling twin", 0, -7);
    ctx.restore();

    ctx.save();
    ctx.translate(ox + 10, oy - g.tEnd * scl * 0.72);
    ctx.fillStyle = "rgba(83,214,242,0.8)";
    ctx.textAlign = "left";
    ctx.fillText("stay-home twin", 0, 0);
    ctx.restore();

    glowDot(ctx, ox, oy - simT * scl, 4.5, CYAN);
    glowDot(ctx, ox + xe * scl, oy - simT * scl, 5, ORANGE);

    ctx.restore();

    ctx.font = MONO_HUD;
    ctx.textAlign = "left";
    if (hk !== hudHomeRef.current.key) {
      hudHomeRef.current.key = hk;
      hudHomeRef.current.str = `home ${fmt(simT, 2)} yr`;
    }
    if (tk !== hudTripRef.current.key) {
      hudTripRef.current.key = tk;
      hudTripRef.current.str = `trip ${fmt(tripTau, 2)} yr`;
    }
    ctx.fillStyle = CYAN;
    ctx.fillRect(14, 36, 8, 8);
    ctx.fillText(hudHomeRef.current.str, 28, 44);
    ctx.fillStyle = ORANGE;
    ctx.fillRect(14, 56, 8, 8);
    ctx.fillText(hudTripRef.current.str, 28, 64);

    if (done) {
      if (bannerRef.current.sig !== g.sig) {
        ctx.font = MONO_LABEL;
        bannerRef.current.sig = g.sig;
        bannerRef.current.wpx = ctx.measureText(g.banner).width;
      }
      const bw = bannerRef.current.wpx + 24;
      const bx = w / 2 - bw / 2;
      const by = mT + 22;
      ctx.fillStyle = PANEL_C;
      ctx.strokeStyle = "rgba(255,210,122,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, 26, 13);
      ctx.fill();
      ctx.stroke();
      ctx.font = MONO_LABEL;
      ctx.fillStyle = AMBER;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(g.banner, w / 2, by + 14);
      ctx.textBaseline = "alphabetic";
    }
  };

  const canvasRef = useSimLoop(draw);

  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const deltaAge = 2 * tau * (gamma - 1);

  return (
    <SimFrame
      title="Twin Paradox"
      subtitle="Minkowski worldlines: the kinked path ages less"
      controls={
        <>
          <Slider
            label="Outbound speed β"
            value={beta}
            min={0.1}
            max={0.95}
            step={0.01}
            onChange={(v) => updateParams({ beta: v })}
          />
          <Slider
            label="Trip half-length τ"
            value={tau}
            min={2}
            max={20}
            step={1}
            unit="yr"
            onChange={(v) => updateParams({ tau: v })}
          />
          <Slider
            label="Time scale"
            value={speed}
            min={0}
            max={3}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ speed: v })}
          />
          <Toggle
            label="Simultaneity planes"
            checked={planes}
            onChange={(v) => updateParams({ planes: v })}
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
          <ActionButton onClick={reset}>Reset</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={"\\tau = \\int \\sqrt{1-\\beta^2}\\,dt"}
            className="text-sm"
          />
          <p className="font-mono text-xs">
            <span className="text-muted">γ </span>
            <span className="text-accent">{fmt(gamma, 3)}</span>
            <span className="text-muted"> · τ_travel </span>
            <span className="text-accent">{fmt(race.trip, 2)}</span>
            <span className="text-muted"> yr · τ_home </span>
            <span className="text-accent">{fmt(race.home, 2)}</span>
            <span className="text-muted"> yr · Δ </span>
            <span className="text-accent">{fmt(deltaAge, 2)}</span>
            <span className="text-muted"> yr</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Minkowski diagram of the twin paradox: the stay-home twin’s vertical worldline beside the traveling twin’s two-leg kinked path between shared departure and reunion events, with 45-degree light cones, optional tilting lines of simultaneity and live aging counters for both twins"
      />
    </SimFrame>
  );
}
