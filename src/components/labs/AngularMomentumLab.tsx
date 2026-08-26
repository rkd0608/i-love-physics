"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { drawArrow, glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const TEAL = "#14b8a6";
const GOLD = "#ffd27a";
const DECAY = "#ff6b6b";
const MUTED = "#8b93b8";
const TRACK = "rgba(139,147,184,0.14)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_TAG = "12px ui-monospace, SFMono-Regular, Menlo, monospace";

const RM = 0.01;
const PULL_R = 20;
const EXTEND_R = 120;
const ANIM_DUR = 0.6;
const FLASH_T = 1.2;
const FRICTION_C = 0.15;
const STAT_INTERVAL = 0.15;
const BLUR_SEGS = 9;
const BLUR_TIME = 0.5;
const BLUR_MAX_SPAN = 1.7;
const BODY_MIN_PX = 16;
const BODY_GAIN_PX = 22;
const EXTENT_PX = BODY_MIN_PX + BODY_GAIN_PX + EXTEND_R;
const TAU = Math.PI * 2;

type SimState = {
  theta: number;
  L: number;
  init: boolean;
  animOn: boolean;
  animA: number;
  animB: number;
  animT: number;
  flash: number;
  maxL: number;
  statClock: number;
};

type Stats = { L: number; K: number; I: number };

function inertiaOf(rPx: number, i0: number): number {
  const m = rPx * RM;
  return i0 + 2 * m * m;
}

function easeInOut(u: number): number {
  const q = -2 * u + 2;
  return u < 0.5 ? 4 * u * u * u : 1 - (q * q * q) / 2;
}

function effRadius(s: SimState, armR: number): number {
  if (!s.animOn) return armR;
  const u = Math.min(s.animT / ANIM_DUR, 1);
  return s.animA + (s.animB - s.animA) * easeInOut(u);
}

const valCache = new Map<number, string>();

function valLabel(v: number): string {
  const key = Math.round(v * 20);
  let s = valCache.get(key);
  if (s === undefined) {
    if (valCache.size > 512) valCache.clear();
    s = fmt(key / 20, 2);
    valCache.set(key, s);
  }
  return s;
}

export default function AngularMomentumLab() {
  const [
    { r: armR, i0, w0, fric },
    updateParams,
  ] = useSimParams<{ r: number; i0: number; w0: number; fric: boolean }>({
    r: 110,
    i0: 0.4,
    w0: 1.5,
    fric: false,
  });
  const [paused, setPaused] = useState(false);
  const [rm, setRm] = useState(false);
  const [stats, setStats] = useState<Stats>({ L: 0, K: 0, I: 0 });

  const cfg = useRef({ armR: 110, i0: 0.4, w0: 1.5, fric: false, paused: false });

  useEffect(() => {
    const c = cfg.current;
    c.armR = armR;
    c.i0 = i0;
    c.w0 = w0;
    c.fric = fric;
    c.paused = paused;
  });

  const sim = useRef<SimState>({
    theta: 0,
    L: 0,
    init: false,
    animOn: false,
    animA: 0,
    animB: 0,
    animT: 0,
    flash: 0,
    maxL: 1e-9,
    statClock: STAT_INTERVAL,
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setRm(true);
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const reseed = (): void => {
    const s = sim.current;
    s.L = inertiaOf(effRadius(s, cfg.current.armR), cfg.current.i0) * cfg.current.w0;
    s.maxL = Math.max(Math.abs(s.L), 1e-9);
  };

  const startArmAnim = (target: number, flash: boolean): void => {
    const s = sim.current;
    s.animA = effRadius(s, cfg.current.armR);
    s.animB = target;
    s.animT = 0;
    s.animOn = true;
    if (flash) s.flash = FLASH_T;
  };

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const c = cfg.current;
    const s = sim.current;

    if (!s.init) {
      reseed();
      s.init = true;
    }

    if (!c.paused) {
      if (s.animOn) {
        s.animT += dt;
        if (s.animT >= ANIM_DUR) {
          s.animT = ANIM_DUR;
          s.animOn = false;
          updateParams({ r: s.animB });
        }
      }
      if (s.flash > 0) s.flash = Math.max(0, s.flash - dt);
    }

    const rEff = effRadius(s, c.armR);
    const I = inertiaOf(rEff, c.i0);
    let omega = s.L / I;

    if (!c.paused && c.fric && omega !== 0) {
      s.L -= FRICTION_C * omega * dt;
      omega = s.L / I;
    }
    if (!c.paused) {
      s.theta += omega * dt;
      if (s.theta > TAU) s.theta -= TAU;
      else if (s.theta < -TAU) s.theta += TAU;
      const absL = s.L < 0 ? -s.L : s.L;
      if (absL > s.maxL) s.maxL = absL;
    }
    const speed = omega < 0 ? -omega : omega;

    s.statClock += dt;
    if (s.statClock >= STAT_INTERVAL) {
      s.statClock = 0;
      setStats({ L: s.L, K: 0.5 * I * omega * omega, I });
    }

    paintSky(ctx, w, h);

    const cx = w * 0.34;
    const cy = h * 0.52;
    const scale = Math.min(1, Math.min(w * 0.3, h * 0.44) / EXTENT_PX);
    const bodyR = (BODY_MIN_PX + c.i0 * BODY_GAIN_PX) * scale;
    const armLen = rEff * scale;

    ctx.strokeStyle = TRACK;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(w * 0.555) + 0.5, h * 0.12);
    ctx.lineTo(Math.round(w * 0.555) + 0.5, h * 0.88);
    ctx.stroke();

    ctx.setLineDash([3, 5]);
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = MUTED;
    ctx.beginPath();
    ctx.arc(cx, cy, armLen, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    if (speed > 0.15 && armLen > bodyR + 3) {
      const span = Math.min(speed * BLUR_TIME, BLUR_MAX_SPAN);
      const dir = omega >= 0 ? 1 : -1;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (let j = 0; j < BLUR_SEGS; j += 1) {
        const aHi = s.theta - dir * (span * j) / BLUR_SEGS;
        const aLo = s.theta - dir * (span * (j + 1)) / BLUR_SEGS;
        ctx.globalAlpha = (1 - j / BLUR_SEGS) * 0.32 * Math.min(speed / 2, 1);
        ctx.beginPath();
        ctx.arc(cx, cy, armLen, Math.min(aLo, aHi), Math.max(aLo, aHi));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    glowDot(ctx, cx, cy, 3.5, TEAL);

    ctx.fillStyle = "rgba(20,184,166,0.13)";
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(cx, cy, bodyR, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = MONO_SMALL;
    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("I₀", cx, cy);

    const hx0 = cx + Math.cos(s.theta) * armLen;
    const hy0 = cy + Math.sin(s.theta) * armLen;
    const hx1 = cx - (hx0 - cx);
    const hy1 = cy - (hy0 - cy);

    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(hx0, hy0);
    ctx.moveTo(cx, cy);
    ctx.lineTo(hx1, hy1);
    ctx.stroke();

    glowDot(ctx, hx0, hy0, 4.5, GOLD);
    glowDot(ctx, hx1, hy1, 4.5, GOLD);

    const dirSign = omega >= 0 ? 1 : -1;
    const tx = -Math.sin(s.theta) * dirSign;
    const ty = Math.cos(s.theta) * dirSign;
    const axR = armLen + 13 * scale;
    const ax = cx + Math.cos(s.theta) * axR;
    const ay = cy + Math.sin(s.theta) * axR;
    const alen = Math.min(10 + speed * 6, 44) * (0.65 + 0.35 * scale);
    drawArrow(
      ctx,
      ax - tx * alen * 0.35,
      ay - ty * alen * 0.35,
      ax + tx * alen * 0.65,
      ay + ty * alen * 0.65,
      GOLD,
      1.5
    );

    if (s.flash > 0) {
      const u = s.flash / FLASH_T;
      ctx.globalAlpha = Math.min(1, u * 1.4);
      ctx.fillStyle = GOLD;
      ctx.font = MONO_TAG;
      ctx.fillText("+ΔK = work", cx, cy - (EXTEND_R + 36) * scale - (1 - u) * 12);
      ctx.globalAlpha = 1;
    }

    const labX = w * 0.585;
    const barL = w * 0.62;
    const barR = w - 74;
    const trackW = barR - barL;
    const barH = 9;
    const titleY = h * 0.16;
    const row1 = h * 0.34;
    const row2 = h * 0.56;

    ctx.textAlign = "left";
    ctx.fillStyle = MUTED;
    ctx.font = MONO_SMALL;
    ctx.fillText("LEDGER", barL, titleY);

    const lFrac = Math.min(1, (s.L < 0 ? -s.L : s.L) / s.maxL);
    const kCeil = s.L * s.L / (2 * inertiaOf(PULL_R, c.i0));
    const kFrac = kCeil > 1e-9 ? Math.min(1, (0.5 * I * omega * omega) / kCeil) : 0;

    ctx.fillStyle = TRACK;
    ctx.fillRect(barL, row1, trackW, barH);
    ctx.fillStyle = c.fric ? DECAY : TEAL;
    ctx.fillRect(barL, row1, trackW * lFrac, barH);
    ctx.fillStyle = MUTED;
    ctx.fillText("L", labX, row1 + barH / 2 + 0.5);
    ctx.textAlign = "left";
    ctx.fillStyle = c.fric ? DECAY : TEAL;
    ctx.fillText(valLabel(s.L), barR + 10, row1 + barH / 2 + 0.5);
    ctx.fillStyle = c.fric ? DECAY : MUTED;
    ctx.textAlign = "right";
    ctx.fillText(c.fric ? "τ = −cω" : "pinned", barR, row1 + barH + 12);

    ctx.fillStyle = TRACK;
    ctx.fillRect(barL, row2, trackW, barH);
    ctx.fillStyle = GOLD;
    ctx.fillRect(barL, row2, trackW * kFrac, barH);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("K", labX, row2 + barH / 2 + 0.5);
    ctx.textAlign = "left";
    ctx.fillStyle = GOLD;
    ctx.fillText(valLabel(0.5 * I * omega * omega), barR + 10, row2 + barH / 2 + 0.5);
    ctx.fillStyle = MUTED;
    ctx.textAlign = "right";
    ctx.fillText("ceiling L²/2I_min", barR, row2 + barH + 12);

    ctx.textAlign = "center";
  };

  const canvasRef = useSimLoop(draw);

  return (
    <SimFrame
      title="Figure Skater · Top-Down View"
      subtitle="Hand masses m = 1 each · zero external torque about the axis"
      controls={
        <>
          <Slider
            label="Arm radius"
            value={armR}
            min={20}
            max={120}
            step={2}
            unit="px"
            onChange={(v) => {
              sim.current.animOn = false;
              updateParams({ r: v });
            }}
          />
          <Slider
            label="Body inertia I₀"
            value={i0}
            min={0.1}
            max={1}
            step={0.05}
            onChange={(v) => updateParams({ i0: v })}
          />
          <Slider
            label="Initial spin ω₀"
            value={w0}
            min={0.5}
            max={4}
            step={0.1}
            unit="rad/s"
            onChange={(v) => {
              updateParams({ w0: v });
              reseed();
            }}
          />
          <Toggle label="Friction" checked={fric} onChange={(v) => updateParams({ fric: v })} />
          <ActionButton onClick={() => startArmAnim(PULL_R, true)}>Pull arms in</ActionButton>
          <ActionButton onClick={() => startArmAnim(EXTEND_R, false)}>Extend arms</ActionButton>
          {rm ? (
            <ActionButton tone="ghost" onClick={() => setPaused((p) => !p)}>
              {paused ? "Play" : "Pause"}
            </ActionButton>
          ) : null}
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="flex items-center gap-2">
            <TeX tex={`L = I\\,\\omega = ${fmt(stats.L, 2)}`} className="text-sm" />
            {fric ? (
              <span
                className="rounded border px-1.5 py-0.5 font-mono text-[10px]"
                style={{ color: DECAY, borderColor: "rgba(255,107,107,0.4)" }}
              >
                τ = −cω
              </span>
            ) : (
              <span className="rounded border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                conserved
              </span>
            )}
          </span>
          <TeX
            tex={`K_{\\text{rot}} = \\tfrac{1}{2}I\\omega^{2} = ${fmt(stats.K, 2)}`}
            className="text-sm"
          />
          <TeX tex={`I = ${fmt(stats.I, 2)}`} className="text-sm" />
          <span className="text-xs text-muted">
            Friction off, L stays pinned while K rises — the gap is muscle work.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Top-down figure skater: glowing central pivot inside a translucent body disc marked I₀, two gold hand masses on radial spinning arms with motion-blur trails, a tangential direction arrow, and ledger bars tracking angular momentum L and rotational kinetic energy K"
      />
    </SimFrame>
  );
}
