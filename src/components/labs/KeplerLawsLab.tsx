"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const TAU = Math.PI * 2;
const NORM = 900;
const OMEGA = -0.55;
const CW = Math.cos(OMEGA);
const SW = Math.sin(OMEGA);
const WEDGE_DT = 0.5;
const SECTOR_HALF = 0.3;
const PERI_CENTER = 0.5;
const APO_CENTER = Math.PI;
const SECTOR_SAMPLES = 24;
const SECTOR_ALT_S = 2.2;
const GHOST_SCALE = 0.6;
const GHOST_E = 0.1;
const TICK_LEN = 7;
const NEWTON_ITERS = 5;
const WEDGE_SUBSTEPS = 8;

const SUN_COLOR = "#ffd27a";
const PLANET_COLOR = "#53d6f2";
const GHOST_COLOR = "#b48cf2";
const ORBIT_STROKE = "rgba(250,204,21,0.28)";
const GHOST_ORBIT_STROKE = "rgba(180,140,242,0.3)";
const WEDGE_FILL = "rgba(250,204,21,0.3)";
const PERI_FILL_DIM = "rgba(83,214,242,0.09)";
const PERI_FILL_HOT = "rgba(83,214,242,0.26)";
const PERI_EDGE_HOT = "rgba(83,214,242,0.8)";
const APO_FILL_DIM = "rgba(180,140,242,0.09)";
const APO_FILL_HOT = "rgba(180,140,242,0.26)";
const APO_EDGE_HOT = "rgba(180,140,242,0.8)";
const MUTED = "#8b93b8";

const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const P_CUR = new Float64Array(2);
const P_PREV = new Float64Array(2);
const P_GHOST = new Float64Array(2);
const SUB_A = new Float64Array(2);
const SUB_B = new Float64Array(2);
const TMP = new Float64Array(2);
const SECTOR_P = new Float32Array((SECTOR_SAMPLES + 1) * 2);
const SECTOR_A = new Float32Array((SECTOR_SAMPLES + 1) * 2);

type Labels = { peri: string; apo: string; px: number; py: number; ax: number; ay: number };

function solveE(m: number, e: number): number {
  const M = m - TAU * Math.floor(m / TAU);
  let E = M;
  for (let i = 0; i < NEWTON_ITERS; i += 1) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }
  return E;
}

function posFromM(m: number, a: number, e: number, out: Float64Array): void {
  const E = solveE(m, e);
  out[0] = a * (Math.cos(E) - e);
  out[1] = a * Math.sqrt(1 - e * e) * Math.sin(E);
}

function wedgeArea(
  m: number,
  dm: number,
  a: number,
  e: number
): number {
  let sum = 0;
  posFromM(m - dm, a, e, SUB_A);
  for (let j = 1; j <= WEDGE_SUBSTEPS; j += 1) {
    posFromM(m - dm + (dm * j) / WEDGE_SUBSTEPS, a, e, SUB_B);
    sum += Math.abs(SUB_A[0] * SUB_B[1] - SUB_A[1] * SUB_B[0]) * 0.5;
    SUB_A[0] = SUB_B[0];
    SUB_A[1] = SUB_B[1];
  }
  return sum;
}

function toSX(sunX: number, k: number, x: number, y: number): number {
  return sunX + k * (x * CW - y * SW);
}

function toSY(sunY: number, k: number, x: number, y: number): number {
  return sunY - k * (x * SW + y * CW);
}

function fillSector(
  buf: Float32Array,
  m1: number,
  m2: number,
  a: number,
  e: number
): void {
  for (let j = 0; j <= SECTOR_SAMPLES; j += 1) {
    posFromM(m1 + ((m2 - m1) * j) / SECTOR_SAMPLES, a, e, TMP);
    buf[j * 2] = TMP[0];
    buf[j * 2 + 1] = TMP[1];
  }
}

function drawSector(
  ctx: CanvasRenderingContext2D,
  buf: Float32Array,
  fillDim: string,
  fillHot: string,
  edgeHot: string,
  hot: boolean,
  sunX: number,
  sunY: number,
  k: number
): void {
  ctx.beginPath();
  ctx.moveTo(sunX, sunY);
  for (let j = 0; j <= SECTOR_SAMPLES; j += 1) {
    const x = buf[j * 2];
    const y = buf[j * 2 + 1];
    ctx.lineTo(toSX(sunX, k, x, y), toSY(sunY, k, x, y));
  }
  ctx.closePath();
  ctx.fillStyle = hot ? fillHot : fillDim;
  ctx.fill();
  if (hot) {
    ctx.strokeStyle = edgeHot;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawTick(
  ctx: CanvasRenderingContext2D,
  sunX: number,
  sunY: number,
  k: number,
  wx: number,
  wy: number,
  label: string
): void {
  const bx = toSX(sunX, k, wx, wy);
  const by = toSY(sunY, k, wx, wy);
  const dx = CW * TICK_LEN;
  const dy = -SW * TICK_LEN;
  ctx.strokeStyle = MUTED;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bx - dx, by - dy);
  ctx.lineTo(bx + dx, by + dy);
  ctx.stroke();
  ctx.font = MONO_SMALL;
  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.fillText(label, bx + dx * 2.4, by + dy * 2.4);
}

export default function KeplerLawsLab() {
  const [
    { a, e, ts: timeScale, wedges, ghost },
    updateParams,
  ] = useSimParams<{ a: number; e: number; ts: number; wedges: boolean; ghost: boolean }>({
    a: 160,
    e: 0.5,
    ts: 1,
    wedges: true,
    ghost: false,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dadt, setDadt] = useState(0);

  const aRef = useRef(a);
  const eRef = useRef(e);
  const tsRef = useRef(timeScale);
  const wedgesRef = useRef(wedges);
  const ghostRef = useRef(ghost);
  const pausedRef = useRef(paused);

  useEffect(() => {
    aRef.current = a;
    eRef.current = e;
    tsRef.current = timeScale;
    wedgesRef.current = wedges;
    ghostRef.current = ghost;
    pausedRef.current = paused;
  });

  const tRef = useRef(0);
  const mRef = useRef(0);
  const mGhostRef = useRef(0);
  const emaRef = useRef(0);
  const labelsRef = useRef<Labels>({ peri: "", apo: "", px: 0, py: 0, ax: 0, ay: 0 });

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
    const b = a * Math.sqrt(1 - e * e);
    const area = fmt(0.3 * a * b, 0);
    fillSector(SECTOR_P, PERI_CENTER - SECTOR_HALF, PERI_CENTER + SECTOR_HALF, a, e);
    fillSector(SECTOR_A, APO_CENTER - SECTOR_HALF, APO_CENTER + SECTOR_HALF, a, e);
    posFromM(PERI_CENTER, a, e, TMP);
    posFromM(APO_CENTER, a, e, P_GHOST);
    labelsRef.current = {
      peri: `peri ${area} px²`,
      apo: `apo ${area} px²`,
      px: TMP[0] * 1.35,
      py: TMP[1] * 1.35,
      ax: P_GHOST[0] * 0.93,
      ay: P_GHOST[1] * 0.93,
    };
  }, [a, e]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setDadt(emaRef.current);
    }, 180);
    return () => window.clearInterval(id);
  }, []);

  const restart = useCallback(() => {
    tRef.current = 0;
    mRef.current = 0;
    mGhostRef.current = 0;
    emaRef.current = 0;
    setDadt(0);
  }, []);

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    paintSky(ctx, w, h);
    ctx.textBaseline = "middle";
    ctx.lineCap = "round";

    const av = aRef.current;
    const ev = eRef.current;
    const bv = av * Math.sqrt(1 - ev * ev);
    const n = NORM / Math.pow(av, 1.5);
    const nG = NORM / Math.pow(av * GHOST_SCALE, 1.5);

    if (!pausedRef.current && dt * tsRef.current > 0) {
      const step = dt * tsRef.current;
      tRef.current += step;
      mRef.current += n * step;
      mGhostRef.current += nG * step;
    }

    const sunX = w * 0.5;
    const sunY = h * 0.54;
    const k = Math.min(1, (Math.min(w, h) * 0.46) / (av * (1 + ev)));

    const ecx = toSX(sunX, k, -av * ev * CW, -av * ev * SW);
    const ecy = toSY(sunY, k, -av * ev * CW, -av * ev * SW);
    ctx.strokeStyle = ORBIT_STROKE;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(ecx, ecy, av * k, bv * k, -OMEGA, 0, TAU);
    ctx.stroke();

    if (ghostRef.current) {
      const ag = av * GHOST_SCALE;
      const bg = ag * Math.sqrt(1 - GHOST_E * GHOST_E);
      const gcx = toSX(sunX, k, -ag * GHOST_E * CW, -ag * GHOST_E * SW);
      const gcy = toSY(sunY, k, -ag * GHOST_E * CW, -ag * GHOST_E * SW);
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = GHOST_ORBIT_STROKE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(gcx, gcy, ag * k, bg * k, -OMEGA, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawTick(ctx, sunX, sunY, k, av * (1 - ev) * CW, av * (1 - ev) * SW, "P");
    drawTick(ctx, sunX, sunY, k, -av * (1 + ev) * CW, -av * (1 + ev) * SW, "A");

    const active = Math.floor(tRef.current / SECTOR_ALT_S) % 2;
    if (wedgesRef.current) {
      drawSector(ctx, SECTOR_P, PERI_FILL_DIM, PERI_FILL_HOT, PERI_EDGE_HOT, active === 0, sunX, sunY, k);
      drawSector(ctx, SECTOR_A, APO_FILL_DIM, APO_FILL_HOT, APO_EDGE_HOT, active === 1, sunX, sunY, k);
      const L = labelsRef.current;
      ctx.font = MONO_SMALL;
      ctx.textAlign = "center";
      ctx.fillStyle = MUTED;
      ctx.fillText(L.peri, toSX(sunX, k, L.px, L.py), toSY(sunY, k, L.px, L.py));
      ctx.fillText(L.apo, toSX(sunX, k, L.ax, L.ay), toSY(sunY, k, L.ax, L.ay));
    }

    posFromM(mRef.current, av, ev, P_CUR);
    posFromM(mRef.current - n * WEDGE_DT, av, ev, P_PREV);

    if (!pausedRef.current && dt * tsRef.current > 0) {
      const inst = wedgeArea(mRef.current, n * WEDGE_DT, av, ev) / WEDGE_DT;
      emaRef.current += (inst - emaRef.current) * 0.08;
    }

    if (wedgesRef.current) {
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(toSX(sunX, k, P_PREV[0], P_PREV[1]), toSY(sunY, k, P_PREV[0], P_PREV[1]));
      ctx.lineTo(toSX(sunX, k, P_CUR[0], P_CUR[1]), toSY(sunY, k, P_CUR[0], P_CUR[1]));
      ctx.closePath();
      ctx.fillStyle = WEDGE_FILL;
      ctx.fill();
    }

    glowDot(ctx, sunX, sunY, 11, SUN_COLOR);

    if (ghostRef.current) {
      posFromM(mGhostRef.current, av * GHOST_SCALE, GHOST_E, P_GHOST);
      ctx.globalAlpha = 0.75;
      glowDot(ctx, toSX(sunX, k, P_GHOST[0], P_GHOST[1]), toSY(sunY, k, P_GHOST[0], P_GHOST[1]), 4, GHOST_COLOR);
      ctx.globalAlpha = 1;
    }

    glowDot(ctx, toSX(sunX, k, P_CUR[0], P_CUR[1]), toSY(sunY, k, P_CUR[0], P_CUR[1]), 5, PLANET_COLOR);
  });

  const bMain = a * Math.sqrt(1 - e * e);
  const tMain = (TAU * Math.pow(a, 1.5)) / NORM;
  const tGhost = (TAU * Math.pow(a * GHOST_SCALE, 1.5)) / NORM;
  const dadtTheory = (Math.PI * a * bMain) / tMain;
  const ratioTxt = Math.pow(TAU / NORM, 2).toExponential(3);

  return (
    <SimFrame
      title="Equal Areas Around a Focus"
      subtitle="Slide a and e; the planet answers through Kepler’s equation"
      controls={
        <>
          <Slider
            label="Semi-major a"
            value={a}
            min={80}
            max={260}
            step={5}
            unit="px"
            onChange={(v) => updateParams({ a: v })}
          />
          <Slider
            label="Eccentricity e"
            value={e}
            min={0}
            max={0.85}
            step={0.01}
            onChange={(v) => updateParams({ e: v })}
          />
          <Slider
            label="Time scale"
            value={timeScale}
            min={0}
            max={4}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ ts: v })}
          />
          <Toggle
            label="Equal-area wedges"
            checked={wedges}
            onChange={(v) => updateParams({ wedges: v })}
          />
          <Toggle
            label="Comparison planet"
            checked={ghost}
            onChange={(v) => updateParams({ ghost: v })}
          />
          {reduced ? (
            <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
              {paused ? "Play" : "Pause"}
            </ActionButton>
          ) : null}
          <ActionButton onClick={restart}>Restart at perihelion</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX tex="T^2 \\propto a^3" className="text-sm" />
          <p className="font-mono text-xs">
            <span className="text-muted">dA/dt </span>
            <span className="text-accent">{fmt(dadt, 0)}</span>
            <span className="text-muted"> px²/s · theory πab/T </span>
            <span className="text-accent">{fmt(dadtTheory, 0)}</span>
          </p>
          {ghost ? (
            <table className="font-mono text-xs">
              <tbody>
                <tr>
                  <td className="pr-3 text-muted">planet</td>
                  <td className="pr-3">a = {fmt(a, 0)} px</td>
                  <td className="pr-3">T = {fmt(tMain, 2)} s</td>
                  <td className="text-accent">T²/a³ = {ratioTxt}</td>
                </tr>
                <tr>
                  <td className="pr-3 text-muted">ghost</td>
                  <td className="pr-3">a = {fmt(a * GHOST_SCALE, 0)} px</td>
                  <td className="pr-3">T = {fmt(tGhost, 2)} s</td>
                  <td className="text-accent">T²/a³ = {ratioTxt}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="font-mono text-xs">
              <span className="text-muted">T²/a³ </span>
              <span className="text-accent">{ratioTxt}</span>
              <span className="text-muted"> s²/px³</span>
            </p>
          )}
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Kepler’s laws simulation: a planet traces an ellipse around a glowing amber sun placed at one focus, sweeping an equal-area wedge each instant; faint comparison sectors sit near perihelion and aphelion with printed areas that match despite different arc lengths; perihelion and aphelion tick marks label the extremes, and an optional ghost planet rides a smaller faster ellipse"
      />
    </SimFrame>
  );
}
