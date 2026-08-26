"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CYAN = "#53d6f2";
const VIOLET = "#b48cf2";
const TEAL = "#5eead4";
const MUTED = "#8b93b8";
const TRACK = "rgba(139,147,184,0.14)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const SPRING_SEGS = 14;
const SPRING_AMP = 9;
const MASS_R = 11;

function drawSpring(
  ctx: CanvasRenderingContext2D,
  xa: number,
  xb: number,
  y: number
): void {
  ctx.beginPath();
  ctx.moveTo(xa, y);
  for (let i = 1; i < SPRING_SEGS; i += 1) {
    const fx = xa + ((xb - xa) * i) / SPRING_SEGS;
    ctx.lineTo(fx, y + (i % 2 === 1 ? SPRING_AMP : -SPRING_AMP));
  }
  ctx.lineTo(xb, y);
  ctx.stroke();
}

function ghostRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  ctx.beginPath();
  ctx.arc(x, y, MASS_R, 0, Math.PI * 2);
  ctx.stroke();
}

const pctCache = new Map<number, string>();

function pctLabel(frac: number): string {
  const key = frac <= 0 ? 0 : frac >= 1 ? 100 : Math.round(frac * 100);
  let s = pctCache.get(key);
  if (s === undefined) {
    s = `${key}%`;
    pctCache.set(key, s);
  }
  return s;
}

const ampCache = new Map<number, string>();

function ampLabel(v: number): string {
  let s = ampCache.get(v);
  if (s === undefined) {
    s = fmt(Math.abs(v), 2);
    ampCache.set(v, s);
  }
  return s;
}

export default function CoupledModesLab() {
  const [
    { pull1, pull2, k, ts, ghosts },
    updateParams,
  ] = useSimParams<{
    pull1: number;
    pull2: number;
    k: number;
    ts: number;
    ghosts: boolean;
  }>({
    pull1: 1,
    pull2: 0,
    k: 6,
    ts: 1,
    ghosts: true,
  });
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);

  const simTRef = useRef(0);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const release = (): void => {
    simTRef.current = 0;
  };

  const wPlus = Math.sqrt(k / 1);
  const wMinus = Math.sqrt((3 * k) / 1);
  const tBeat = 2 * Math.PI / (wMinus - wPlus);

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    if (playing) simTRef.current += dt * ts;

    const qp = (pull1 + pull2) / 2;
    const qm = (pull1 - pull2) / 2;
    const cP = Math.cos(wPlus * simTRef.current);
    const cM = Math.cos(wMinus * simTRef.current);
    const sP = Math.sin(wPlus * simTRef.current);
    const sM = Math.sin(wMinus * simTRef.current);
    const x1 = qp * cP + qm * cM;
    const x2 = qp * cP - qm * cM;
    const v1 = -qp * wPlus * sP - qm * wMinus * sM;
    const v2 = -qp * wPlus * sP + qm * wMinus * sM;

    const dc = x1 - x2;
    const e1 = 0.5 * v1 * v1 + 0.5 * k * x1 * x1 + 0.25 * k * dc * dc;
    const e2 = 0.5 * v2 * v2 + 0.5 * k * x2 * x2 + 0.25 * k * dc * dc;
    const eTot = e1 + e2;
    const f1 = eTot > 1e-9 ? e1 / eTot : 0.5;

    paintSky(ctx, w, h);

    const rigH = h * 0.55;
    const cy = rigH * 0.52;
    const margin = 26;
    const wxl = margin;
    const wxr = w - margin;
    const gap = Math.min(w * 0.36, 320);
    const eq1 = w * 0.5 - gap / 2;
    const eq2 = w * 0.5 + gap / 2;
    const travel = Math.min(eq1 - wxl - MASS_R - 18, wxr - eq2 - MASS_R - 18);
    const scl = travel / 1.05;
    const mx1 = eq1 + x1 * scl;
    const mx2 = eq2 + x2 * scl;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wxl, cy - 46);
    ctx.lineTo(wxl, cy + 46);
    ctx.moveTo(wxr, cy - 46);
    ctx.lineTo(wxr, cy + 46);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let j = 0; j < 4; j += 1) {
      const yy = cy - 42 + j * 26;
      ctx.moveTo(wxl, yy);
      ctx.lineTo(wxl - 9, yy - 9);
      ctx.moveTo(wxr, yy);
      ctx.lineTo(wxr + 9, yy - 9);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.setLineDash([4, 4]);
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(eq1 + 0.5, cy - 30);
    ctx.lineTo(eq1 + 0.5, cy + 30);
    ctx.moveTo(eq2 + 0.5, cy - 30);
    ctx.lineTo(eq2 + 0.5, cy + 30);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    if (ghosts) {
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 4]);
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = CYAN;
      ghostRing(ctx, eq1 + qp * cP * scl, cy);
      ghostRing(ctx, eq2 + qp * cP * scl, cy);
      ctx.strokeStyle = VIOLET;
      ghostRing(ctx, eq1 + qm * cM * scl, cy);
      ghostRing(ctx, eq2 - qm * cM * scl, cy);
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 1.5;
    drawSpring(ctx, wxl, mx1 - MASS_R, cy);
    drawSpring(ctx, mx1 + MASS_R, mx2 - MASS_R, cy);
    drawSpring(ctx, mx2 + MASS_R, wxr, cy);

    glowDot(ctx, mx1, cy, MASS_R, CYAN);
    glowDot(ctx, mx2, cy, MASS_R, VIOLET);

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("m₁", mx1, cy + MASS_R + 6);
    ctx.fillText("m₂", mx2, cy + MASS_R + 6);

    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(16, Math.round(rigH) + 0.5);
    ctx.lineTo(w - 16, Math.round(rigH) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const loT = rigH;
    const loH = h - rigH;
    const bxL = 64;
    const bxR = w - 96;
    const trackW = bxR - bxL;
    const barH = 9;
    const rowStep = loH * 0.21;

    ctx.textBaseline = "middle";

    let y = loT + loH * 0.12;
    let midY = y + barH / 2 + 0.5;

    ctx.fillStyle = TRACK;
    ctx.fillRect(bxL, y, trackW, barH);
    ctx.fillStyle = CYAN;
    ctx.fillRect(bxL, y, f1 * trackW, barH);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("E₁", bxL - 10, midY);
    ctx.fillStyle = CYAN;
    ctx.textAlign = "left";
    ctx.fillText(pctLabel(f1), bxR + 10, midY);

    y += rowStep;
    midY = y + barH / 2 + 0.5;
    ctx.fillStyle = TRACK;
    ctx.fillRect(bxL, y, trackW, barH);
    ctx.fillStyle = VIOLET;
    ctx.fillRect(bxL, y, (1 - f1) * trackW, barH);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("E₂", bxL - 10, midY);
    ctx.fillStyle = VIOLET;
    ctx.textAlign = "left";
    ctx.fillText(pctLabel(1 - f1), bxR + 10, midY);

    const aqP = qp < 0 ? -qp : qp;
    const aqM = qm < 0 ? -qm : qm;

    y += rowStep;
    midY = y + barH / 2 + 0.5;
    ctx.fillStyle = TRACK;
    ctx.fillRect(bxL, y, trackW, barH);
    ctx.fillStyle = TEAL;
    ctx.fillRect(bxL, y, aqP * trackW, barH);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("|q₊|", bxL - 10, midY);
    ctx.fillStyle = TEAL;
    ctx.textAlign = "left";
    ctx.fillText(ampLabel(qp), bxR + 10, midY);

    y += rowStep;
    midY = y + barH / 2 + 0.5;
    ctx.fillStyle = TRACK;
    ctx.fillRect(bxL, y, trackW, barH);
    ctx.fillStyle = TEAL;
    ctx.fillRect(bxL, y, aqM * trackW, barH);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("|q₋|", bxL - 10, midY);
    ctx.fillStyle = TEAL;
    ctx.textAlign = "left";
    ctx.fillText(ampLabel(qm), bxR + 10, midY);

    ctx.textAlign = "center";
  });

  return (
    <SimFrame
      title="Coupled Oscillators"
      subtitle="Normal modes in closed form · equal masses m = 1 kg"
      controls={
        <>
          <Slider
            label="Pull mass 1"
            value={pull1}
            min={-1}
            max={1}
            step={0.05}
            onChange={(v) => {
              updateParams({ pull1: v });
              release();
            }}
          />
          <Slider
            label="Pull mass 2"
            value={pull2}
            min={-1}
            max={1}
            step={0.05}
            onChange={(v) => {
              updateParams({ pull2: v });
              release();
            }}
          />
          <Slider
            label="Stiffness k"
            value={k}
            min={1}
            max={20}
            step={0.5}
            unit="N/m"
            onChange={(v) => {
              updateParams({ k: v });
              release();
            }}
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
            label="Mode ghosts"
            checked={ghosts}
            onChange={(v) => updateParams({ ghosts: v })}
          />
          <ActionButton onClick={release}>Release</ActionButton>
          {reduced ? (
            <ActionButton tone="ghost" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </ActionButton>
          ) : null}
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`x_{1,2}(t) = q_{+}\cos(\omega_{+}t) \pm q_{-}\cos(\omega_{-}t)`}
            className="text-sm"
          />
          <span className="font-mono text-xs text-muted">{`ω₊=${fmt(wPlus, 2)} rad/s · ω₋=${fmt(wMinus, 2)} rad/s · T_beat=${fmt(tBeat, 2)} s`}</span>
          <span className="text-xs text-muted">
            Every frame is evaluated in closed form — no integrator runs.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Coupled oscillators: two glowing masses between hatched walls joined by three zigzag springs, displaced horizontally above live energy bars and static mode-amplitude bars"
      />
    </SimFrame>
  );
}
