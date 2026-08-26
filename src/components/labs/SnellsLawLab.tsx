"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { paintSky, glowDot, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const ACCENT = "#7dd3fc";
const AMBER = "#ffd27a";
const INK = "#e6ebff";
const MUTED = "#8b93b8";
const FAINT = "rgba(139,147,184,0.45)";
const GHOST_LINE = "rgba(139,147,184,0.28)";
const N1_TINT = "rgba(125,211,252,0.05)";
const N2_TINT = "rgba(126,240,176,0.06)";
const INTERFACE_LINE = "rgba(230,235,255,0.32)";
const AMBER_SOFT = "rgba(255,210,122,0.10)";
const AMBER_EDGE = "rgba(255,210,122,0.85)";
const MONO_LABEL = "600 12px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_BADGE = "700 11px ui-monospace, SFMono-Regular, Menlo, monospace";

const SWEEP_S = 2.2;
const HOLD_S = 1.0;
const BACK_S = 1.4;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function smooth(u: number): number {
  const x = clamp(u, 0, 1);
  return x * x * (3 - 2 * x);
}

function thetaCdeg(a: number, b: number): number {
  return a > b ? (Math.asin(b / a) * 180) / Math.PI : NaN;
}

export default function SnellsLawLab() {
  const [{ n1, n2, th1, norm }, updateParams] = useSimParams<{
    n1: number;
    n2: number;
    th1: number;
    norm: boolean;
  }>({ n1: 1.33, n2: 1.5, th1: 35, norm: true });

  const n1Ref = useRef(n1);
  const n2Ref = useRef(n2);
  const th1Ref = useRef(th1);
  const normRef = useRef(norm);

  useEffect(() => {
    n1Ref.current = n1;
    n2Ref.current = n2;
    th1Ref.current = th1;
    normRef.current = norm;
  });

  const demoRef = useRef({ active: false, t: 0, from: 35, q: -1 });
  const dragRef = useRef({ active: false, id: -1 });

  const cancelDemo = (): void => {
    demoRef.current.active = false;
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const a = n1Ref.current;
    const b = n2Ref.current;

    const dm = demoRef.current;
    if (dm.active) {
      dm.t += dt;
      const tc = thetaCdeg(a, b);
      let target = dm.from;
      if (!Number.isFinite(tc)) {
        dm.active = false;
      } else {
        const total = SWEEP_S + HOLD_S + BACK_S;
        if (dm.t < SWEEP_S) target = dm.from + (tc - dm.from) * smooth(dm.t / SWEEP_S);
        else if (dm.t < SWEEP_S + HOLD_S) target = tc;
        else if (dm.t < total)
          target = tc + (dm.from - tc) * smooth((dm.t - SWEEP_S - HOLD_S) / BACK_S);
        else {
          dm.active = false;
          target = dm.from;
        }
      }
      if (dm.active) {
        const q = Math.round(clamp(target, 0, 89));
        if (q !== dm.q) {
          dm.q = q;
          updateParams({ th1: q });
        }
      }
    }

    const cx = w * 0.5;
    const cy = h * 0.5;
    const R = Math.min(w, h) * 0.38;

    const th = (th1Ref.current * Math.PI) / 180;
    const s1 = Math.sin(th);
    const c1 = Math.cos(th);
    const ratio = a / b;
    const sin2 = ratio * s1;
    const tir = sin2 > 1;
    let cos2 = 0;
    if (!tir) cos2 = Math.sqrt(1 - sin2 * sin2);
    let refl = 1;
    if (!tir) {
      const rs = (a * c1 - b * cos2) / (a * c1 + b * cos2);
      refl = rs * rs;
    }

    paintSky(ctx, w, h);
    ctx.fillStyle = N1_TINT;
    ctx.fillRect(0, 0, w, cy);
    ctx.fillStyle = N2_TINT;
    ctx.fillRect(0, cy, w, h - cy);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = INTERFACE_LINE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = GHOST_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (normRef.current) {
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 1.08);
      ctx.lineTo(cx, cy + R * 1.08);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const tcd = thetaCdeg(a, b);
    if (Number.isFinite(tcd)) {
      const phc = (tcd * Math.PI) / 180;
      const ux = -Math.sin(phc);
      const uy = -Math.cos(phc);
      ctx.strokeStyle = AMBER;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + ux * (R - 7), cy + uy * (R - 7));
      ctx.lineTo(cx + ux * (R + 7), cy + uy * (R + 7));
      ctx.stroke();
      ctx.font = MONO_LABEL;
      ctx.fillStyle = AMBER;
      ctx.textAlign = "left";
      ctx.fillText("θc", cx + ux * (R + 14), cy + uy * (R + 14) + 4);
    }

    const ox = cx - s1 * R;
    const oy = cy - c1 * R;
    const ra = R * 0.42;
    const rb = R * 0.52;
    const phiO = Math.atan2(-c1, -s1);

    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(cx, cy, ra, -Math.PI / 2, phiO, true);
    ctx.stroke();

    const L2 = R * 1.18;
    if (!tir) {
      const phiT = Math.atan2(cos2, sin2);
      ctx.beginPath();
      ctx.arc(cx, cy, rb, Math.PI / 2, phiT, true);
      ctx.stroke();
      const m1 = (-Math.PI / 2 + phiO) / 2;
      const m2 = (Math.PI / 2 + phiT) / 2;
      ctx.font = MONO_LABEL;
      ctx.fillStyle = MUTED;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("θ₁", cx + Math.cos(m1) * (ra + 15), cy + Math.sin(m1) * (ra + 15));
      ctx.fillText("θ₂", cx + Math.cos(m2) * (rb + 15), cy + Math.sin(m2) * (rb + 15));
      ctx.textBaseline = "alphabetic";
      ctx.globalAlpha = Math.max(1 - refl, 0.07);
      drawArrow(ctx, cx, cy, cx + sin2 * L2, cy + cos2 * L2, ACCENT, 2);
      if (refl > 0.02) {
        ctx.globalAlpha = Math.min(refl * 0.9, 0.55);
        drawArrow(ctx, cx, cy, cx + s1 * R * 0.95, cy - c1 * R * 0.95, MUTED, 1.25);
      }
      ctx.globalAlpha = 1;
    } else {
      drawArrow(ctx, cx, cy, cx + s1 * L2, cy - c1 * L2, AMBER, 2.5);
    }

    drawArrow(ctx, ox, oy, cx, cy, INK, 2);
    glowDot(ctx, ox, oy, 5, AMBER);

    ctx.font = MONO_LABEL;
    ctx.textAlign = "left";
    ctx.fillStyle = "#bff1ff";
    ctx.fillText(`n₁ = ${fmt(a, 2)}`, 14, 26);
    ctx.fillStyle = "#ccffe4";
    ctx.fillText(`n₂ = ${fmt(b, 2)}`, 14, h - 14);

    if (tir) {
      const label = "TOTAL INTERNAL REFLECTION";
      ctx.font = MONO_BADGE;
      const tw = ctx.measureText(label).width;
      const bw = tw + 24;
      const bh = 26;
      const bx = w - bw - 16;
      const by = 14;
      ctx.fillStyle = AMBER_SOFT;
      ctx.strokeStyle = AMBER_EDGE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, bx + bw / 2, by + bh / 2 + 0.5);
      ctx.textBaseline = "alphabetic";
    }
  };

  const canvasRef = useSimLoop(draw);

  const localXY = (
    e: ReactPointerEvent<HTMLCanvasElement>,
    rect: DOMRect
  ): [number, number] => [e.clientX - rect.left, e.clientY - rect.top];

  const applyDragAngle = (x: number, y: number, w: number, h: number): void => {
    const cy = h * 0.5;
    if (y >= cy) return;
    const deg = (Math.atan2(Math.abs(x - w * 0.5), Math.max(cy - y, 1)) * 180) / Math.PI;
    cancelDemo();
    updateParams({ th1: clamp(Math.round(deg), 0, 89) });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!e.isPrimary) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current.active = true;
    dragRef.current.id = e.pointerId;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = localXY(e, rect);
    applyDragAngle(pos[0], pos[1], rect.width, rect.height);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = localXY(e, rect);
    const d = dragRef.current;
    if (d.active && e.pointerId === d.id) {
      applyDragAngle(pos[0], pos[1], rect.width, rect.height);
      return;
    }
    const cy = rect.height * 0.5;
    const R = Math.min(rect.width, rect.height) * 0.38;
    const thr = (th1 * Math.PI) / 180;
    const hx = rect.width * 0.5 - Math.sin(thr) * R;
    const hy = cy - Math.cos(thr) * R;
    e.currentTarget.style.cursor =
      pos[1] < cy && Math.hypot(pos[0] - hx, pos[1] - hy) < 30
        ? "grab"
        : pos[1] < cy
          ? "crosshair"
          : "default";
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    const d = dragRef.current;
    if (d.active && e.pointerId === d.id) d.active = false;
  };

  const onPointerCancel = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    const d = dragRef.current;
    if (d.active && e.pointerId === d.id) d.active = false;
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    e.currentTarget.style.cursor = "default";
  };

  const sin2v = (n1 / n2) * Math.sin((th1 * Math.PI) / 180);
  const th2v = (Math.asin(Math.min(sin2v, 1)) * 180) / Math.PI;

  const startDemo = (): void => {
    const tc = thetaCdeg(n1, n2);
    if (!Number.isFinite(tc)) return;
    const target = clamp(Math.round(tc), 0, 89);
    if (prefersReducedMotion()) {
      updateParams({ th1: target });
      return;
    }
    demoRef.current = { active: true, t: 0, from: th1, q: -1 };
  };

  return (
    <SimFrame
      title="Snell’s Law"
      subtitle="Refraction, critical angle, and total internal reflection"
      controls={
        <>
          <Slider
            label="Index n₁"
            value={n1}
            min={1}
            max={2.5}
            step={0.01}
            onChange={(v) => {
              cancelDemo();
              updateParams({ n1: v });
            }}
          />
          <Slider
            label="Index n₂"
            value={n2}
            min={1}
            max={2.5}
            step={0.01}
            onChange={(v) => {
              cancelDemo();
              updateParams({ n2: v });
            }}
          />
          <Slider
            label="Angle θ₁"
            value={th1}
            min={0}
            max={89}
            step={1}
            unit="°"
            onChange={(v) => {
              cancelDemo();
              updateParams({ th1: v });
            }}
          />
          <Toggle
            label="Show normals"
            checked={norm}
            onChange={(v) => updateParams({ norm: v })}
          />
          <span
            title={
              n1 > n2
                ? undefined
                : "Needs n₁ > n₂ — total internal reflection only happens going from dense to rare"
            }
          >
            <ActionButton tone={n1 > n2 ? "accent" : "ghost"} onClick={startDemo}>
              Critical angle demo
            </ActionButton>
          </span>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={`${fmt(n1, 2)}\\,\\sin ${fmt(th1, 0)}^{\\circ} = ${fmt(n2, 2)}\\,\\sin\\theta_2`}
            className="text-sm"
          />
          <p className="font-mono text-xs">
            <span className="text-muted">θ₂ = </span>
            <span className="text-accent">{sin2v > 1 ? "TIR" : `${fmt(th2v, 1)}°`}</span>
          </p>
          {n1 > n2 ? (
            <p className="font-mono text-xs">
              <span className="text-muted">θc = </span>
              <span className="text-accent">{fmt((Math.asin(n2 / n1) * 180) / Math.PI, 1)}°</span>
            </p>
          ) : null}
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Snell’s law simulation: an incident ray from the upper left strikes a horizontal interface between two media, splitting into a refracted ray that bends toward the normal below and a faint reflected ray, with a dashed normal, labeled angle arcs θ₁ and θ₂, and an amber TOTAL INTERNAL REFLECTION badge past the critical angle"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerLeave}
      />
    </SimFrame>
  );
}
