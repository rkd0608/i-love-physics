"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CYAN = "#53d6f2";
const VIOLET = "#b48cf2";
const AMBER = "#fbbf24";
const MUTED = "#8b93b8";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MARGIN_X = 40;
const TOTAL_MARGIN = 80;
const WALL_HALF = 46;
const NODE_LABELS = ["N₁", "N₂", "N₃", "N₄", "N₅"];
const SUBS = ["", "₁", "₂", "₃", "₄", "₅", "₆"];
const FIXED_LABEL = "fixed";
const TAU = Math.PI * 2;

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = cx + rad * Math.cos(ang);
    const py = cy + rad * Math.sin(ang);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function StandingWavesLab() {
  const [
    { n, v, amp, ts, octave },
    updateParams,
  ] = useSimParams<{
    n: number;
    v: number;
    amp: number;
    ts: number;
    octave: boolean;
  }>({
    n: 3,
    v: 100,
    amp: 16,
    ts: 1,
    octave: false,
  });
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [stringL, setStringL] = useState(Number.NaN);

  const phaseNRef = useRef(0);
  const phaseORef = useRef(0);
  const lastLRef = useRef(Number.NaN);

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const omega1 = Number.isFinite(stringL) ? v / (2 * stringL) : Number.NaN;
  const fN = n * omega1;
  const lambdaN = Number.isFinite(stringL) ? (2 * stringL) / n : Number.NaN;
  const modeLabel = `mode n = ${n}`;

  const canvasRef = useSimLoop((ctx, w, h, _t, dt) => {
    const L = w - TOTAL_MARGIN;
    if (L !== lastLRef.current) {
      lastLRef.current = L;
      setStringL(L);
    }
    if (!(L > 0)) return;

    if (playing && dt > 0) {
      const omegaBase = v / (2 * L);
      phaseNRef.current =
        (phaseNRef.current + n * omegaBase * dt * ts) % TAU;
      phaseORef.current = (phaseORef.current + 2 * omegaBase * dt * ts) % TAU;
    }
    const cN = Math.cos(phaseNRef.current);
    const cO = Math.cos(phaseORef.current);

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const xl = MARGIN_X;
    const xr = w - MARGIN_X;
    const cy = h * 0.48;

    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xl, cy - WALL_HALF);
    ctx.lineTo(xl, cy + WALL_HALF);
    ctx.moveTo(xr, cy - WALL_HALF);
    ctx.lineTo(xr, cy + WALL_HALF);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    for (let j = 0; j < 4; j += 1) {
      const yy = cy - 42 + j * 26;
      ctx.moveTo(xl, yy);
      ctx.lineTo(xl - 9, yy - 9);
      ctx.moveTo(xr, yy);
      ctx.lineTo(xr + 9, yy - 9);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    const ay = Math.round(cy) + 0.5;
    ctx.moveTo(xl + 1, ay);
    ctx.lineTo(xr - 1, ay);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const kn = (n * Math.PI) / L;
    const k2 = (2 * Math.PI) / L;
    const octAmp = octave ? amp : 0;

    ctx.setLineDash([4, 4]);
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = MUTED;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const envStep = 4;
    const envCount = Math.max(2, Math.ceil(L / envStep));
    for (let i = 0; i <= envCount; i += 1) {
      const u = (i * L) / envCount;
      const e =
        2 * amp * Math.abs(Math.sin(kn * u)) +
        octAmp * Math.abs(Math.sin(k2 * u));
      const px = xl + u;
      if (i === 0) ctx.moveTo(px, cy - e);
      else ctx.lineTo(px, cy - e);
    }
    for (let i = envCount; i >= 0; i -= 1) {
      const u = (i * L) / envCount;
      const e =
        2 * amp * Math.abs(Math.sin(kn * u)) +
        octAmp * Math.abs(Math.sin(k2 * u));
      ctx.lineTo(xl + u, cy + e);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    ctx.strokeStyle = CYAN;
    ctx.beginPath();
    const segs = Math.max(2, Math.floor(L / 2));
    for (let i = 0; i <= segs; i += 1) {
      const u = (i * L) / segs;
      const yP = 2 * amp * Math.sin(kn * u) * cN;
      const yOct = octave ? amp * Math.sin(k2 * u) * cO : 0;
      const py = cy - yP - yOct;
      const px = xl + u;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = MONO_SMALL;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let j = 1; j < n; j += 1) {
      const nx = xl + (j * L) / n;
      glowDot(ctx, nx, cy, 3.5, VIOLET);
      ctx.fillStyle = VIOLET;
      ctx.fillText(NODE_LABELS[j - 1], nx, cy + 12);
    }

    for (let i = 0; i < n; i += 1) {
      const ax = xl + ((i + 0.5) * L) / n;
      drawStar(ctx, ax, cy, 6, AMBER);
    }

    ctx.fillStyle = MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(FIXED_LABEL, xl, cy - WALL_HALF - 8);
    ctx.fillText(FIXED_LABEL, xr, cy - WALL_HALF - 8);
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(modeLabel, xl + 4, 10);
    ctx.textAlign = "center";
  });

  return (
    <SimFrame
      title="Standing Waves on a String"
      subtitle="Fixed ends, quantized harmonics · closed form y(x,t)"
      controls={
        <>
          <Slider
            label="Harmonic n"
            value={n}
            min={1}
            max={6}
            step={1}
            onChange={(val) => updateParams({ n: val })}
          />
          <Slider
            label="Wave speed v"
            value={v}
            min={40}
            max={200}
            step={5}
            unit="px/s"
            onChange={(val) => updateParams({ v: val })}
          />
          <Slider
            label="Amplitude A"
            value={amp}
            min={5}
            max={24}
            step={1}
            unit="px"
            onChange={(val) => updateParams({ amp: val })}
          />
          <Slider
            label="Time scale"
            value={ts}
            min={0}
            max={3}
            step={0.1}
            unit="×"
            onChange={(val) => updateParams({ ts: val })}
          />
          <Toggle
            label="Add octave"
            checked={octave}
            onChange={(val) => updateParams({ octave: val })}
          />
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
            tex={
              Number.isFinite(stringL)
                ? String.raw`f_n = \frac{nv}{2L} = ${fmt(fN, 2)}\,\text{Hz}`
                : String.raw`f_n = \frac{nv}{2L}`
            }
            className="text-sm"
          />
          <span className="font-mono text-xs text-muted">
            {`λ${SUBS[n]} = 2L/${n} = ${fmt(lambdaN)} px · nodes = ${n - 1}`}
          </span>
          {octave ? (
            <span className="text-xs text-muted">
              Primary plus its octave is a standing chord — additive stacks like
              this build timbre in{" "}
              <Link
                href="/topics/fourier-sound"
                className="text-accent hover:underline"
              >
                fourier-sound
              </Link>
              .
            </span>
          ) : null}
          <span className="text-xs text-muted">
            Every frame is evaluated in closed form — no integrator runs.
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Standing wave on a string fixed between two hatched walls: a glowing cyan string vibrates inside a dashed envelope, violet node dots sit still while amber antinode stars mark the widest swings"
      />
    </SimFrame>
  );
}
