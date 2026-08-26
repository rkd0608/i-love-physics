"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const G = 9.81;
const H = 1 / 240;
const MAX_PTS = 4000;
const TAIL_PTS = 30;

const VIOLET = "#b48cf2";
const AMBER = "#ffd27a";
const CYAN = "#53d6f2";
const MUTED = "#8b93b8";
const MUTED_FAINT = "rgba(139,147,184,0.35)";
const MUTED_GHOST = "rgba(139,147,184,0.5)";
const GROUND_LINE = "rgba(139,147,184,0.45)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

type St = { x: number; y: number; vx: number; vy: number };

const K1: St = { x: 0, y: 0, vx: 0, vy: 0 };
const K2: St = { x: 0, y: 0, vx: 0, vy: 0 };
const K3: St = { x: 0, y: 0, vx: 0, vy: 0 };
const K4: St = { x: 0, y: 0, vx: 0, vy: 0 };
const TMP: St = { x: 0, y: 0, vx: 0, vy: 0 };

function deriv(s: St, out: St, k: number): void {
  const sp = Math.hypot(s.vx, s.vy);
  out.x = s.vx;
  out.y = s.vy;
  out.vx = -k * sp * s.vx;
  out.vy = -G - k * sp * s.vy;
}

function rk4(s: St, h: number, k: number): void {
  const hh = h * 0.5;
  deriv(s, K1, k);
  TMP.x = s.x + K1.x * hh;
  TMP.y = s.y + K1.y * hh;
  TMP.vx = s.vx + K1.vx * hh;
  TMP.vy = s.vy + K1.vy * hh;
  deriv(TMP, K2, k);
  TMP.x = s.x + K2.x * hh;
  TMP.y = s.y + K2.y * hh;
  TMP.vx = s.vx + K2.vx * hh;
  TMP.vy = s.vy + K2.vy * hh;
  deriv(TMP, K3, k);
  TMP.x = s.x + K3.x * h;
  TMP.y = s.y + K3.y * h;
  TMP.vx = s.vx + K3.vx * h;
  TMP.vy = s.vy + K3.vy * h;
  deriv(TMP, K4, k);
  const sixth = h / 6;
  s.x += sixth * (K1.x + 2 * (K2.x + K3.x) + K4.x);
  s.y += sixth * (K1.y + 2 * (K2.y + K3.y) + K4.y);
  s.vx += sixth * (K1.vx + 2 * (K2.vx + K3.vx) + K4.vx);
  s.vy += sixth * (K1.vy + 2 * (K2.vy + K3.vy) + K4.vy);
}

const TICKS: string[] = [];
for (let i = 0; i <= 300; i++) TICKS.push(String(i * 10));

function tickLabel(m: number): string {
  return m >= 0 && m % 10 === 0 && m / 10 < TICKS.length ? TICKS[m / 10] : String(m);
}

export default function ProjectileLab() {
  const [
    { v0, ang: angle, k: dragK, ghost },
    updateParams,
  ] = useSimParams<{ v0: number; ang: number; k: number; ghost: boolean }>({
    v0: 42,
    ang: 45,
    k: 0.008,
    ghost: true,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [fireSeq, setFireSeq] = useState(0);
  const [result, setResult] = useState<{ r: number; a: number } | null>(null);

  const v0Ref = useRef(v0);
  const angleRef = useRef(angle);
  const kRef = useRef(dragK);
  const ghostRef = useRef(ghost);
  const pausedRef = useRef(paused);

  useEffect(() => {
    v0Ref.current = v0;
    angleRef.current = angle;
    kRef.current = dragK;
    ghostRef.current = ghost;
    pausedRef.current = paused;
  });

  const stRef = useRef<St>({ x: 0, y: 0, vx: 0, vy: 0 });
  const flyingRef = useRef(false);
  const accRef = useRef(0);
  const apexRef = useRef(0);
  const ptsRef = useRef<Float32Array>(new Float32Array(MAX_PTS * 2));
  const headRef = useRef(0);
  const countRef = useRef(0);
  const flipRef = useRef(false);
  const resultRef = useRef<{ r: number; a: number } | null>(null);
  const impactRef = useRef<{ x: number; y: number } | null>(null);
  const camScaleRef = useRef(0);
  const camOxRef = useRef(0);
  const camGyRef = useRef(0);

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const st = stRef.current;
    const k = kRef.current;
    if (!pausedRef.current && flyingRef.current) {
      accRef.current += dt;
      let guard = 0;
      while (accRef.current >= H && flyingRef.current && guard < 24) {
        guard++;
        accRef.current -= H;
        const px = st.x;
        const py = st.y;
        rk4(st, H, k);
        if (st.y > apexRef.current) apexRef.current = st.y;
        flipRef.current = !flipRef.current;
        const pts = ptsRef.current;
        if (flipRef.current && pts) {
          const i2 = headRef.current * 2;
          pts[i2] = st.x;
          pts[i2 + 1] = st.y;
          headRef.current = (headRef.current + 1) % MAX_PTS;
          if (countRef.current < MAX_PTS) countRef.current++;
        }
        if (st.y <= 0) {
          const f = py <= 0 ? 0 : py / (py - st.y);
          const ix = px + (st.x - px) * f;
          st.x = ix;
          st.y = 0;
          flyingRef.current = false;
          impactRef.current = { x: ix, y: 0 };
          const rec = { r: ix, a: apexRef.current };
          resultRef.current = rec;
          setResult(rec);
          if (pts) {
            const i2 = headRef.current * 2;
            pts[i2] = ix;
            pts[i2 + 1] = 0;
            headRef.current = (headRef.current + 1) % MAX_PTS;
            if (countRef.current < MAX_PTS) countRef.current++;
          }
          break;
        }
      }
      if (accRef.current > H) accRef.current = 0;
    }

    const a = (angleRef.current * Math.PI) / 180;
    const v = v0Ref.current;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);
    const tanA = sinA / cosA;
    const rvac = (v * v * Math.sin(2 * a)) / G;
    const avac = (v * v * sinA * sinA) / (2 * G);
    const rec = resultRef.current;
    const fitW = 1.15 * Math.max(rvac, rec ? rec.r : 0, 1);
    const fitH = 1.3 * Math.max(avac, rec ? rec.a : 0, 1);
    const targetScale = Math.min(w / fitW, h / fitH);
    const targetOx = w * 0.06;
    const targetGy = h * 0.9;
    if (camScaleRef.current <= 0) {
      camScaleRef.current = targetScale;
      camOxRef.current = targetOx;
      camGyRef.current = targetGy;
    } else {
      camScaleRef.current += (targetScale - camScaleRef.current) * 0.08;
      camOxRef.current += (targetOx - camOxRef.current) * 0.08;
      camGyRef.current += (targetGy - camGyRef.current) * 0.08;
    }
    const scl = camScaleRef.current;
    const ox = camOxRef.current;
    const gy = camGyRef.current;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = GROUND_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED_FAINT;
    ctx.textAlign = "center";
    const xMax = (w - ox) / scl;
    for (let i = 1; i * 10 <= xMax; i++) {
      const m = i * 10;
      const tx = ox + m * scl;
      ctx.fillRect(tx - 0.5, gy - 3, 1, 6);
      ctx.fillText(tickLabel(m), tx, gy + 14);
    }

    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = MUTED_FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, gy);
    ctx.lineTo(ox + cosA * 80, gy - sinA * 80);
    ctx.stroke();
    ctx.setLineDash([]);

    if (ghostRef.current && rvac > 0) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = MUTED_GHOST;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const c2 = 2 * v * v * cosA * cosA;
      const N = 72;
      for (let i = 0; i <= N; i++) {
        const xv = (rvac * i) / N;
        const yv = xv * tanA - (G * xv * xv) / c2;
        const gx = ox + xv * scl;
        const gyy = gy - yv * scl;
        if (i === 0) ctx.moveTo(gx, gyy);
        else ctx.lineTo(gx, gyy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const pts = ptsRef.current;
    const n = countRef.current;
    const head = headRef.current;
    if (pts && n > 1) {
      const base = head - n;
      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const idx = (((base + i) % MAX_PTS) + MAX_PTS) % MAX_PTS;
        const tx = ox + pts[idx * 2] * scl;
        const ty = gy - pts[idx * 2 + 1] * scl;
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();
      const m2 = Math.min(TAIL_PTS, n - 1);
      ctx.lineWidth = 2.5;
      for (let j = 0; j < m2; j++) {
        const i0 = n - m2 + j;
        const ia = ((((base + i0) % MAX_PTS) + MAX_PTS) % MAX_PTS) * 2;
        const ib = ((((base + i0 + 1) % MAX_PTS) + MAX_PTS) % MAX_PTS) * 2;
        ctx.globalAlpha = ((j + 1) / m2) * 0.7;
        ctx.beginPath();
        ctx.moveTo(ox + pts[ia] * scl, gy - pts[ia + 1] * scl);
        ctx.lineTo(ox + pts[ib] * scl, gy - pts[ib + 1] * scl);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    const imp = impactRef.current;
    if (imp) {
      const cx = ox + imp.x * scl;
      const cy = gy - imp.y * scl;
      ctx.strokeStyle = MUTED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 5);
      ctx.lineTo(cx + 5, cy + 5);
      ctx.moveTo(cx - 5, cy + 5);
      ctx.lineTo(cx + 5, cy - 5);
      ctx.stroke();
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const rec2 = resultRef.current;
      if (rec2) {
        ctx.fillStyle = AMBER;
        ctx.font = MONO_LABEL;
        ctx.textAlign = "center";
        ctx.fillText(`${fmt(rec2.r, 1)} m`, cx, cy - 16);
      }
    }

    {
      const dx = cosA;
      const dy = -sinA;
      const tx = ox + dx * 18;
      const ty = gy + dy * 18;
      const sw = Math.sin(0.55);
      const cw = Math.cos(0.55);
      ctx.strokeStyle = MUTED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx + (dx * cw - dy * sw) * -12, ty + (dx * sw + dy * cw) * -12);
      ctx.lineTo(tx, ty);
      ctx.lineTo(tx + (dx * cw + dy * sw) * -12, ty + (-dx * sw + dy * cw) * -12);
      ctx.stroke();
    }

    const psx = ox + st.x * scl;
    const psy = gy - st.y * scl;
    if (flyingRef.current) {
      drawArrow(ctx, psx, psy, psx + st.vx * 3, psy - st.vy * 3, CYAN, 2);
    }
    glowDot(ctx, psx, psy, 5, AMBER);
  };

  const canvasRef = useSimLoop(draw);

  const fire = (): void => {
    const a = (angleRef.current * Math.PI) / 180;
    const v = v0Ref.current;
    const st = stRef.current;
    st.x = 0;
    st.y = 0;
    st.vx = v * Math.cos(a);
    st.vy = v * Math.sin(a);
    flyingRef.current = true;
    accRef.current = 0;
    apexRef.current = 0;
    headRef.current = 0;
    countRef.current = 0;
    flipRef.current = false;
    resultRef.current = null;
    impactRef.current = null;
    const pts = ptsRef.current;
    if (pts) {
      pts[0] = 0;
      pts[1] = 0;
      headRef.current = 1;
      countRef.current = 1;
    }
    setResult(null);
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => fire());
    return () => cancelAnimationFrame(id);
  }, [v0, angle, dragK, fireSeq]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const vacR = (v0 * v0 * Math.sin((2 * angle * Math.PI) / 180)) / G;

  return (
    <SimFrame
      title="Projectile Motion"
      subtitle="Quadratic air drag vs. vacuum ghost"
      controls={
        <>
          <Slider
            label="Launch speed"
            value={v0}
            min={10}
            max={80}
            unit="m/s"
            onChange={(v) => updateParams({ v0: v })}
          />
          <Slider
            label="Angle"
            value={angle}
            min={5}
            max={85}
            unit="°"
            onChange={(v) => updateParams({ ang: v })}
          />
          <Slider
            label="Drag coefficient k"
            value={dragK}
            min={0}
            max={0.03}
            step={0.001}
            unit="1/m"
            onChange={(v) => updateParams({ k: v })}
          />
          <Toggle
            label="Vacuum ghost"
            checked={ghost}
            onChange={(v) => updateParams({ ghost: v })}
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
          <ActionButton onClick={() => setFireSeq((s) => s + 1)}>Fire</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={"\\vec{a} = \\vec{g} - k\\left|\\vec{v}\\right|\\vec{v}"}
            className="text-sm"
          />
          <p className="font-mono text-xs">
            <span className="text-muted">Range </span>
            <span className="text-accent">{fmt(result ? result.r : NaN, 1)}</span>
            <span className="text-muted"> m · Apex </span>
            <span className="text-accent">{fmt(result ? result.a : NaN, 1)}</span>
            <span className="text-muted"> m · Vacuum </span>
            <span className="text-accent">{fmt(vacR, 1)}</span>
            <span className="text-muted"> m</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Projectile motion simulation comparing a drag flight with its dashed vacuum parabola, showing an angled launcher, velocity vector, meter ticks along the ground and the impact range marker"
      />
    </SimFrame>
  );
}
