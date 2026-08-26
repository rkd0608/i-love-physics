"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { paintSky, drawArrow } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CAP = 200;
const MARGIN = 14;
const PISTON_W = 10;
const CORE_R = 3;
const HALO_R = 8;
const PAD = 6;
const TAU = Math.PI * 2;

const WIN = 0.5;
const JCAP = 1024;
const EMA_TAU = 0.12;
const BOOK_EVERY = 10;

const V_REF = 0.69;
const T_REF = 300;
const P_DIV = 4;
const KV = 0.016;
const PISTON_TAU = 0.2;
const VP_MAX = 0.4;
const L_MIN_N = 0.16;
const VL_PER_UNIT = 20;

const FAST_CORE = "#ffd27a";
const MID_CORE = "#b48cf2";
const SLOW_CORE = "#53d6f2";
const PLAIN_CORE = "#9fb3ff";
const FAST_RGB = "255,210,122";
const MID_RGB = "180,140,242";
const SLOW_RGB = "83,214,242";
const PLAIN_RGB = "159,179,255";
const FAST_STOP_IN = `rgba(${FAST_RGB},0.7)`;
const FAST_STOP_OUT = `rgba(${FAST_RGB},0)`;
const MID_STOP_IN = `rgba(${MID_RGB},0.7)`;
const MID_STOP_OUT = `rgba(${MID_RGB},0)`;
const SLOW_STOP_IN = `rgba(${SLOW_RGB},0.7)`;
const SLOW_STOP_OUT = `rgba(${SLOW_RGB},0)`;
const PLAIN_STOP_IN = `rgba(${PLAIN_RGB},0.7)`;
const PLAIN_STOP_OUT = `rgba(${PLAIN_RGB},0)`;
const PISTON_FREE = "rgba(148,163,184,0.92)";
const PISTON_LOCKED = "rgba(251,191,36,0.95)";
const PISTON_EDGE = "rgba(251,191,36,0.65)";
const BORDER_COLOR = "rgba(139,147,184,0.28)";
const LABEL_COLOR = "rgba(139,147,184,0.6)";
const DIVIDER_COLOR = "rgba(196,181,253,0.85)";
const ACCENT = "#fbbf24";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

interface Gas {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
}

interface Ledger {
  t: Float64Array;
  v: Float64Array;
  head: number;
  count: number;
  sum: number;
  pSm: number;
}

interface Stats {
  pMeas: number;
  pPred: number;
  vrms: number;
  vol: number;
}

function makeGas(): Gas {
  return {
    x: new Float32Array(CAP),
    y: new Float32Array(CAP),
    vx: new Float32Array(CAP),
    vy: new Float32Array(CAP),
  };
}

function makeLedger(): Ledger {
  return {
    t: new Float64Array(JCAP),
    v: new Float64Array(JCAP),
    head: 0,
    count: 0,
    sum: 0,
    pSm: 0,
  };
}

function rescaleTo(g: Gas, count: number, targetPx: number): void {
  for (let i = 0; i < count; i++) {
    const sp = Math.hypot(g.vx[i], g.vy[i]);
    if (sp > 0) {
      const s = targetPx / sp;
      g.vx[i] *= s;
      g.vy[i] *= s;
    }
  }
}

function seed(
  g: Gas,
  count: number,
  m: number,
  u: number,
  facePx: number,
  vtPx: number
): void {
  const lo = m + CORE_R + PAD;
  const hiX = Math.max(lo + 1, facePx - CORE_R - PAD);
  const hiY = Math.max(lo + 1, m + u - CORE_R - PAD);
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * TAU;
    const sp = vtPx * (0.55 + 0.9 * Math.random());
    g.vx[i] = Math.cos(ang) * sp;
    g.vy[i] = Math.sin(ang) * sp;
    g.x[i] = lo + Math.random() * (hiX - lo);
    g.y[i] = lo + Math.random() * (hiY - lo);
  }
  rescaleTo(g, count, vtPx);
}

export default function IdealGasLab() {
  const [{ T, Pext, n, color }, updateParams] = useSimParams<{
    T: number;
    Pext: number;
    n: number;
    color: boolean;
  }>({ T: 300, Pext: 100, n: 100, color: true });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [released, setReleased] = useState(false);
  const [stats, setStats] = useState<Stats>({
    pMeas: NaN,
    pPred: NaN,
    vrms: NaN,
    vol: NaN,
  });

  const gasRef = useRef<Gas | null>(null);
  const ledRef = useRef<Ledger | null>(null);
  const nRef = useRef(n);
  const tRef = useRef(T);
  const pextRef = useRef(Pext);
  const pausedRef = useRef(paused);
  const releasedRef = useRef(released);
  const faceRef = useRef(0);
  const vpRef = useRef(0);
  const dimRef = useRef({ w: 640, h: 360 });
  const frameRef = useRef(0);
  const midPxRef = useRef(0);
  const divARef = useRef(0);
  const volKeyRef = useRef(-1);
  const volLabelRef = useRef("");
  const tKeyRef = useRef(-1);
  const tLabelRef = useRef("");
  const pKeyRef = useRef(-1);
  const pLabelRef = useRef("");

  useEffect(() => {
    if (!gasRef.current) gasRef.current = makeGas();
    if (!ledRef.current) ledRef.current = makeLedger();
  }, []);

  useEffect(() => {
    nRef.current = n;
    tRef.current = T;
    pextRef.current = Pext;
    pausedRef.current = paused;
  });

  useEffect(() => {
    const g = gasRef.current;
    const led = ledRef.current;
    if (!g || !led) return;
    const id = requestAnimationFrame(() => {
      const { w, h } = dimRef.current;
      const u = Math.max(h - 2 * MARGIN, 1);
      const m = MARGIN;
      const faceMax = w - m - PISTON_W;
      const lMaxN = Math.max((faceMax - m) / u, L_MIN_N + 0.01);
      const vt = V_REF * Math.sqrt(Math.max(tRef.current, 1) / T_REF);
      const pN = Math.max(pextRef.current / P_DIV, 1e-6);
      const vN = (nRef.current * (vt * vt)) / (2 * pN);
      const lN = Math.min(Math.max(vN, L_MIN_N), lMaxN);
      faceRef.current = m + lN * u;
      vpRef.current = 0;
      releasedRef.current = false;
      setReleased(false);
      divARef.current = 0;
      led.head = 0;
      led.count = 0;
      led.sum = 0;
      led.pSm = pN;
      seed(g, nRef.current, m, u, faceRef.current, vt * u);
      frameRef.current = 0;
    });
    return () => cancelAnimationFrame(id);
  }, [n]);

  useEffect(() => {
    const g = gasRef.current;
    if (!g) return;
    const u = Math.max(dimRef.current.h - 2 * MARGIN, 1);
    rescaleTo(g, nRef.current, V_REF * Math.sqrt(Math.max(T, 1) / T_REF) * u);
  }, [T]);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const measure = (vt: number): void => {
    const g = gasRef.current;
    const led = ledRef.current;
    if (!g || !led) return;
    const u = Math.max(dimRef.current.h - 2 * MARGIN, 1);
    const count = nRef.current;
    let q = 0;
    for (let i = 0; i < count; i++) q += g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i];
    const vrms = count > 0 ? Math.sqrt(q / count) / u : NaN;
    const vN = (faceRef.current - MARGIN) / u;
    const pPred = (count * vt * vt) / (2 * Math.max(vN, 1e-6));
    setStats({
      pMeas: led.pSm * P_DIV,
      pPred: pPred * P_DIV,
      vrms,
      vol: vN * VL_PER_UNIT,
    });
  };

  const release = (): void => {
    const g = gasRef.current;
    if (!g || releasedRef.current) return;
    const u = Math.max(dimRef.current.h - 2 * MARGIN, 1);
    const m = MARGIN;
    const face = faceRef.current;
    let mid = (m + face) / 2;
    mid = Math.max(mid, m + 0.22 * (face - m));
    const lo = m + CORE_R + PAD;
    const hiX = Math.max(lo + 1, mid - CORE_R - PAD);
    const hiY = Math.max(lo + 1, m + u - CORE_R - PAD);
    for (let i = 0; i < nRef.current; i++) {
      g.x[i] = lo + Math.random() * (hiX - lo);
      g.y[i] = lo + Math.random() * (hiY - lo);
    }
    midPxRef.current = mid;
    divARef.current = 1;
    vpRef.current = 0;
    releasedRef.current = true;
    setReleased(true);
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    dt: number
  ): void => {
    dimRef.current.w = w;
    dimRef.current.h = h;
    const g = gasRef.current;
    const led = ledRef.current;
    if (!g || !led) return;
    const m = MARGIN;
    const u = Math.max(h - 2 * MARGIN, 1);
    const count = nRef.current;
    const vt = V_REF * Math.sqrt(Math.max(tRef.current, 1) / T_REF);
    const pN = Math.max(pextRef.current / P_DIV, 1e-6);
    const faceMax = w - m - PISTON_W;
    const lMaxN = Math.max((faceMax - m) / u, L_MIN_N + 0.01);
    const fMin = m + L_MIN_N * u;
    const fMax = m + lMaxN * u;
    const locked = releasedRef.current;

    if (!pausedRef.current) {
      if (!locked) {
        const dP = led.pSm - pN;
        const vT = Math.min(Math.max(KV * dP, -VP_MAX), VP_MAX);
        vpRef.current +=
          (vT - vpRef.current) * Math.min(1, dt / PISTON_TAU);
        let nf = faceRef.current + vpRef.current * dt * u;
        if (nf < fMin) {
          nf = fMin;
          vpRef.current = 0;
        } else if (nf > fMax) {
          nf = fMax;
          vpRef.current = 0;
        }
        faceRef.current = nf;
      }
      const face = faceRef.current;
      const vpPx = vpRef.current * u;
      const left = m + CORE_R;
      const bot = m + CORE_R;
      const top = h - m - CORE_R;
      const lim = face - CORE_R;
      let jAcc = 0;
      for (let i = 0; i < count; i++) {
        const ox = g.x[i];
        let nx = ox + g.vx[i] * dt;
        let ny = g.y[i] + g.vy[i] * dt;
        if (ny < bot) {
          ny = 2 * bot - ny;
          g.vy[i] = -g.vy[i];
        } else if (ny > top) {
          ny = 2 * top - ny;
          g.vy[i] = -g.vy[i];
        }
        if (nx < left) {
          nx = 2 * left - nx;
          g.vx[i] = -g.vx[i];
        }
        if (nx >= lim) {
          if (g.vx[i] > vpPx) {
            jAcc += 2 * (g.vx[i] - vpPx);
            g.vx[i] = 2 * vpPx - g.vx[i];
          }
          nx = lim;
        }
        g.x[i] = nx < left ? left : nx;
        g.y[i] = ny;
      }
      if (jAcc > 0) {
        led.t[led.head] = t;
        led.v[led.head] = jAcc / u;
        led.sum += led.v[led.head];
        led.head = (led.head + 1) % JCAP;
        if (led.count < JCAP) led.count++;
      }
      while (led.count > 0) {
        const tail = (led.head - led.count + JCAP) % JCAP;
        if (led.t[tail] >= t - WIN) break;
        led.sum -= led.v[tail];
        led.count--;
      }
      const pRaw = led.sum / WIN;
      led.pSm += (pRaw - led.pSm) * Math.min(1, dt / EMA_TAU);
      frameRef.current++;
      if (frameRef.current % BOOK_EVERY === 0) measure(vt);
    }

    if (divARef.current > 0) {
      divARef.current = Math.max(0, divARef.current - dt * 1.4);
    }

    paintSky(ctx, w, h);

    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);

    const face = faceRef.current;
    let qSum = 0;
    for (let i = 0; i < count; i++)
      qSum += g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i];
    const vr = count > 0 ? Math.sqrt(qSum / count) / u : 0;

    if (divARef.current > 0) {
      ctx.save();
      ctx.globalAlpha = divARef.current;
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = DIVIDER_COLOR;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(midPxRef.current, m + 4);
      ctx.lineTo(midPxRef.current, h - m - 4);
      ctx.stroke();
      ctx.restore();
    }

    const haloFast = ctx.createRadialGradient(0, 0, 0, 0, 0, HALO_R);
    haloFast.addColorStop(0, FAST_STOP_IN);
    haloFast.addColorStop(1, FAST_STOP_OUT);
    const haloMid = ctx.createRadialGradient(0, 0, 0, 0, 0, HALO_R);
    haloMid.addColorStop(0, MID_STOP_IN);
    haloMid.addColorStop(1, MID_STOP_OUT);
    const haloSlow = ctx.createRadialGradient(0, 0, 0, 0, 0, HALO_R);
    haloSlow.addColorStop(0, SLOW_STOP_IN);
    haloSlow.addColorStop(1, SLOW_STOP_OUT);
    const haloPlain = ctx.createRadialGradient(0, 0, 0, 0, 0, HALO_R);
    haloPlain.addColorStop(0, PLAIN_STOP_IN);
    haloPlain.addColorStop(1, PLAIN_STOP_OUT);
    const tinting = color;

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < count; i++) {
      let halo: CanvasGradient;
      if (!tinting) halo = haloPlain;
      else {
        const s = vr > 0 ? Math.hypot(g.vx[i], g.vy[i]) / vr : 0;
        halo = s > 1.38 ? haloFast : s < 0.72 ? haloSlow : haloMid;
      }
      ctx.save();
      ctx.translate(g.x[i], g.y[i]);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, HALO_R, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < count; i++) {
      let col: string;
      if (!tinting) col = PLAIN_CORE;
      else {
        const s = vr > 0 ? Math.hypot(g.vx[i], g.vy[i]) / vr : 0;
        col = s > 1.38 ? FAST_CORE : s < 0.72 ? SLOW_CORE : MID_CORE;
      }
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(g.x[i], g.y[i], CORE_R, 0, TAU);
      ctx.fill();
    }

    ctx.fillStyle = locked ? PISTON_LOCKED : PISTON_FREE;
    ctx.fillRect(face, m, PISTON_W, h - 2 * m);
    ctx.strokeStyle = PISTON_EDGE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(face, m);
    ctx.lineTo(face, h - m);
    ctx.stroke();

    const vpPx = vpRef.current * u;
    if (!locked && Math.abs(vpPx) > 14) {
      const cy = h / 2;
      const cx0 = face + PISTON_W / 2;
      const len = Math.min(46, Math.abs(vpPx) * 0.35);
      drawArrow(
        ctx,
        cx0,
        cy,
        cx0 + Math.sign(vpPx) * len,
        cy,
        ACCENT,
        2
      );
    }

    ctx.font = MONO_LABEL;
    ctx.fillStyle = LABEL_COLOR;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    if (tKeyRef.current !== tRef.current) {
      tKeyRef.current = tRef.current;
      tLabelRef.current = `T = ${fmt(tRef.current, 0)} K`;
    }
    if (pKeyRef.current !== pextRef.current) {
      pKeyRef.current = pextRef.current;
      pLabelRef.current = `P_ext = ${fmt(pextRef.current, 0)} kPa`;
    }
    const volN = (face - m) / u;
    const volKey = Math.round(volN * VL_PER_UNIT * 10);
    if (volKeyRef.current !== volKey) {
      volKeyRef.current = volKey;
      volLabelRef.current = `V = ${fmt(volN * VL_PER_UNIT, 1)} L`;
    }
    ctx.fillText(tLabelRef.current, m + 10, m + 20);
    ctx.fillText(pLabelRef.current, m + 10, m + 36);
    ctx.fillText(volLabelRef.current, m + 10, h - m - 12);
    if (locked) {
      ctx.fillStyle = ACCENT;
      ctx.fillText("latched", face - 54, m + 20);
    }
  };

  const canvasRef = useSimLoop(draw);

  return (
    <SimFrame
      title="Piston Chamber"
      subtitle="Pressure read from real wall impulses; the piston drifts until measurement meets external load"
      controls={
        <>
          <Slider
            label="Temperature T"
            value={T}
            min={50}
            max={600}
            step={10}
            unit="K"
            onChange={(v) => updateParams({ T: v })}
          />
          <Slider
            label="External pressure Pₑₓₜ"
            value={Pext}
            min={20}
            max={200}
            step={5}
            unit="kPa"
            onChange={(v) => updateParams({ Pext: v })}
          />
          <Slider
            label="Particle count"
            value={n}
            min={30}
            max={200}
            step={10}
            onChange={(v) => updateParams({ n: v })}
          />
          <Toggle
            label="Velocity coloring"
            checked={color}
            onChange={(v) => updateParams({ color: v })}
          />
          {!released ? (
            <ActionButton onClick={release}>Release latch</ActionButton>
          ) : null}
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
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX tex={"PV = nRT"} className="text-sm" />
          <span className="font-mono text-xs">
            <span className="text-muted">P meas </span>
            <span className="text-accent">{fmt(stats.pMeas, 1)}</span>
            <span className="text-muted"> kPa · pred nRT/V </span>
            <span className="text-accent">{fmt(stats.pPred, 1)}</span>
            <span className="text-muted"> kPa</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">V = </span>
            <span className="text-accent">{fmt(stats.vol, 1)}</span>
            <span className="text-muted"> L</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">v_rms = </span>
            <span className="text-accent">{fmt(stats.vrms, 2)}</span>
            <span className="text-muted"> h/s</span>
          </span>
          <p className="w-full text-xs leading-relaxed">
            Press “Release latch” and the divider dissolves: the gas floods
            into the doubled volume, pressure halves, yet v_rms never budges —
            free expansion does no work, so an ideal gas cools not at all and
            the entropy ΔS = nR ln 2 hides in the forgotten positions of
            molecules.
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark chamber of glowing molecules bouncing between fixed walls and an amber piston that drifts until the measured wall pressure matches the external load; labels show temperature, external pressure and live volume, and with velocity coloring on, slow molecules glow cyan, mid-speed violet and fast amber"
      />
    </SimFrame>
  );
}
