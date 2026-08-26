"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const LIME = "#a3e635";
const CYAN = "#53d6f2";
const VIOLET = "#a78bfa";
const CHAOS_COLOR = "#fb923c";
const MUTED = "rgba(139,147,184,0.7)";
const FAINT = "rgba(139,147,184,0.35)";
const TAG = "rgba(139,147,184,0.55)";
const PARABOLA_COLOR = "rgba(230,235,255,0.85)";
const BAR_COLOR = "rgba(101,163,13,0.8)";
const HAIRLINE = "rgba(230,235,255,0.07)";

const R_MIN = 2.5;
const R_MAX = 4;
const COLS = 480;
const BIF_H = 320;
const WARMUP = 120;
const PLOT_N = 80;
const X0 = 0.4;
const CASCADE = [3, 3.449, 3.544, 3.5699];

const BIF_FRAC = 0.55;
const COB_FRAC = 0.25;
const COB_PAD = 12;
const COB_KEEP = 25;
const COB_CAP = 32;
const SER_N = 96;
const ADVANCE = 0.09;
const MAX_STEPS = 4;
const REGIME_WIN = 64;
const REGIME_MIN = 32;
const STEADY_TOL = 1e-3;
const RESEED_EPS = 1e-6;
const READ_EVERY = 0.15;

const MONO_LABEL = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_TAG = "500 9px ui-monospace, SFMono-Regular, Menlo, monospace";

interface Readout {
  r: number;
  xStar: number;
  regime: string;
  x: number;
}

type SimStore = {
  r: number;
  seed: number;
  x: number;
  running: boolean;
  acc: number;
  uiT: number;
  cob: Float64Array;
  cobHead: number;
  cobLen: number;
  ser: Float64Array;
  serHead: number;
  serLen: number;
  code: number;
  regime: string;
};

function serAt(buf: Float64Array, head: number, len: number, i: number): number {
  return buf[(head - len + i + SER_N) % SER_N];
}

function resetOrbit(st: SimStore): void {
  st.x = st.seed;
  st.cob[0] = st.seed;
  st.ser[0] = st.seed;
  st.cobHead = 1;
  st.cobLen = 1;
  st.serHead = 1;
  st.serLen = 1;
  st.acc = 0;
}

function createSim(seed: number): SimStore {
  const st: SimStore = {
    r: 3.2,
    seed,
    x: seed,
    running: true,
    acc: 0,
    uiT: 0,
    cob: new Float64Array(COB_CAP),
    cobHead: 0,
    cobLen: 0,
    ser: new Float64Array(SER_N),
    serHead: 0,
    serLen: 0,
    code: -1,
    regime: "sampling",
  };
  resetOrbit(st);
  return st;
}

function iterate(st: SimStore): void {
  st.x = st.r * st.x * (1 - st.x);
  st.cob[st.cobHead] = st.x;
  st.cobHead = (st.cobHead + 1) % COB_CAP;
  if (st.cobLen < COB_CAP) st.cobLen++;
  st.ser[st.serHead] = st.x;
  st.serHead = (st.serHead + 1) % SER_N;
  if (st.serLen < SER_N) st.serLen++;
}

function classify(st: SimStore): number {
  const n = st.serLen;
  if (n < REGIME_MIN) return -1;
  const win = Math.min(REGIME_WIN, n);
  let lo = 1;
  let hi = 0;
  for (let i = 0; i < win; i++) {
    const v = serAt(st.ser, st.serHead, st.serLen, i);
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const spread = hi - lo;
  if (spread < STEADY_TOL) return 0;
  const tol = STEADY_TOL + spread * 0.02;
  for (let p = 1; p <= 8; p++) {
    let ok = true;
    for (let i = 0; i + p < win; i++) {
      if (
        Math.abs(
          serAt(st.ser, st.serHead, st.serLen, i) -
            serAt(st.ser, st.serHead, st.serLen, i + p)
        ) > tol
      ) {
        ok = false;
        break;
      }
    }
    if (ok) return p === 1 ? 0 : p;
  }
  return 99;
}

function regimeLabel(code: number): string {
  if (code < 0) return "sampling";
  if (code === 0) return "steady";
  if (code === 99) return "chaotic";
  return `cycle-${code}`;
}

function buildBifurcation(): HTMLCanvasElement {
  const off = document.createElement("canvas");
  off.width = COLS;
  off.height = BIF_H;
  const cctx = off.getContext("2d");
  const img = cctx?.createImageData(COLS, BIF_H);
  if (!cctx || !img) return off;
  const counts = new Uint16Array(COLS * BIF_H);
  for (let c = 0; c < COLS; c++) {
    const r = R_MIN + (c / (COLS - 1)) * (R_MAX - R_MIN);
    let x = X0;
    for (let i = 0; i < WARMUP; i++) x = r * x * (1 - x);
    for (let i = 0; i < PLOT_N; i++) {
      x = r * x * (1 - x);
      const row = ((1 - x) * (BIF_H - 1)) | 0;
      counts[row * COLS + c]++;
    }
  }
  const data = img.data;
  for (let i = 0; i < counts.length; i++) {
    const a = counts[i];
    if (a === 0) continue;
    const j = i * 4;
    data[j] = 132;
    data[j + 1] = 204;
    data[j + 2] = 34;
    data[j + 3] = Math.min(225, 64 + a * 48);
  }
  cctx.putImageData(img, 0, 0);
  return off;
}

export default function LogisticMapLab() {
  const simRef = useRef<SimStore | null>(null);
  const bifRef = useRef<HTMLCanvasElement | null>(null);
  const [
    { r, seed, cobweb, series },
    updateParams,
  ] = useSimParams<{ r: number; seed: number; cobweb: boolean; series: boolean }>({
    r: 3.2,
    seed: 0.4,
    cobweb: true,
    series: true,
  });
  const [running, setRunning] = useState(true);
  const [readout, setReadout] = useState<Readout>({
    r: 3.2,
    xStar: 1 - 1 / 3.2,
    regime: "sampling",
    x: 0.4,
  });

  const getSim = useCallback((): SimStore => {
    if (!simRef.current) simRef.current = createSim(0.4);
    return simRef.current;
  }, []);

  useEffect(() => {
    const st = getSim();
    st.r = r;
    st.seed = seed;
    resetOrbit(st);
  }, [r, seed, getSim]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      getSim().running = false;
      setRunning(false);
    });
    return () => cancelAnimationFrame(id);
  }, [getSim]);

  const toggleRunning = (): void => {
    const st = getSim();
    st.running = !st.running;
    setRunning(st.running);
  };

  const reseed = (): void => {
    const st = getSim();
    st.x = Math.min(st.x + RESEED_EPS, 1);
  };

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    const st = getSim();
    paintSky(ctx, w, h);

    if (!bifRef.current) {
      const t0 = performance.now();
      bifRef.current = buildBifurcation();
      const ms = (performance.now() - t0).toFixed(1);
      console.info(
        `[logistic-map] bifurcation precompute ${COLS}×${BIF_H} in ${ms} ms (lazy, client-only)`
      );
    }

    if (st.running) {
      st.acc += dt;
      let n = 0;
      while (st.acc >= ADVANCE && n < MAX_STEPS) {
        iterate(st);
        st.acc -= ADVANCE;
        n++;
      }
      if (n === MAX_STEPS) st.acc = 0;
    }

    const code = classify(st);
    if (code !== st.code) {
      st.code = code;
      st.regime = regimeLabel(code);
    }

    const bifH = Math.floor(h * BIF_FRAC);
    const cobY = bifH;
    const cobH = h * COB_FRAC;
    const serY = cobY + cobH;
    const serH = h - serY;

    ctx.drawImage(bifRef.current, 0, 0, w, bifH);

    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < CASCADE.length; i++) {
      const hx = ((CASCADE[i] - R_MIN) / (R_MAX - R_MIN)) * w;
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx, bifH);
    }
    ctx.stroke();

    const cursorX = ((st.r - R_MIN) / (R_MAX - R_MIN)) * w;
    ctx.strokeStyle = LIME;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(cursorX, 0);
    ctx.lineTo(cursorX, bifH);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = MONO_LABEL;
    ctx.fillStyle = MUTED;
    const tickY = bifH - 8;
    const tx = (rv: number): number =>
      ((rv - R_MIN) / (R_MAX - R_MIN)) * w;
    ctx.textAlign = "left";
    ctx.fillText("2.5", 6, tickY);
    ctx.textAlign = "center";
    ctx.fillText("3.0", tx(3), tickY);
    ctx.fillText("3.5", tx(3.5), tickY);
    ctx.textAlign = "right";
    ctx.fillText("4.0", w - 6, tickY);

    ctx.strokeStyle = FAINT;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cobY + 0.5);
    ctx.lineTo(w, cobY + 0.5);
    ctx.moveTo(0, serY + 0.5);
    ctx.lineTo(w, serY + 0.5);
    ctx.stroke();

    ctx.font = MONO_TAG;
    ctx.fillStyle = TAG;
    ctx.textAlign = "left";
    ctx.fillText("BIFURCATION · r → x", 10, 14);
    ctx.fillText("TIME SERIES · LAST 96", 10, serY + 13);

    const side = Math.min(w * 0.5, cobH - COB_PAD * 2);
    const ox = COB_PAD + 2;
    const oy = cobY + (cobH - side) / 2;

    if (cobweb && side > 10) {
      ctx.strokeStyle = PARABOLA_COLOR;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= 96; i++) {
        const u = i / 96;
        const py = oy + (1 - st.r * u * (1 - u)) * side;
        if (i === 0) ctx.moveTo(ox, py);
        else ctx.lineTo(ox + u * side, py);
      }
      ctx.stroke();

      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ox, oy + side);
      ctx.lineTo(ox + side, oy);
      ctx.stroke();
      ctx.setLineDash([]);

      const keep = Math.min(st.cobLen, COB_KEEP);
      if (keep > 1) {
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 1.75;
        ctx.lineJoin = "round";
        ctx.beginPath();
        let idx = (st.cobHead - keep + COB_CAP) % COB_CAP;
        const v0 = st.cob[idx];
        ctx.moveTo(ox + v0 * side, oy + (1 - v0) * side);
        for (let k = 1; k < keep; k++) {
          const a = st.cob[idx];
          idx = (idx + 1) % COB_CAP;
          const b = st.cob[idx];
          ctx.lineTo(ox + a * side, oy + (1 - b) * side);
          ctx.lineTo(ox + b * side, oy + (1 - b) * side);
        }
        ctx.stroke();
      }

      glowDot(ctx, ox + st.x * side, oy + (1 - st.x) * side, 3.5, LIME);

      if (st.r > 1 && st.r < 3) {
        const xs = 1 - 1 / st.r;
        ctx.strokeStyle = VIOLET;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ox + xs * side, oy + (1 - xs) * side, 3.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = MONO_TAG;
        ctx.fillStyle = VIOLET;
        ctx.textAlign = "left";
        ctx.fillText("x*", ox + xs * side + 6, oy + (1 - xs) * side - 4);
      }
    }

    ctx.font = MONO_LABEL;
    ctx.textAlign = "right";
    ctx.fillStyle =
      st.code === 99
        ? CHAOS_COLOR
        : st.code === 0
          ? LIME
          : st.code < 0
            ? MUTED
            : CYAN;
    ctx.fillText(st.regime, w - 12, cobY + 18);

    if (series) {
      const base = serY + serH - 6;
      const avail = serH - 24;
      const bw = w / SER_N;
      ctx.fillStyle = BAR_COLOR;
      ctx.beginPath();
      for (let i = 0; i < st.serLen; i++) {
        const v = serAt(st.ser, st.serHead, st.serLen, i);
        const bh = v * avail;
        ctx.rect(i * bw + 0.5, base - bh, Math.max(1, bw - 1.5), bh);
      }
      ctx.fill();
      if (st.serLen > 0) {
        const lv = st.ser[(st.serHead - 1 + SER_N) % SER_N];
        ctx.fillStyle = LIME;
        ctx.fillRect(
          (st.serLen - 1) * bw + 0.5,
          base - lv * avail,
          Math.max(1, bw - 1.5),
          lv * avail
        );
      }
      ctx.strokeStyle = FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, base + 0.5);
      ctx.lineTo(w, base + 0.5);
      ctx.stroke();
    }

    st.uiT += dt;
    if (st.uiT >= READ_EVERY) {
      st.uiT = 0;
      setReadout({
        r: st.r,
        xStar: 1 - 1 / st.r,
        regime: st.regime,
        x: st.x,
      });
    }
  });

  return (
    <SimFrame
      title="Logistic Map"
      subtitle="Chaos hiding inside one multiplication"
      controls={
        <>
          <Slider
            label="Growth rate r"
            value={r}
            min={2.5}
            max={4}
            step={0.001}
            format={(v) => fmt(v, 3)}
            onChange={(v) => updateParams({ r: v })}
          />
          <Slider
            label="Seed x₀"
            value={seed}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={(v) => updateParams({ seed: v })}
          />
          <Toggle
            label="Cobweb plot"
            checked={cobweb}
            onChange={(v) => updateParams({ cobweb: v })}
          />
          <Toggle
            label="Time series"
            checked={series}
            onChange={(v) => updateParams({ series: v })}
          />
          <ActionButton tone="ghost" onClick={toggleRunning}>
            {running ? "Pause" : "Play"}
          </ActionButton>
          <ActionButton onClick={reseed}>Reseed</ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`x_{n+1} = ${fmt(readout.r, 3)}\,x_n(1-x_n)`}
            className="text-sm"
          />
          <TeX
            tex={String.raw`x^{*} = 1 - \tfrac{1}{${fmt(readout.r, 3)}} = ${fmt(
              readout.xStar,
              4
            )}`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">regime: </span>
            <span className="text-accent">{readout.regime}</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">xₙ = </span>
            <span className="text-accent">{fmt(readout.x, 4)}</span>
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Three stacked dark-canvas views of the logistic map: a green bifurcation diagram sweeping growth rate from 2.5 to 4 with a lime cursor tracking the slider, a cobweb plot bouncing between the parabola and the diagonal with a glowing current iterate, and a scrolling green time-series strip of the last ninety-six iterates"
      />
    </SimFrame>
  );
}
