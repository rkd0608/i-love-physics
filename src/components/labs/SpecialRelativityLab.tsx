"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const T0 = 1;
const L_PX = 60;
const MIRROR_HALF = 44;
const ROD_L0 = 110;
const ROD_H = 12;
const PX_SPEED = 100;
const TRAIL_N = 900;
const FLASH_DUR = 0.7;
const TICK_SPACING = 8;
const TICK_X = 118;

const ROSE = "#ff6b6b";
const AMBER = "#ffd27a";
const CYAN = "#53d6f2";
const MUTED = "#8b93b8";
const MUTED_GHOST = "rgba(139,147,184,0.5)";
const TRAIL_STROKE = "rgba(255,107,107,0.45)";

const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

function gammaOf(b: number): number {
  return 1 / Math.sqrt(1 - b * b);
}

function triangle(phase: number): number {
  return 1 - Math.abs(2 * phase - 1);
}

function drawMirror(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  dir: number
): void {
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - MIRROR_HALF, y);
  ctx.lineTo(cx + MIRROR_HALF, y);
  ctx.stroke();
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let j = 0; j < 7; j += 1) {
    const hx = cx - MIRROR_HALF + 5 + (j * (MIRROR_HALF * 2 - 10)) / 6;
    ctx.moveTo(hx, y);
    ctx.lineTo(hx - 7, y + dir * 8);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

type Counts = { l: number; r: number };

export default function SpecialRelativityLab() {
  const [
    { beta, tscale, contraction, ticks: showTicks },
    updateParams,
  ] = useSimParams<{ beta: number; tscale: number; contraction: boolean; ticks: boolean }>({
    beta: 0.6,
    tscale: 1,
    contraction: true,
    ticks: true,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [counts, setCounts] = useState<Counts>({ l: 0, r: 0 });

  const betaRef = useRef(beta);
  const tscaleRef = useRef(tscale);
  const ticksRef = useRef(showTicks);
  const pausedRef = useRef(paused);

  useEffect(() => {
    betaRef.current = beta;
    tscaleRef.current = tscale;
    ticksRef.current = showTicks;
    pausedRef.current = paused;
  });

  const tRef = useRef(0);
  const wrapKRef = useRef(0);
  const trailRef = useRef<Float32Array>(new Float32Array(TRAIL_N * 2));
  const headRef = useRef(0);
  const countRef = useRef(0);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const t = tRef.current;
      const l = Math.floor(t / T0);
      const r = Math.floor(t / (gammaOf(betaRef.current) * T0));
      setCounts((prev) => (prev.l === l && prev.r === r ? prev : { l, r }));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  const syncFlashes = (): void => {
    tRef.current = 0;
    wrapKRef.current = 0;
    headRef.current = 0;
    countRef.current = 0;
    setCounts({ l: 0, r: 0 });
  };

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    if (!pausedRef.current) tRef.current += dt * tscaleRef.current;
    const t = tRef.current;
    const b = betaRef.current;
    const g = gammaOf(b);
    const bigT = g * T0;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    const cy = h * 0.4;
    const leftCx = w * 0.26;
    const laneR = w - 70;
    const x0r = w * 0.52 + 30;
    const span = laneR - x0r;

    let cx = x0r;
    if (span > 0) {
      const total = b * t * PX_SPEED;
      const k = Math.floor(total / span);
      if (k !== wrapKRef.current) {
        wrapKRef.current = k;
        headRef.current = 0;
        countRef.current = 0;
      }
      cx = x0r + total - k * span;
    }

    ctx.setLineDash([4, 6]);
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(x0r - 30) + 0.5, 16);
    ctx.lineTo(Math.round(x0r - 30) + 0.5, h - 76);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const pL = (t / T0) % 1;
    const pyL = cy + L_PX / 2 - L_PX * triangle(pL);

    drawMirror(ctx, leftCx, cy - L_PX / 2, -1);
    drawMirror(ctx, leftCx, cy + L_PX / 2, 1);
    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.fillText("β = 0", leftCx, cy + 52);
    glowDot(ctx, leftCx, pyL, 4.5, AMBER);

    if (countRef.current > 1) {
      const buf = trailRef.current;
      const n = countRef.current;
      const head = headRef.current;
      const base = head - n;
      ctx.strokeStyle = TRAIL_STROKE;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < n; i += 1) {
        const idx = (((base + i) % TRAIL_N) + TRAIL_N) % TRAIL_N;
        const tx = x0r + buf[idx * 2];
        const ty = cy + L_PX / 2 - buf[idx * 2 + 1];
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();
    }

    const rodY = cy - 64;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = MUTED_GHOST;
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - ROD_L0 / 2, rodY, ROD_L0, ROD_H);
    ctx.setLineDash([]);
    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.fillText("L₀", cx - ROD_L0 / 2, rodY - 5);
    if (contraction) {
      const lw = ROD_L0 / g;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = ROSE;
      ctx.fillRect(cx - lw / 2, rodY, lw, ROD_H);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ROSE;
      ctx.fillText("L′", cx + lw / 2 + 4, rodY - 5);
      ctx.fillStyle = MUTED;
      ctx.textAlign = "right";
      ctx.fillText(`γ = ${fmt(g, 2)}`, cx - ROD_L0 / 2 - 6, rodY + ROD_H);
      ctx.textAlign = "left";
    }

    const pR = (t / bigT) % 1;
    const offR = L_PX * triangle(pR);
    const pyR = cy + L_PX / 2 - offR;

    if (!pausedRef.current && countRef.current < TRAIL_N) {
      const buf = trailRef.current;
      buf[headRef.current * 2] = cx - x0r;
      buf[headRef.current * 2 + 1] = offR;
      headRef.current = (headRef.current + 1) % TRAIL_N;
      countRef.current += 1;
    }

    drawMirror(ctx, cx, cy - L_PX / 2, -1);
    drawMirror(ctx, cx, cy + L_PX / 2, 1);
    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.fillText(`β = ${fmt(b, 2)}`, cx, cy + 52);
    glowDot(ctx, cx, pyR, 4.5, AMBER);

    if (t < FLASH_DUR) {
      const age = t / FLASH_DUR;
      const fy = cy + L_PX / 2;
      ctx.globalAlpha = (1 - age) * 0.9;
      ctx.lineWidth = 2;
      ctx.strokeStyle = CYAN;
      ctx.beginPath();
      ctx.arc(leftCx, fy, 8 + age * 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = ROSE;
      ctx.beginPath();
      ctx.arc(cx, fy, 8 + age * 90, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (ticksRef.current) {
      const maxVisible = Math.max(1, Math.floor((w - TICK_X - 14) / TICK_SPACING));
      const nL = Math.floor(t / T0);
      const nR = Math.floor(t / bigT);
      const rowY = h - 58;
      ctx.font = MONO_SMALL;
      ctx.textAlign = "left";
      ctx.fillStyle = MUTED;
      ctx.fillText("Rest clock", 24, rowY + 3);
      ctx.fillText("Moving clock", 24, rowY + 31);
      const startL = Math.max(0, nL - maxVisible);
      ctx.fillStyle = CYAN;
      for (let i = startL; i < nL; i += 1) {
        ctx.fillRect(TICK_X + (i - startL) * TICK_SPACING, rowY - 4, 2, 8);
      }
      const startR = Math.max(0, nR - maxVisible);
      ctx.fillStyle = ROSE;
      for (let i = startR; i < nR; i += 1) {
        ctx.fillRect(TICK_X + (i - startR) * TICK_SPACING, rowY + 24, 2, 8);
      }
    }
  });

  const gamma = gammaOf(beta);
  const periodT = gamma * T0;
  const contracted = ROD_L0 / gamma;

  return (
    <SimFrame
      title="Light Clock Pair"
      subtitle="One clock at rest, one in motion — same light, unequal aging"
      controls={
        <>
          <Slider
            label="Speed β"
            value={beta}
            min={0}
            max={0.99}
            step={0.01}
            onChange={(v) => updateParams({ beta: v })}
          />
          <Slider
            label="Time scale"
            value={tscale}
            min={0}
            max={3}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ tscale: v })}
          />
          <Toggle
            label="Length contraction"
            checked={contraction}
            onChange={(v) => updateParams({ contraction: v })}
          />
          <Toggle
            label="Bounce ticks"
            checked={showTicks}
            onChange={(v) => updateParams({ ticks: v })}
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
          <ActionButton onClick={syncFlashes}>Sync flashes</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={"\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}}"}
            className="text-sm"
          />
          <p className="font-mono text-xs">
            <span className="text-muted">γ </span>
            <span className="text-accent">{fmt(gamma, 3)}</span>
            <span className="text-muted"> · T=γT₀ </span>
            <span className="text-accent">{fmt(periodT, 3)}</span>
            <span className="text-muted"> s · L′=L₀/γ </span>
            <span className="text-accent">{fmt(contracted, 1)}</span>
            <span className="text-muted"> px · ticks </span>
            <span className="text-accent">{counts.l}</span>
            <span className="text-muted"> rest vs </span>
            <span className="text-accent">{counts.r}</span>
            <span className="text-muted"> moving</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Two light clocks side by side: a stationary clock whose photon bounces between mirrors once per second, and a moving clock whose photon traces wider diagonal zigzags and completes fewer bounces, with a dashed rest-length rod ghost beside its contracted solid rod above, and rows of bounce tick marks underneath counting how much each clock has aged"
      />
    </SimFrame>
  );
}
