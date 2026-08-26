"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { drawArrow, glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const PXU = 100;
const GRAV = 9.81;
const DT = 1 / 240;
const SAMPLE_EVERY = 4;
const NB = 1024;
const PX_PER_SAMPLE = 2;
const SMOOTH = 1 - Math.exp(-25 * DT);
const TAU = Math.PI * 2;
const MAG_W = 26;
const MAG_H = 56;

const FUCHSIA = "#c026d3";
const VIOLET = "#a78bfa";
const AMBER = "#ffd27a";
const COPPER = "#e8a15c";
const CYAN = "#53d6f2";
const POLE_N = "#ff6b6b";
const POLE_S = "#53d6f2";
const MUTED = "#8b93b8";
const FAINT = "rgba(139,147,184,0.35)";
const TRACE_DIM = "rgba(139,147,184,0.18)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

function totalFlux(z: number, n: number, r: number): number {
  return (n * r * r) / (2 * Math.pow(z * z + r * r, 1.5));
}

type SimState = {
  z: number;
  v: number;
  prevPhi: number;
  emfTarget: number;
  emfDisp: number;
  flying: boolean;
  acc: number;
  sub: number;
  head: number;
  count: number;
  absN: number;
  peakVal: number;
  peakAbs: number;
  scaleEps: number;
  scalePhi: number;
  kPix: number;
  dispAcc: number;
  lastPhi: number;
  lastEmf: number;
  lastPeak: number;
  eps: Float32Array;
  flux: Float32Array;
};

const peakLabels = new Map<number, string>();

function peakLabel(p: number): string {
  const key = Math.round(p * 10);
  let s = peakLabels.get(key);
  if (s === undefined) {
    s = fmt(key / 10, 1);
    peakLabels.set(key, s);
  }
  return s;
}

function arcArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  a1: number,
  a2: number,
  color: string,
  lw: number
): void {
  const ccw = a2 < a1;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, a1, a2, ccw);
  ctx.stroke();
  const dir = ccw ? -1 : 1;
  const tx = -Math.sin(a2) * rx * dir;
  const ty = Math.cos(a2) * ry * dir;
  const tl = Math.hypot(tx, ty);
  if (tl === 0) return;
  const ux = tx / tl;
  const uy = ty / tl;
  const px = cx + Math.cos(a2) * rx;
  const py = cy + Math.sin(a2) * ry;
  const hl = Math.max(lw * 3.4, 7);
  const hw = hl * 0.42;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(px + ux * hl, py + uy * hl);
  ctx.lineTo(px - uy * hw, py + ux * hw);
  ctx.lineTo(px + uy * hw, py - ux * hw);
  ctx.closePath();
  ctx.fill();
}

export default function InductionLab() {
  const [
    { h: dropH, n: turns, r: coilR, ov },
    updateParams,
  ] = useSimParams<{ h: number; n: number; r: number; ov: boolean }>({
    h: 220,
    n: 12,
    r: 55,
    ov: true,
  });
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [live, setLive] = useState({ phi: 0, emf: 0, peak: 0 });

  const SRef = useRef<SimState>({
    z: -2.2,
    v: 0,
    prevPhi: 0,
    emfTarget: 0,
    emfDisp: 0,
    flying: false,
    acc: 0,
    sub: 0,
    head: 0,
    count: 0,
    absN: 0,
    peakVal: 0,
    peakAbs: 0,
    scaleEps: 1,
    scalePhi: 1,
    kPix: 0.43,
    dispAcc: 0,
    lastPhi: 0,
    lastEmf: 0,
    lastPeak: 0,
    eps: new Float32Array(NB),
    flux: new Float32Array(NB),
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const drop = (): void => {
    const S = SRef.current;
    const rp = coilR / PXU;
    S.z = -dropH / PXU;
    S.v = 0;
    S.prevPhi = totalFlux(S.z, turns, rp);
    S.emfTarget = 0;
    S.emfDisp = 0;
    S.flying = true;
    S.acc = 0;
    S.sub = 0;
    S.head = 0;
    S.count = 0;
    S.absN = 0;
    S.peakVal = 0;
    S.peakAbs = 0;
    const vmax = Math.sqrt(2 * GRAV * (dropH / PXU));
    const phiMax = turns / (2 * rp);
    S.scaleEps = (phiMax * vmax) / rp;
    S.scalePhi = phiMax * 1.2;
  };

  const changeH = (v: number): void => {
    updateParams({ h: v });
    const S = SRef.current;
    if (!S.flying) S.z = -v / PXU;
  };

  const changeN = (v: number): void => {
    updateParams({ n: v });
    const S = SRef.current;
    S.prevPhi = totalFlux(S.z, v, coilR / PXU);
  };

  const changeR = (v: number): void => {
    updateParams({ r: v });
    const S = SRef.current;
    S.prevPhi = totalFlux(S.z, turns, v / PXU);
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const S = SRef.current;
    const rp = coilR / PXU;

    if (playing && S.flying) {
      S.acc += dt;
      let guard = 0;
      while (S.acc >= DT && S.flying && guard < 48) {
        guard += 1;
        S.acc -= DT;
        S.v += GRAV * DT;
        S.z += S.v * DT;
        const phi = totalFlux(S.z, turns, rp);
        S.emfTarget = -(phi - S.prevPhi) / DT;
        S.prevPhi = phi;
        S.emfDisp += (S.emfTarget - S.emfDisp) * SMOOTH;
        const ae = S.emfDisp < 0 ? -S.emfDisp : S.emfDisp;
        if (ae > S.peakVal) {
          S.peakVal = ae;
          S.peakAbs = S.absN;
        }
        S.sub += 1;
        if (S.sub % SAMPLE_EVERY === 0) {
          S.eps[S.head] = S.emfDisp;
          S.flux[S.head] = phi;
          S.head = (S.head + 1) % NB;
          if (S.count < NB) S.count += 1;
          S.absN += 1;
        }
        if (S.z >= dropH / PXU) {
          S.z = dropH / PXU;
          S.flying = false;
          S.emfTarget = 0;
        }
      }
      if (guard >= 48) S.acc = 0;
    } else {
      S.emfDisp += (0 - S.emfDisp) * Math.min(1, dt * 10);
    }

    S.dispAcc += dt;
    if (S.dispAcc >= 0.12) {
      S.dispAcc = 0;
      const rp2 = Math.round(S.prevPhi * 100) / 100;
      const re2 = Math.round(S.emfDisp * 100) / 100;
      const rk2 = Math.round(S.peakVal * 100) / 100;
      if (rp2 !== S.lastPhi || re2 !== S.lastEmf || rk2 !== S.lastPeak) {
        S.lastPhi = rp2;
        S.lastEmf = re2;
        S.lastPeak = rk2;
        setLive({ phi: rp2, emf: re2, peak: rk2 });
      }
    }

    paintSky(ctx, w, h);

    const sceneT = 12;
    const sceneB = h * 0.6;
    const kTarget = Math.min(1, (sceneB - sceneT - 68) / (2 * dropH));
    S.kPix += (kTarget - S.kPix) * Math.min(1, dt * 6);
    const kp = S.kPix;
    const cx = w * 0.5;
    const coilY = sceneT + 34 + dropH * kp;
    const magY = coilY + S.z * kp;

    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx + 0.5, sceneT + 4);
    ctx.lineTo(cx + 0.5, sceneB - 4);
    ctx.moveTo(24, Math.round(coilY - dropH * kp) + 0.5);
    ctx.lineTo(w - 24, Math.round(coilY - dropH * kp) + 0.5);
    ctx.moveTo(24, Math.round(coilY + dropH * kp) + 0.5);
    ctx.lineTo(w - 24, Math.round(coilY + dropH * kp) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let i = -1; i <= 1; i += 1) {
      ctx.strokeStyle = COPPER;
      ctx.lineWidth = i === 0 ? 2.6 : 1.5;
      ctx.globalAlpha = i === 0 ? 0.95 : 0.4;
      ctx.beginPath();
      ctx.ellipse(cx, coilY + i * 4, coilR, coilR * 0.3, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = COPPER;
    ctx.beginPath();
    ctx.arc(cx - coilR, coilY, 3, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + coilR, coilY, 3, 0, TAU);
    ctx.fill();

    const mag = S.emfDisp < 0 ? -S.emfDisp : S.emfDisp;
    if (mag > 0.5) {
      const strength = Math.min(1, mag / (S.scaleEps * 0.3 + 1e-9));
      ctx.globalAlpha = 0.25 + 0.7 * strength;
      const rr = coilR + 14;
      const fwd = S.emfDisp > 0;
      arcArrow(
        ctx,
        cx,
        coilY,
        rr,
        rr * 0.3,
        fwd ? 2.62 : 0.52,
        fwd ? 0.52 : 2.62,
        FUCHSIA,
        2
      );
      ctx.globalAlpha = 1;
    }

    const mx = cx - MAG_W / 2;
    ctx.save();
    ctx.shadowColor = "rgba(192,38,211,0.45)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = POLE_N;
    ctx.beginPath();
    ctx.roundRect(mx, magY - MAG_H / 2, MAG_W, MAG_H / 2, [7, 7, 0, 0]);
    ctx.fill();
    ctx.fillStyle = POLE_S;
    ctx.beginPath();
    ctx.roundRect(mx, magY, MAG_W, MAG_H / 2, [0, 0, 7, 7]);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(mx, magY - MAG_H / 2, MAG_W, MAG_H);
    ctx.stroke();

    ctx.font = MONO_LABEL;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("N", cx, magY - MAG_H / 4);
    ctx.fillText("S", cx, magY + MAG_H / 4);

    if (S.flying && S.v > 0.05) {
      const alen = Math.min(64, S.v * 9);
      drawArrow(ctx, cx + MAG_W / 2 + 9, magY, cx + MAG_W / 2 + 9, magY + alen, CYAN, 2);
    }

    ctx.strokeStyle = TRACE_DIM;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(sceneB + 8) + 0.5);
    ctx.lineTo(w, Math.round(sceneB + 8) + 0.5);
    ctx.stroke();

    const chT = sceneB + 16;
    const chB = h - 20;
    const chL = 46;
    const chR = w - 16;
    const cyC = (chT + chB) * 0.5;
    const halfH = (chB - chT) * 0.5;
    const spanPx = chR - chL;
    const ncols = Math.floor(spanPx / PX_PER_SAMPLE);
    const vis = Math.min(S.count, ncols + 1);

    let pe = 0;
    let pf = 0;
    for (let a = 0; a < vis; a += 1) {
      const idx = (S.head - 1 - a + NB) % NB;
      const ev = S.eps[idx];
      const av = ev < 0 ? -ev : ev;
      if (av > pe) pe = av;
      if (ov) {
        const fv = S.flux[idx];
        if (fv > pf) pf = fv;
      }
    }
    S.scaleEps += (pe * 1.18 + 0.5 - S.scaleEps) * Math.min(1, dt * 4);
    S.scalePhi += (pf * 1.18 + 0.05 - S.scalePhi) * Math.min(1, dt * 4);
    const ppmE = (halfH * 0.88) / S.scaleEps;
    const ppmF = (halfH * 0.88) / S.scalePhi;

    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chL, Math.round(cyC) + 0.5);
    ctx.lineTo(chR, Math.round(cyC) + 0.5);
    ctx.stroke();

    ctx.font = MONO_LABEL;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = VIOLET;
    ctx.fillText("ε", chL - 8, cyC - 9);
    if (ov) {
      ctx.fillStyle = AMBER;
      ctx.fillText("Φ", chL - 8, cyC + 10);
    }

    if (vis > 1) {
      if (ov) {
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = AMBER;
        ctx.lineWidth = 1.25;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        for (let a = vis - 1; a >= 0; a -= 1) {
          const px = chR - a * PX_PER_SAMPLE;
          const fv = S.flux[(S.head - 1 - a + NB) % NB];
          const py = cyC - fv * ppmF;
          if (a === vis - 1) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }

      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      for (let a = vis - 1; a >= 0; a -= 1) {
        const px = chR - a * PX_PER_SAMPLE;
        const val = S.eps[(S.head - 1 - a + NB) % NB];
        const py = cyC - val * ppmE;
        if (a === vis - 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      glowDot(ctx, chR, cyC - S.eps[(S.head - 1 + NB) % NB] * ppmE, 3, VIOLET);

      if (S.peakVal > 0) {
        const age = S.absN - 1 - S.peakAbs;
        if (age >= 0 && age <= ncols) {
          const pkx = chR - age * PX_PER_SAMPLE;
          const ipv = S.eps[(S.head - 1 - age + NB) % NB];
          const pky = cyC - ipv * ppmE;
          ctx.setLineDash([2, 4]);
          ctx.strokeStyle = AMBER;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pkx + 0.5, cyC);
          ctx.lineTo(pkx + 0.5, pky - 8);
          ctx.stroke();
          ctx.setLineDash([]);
          glowDot(ctx, pkx, pky, 2.5, AMBER);
          ctx.font = MONO_SMALL;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillStyle = AMBER;
          ctx.fillText(peakLabel(S.peakVal), pkx, Math.min(cyC, pky) - 12);
        }
      }
    }

    ctx.font = MONO_SMALL;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = MUTED;
    ctx.fillText("ε(t)", chL, chB + 14);
  };

  const canvasRef = useSimLoop(draw);

  return (
    <SimFrame
      title="Faraday Induction"
      subtitle="Bar magnet dropped through an N-turn coil · EMF oscilloscope"
      controls={
        <>
          <Slider
            label="Drop height"
            value={dropH}
            min={80}
            max={400}
            step={10}
            unit="px"
            onChange={changeH}
          />
          <Slider
            label="Coil turns N"
            value={turns}
            min={1}
            max={50}
            onChange={changeN}
          />
          <Slider
            label="Coil radius"
            value={coilR}
            min={30}
            max={90}
            step={5}
            unit="px"
            onChange={changeR}
          />
          <Toggle
            label="Flux curve overlay"
            checked={ov}
            onChange={(v) => updateParams({ ov: v })}
          />
          {reduced ? (
            <ActionButton tone="ghost" onClick={() => setPlaying((p) => !p)}>
              {playing ? "Pause" : "Play"}
            </ActionButton>
          ) : null}
          <ActionButton onClick={drop}>Drop magnet</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`\varepsilon = -N\,\frac{d\Phi}{dt}`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">Φ </span>
            <span className="text-accent">{fmt(live.phi)}</span>
            <span className="text-muted"> · ε </span>
            <span className="text-accent">{fmt(live.emf)}</span>
            <span className="text-muted"> · peak ε </span>
            <span className="text-accent">{fmt(live.peak)}</span>
          </span>
          <span className="text-xs text-muted">
            ε spikes on entry and exit and crosses zero exactly at the coil’s center.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="A bar magnet falls through a copper coil while a Lenz-law arrow circles the winding; an oscilloscope strip below traces the induced EMF with an optional flux overlay and a peak marker"
      />
    </SimFrame>
  );
}
