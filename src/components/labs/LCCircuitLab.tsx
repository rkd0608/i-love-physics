"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const TEAL = "#14b8a6";
const VIOLET = "#b48cf2";
const CYAN = "#53d6f2";
const FLOW = "#eaf2ff";
const MUTED = "#8b93b8";
const TRACK = "rgba(139,147,184,0.14)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const MARKERS = 12;
const MARKER_AMP = 44;
const PLATE_GAP = 26;
const PLATE_H = 34;
const COIL_SEGS = 12;
const COIL_WIDTH = 96;
const COIL_AMP = 12;
const BAR_H = 9;
const SCOPE_WINDOW_S = 24;
const STAT_INTERVAL = 0.25;

const GLYPH_FONTS: string[] = [];
for (let k = 0; k <= 20; k += 1) {
  GLYPH_FONTS.push(
    `${(8 + k * 0.55).toFixed(1)}px ui-monospace, SFMono-Regular, Menlo, monospace`
  );
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

const PT = { x: 0, y: 0, tx: 0, ty: 0 };

function perimeterPoint(
  s: number,
  lx: number,
  ty: number,
  rx: number,
  by: number
): void {
  const wSeg = rx - lx;
  const hSeg = by - ty;
  const per = 2 * (wSeg + hSeg);
  let u = s % per;
  if (u < 0) u += per;
  if (u < wSeg) {
    PT.x = lx + u;
    PT.y = ty;
    PT.tx = 1;
    PT.ty = 0;
  } else if (u < wSeg + hSeg) {
    PT.x = rx;
    PT.y = ty + (u - wSeg);
    PT.tx = 0;
    PT.ty = 1;
  } else if (u < 2 * wSeg + hSeg) {
    PT.x = rx - (u - wSeg - hSeg);
    PT.y = by;
    PT.tx = -1;
    PT.ty = 0;
  } else {
    PT.x = lx;
    PT.y = by - (u - 2 * wSeg - hSeg);
    PT.tx = 0;
    PT.ty = -1;
  }
}

function drawCircuit(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ty: number,
  rx: number,
  by: number,
  dim: number,
  qN: number,
  sinN: number,
  phase: number,
  wire: string,
  charge: string,
  flow: string,
  glow: string,
  tag: string
): void {
  const aq = qN < 0 ? -qN : qN;
  const ai = sinN < 0 ? -sinN : sinN;
  const cx = (lx + rx) / 2;
  const bxc = (lx + rx) / 2;
  const plL = cx - PLATE_GAP / 2;
  const plR = cx + PLATE_GAP / 2;
  const coilL = bxc - COIL_WIDTH / 2;
  const coilR = bxc + COIL_WIDTH / 2;

  ctx.strokeStyle = wire;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(lx, ty);
  ctx.lineTo(plL, ty);
  ctx.moveTo(plR, ty);
  ctx.lineTo(rx, ty);
  ctx.lineTo(rx, by);
  ctx.lineTo(coilR, by);
  for (let i = 1; i < COIL_SEGS; i += 1) {
    const fx = coilR - (COIL_WIDTH * i) / COIL_SEGS;
    ctx.lineTo(fx, by + (i % 2 === 1 ? COIL_AMP : -COIL_AMP));
  }
  ctx.lineTo(coilL, by);
  ctx.lineTo(lx, by);
  ctx.lineTo(lx, ty);
  ctx.stroke();

  ctx.fillStyle = wire;
  ctx.globalAlpha = 0.8 * dim;
  ctx.fillRect(lx - 2, ty - 2, 4, 4);
  ctx.fillRect(rx - 2, ty - 2, 4, 4);
  ctx.fillRect(rx - 2, by - 2, 4, 4);
  ctx.fillRect(lx - 2, by - 2, 4, 4);
  ctx.globalAlpha = dim;

  if (aq > 0.04) {
    ctx.save();
    ctx.shadowColor = charge;
    ctx.shadowBlur = 12 * aq * aq;
    ctx.strokeStyle = charge;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(plL, ty - PLATE_H / 2);
    ctx.lineTo(plL, ty + PLATE_H / 2);
    ctx.moveTo(plR, ty - PLATE_H / 2);
    ctx.lineTo(plR, ty + PLATE_H / 2);
    ctx.stroke();
    ctx.restore();

    const nTicks = Math.round(aq * 5);
    if (nTicks > 0) {
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1;
      ctx.globalAlpha = (0.2 + 0.6 * aq) * dim;
      ctx.beginPath();
      for (let j = 0; j < nTicks; j += 1) {
        const yy = ty - 13 + ((j + 1) * 26) / (nTicks + 1);
        ctx.moveTo(plL + 4, yy);
        ctx.lineTo(plR - 4, yy);
      }
      ctx.stroke();
      ctx.globalAlpha = dim;
    }

    const idx = Math.min(20, Math.round(aq * 20));
    ctx.font = GLYPH_FONTS[idx];
    ctx.fillStyle = charge;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.globalAlpha = (0.3 + 0.7 * aq) * dim;
    ctx.fillText("+", plL - 14, ty);
    ctx.fillText("−", plR + 14, ty);
    ctx.globalAlpha = dim;
  }

  if (ai > 0.01) {
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 26 * ai * ai;
    ctx.strokeStyle = glow;
    ctx.globalAlpha = (0.25 + 0.75 * ai * ai) * dim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(coilR, by);
    for (let i = 1; i < COIL_SEGS; i += 1) {
      const fx = coilR - (COIL_WIDTH * i) / COIL_SEGS;
      ctx.lineTo(fx, by + (i % 2 === 1 ? COIL_AMP : -COIL_AMP));
    }
    ctx.lineTo(coilL, by);
    ctx.stroke();
    ctx.restore();
  }

  ctx.font = MONO_SMALL;
  ctx.fillStyle = MUTED;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.9 * dim;
  ctx.fillText(tag, lx + 10, ty - 12 > 8 ? ty - 12 : ty + 12);
  ctx.fillText("L", coilL - 14, by);
  ctx.globalAlpha = 1;

  const wSeg = rx - lx;
  const hSeg = by - ty;
  const per = 2 * (wSeg + hSeg);
  const dir = sinN <= 0 ? 1 : -1;
  const len = 4 + 9 * ai;
  for (let k = 0; k < MARKERS; k += 1) {
    const s = (k * per) / MARKERS + phase;
    perimeterPoint(s, lx, ty, rx, by);
    const ux = PT.tx * dir;
    const uy = PT.ty * dir;
    const arrA = (0.22 + 0.68 * ai) * dim;
    ctx.globalAlpha = arrA * 0.35;
    ctx.fillStyle = flow;
    ctx.beginPath();
    ctx.arc(PT.x, PT.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = arrA;
    ctx.strokeStyle = flow;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(PT.x - ux * len, PT.y - uy * len);
    ctx.lineTo(PT.x + ux * len, PT.y + uy * len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export default function LCCircuitLab() {
  const [
    { c, l, ts, twin },
    updateParams,
  ] = useSimParams<{ c: number; l: number; ts: number; twin: boolean }>({
    c: 1,
    l: 1,
    ts: 1,
    twin: false,
  });
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [splitE, setSplitE] = useState(0.5);

  const simTRef = useRef(0);
  const statClock = useRef(0);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const recharge = (): void => {
    simTRef.current = 0;
  };

  const w1 = 1 / Math.sqrt(l * c);
  const w2 = 1 / Math.sqrt(l * c * 1.05);

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    if (playing) simTRef.current += dt * ts;
    const T = simTRef.current;

    const q1 = Math.cos(w1 * T);
    const s1 = Math.sin(w1 * T);
    const i1 = -w1 * s1;
    const q2 = Math.cos(w2 * T);
    const s2 = Math.sin(w2 * T);
    const ue = (q1 * q1) / (2 * c);
    const ub = 0.5 * l * i1 * i1;
    const etot = ue + ub;
    const fe = etot > 1e-12 ? ue / etot : 0.5;

    if (playing) {
      statClock.current += dt;
      if (statClock.current >= STAT_INTERVAL) {
        statClock.current = 0;
        setSplitE(fe);
      }
    }

    paintSky(ctx, w, h);

    const sepY = h - 92;
    const scopeTop = sepY + 10;
    const scopeBot = h - 10;
    const midY = (scopeTop + scopeBot) / 2;
    const halfH = (scopeBot - scopeTop) * 0.41;
    const lx = 54;
    const ty = 44;
    const rx = w - 186;
    const by = sepY - 20;

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(16, Math.round(sepY) + 0.5);
    ctx.lineTo(w - 16, Math.round(sepY) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (twin) {
      drawCircuit(
        ctx,
        lx - 16,
        ty - 16,
        rx - 16,
        by - 16,
        0.4,
        q2,
        s2,
        MARKER_AMP * Math.cos(w2 * T),
        VIOLET,
        VIOLET,
        VIOLET,
        VIOLET,
        "C×1.05"
      );
    }

    drawCircuit(
      ctx,
      lx,
      ty,
      rx,
      by,
      1,
      q1,
      s1,
      MARKER_AMP * Math.cos(w1 * T),
      MUTED,
      TEAL,
      FLOW,
      VIOLET,
      "C"
    );

    const barLx = w - 146;
    const trackW = 86;
    const r1 = Math.round(h * 0.3);
    const r2 = r1 + 54;

    ctx.textBaseline = "middle";

    ctx.fillStyle = TRACK;
    ctx.fillRect(barLx, r1, trackW, BAR_H);
    ctx.fillStyle = TEAL;
    ctx.fillRect(barLx, r1, fe * trackW, BAR_H);
    ctx.fillStyle = MUTED;
    ctx.font = MONO_SMALL;
    ctx.textAlign = "right";
    ctx.fillText("U_E", barLx - 10, r1 + BAR_H / 2 + 0.5);
    ctx.fillStyle = TEAL;
    ctx.textAlign = "left";
    ctx.fillText(pctLabel(fe), barLx + trackW + 8, r1 + BAR_H / 2 + 0.5);

    ctx.fillStyle = TRACK;
    ctx.fillRect(barLx, r2, trackW, BAR_H);
    ctx.fillStyle = VIOLET;
    ctx.fillRect(barLx, r2, (1 - fe) * trackW, BAR_H);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("U_B", barLx - 10, r2 + BAR_H / 2 + 0.5);
    ctx.fillStyle = VIOLET;
    ctx.textAlign = "left";
    ctx.fillText(pctLabel(1 - fe), barLx + trackW + 8, r2 + BAR_H / 2 + 0.5);

    const sx0 = 18;
    const sx1 = w - 18;
    const pps = (sx1 - sx0) / SCOPE_WINDOW_S;

    ctx.strokeStyle = MUTED;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx0, Math.round(midY) + 0.5);
    ctx.lineTo(sx1, Math.round(midY) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (twin) {
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = VIOLET;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = sx1; px >= sx0; px -= 2) {
        const tt = T - (sx1 - px) / pps;
        if (tt < 0) break;
        const py = midY - Math.cos(w2 * tt) * halfH;
        if (px === sx1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let px = sx1; px >= sx0; px -= 2) {
      const tt = T - (sx1 - px) / pps;
      if (tt < 0) break;
      const py = midY - Math.cos(w1 * tt) * halfH;
      if (px === sx1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(sx1, midY - q1 * halfH, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = MONO_SMALL;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = TEAL;
    ctx.fillText("q₁", sx0 + 6, sepY + 6);
    if (twin) {
      ctx.fillStyle = VIOLET;
      ctx.fillText("q₂", sx0 + 28, sepY + 6);
    }
  });

  return (
    <SimFrame
      title="LC Circuit"
      subtitle="Closed-form charge sloshing · normalized Q₀ = 1"
      controls={
        <>
          <Slider
            label="Capacitance C"
            value={c}
            min={0.2}
            max={2}
            step={0.05}
            unit="F"
            onChange={(v) => {
              updateParams({ c: v });
              recharge();
            }}
          />
          <Slider
            label="Inductance L"
            value={l}
            min={0.2}
            max={2}
            step={0.05}
            unit="H"
            onChange={(v) => {
              updateParams({ l: v });
              recharge();
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
            label="Detuned twin"
            checked={twin}
            onChange={(v) => updateParams({ twin: v })}
          />
          <ActionButton onClick={recharge}>Recharge</ActionButton>
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
            tex={String.raw`\omega_0 = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{(${fmt(
              l,
              2
            )}\,\text{H})(${fmt(c, 2)}\,\text{F})}} \approx ${fmt(
              w1,
              3
            )}\,\text{rad/s}`}
            className="text-sm"
          />
          <span className="font-mono text-xs text-muted">{`f₀=${fmt(
            w1 / (2 * Math.PI),
            4
          )} Hz · T=${fmt((2 * Math.PI) / w1, 2)} s`}</span>
          <span className="font-mono text-xs text-muted">
            <span className="text-accent">{`U_E ${pctLabel(splitE)} / U_B ${pctLabel(
              1 - splitE
            )}`}</span>
          </span>
          <span className="text-xs text-muted">
            Every frame evaluates the closed forms — no integrator runs.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="LC circuit schematic: capacitor with charge glyphs and field ticks on the top wire, glowing coil on the bottom wire, current arrows circulating around the loop, electric and magnetic energy bars trading share, and a charge-versus-time scope strip below with an optional detuned twin circuit overlaid"
      />
    </SimFrame>
  );
}
