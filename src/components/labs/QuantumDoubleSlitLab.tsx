"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { paintSky, glowDot } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CDF_N = 2048;
const MAX_FLIGHT = 40;
const STRIDE = 8;
const FLIGHT_BASE = 0.45;
const FLIGHT_JITTER = 0.1;
const WALL_FRAC = 0.1;
const PLATE_FRAC = 0.52;
const EDGE_PAD = 14;
const SRC_LIFT = 26;
const HUD_SYNC = 0.12;
const DOT = 1.4;

const TEAL = "#2dd4bf";
const TEAL_GLOW = "#5eead4";
const CYAN = "#22d3ee";
const CYAN_GLOW = "#67e8f9";
const VIOLET = "#b48cf2";
const VIOLET_GLOW = "#c4b5fd";
const PLATE_LINE = "rgba(139,147,184,0.55)";
const WALL_LINE = "rgba(139,147,184,0.3)";
const BADGE = "WHICH-PATH CAMERA ON";
const MONO_BADGE = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";

interface CdfCache {
  d: number;
  lam: number;
  len: number;
  x0: number;
  x1: number;
  totalFull: number;
  totalEnv: number;
  full: Float32Array;
  env: Float32Array;
}

function buildCdfs(
  c: CdfCache,
  d: number,
  lam: number,
  L: number,
  x0: number,
  x1: number,
  cx: number
): void {
  const binW = (x1 - x0) / CDF_N;
  const kEnv = (Math.PI * (d / 4)) / (lam * L);
  const kFr = (Math.PI * d) / (lam * L);
  let tf = 0;
  let te = 0;
  for (let i = 0; i < CDF_N; i++) {
    const y = x0 + (i + 0.5) * binW - cx;
    const u = kEnv * y;
    const s = u === 0 ? 1 : Math.sin(u) / u;
    const env = s * s;
    const cf = Math.cos(kFr * y);
    te += env;
    tf += env * cf * cf;
    c.full[i] = tf;
    c.env[i] = te;
  }
  c.totalFull = tf;
  c.totalEnv = te;
  c.d = d;
  c.lam = lam;
  c.len = L;
  c.x0 = x0;
  c.x1 = x1;
}

function sampleBin(cdf: Float32Array, total: number): number {
  const u = Math.random() * total;
  let lo = 0;
  let hi = CDF_N - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid] < u) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function stampDot(
  fctx: CanvasRenderingContext2D,
  fs: number,
  x: number,
  y: number,
  color: string
): void {
  fctx.globalAlpha = 0.55 + Math.random() * 0.45;
  fctx.fillStyle = color;
  fctx.fillRect((x - 0.7) * fs, (y - 0.7) * fs, DOT * fs, DOT * fs);
  fctx.globalAlpha = 1;
}

export default function QuantumDoubleSlitLab() {
  const [{ d, lam: lambda, rate, cam }, updateParams] = useSimParams<{
    d: number;
    lam: number;
    rate: number;
    cam: boolean;
  }>({ d: 120, lam: 24, rate: 300, cam: false });
  const [reduced, setReduced] = useState(false);
  const [clearSeq, setClearSeq] = useState(0);
  const [detections, setDetections] = useState(0);
  const [wallL, setWallL] = useState(Number.NaN);

  const dRef = useRef(d);
  const lamRef = useRef(lambda);
  const rateRef = useRef(rate);
  const camRef = useRef(cam);
  const reducedRef = useRef(reduced);

  useEffect(() => {
    dRef.current = d;
    lamRef.current = lambda;
    rateRef.current = rate;
    camRef.current = cam;
    reducedRef.current = reduced;
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => setReduced(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const poolRef = useRef<Float32Array | null>(null);
  const actRef = useRef<Uint8Array | null>(null);
  const slitRef = useRef<Uint8Array | null>(null);
  const activeCountRef = useRef(0);
  const slotHintRef = useRef(0);
  const emitAccRef = useRef(0);
  const countRef = useRef(0);
  const hudAccRef = useRef(0);
  const lastCountRef = useRef(-1);
  const filmRef = useRef<HTMLCanvasElement | null>(null);
  const filmCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cdfRef = useRef<CdfCache | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const film = filmRef.current;
      const fctx = filmCtxRef.current;
      if (film && fctx) fctx.clearRect(0, 0, film.width, film.height);
      countRef.current = 0;
      setDetections(0);
    });
    return () => cancelAnimationFrame(id);
  }, [clearSeq]);

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const dNow = dRef.current;
    const lamNow = lamRef.current;
    const wallY = h * WALL_FRAC;
    const plateY = h * PLATE_FRAC;
    const srcY = h - SRC_LIFT;
    const cx = w / 2;
    const L = plateY - wallY;
    const x0 = EDGE_PAD;
    const x1 = w - EDGE_PAD;
    const a = dNow / 4;
    const sxA = cx - dNow / 2;
    const sxB = cx + dNow / 2;

    const fw = Math.max(1, Math.round(ctx.canvas.width));
    const fh = Math.max(1, Math.round(ctx.canvas.height));
    let film = filmRef.current;
    let fctx = filmCtxRef.current;
    if (!film || !fctx || film.width !== fw || film.height !== fh) {
      const nf = document.createElement("canvas");
      nf.width = fw;
      nf.height = fh;
      const nc = nf.getContext("2d");
      if (!nc) return;
      if (film && fctx) nc.drawImage(film, 0, 0, fw, fh);
      filmRef.current = nf;
      filmCtxRef.current = nc;
      film = nf;
      fctx = nc;
    }
    const fs = fw / w;

    let cc = cdfRef.current;
    if (!cc) {
      cc = {
        d: Number.NaN,
        lam: Number.NaN,
        len: Number.NaN,
        x0: Number.NaN,
        x1: Number.NaN,
        totalFull: 0,
        totalEnv: 0,
        full: new Float32Array(CDF_N),
        env: new Float32Array(CDF_N),
      };
      cdfRef.current = cc;
    }
    if (
      cc.d !== dNow ||
      cc.lam !== lamNow ||
      cc.len !== L ||
      cc.x0 !== x0 ||
      cc.x1 !== x1
    ) {
      buildCdfs(cc, dNow, lamNow, L, x0, x1, cx);
    }

    if (!poolRef.current || !actRef.current || !slitRef.current) {
      poolRef.current = new Float32Array(MAX_FLIGHT * STRIDE);
      actRef.current = new Uint8Array(MAX_FLIGHT);
      slitRef.current = new Uint8Array(MAX_FLIGHT);
    }
    const pool = poolRef.current;
    const act = actRef.current;
    const slits = slitRef.current;

    const binW = (x1 - x0) / CDF_N;
    emitAccRef.current += dt * rateRef.current;
    let n = Math.floor(emitAccRef.current);
    emitAccRef.current -= n;

    if (reducedRef.current) {
      for (let k = 0; k < n; k++) {
        const bin = camRef.current
          ? sampleBin(cc.env, cc.totalEnv)
          : sampleBin(cc.full, cc.totalFull);
        const lx = x0 + (bin + Math.random()) * binW;
        const sd = Math.random() < 0.5 ? 0 : 1;
        stampDot(
          fctx,
          fs,
          lx,
          wallY,
          camRef.current ? (sd === 0 ? CYAN : VIOLET) : TEAL
        );
      }
      countRef.current += n;
    } else {
      const free = MAX_FLIGHT - activeCountRef.current;
      if (n > free) n = free;
      for (let k = 0; k < n; k++) {
        let tries = 0;
        while (tries < MAX_FLIGHT && act[slotHintRef.current]) {
          slotHintRef.current = (slotHintRef.current + 1) % MAX_FLIGHT;
          tries++;
        }
        if (tries >= MAX_FLIGHT) break;
        const i = slotHintRef.current;
        slotHintRef.current = (slotHintRef.current + 1) % MAX_FLIGHT;
        const bin = camRef.current
          ? sampleBin(cc.env, cc.totalEnv)
          : sampleBin(cc.full, cc.totalFull);
        const lx = x0 + (bin + Math.random()) * binW;
        const sd = Math.random() < 0.5 ? 0 : 1;
        const mx = (sd === 0 ? sxA : sxB) + (Math.random() - 0.5) * a;
        const base = i * STRIDE;
        pool[base] = cx;
        pool[base + 1] = srcY;
        pool[base + 2] = mx;
        pool[base + 3] = plateY;
        pool[base + 4] = lx;
        pool[base + 5] = wallY;
        pool[base + 6] = 0;
        pool[base + 7] = FLIGHT_BASE + Math.random() * FLIGHT_JITTER;
        act[i] = 1;
        slits[i] = sd;
        activeCountRef.current++;
      }
    }

    for (let i = 0; i < MAX_FLIGHT; i++) {
      if (!act[i]) continue;
      const base = i * STRIDE;
      const tt = pool[base + 6] + dt;
      const dur = pool[base + 7];
      if (tt >= dur) {
        stampDot(
          fctx,
          fs,
          pool[base + 4],
          pool[base + 5],
          camRef.current ? (slits[i] === 0 ? CYAN : VIOLET) : TEAL
        );
        act[i] = 0;
        activeCountRef.current--;
        countRef.current++;
        continue;
      }
      pool[base + 6] = tt;
      const p = tt / dur;
      let px: number;
      let py: number;
      if (p < 0.5) {
        const q = p * 2;
        px = pool[base] + (pool[base + 2] - pool[base]) * q;
        py = pool[base + 1] + (pool[base + 3] - pool[base + 1]) * q;
      } else {
        const q = p * 2 - 1;
        px = pool[base + 2] + (pool[base + 4] - pool[base + 2]) * q;
        py = pool[base + 3] + (pool[base + 5] - pool[base + 3]) * q;
      }
      const alpha =
        p < 0.12 ? p / 0.12 : p > 0.78 ? (1 - p) / 0.22 : 1;
      const glowCol = camRef.current
        ? slits[i] === 0
          ? CYAN_GLOW
          : VIOLET_GLOW
        : TEAL_GLOW;
      ctx.globalAlpha = alpha * 0.18;
      ctx.fillStyle = glowCol;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    paintSky(ctx, w, h);
    ctx.drawImage(film, 0, 0, w, h);

    ctx.strokeStyle = WALL_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, wallY);
    ctx.lineTo(x1, wallY);
    ctx.stroke();

    ctx.strokeStyle = PLATE_LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0, plateY);
    ctx.lineTo(sxA - a / 2, plateY);
    ctx.moveTo(sxA + a / 2, plateY);
    ctx.lineTo(sxB - a / 2, plateY);
    ctx.moveTo(sxB + a / 2, plateY);
    ctx.lineTo(x1, plateY);
    ctx.stroke();

    glowDot(ctx, cx, srcY, 5, TEAL);

    if (camRef.current) {
      ctx.font = MONO_BADGE;
      ctx.textAlign = "right";
      ctx.fillStyle = VIOLET_GLOW;
      ctx.fillText(BADGE, x1, wallY - 8);
      ctx.textAlign = "left";
    }

    hudAccRef.current += dt;
    if (hudAccRef.current >= HUD_SYNC) {
      hudAccRef.current = 0;
      if (countRef.current !== lastCountRef.current) {
        lastCountRef.current = countRef.current;
        setDetections(countRef.current);
      }
      setWallL(L);
    }
  };

  const canvasRef = useSimLoop(draw);

  const dyPx = (lambda * wallL) / d;

  return (
    <SimFrame
      title="Single-Particle Buildup"
      subtitle="Every dot is one detection; the fringes belong to none of them"
      controls={
        <>
          <Slider
            label="Slit separation d"
            value={d}
            min={40}
            max={300}
            step={5}
            unit="px"
            onChange={(v) => updateParams({ d: v })}
          />
          <Slider
            label="Wavelength λ"
            value={lambda}
            min={8}
            max={60}
            step={1}
            unit="px"
            onChange={(v) => updateParams({ lam: v })}
          />
          <Slider
            label="Emission rate"
            value={rate}
            min={50}
            max={1000}
            step={50}
            unit="/s"
            onChange={(v) => updateParams({ rate: v })}
          />
          <Toggle
            label="Which-path camera"
            checked={cam}
            onChange={(v) => updateParams({ cam: v })}
          />
          <ActionButton onClick={() => setClearSeq((s) => s + 1)}>
            Clear film
          </ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`|\psi|^2 = \left|\psi_1 + \psi_2\right|^2`}
            className="text-sm"
          />
          <p className="font-mono text-xs">
            <span className="text-muted">Δy = λL/d = </span>
            <span className="text-accent">{fmt(dyPx, 1)}</span>
            <span className="text-muted"> px · detections </span>
            <span className="text-accent">{fmt(detections, 0)}</span>
            <span className="text-muted"> · visibility V = </span>
            <span className="text-accent">{cam ? "0" : "1"}</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark buildup film where particles fired one at a time from a source below a two-slit plate land on a wall above, slowly tracing interference fringes; with the which-path camera on, fringes vanish and detections are tinted cyan or violet by the slit taken"
      />
    </SimFrame>
  );
}
