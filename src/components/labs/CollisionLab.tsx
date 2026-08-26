"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { ActionButton, Slider } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { drawArrow, glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const H = 1 / 240;
const TRACK_LEN = 10;
const X1_0 = 3;
const X2_0 = 7;
const FLASH = 0.28;

const CYAN = "#53d6f2";
const AMBER = "#ffd27a";
const RED = "#f87171";
const GREEN = "#4ade80";
const FG = "#e6ebff";
const MUTED = "#8b93b8";
const MUTED_FAINT = "rgba(139,147,184,0.3)";
const RAIL = "rgba(139,147,184,0.55)";
const PANEL_BG = "rgba(11,16,36,0.82)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

type Ledger = {
  pB: number;
  pA: number;
  kB: number;
  kA: number;
  dK: number;
  v1: number;
  v2: number;
};

function halfW(mm: number): number {
  return 0.275 * Math.cbrt(mm);
}

function paren(n: number): string {
  return n < 0 ? `(${fmt(n)})` : fmt(n);
}

function drawGlider(
  ctx: CanvasRenderingContext2D,
  x: number,
  mm: number,
  vv: number,
  color: string,
  label: string,
  scl: number,
  ox: number,
  trackY: number,
  sqW: number,
  sqH: number
): void {
  const cx = ox + x * scl;
  const wmPx = halfW(mm) * 2 * scl * sqW;
  const hmPx = halfW(mm) * 1.32 * scl * sqH;
  const top = trackY - hmPx;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(cx - wmPx / 2, top, wmPx, hmPx, 6);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "rgba(6,10,23,0.55)";
  ctx.font = MONO_LABEL;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, top + hmPx / 2 + 0.5);
  ctx.fillStyle = color;
  ctx.fillText(label, cx, trackY + 22);
  if (Math.abs(vv) >= 0.06) {
    const len = Math.max(-90, Math.min(90, vv * 16));
    drawArrow(ctx, cx, top - 14, cx + len, top - 14, color, 2);
  }
  ctx.textBaseline = "alphabetic";
}

function ledgerRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  value: string,
  ly: number,
  lx: number,
  rx: number,
  valColor?: string
): void {
  ctx.font = MONO_LABEL;
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.fillText(label, lx, ly);
  ctx.textAlign = "right";
  ctx.fillStyle = valColor ?? FG;
  ctx.fillText(value, rx, ly);
}

export default function CollisionLab() {
  const [
    { m1, m2, u1, u2, e },
    updateParams,
  ] = useSimParams<{ m1: number; m2: number; u1: number; u2: number; e: number }>({
    m1: 1,
    m2: 2,
    u1: 3,
    u2: -1,
    e: 1,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seq, setSeq] = useState(0);
  const [ledger, setLedger] = useState<Ledger | null>(null);

  const posRef = useRef({ x1: X1_0, v1: u1, x2: X2_0, v2: u2 });
  const accRef = useRef(0);
  const flashTRef = useRef(0);
  const flashXRef = useRef((X1_0 + X2_0) / 2);
  const ledgerRef = useRef<Ledger | null>(null);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const P = posRef.current;
      P.x1 = X1_0;
      P.x2 = X2_0;
      P.v1 = u1;
      P.v2 = u2;
      accRef.current = 0;
      flashTRef.current = 0;
      ledgerRef.current = null;
      setLedger(null);
    });
    return () => cancelAnimationFrame(id);
  }, [m1, m2, u1, u2, e, seq]);

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const panelX = Math.round(w * 0.665);
    const ox = 20;
    const scl = (panelX - ox - 20) / TRACK_LEN;
    const trackY = Math.round(h * 0.58);

    const hw1 = halfW(m1);
    const hw2 = halfW(m2);
    const P = posRef.current;

    if (!paused) {
      if (flashTRef.current > 0) {
        flashTRef.current = Math.max(0, flashTRef.current - dt);
      }
      accRef.current += dt;
      let guard = 0;
      while (accRef.current >= H && guard < 24) {
        guard++;
        accRef.current -= H;
        P.x1 += P.v1 * H;
        P.x2 += P.v2 * H;
        if (P.x1 - hw1 < 0) {
          P.x1 = hw1;
          P.v1 = Math.abs(P.v1);
        }
        if (P.x1 + hw1 > TRACK_LEN) {
          P.x1 = TRACK_LEN - hw1;
          P.v1 = -Math.abs(P.v1);
        }
        if (P.x2 - hw2 < 0) {
          P.x2 = hw2;
          P.v2 = Math.abs(P.v2);
        }
        if (P.x2 + hw2 > TRACK_LEN) {
          P.x2 = TRACK_LEN - hw2;
          P.v2 = -Math.abs(P.v2);
        }
        const rel = P.v1 - P.v2;
        if (P.x2 - P.x1 <= hw1 + hw2 && rel > 1e-9) {
          const M = m1 + m2;
          const nv1 = ((m1 - e * m2) * P.v1 + (1 + e) * m2 * P.v2) / M;
          const nv2 = ((m2 - e * m1) * P.v2 + (1 + e) * m1 * P.v1) / M;
          const pB = m1 * P.v1 + m2 * P.v2;
          const kB = 0.5 * m1 * P.v1 * P.v1 + 0.5 * m2 * P.v2 * P.v2;
          const pA = m1 * nv1 + m2 * nv2;
          const kA = 0.5 * m1 * nv1 * nv1 + 0.5 * m2 * nv2 * nv2;
          P.x2 = P.x1 + hw1 + hw2;
          if (P.x2 > TRACK_LEN - hw2) {
            P.x2 = TRACK_LEN - hw2;
            P.x1 = P.x2 - hw1 - hw2;
          }
          if (P.x1 < hw1) {
            P.x1 = hw1;
            P.x2 = P.x1 + hw1 + hw2;
          }
          P.v1 = nv1;
          P.v2 = nv2;
          flashTRef.current = FLASH;
          flashXRef.current = P.x1 + hw1;
          const rec: Ledger = { pB, pA, kB, kA, dK: kB - kA, v1: nv1, v2: nv2 };
          ledgerRef.current = rec;
          setLedger(rec);
        }
      }
      if (accRef.current > H) accRef.current = 0;
    }

    const railL = ox;
    const railR = ox + TRACK_LEN * scl;
    ctx.strokeStyle = RAIL;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(railL, trackY);
    ctx.lineTo(railR, trackY);
    ctx.stroke();

    ctx.strokeStyle = MUTED_FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= TRACK_LEN; i++) {
      const tx = ox + i * scl;
      ctx.moveTo(tx, trackY + 4);
      ctx.lineTo(tx, trackY + 9);
    }
    ctx.stroke();

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(railL, trackY - 58);
    ctx.lineTo(railL, trackY + 8);
    ctx.moveTo(railR, trackY - 58);
    ctx.lineTo(railR, trackY + 8);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const yy = trackY - 50 + j * 13;
      ctx.moveTo(railL + 1, yy);
      ctx.lineTo(railL - 7, yy + 9);
      ctx.moveTo(railR - 1, yy);
      ctx.lineTo(railR + 7, yy + 9);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    const squash = flashTRef.current > 0 ? flashTRef.current / FLASH : 0;
    const sqW = 1 + 0.38 * squash;
    const sqH = 1 - 0.22 * squash;

    drawGlider(ctx, P.x1, m1, P.v1, CYAN, "m₁", scl, ox, trackY, sqW, sqH);
    drawGlider(ctx, P.x2, m2, P.v2, AMBER, "m₂", scl, ox, trackY, sqW, sqH);

    if (squash > 0) {
      const fx = ox + flashXRef.current * scl;
      const fy = trackY - 16;
      glowDot(ctx, fx, fy, 4 + 7 * squash, "#ffffff");
      ctx.globalAlpha = squash * 0.9;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx, fy, 12 + 26 * (1 - squash), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = PANEL_BG;
    ctx.fillRect(panelX, 0, w - panelX, h);
    ctx.strokeStyle = MUTED_FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 0.5, 0);
    ctx.lineTo(panelX + 0.5, h);
    ctx.stroke();

    const lx = panelX + 18;
    const rx = w - 18;
    const rec = ledgerRef.current;
    const lead = Math.max(14, Math.min(21, (h - 70) / 9));
    let ry = 34;
    ctx.font = MONO_SMALL;
    ctx.textAlign = "left";
    ctx.fillStyle = MUTED;
    ctx.fillText("COLLISION LEDGER", lx, ry);
    ry += 8 + lead;
    ledgerRow(ctx, "e (restitution)", fmt(e, 2), ry, lx, rx, AMBER);
    ry += lead;
    ledgerRow(ctx, "u_rel (live)", fmt(P.v1 - P.v2), ry, lx, rx);
    ry += lead * 0.7;
    ctx.strokeStyle = MUTED_FAINT;
    ctx.beginPath();
    ctx.moveTo(lx, ry);
    ctx.lineTo(rx, ry);
    ctx.stroke();
    ry += lead * 0.9;
    ledgerRow(ctx, "Σp before", `${fmt(rec ? rec.pB : NaN)} kg·m/s`, ry, lx, rx);
    ry += lead;
    ledgerRow(ctx, "Σp after", `${fmt(rec ? rec.pA : NaN)} kg·m/s`, ry, lx, rx);
    ry += lead;
    if (rec && Math.abs(rec.pB - rec.pA) <= 1e-9 * Math.max(1, Math.abs(rec.pB))) {
      ledgerRow(ctx, "momentum check", "✓ closed", ry, lx, rx, GREEN);
    } else if (rec) {
      ledgerRow(ctx, "momentum check", "✗ drift", ry, lx, rx, RED);
    } else {
      ledgerRow(ctx, "momentum check", "awaiting impact", ry, lx, rx);
    }
    ry += lead * 0.7;
    ctx.beginPath();
    ctx.moveTo(lx, ry);
    ctx.lineTo(rx, ry);
    ctx.stroke();
    ry += lead * 0.9;
    ledgerRow(ctx, "ΣKE before", `${fmt(rec ? rec.kB : NaN)} J`, ry, lx, rx);
    ry += lead;
    ledgerRow(ctx, "ΣKE after", `${fmt(rec ? rec.kA : NaN)} J`, ry, lx, rx);
    ry += lead;
    const lost = rec ? rec.dK : NaN;
    const lostColor = !rec || lost <= 1e-9 ? GREEN : e === 0 ? RED : AMBER;
    ledgerRow(ctx, "ΔKE lost", `${fmt(lost, 3)} J`, ry, lx, rx, lostColor);
  });

  const symTex = "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2";
  const numTex = ledger
    ? `${fmt(m1)}\\cdot${paren(u1)} + ${fmt(m2)}\\cdot${paren(u2)} = ${fmt(m1)}\\cdot${paren(ledger.v1)} + ${fmt(m2)}\\cdot${paren(ledger.v2)}`
    : symTex;

  return (
    <SimFrame
      title="Collision Lab"
      subtitle="Two gliders on an air track: momentum closes every time, energy negotiates"
      controls={
        <>
          <Slider
            label="Mass m₁"
            value={m1}
            min={0.5}
            max={5}
            step={0.1}
            unit="kg"
            onChange={(v) => updateParams({ m1: v })}
          />
          <Slider
            label="Mass m₂"
            value={m2}
            min={0.5}
            max={5}
            step={0.1}
            unit="kg"
            onChange={(v) => updateParams({ m2: v })}
          />
          <Slider
            label="u₁"
            value={u1}
            min={-5}
            max={5}
            step={0.25}
            unit="m/s"
            onChange={(v) => updateParams({ u1: v })}
          />
          <Slider
            label="u₂"
            value={u2}
            min={-5}
            max={5}
            step={0.25}
            unit="m/s"
            onChange={(v) => updateParams({ u2: v })}
          />
          <Slider
            label="Restitution e"
            value={e}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => updateParams({ e: v })}
          />
          {reduced ? (
            <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
              {paused ? "Play" : "Pause"}
            </ActionButton>
          ) : null}
          <ActionButton onClick={() => setSeq((s) => s + 1)}>
            Collide again
          </ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX tex={numTex} className="text-sm" />
          <p className="font-mono text-xs">
            <span className="text-muted">e = </span>
            <span className="text-accent">{fmt(e, 2)}</span>
            <span className="text-muted"> · ΔKE = </span>
            <span
              className="text-accent"
              style={
                ledger && ledger.dK > 1e-9 ? { color: AMBER } : undefined
              }
            >
              {ledger ? fmt(ledger.dK, 3) : "—"}
            </span>
            <span className="text-muted"> J</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Two gliders sliding toward each other on a frictionless air track between hatched elastic walls, with live velocity arrows and a momentum ledger panel showing before-and-after totals that always balance"
      />
    </SimFrame>
  );
}
