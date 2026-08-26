"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { paintSky, glowDot, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const N_DASHES = 14;
const INF_STEP = 99;
const T_SMOOTH = 5;
const GLIDE_WALL = 0.35;
const W_MAX = 0.9;
const W_MIN = 0.1;
const MAX_PHASE = 10;

const PINK = "#f9a8d4";
const CYAN = "#53d6f2";
const AMBER = "#ffd27a";
const BRIGHT = "#e6ebff";
const MUTED = "#8b93b8";
const FAINT = "rgba(139,147,184,0.35)";
const TRACK_C = "rgba(139,147,184,0.45)";
const PANEL_C = "rgba(6,10,23,0.88)";
const MONO_XS = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_SM = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

interface ZenoTable {
  sig: number;
  g0: number;
  va: number;
  vt: number;
  r: number;
  inv: number;
  tStar: number;
  xFlag: number;
  ax: Float64Array;
  tx: Float64Array;
  sT: Float64Array;
  wall: Float64Array;
  glideDur: number;
  nLog: number;
  logFrac: Float64Array;
}

const POS = { a: 0, t: 0, n: 0 };
const HUD_T = { key: -1, str: "" };
const HUD_G = { key: -1, str: "" };
const ANN = { sig: -1, str: "" };
const BANNER = { sig: -1, str: "" };

function clampVt(vt: number, va: number): number {
  return Math.min(vt, va * 0.96);
}

function niceStep(span: number): number {
  const raw = span / 8;
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-9))));
  const c = raw / p;
  return (c >= 5 ? 5 : c >= 2 ? 2 : 1) * p;
}

function buildTable(sig: number, g0: number, va: number, vtIn: number): ZenoTable {
  const vt = clampVt(vtIn, va);
  const r = vt / va;
  const inv = 1 / (1 - r);
  const tStar = g0 / (va - vt);
  const xFlag = g0 + vt * tStar;
  const ax = new Float64Array(N_DASHES + 1);
  const tx = new Float64Array(N_DASHES + 1);
  const sT = new Float64Array(N_DASHES + 1);
  const wall = new Float64Array(N_DASHES);
  ax[0] = 0;
  tx[0] = g0;
  let gap = g0;
  let sumW = 0;
  for (let n = 1; n <= N_DASHES; n++) {
    const dur = gap / va;
    sT[n] = sT[n - 1] + dur;
    ax[n] = ax[n - 1] + gap;
    tx[n] = tx[n - 1] + vt * dur;
    const w = Math.max(W_MIN, W_MAX * Math.pow(r, (n - 1) * 0.5));
    wall[n - 1] = w;
    sumW += w;
    gap *= r;
  }
  if (sumW > MAX_PHASE) {
    const k = MAX_PHASE / sumW;
    for (let n = 0; n < N_DASHES; n++) wall[n] *= k;
  }
  const nLog = Math.max(8, Math.min(64, Math.ceil(Math.log(1e-15) / Math.log(r))));
  const logFrac = new Float64Array(nLog + 1);
  for (let i = 0; i <= nLog; i++) logFrac[i] = i / nLog;
  return {
    sig,
    g0,
    va,
    vt,
    r,
    inv,
    tStar,
    xFlag,
    ax,
    tx,
    sT,
    wall,
    glideDur: tStar - sT[N_DASHES],
    nLog,
    logFrac,
  };
}

function zenoPos(tab: ZenoTable, tau: number): void {
  const { ax, tx, sT } = tab;
  let k = 0;
  while (k < N_DASHES && tau >= sT[k + 1]) k++;
  if (k < N_DASHES) {
    const f = (tau - sT[k]) / (sT[k + 1] - sT[k]);
    const e = 1 - (1 - f) * (1 - f) * (1 - f);
    POS.a = ax[k] + (ax[k + 1] - ax[k]) * e;
    POS.t = tx[k] + (tx[k + 1] - tx[k]) * e;
    POS.n = k + 1;
  } else {
    const q = Math.min(1, (tau - sT[N_DASHES]) / tab.glideDur);
    POS.a = ax[N_DASHES] + (tab.xFlag - ax[N_DASHES]) * q;
    POS.t = tx[N_DASHES] + (tab.xFlag - tx[N_DASHES]) * q;
    POS.n = INF_STEP;
  }
}

function zenoRate(tab: ZenoTable, tau: number): number {
  if (tau >= tab.sT[N_DASHES]) {
    return tab.glideDur > 1e-12 ? tab.glideDur / GLIDE_WALL : 1;
  }
  let k = 0;
  while (k < N_DASHES - 1 && tau >= tab.sT[k + 1]) k++;
  return (tab.sT[k + 1] - tab.sT[k]) / tab.wall[k];
}

export default function ZenoAchillesLab() {
  const [
    { g0, va, vt, zeno },
    updateParams,
  ] = useSimParams<{ g0: number; va: number; vt: number; zeno: boolean }>({
    g0: 10,
    va: 10,
    vt: 1,
    zeno: true,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);

  const g0Ref = useRef(g0);
  const vaRef = useRef(va);
  const vtRef = useRef(vt);
  const zenoRef = useRef(zeno);
  const pausedRef = useRef(paused);

  useEffect(() => {
    g0Ref.current = g0;
    vaRef.current = va;
    vtRef.current = vt;
    zenoRef.current = zeno;
    pausedRef.current = paused;
  });

  const tabRef = useRef<ZenoTable | null>(null);
  const tauRef = useRef(0);
  const stepRef = useRef(0);
  const camSclRef = useRef(0);
  const camOxRef = useRef(0);

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const sig =
      Math.round(g0Ref.current) * 4096 +
      Math.round(vaRef.current * 2) * 64 +
      Math.round(vtRef.current * 10);
    let tab = tabRef.current;
    if (!tab || tab.sig !== sig) {
      tab = buildTable(sig, g0Ref.current, vaRef.current, vtRef.current);
      tabRef.current = tab;
    }

    const zenoOn = zenoRef.current;
    const tau = tauRef.current;
    const rate = zenoOn ? zenoRate(tab, tau) : tab.tStar / T_SMOOTH;
    if (!pausedRef.current && tau < tab.tStar) {
      tauRef.current = Math.min(tab.tStar, tau + dt * rate);
    }
    const tq = tauRef.current;

    let aX: number;
    let tX: number;
    let nCur: number;
    if (zenoOn) {
      zenoPos(tab, tq);
      aX = POS.a;
      tX = POS.t;
      nCur = POS.n;
    } else {
      aX = tab.va * tq;
      tX = tab.g0 + tab.vt * tq;
      nCur = INF_STEP;
    }

    const nPush = tq >= tab.tStar - 1e-12 ? INF_STEP : nCur;
    if (nPush !== stepRef.current) {
      stepRef.current = nPush;
      setStep(nPush);
    }

    const xL = -0.07 * tab.xFlag;
    const xR = tab.xFlag * 1.12;
    const targetScl = w / (xR - xL);
    const targetOx = -xL * targetScl;
    if (camSclRef.current <= 0) {
      camSclRef.current = targetScl;
      camOxRef.current = targetOx;
    } else {
      camSclRef.current += (targetScl - camSclRef.current) * 0.08;
      camOxRef.current += (targetOx - camOxRef.current) * 0.08;
    }
    const scl = camSclRef.current;
    const ox = camOxRef.current;
    const gy = h * 0.55;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    ctx.strokeStyle = TRACK_C;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, gy + 0.5);
    ctx.lineTo(w, gy + 0.5);
    ctx.stroke();

    ctx.font = MONO_XS;
    ctx.fillStyle = FAINT;
    ctx.textAlign = "center";
    const stp = niceStep(tab.xFlag * 1.1);
    for (let m = stp; m <= tab.xFlag * 1.05; m += stp) {
      const px = ox + m * scl;
      ctx.fillRect(px - 0.5, gy + 3, 1, 6);
      ctx.fillText(fmt(m, 0), px, gy + 20);
    }
    ctx.fillRect(ox - 0.5, gy + 3, 1, 6);
    ctx.fillStyle = MUTED;
    ctx.fillText("0", ox, gy + 20);

    const g0x = ox + tab.g0 * scl;
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = FAINT;
    ctx.beginPath();
    ctx.moveTo(g0x, gy - 24);
    ctx.lineTo(g0x, gy + 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = MUTED;
    ctx.fillText("g₀", g0x, gy - 30);
    ctx.fillStyle = PINK;
    ctx.fillText("Achilles", ox, gy + 32);
    ctx.fillStyle = CYAN;
    ctx.fillText("Tortoise", g0x, gy + 32);

    if (zenoOn) {
      for (let k = 0; k < N_DASHES; k++) {
        const x1 = ox + tab.ax[k] * scl;
        const x2 = ox + tab.ax[k + 1] * scl;
        if (x2 - x1 < 0.75) continue;
        const ly = gy - 16 - (k % 2) * 7;
        if (tq < tab.sT[k]) {
          ctx.globalAlpha = 0.12;
          drawArrow(ctx, x1, ly, x2, ly, PINK, 1);
        } else if (tq >= tab.sT[k + 1]) {
          ctx.globalAlpha = 0.28 + 0.45 * Math.pow(tab.r, k * 0.15);
          drawArrow(ctx, x1, ly, x2, ly, PINK, 1.25);
        } else {
          ctx.globalAlpha = 0.9;
          drawArrow(ctx, x1, ly, ox + aX * scl, ly, PINK, 2);
        }
      }
      ctx.globalAlpha = 1;
    }

    const fx = ox + tab.xFlag * scl;
    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, gy + 2);
    ctx.lineTo(fx, gy - 34);
    ctx.stroke();
    ctx.fillStyle = AMBER;
    ctx.beginPath();
    ctx.moveTo(fx, gy - 34);
    ctx.lineTo(fx + 16, gy - 29);
    ctx.lineTo(fx, gy - 24);
    ctx.closePath();
    ctx.fill();
    ctx.font = MONO_XS;
    ctx.textAlign = "center";
    ctx.fillText(`${fmt(tab.xFlag, 1)} m`, fx, gy - 40);

    const done = tq >= tab.tStar - 1e-9;
    if (!zenoOn && !done) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = PINK;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + (aX - tab.va * 0.08) * scl, gy);
      ctx.lineTo(ox + aX * scl, gy);
      ctx.stroke();
      ctx.strokeStyle = CYAN;
      ctx.beginPath();
      ctx.moveTo(ox + (tX - tab.vt * 0.08) * scl, gy);
      ctx.lineTo(ox + tX * scl, gy);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    glowDot(ctx, ox + aX * scl, gy, 5, PINK);
    glowDot(ctx, ox + tX * scl, gy, 4.5, CYAN);

    ctx.font = MONO_SM;
    ctx.textAlign = "left";
    ctx.fillStyle = MUTED;
    ctx.fillText(zenoOn ? "mode: zeno dashes" : "mode: continuous", 16, 26);
    const tk = Math.round(tq * 100);
    if (tk !== HUD_T.key) {
      HUD_T.key = tk;
      HUD_T.str = `t = ${fmt(tq, 2)} s`;
    }
    ctx.fillStyle = BRIGHT;
    ctx.fillText(HUD_T.str, 16, 44);
    const gap = tX - aX;
    const gk = Math.round(gap * 1000);
    if (gk !== HUD_G.key) {
      HUD_G.key = gk;
      HUD_G.str = `gap = ${fmt(gap, 3)} m`;
    }
    ctx.fillStyle = CYAN;
    ctx.fillText(HUD_G.str, 16, 62);

    if (done) {
      if (BANNER.sig !== sig) {
        BANNER.sig = sig;
        BANNER.str = `flag crossed · t* = ${fmt(tab.tStar, 2)} s`;
      }
      ctx.font = MONO_SM;
      const bw = ctx.measureText(BANNER.str).width + 24;
      const bx = w / 2 - bw / 2;
      ctx.fillStyle = PANEL_C;
      ctx.strokeStyle = "rgba(255,210,122,0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, 14, bw, 26, 13);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = AMBER;
      ctx.textAlign = "center";
      ctx.fillText(BANNER.str, w / 2, 31);
    }

    const iw = Math.min(320, Math.max(170, w * 0.31));
    const ih = Math.min(200, Math.max(130, h * 0.4));
    const ix = w - iw - 12;
    const iy = h - ih - 12;
    ctx.fillStyle = PANEL_C;
    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(ix, iy, iw, ih, 8);
    ctx.fill();
    ctx.stroke();
    ctx.font = MONO_XS;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "left";
    ctx.fillText("gap gₙ per step (log)", ix + 10, iy + 16);
    const pl = ix + 14;
    const pr = ix + iw - 48;
    const pt = iy + 26;
    const pb = iy + ih - 30;
    ctx.textAlign = "left";
    for (let d = 0; d <= 15; d += 3) {
      const f = d / 15;
      const yy = pt + f * (pb - pt);
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = FAINT;
      ctx.beginPath();
      ctx.moveTo(pl, yy);
      ctx.lineTo(pr, yy);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = FAINT;
      ctx.fillText(d === 0 ? "g₀" : `1e-${d}`, pr + 5, yy + 3);
    }
    ctx.strokeStyle = PINK;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pl, pt);
    ctx.lineTo(pr, pb);
    ctx.stroke();
    ctx.globalAlpha = 1;
    const nd = Math.min(N_DASHES, tab.nLog);
    for (let n = 0; n <= nd; n++) {
      const f = n / tab.nLog;
      glowDot(ctx, pl + f * (pr - pl), pt + f * (pb - pt), 2.2, CYAN);
    }
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.fillText("0", pl, pb + 13);
    ctx.fillText(String(tab.nLog), pr, pb + 13);
    ctx.textAlign = "right";
    ctx.fillText("step n →", pr, pb + 24 > iy + ih - 6 ? iy + ih - 6 : pb + 24);
    if (ANN.sig !== sig) {
      ANN.sig = sig;
      ANN.str = `Σ rⁿ = 1/(1-r) = ${fmt(tab.inv, 3)}`;
    }
    ctx.textAlign = "left";
    ctx.fillStyle = AMBER;
    ctx.fillText(ANN.str, pl + 6, pt + 14);
  };

  const canvasRef = useSimLoop(draw);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const restart = (): void => {
    tauRef.current = 0;
    stepRef.current = 0;
    HUD_T.key = -1;
    HUD_G.key = -1;
    setStep(0);
  };

  const vtE = clampVt(vt, va);
  const r = vtE / va;
  const rInv = 1 / (1 - r);
  const tStar = g0 / (va - vtE);
  const partial = step === INF_STEP ? rInv : (1 - Math.pow(r, step)) / (1 - r);

  return (
    <SimFrame
      title="Zeno & Achilles"
      subtitle="Geometric dashes vs. the continuous catch"
      controls={
        <>
          <Slider
            label="Head start g₀"
            value={g0}
            min={1}
            max={50}
            step={1}
            unit="m"
            onChange={(v) => updateParams({ g0: v })}
          />
          <Slider
            label="Achilles speed v_A"
            value={va}
            min={2}
            max={20}
            step={0.5}
            unit="m/s"
            onChange={(v) => updateParams({ va: v })}
          />
          <Slider
            label="Tortoise speed v_T"
            value={vt}
            min={0.2}
            max={3}
            step={0.1}
            unit="m/s"
            onChange={(v) => updateParams({ vt: v })}
          />
          <Toggle
            label="Zeno steps"
            checked={zeno}
            onChange={(v) => updateParams({ zeno: v })}
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
          <ActionButton onClick={restart}>Restart race</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={"\\Sigma = 1 + r + r^2 + \\cdots = \\frac{1}{1-r}"}
            className="text-sm"
          />
          <p className="font-mono text-xs">
            <span className="text-muted">r </span>
            <span className="text-accent">{fmt(r, 3)}</span>
            <span className="text-muted"> · Σ </span>
            <span className="text-accent">{fmt(partial, 3)}</span>
            <span className="text-muted"> → 1/(1−r) </span>
            <span className="text-accent">{fmt(rInv, 3)}</span>
            <span className="text-muted"> · t* </span>
            <span className="text-accent">{fmt(tStar, 2)}</span>
            <span className="text-muted"> s · n </span>
            <span className="text-accent">{step === INF_STEP ? "∞" : step}</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Race track where Achilles chases a tortoise given a head start: in Zeno mode his pursuit breaks into shrinking dashed segments whose gaps collapse geometrically toward a finish flag, with a logarithmic inset showing the gap falling step by step toward machine epsilon"
      />
    </SimFrame>
  );
}
