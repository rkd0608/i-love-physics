"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import TeX from "@/components/math/TeX";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { drawArrow, glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CYAN = "#53d6f2";
const VIOLET = "#b48cf2";
const GREEN = "#4ade80";
const OBJ_C = "#ffd27a";
const IMG_C = "#ff6b6b";
const MUTED = "#8b93b8";
const AXIS_C = "rgba(139,147,184,0.35)";
const LENS_C = "#aab4d4";
const FAN_C = "rgba(199,207,232,0.6)";
const CONV_TINT = "rgba(14,165,233,0.09)";
const DIV_TINT = "rgba(180,140,242,0.09)";
const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";

const PAD_X = 46;
const PAD_Y = 30;
const MIN_SPAN = 260;
const MIN_H = 64;
const APERTURE = 76;
const AP_MIN_R = 140;
const FAN_N = 7;
const EPAD = 60;

function drawLens(
  ctx: CanvasRenderingContext2D,
  x: number,
  ay: number,
  half: number,
  mode: number
): void {
  ctx.fillStyle = mode >= 0 ? CONV_TINT : DIV_TINT;
  ctx.fillRect(x - 5, ay - half, 10, half * 2);
  ctx.strokeStyle = LENS_C;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, ay - half);
  ctx.lineTo(x, ay + half);
  ctx.stroke();
  const hl = 11;
  const hw = 5.5;
  ctx.fillStyle = LENS_C;
  ctx.beginPath();
  if (mode < 0) {
    ctx.moveTo(x, ay - half + hl);
  } else {
    ctx.moveTo(x, ay - half - hl);
  }
  ctx.lineTo(x - hw, ay - half);
  ctx.lineTo(x + hw, ay - half);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  if (mode < 0) {
    ctx.moveTo(x, ay + half - hl);
  } else {
    ctx.moveTo(x, ay + half + hl);
  }
  ctx.lineTo(x - hw, ay + half);
  ctx.lineTo(x + hw, ay + half);
  ctx.closePath();
  ctx.fill();
}

function dashSeg(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
): void {
  ctx.setLineDash([4, 6]);
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function dashedArrowV(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
  color: string
): void {
  const dir = Math.sign(y2 - y1) || 1;
  ctx.setLineDash([7, 5]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2 - dir * 8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y2);
  ctx.lineTo(x - 4.5, y2 - dir * 9);
  ctx.lineTo(x + 4.5, y2 - dir * 9);
  ctx.closePath();
  ctx.fill();
}

export default function ThinLensLab() {
  const [
    { f, do: distO, ho: objH, ext: showExt, fan: showFan },
    updateParams,
  ] = useSimParams<{ f: number; do: number; ho: number; ext: boolean; fan: boolean }>({
    f: 120,
    do: 250,
    ho: 50,
    ext: true,
    fan: false,
  });
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  const fRef = useRef(f);
  const doRef = useRef(distO);
  const hoRef = useRef(objH);
  const extRef = useRef(showExt);
  const fanRef = useRef(showFan);
  const pausedRef = useRef(paused);

  useEffect(() => {
    fRef.current = f;
    doRef.current = distO;
    hoRef.current = objH;
    extRef.current = showExt;
    fanRef.current = showFan;
    pausedRef.current = paused;
  });

  useEffect(() => {
    if (!prefersReducedMotion()) return;
    const id = requestAnimationFrame(() => {
      setReduced(true);
      pausedRef.current = true;
      setPaused(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const canvasRef = useSimLoop((ctx, w, h) => {
    const fv = fRef.current;
    const dv = doRef.current;
    const hv = hoRef.current;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    const ay = h * 0.5;
    ctx.setLineDash([3, 7]);
    ctx.strokeStyle = AXIS_C;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ay);
    ctx.lineTo(w, ay);
    ctx.stroke();
    ctx.setLineDash([]);

    const zeroPower = fv === 0;
    const g = Math.abs(fv);
    const den = dv - fv;
    const atInf = !zeroPower && Math.abs(den) < 1e-9;
    const di = atInf ? Infinity : zeroPower ? NaN : (fv * dv) / den;
    const hi = Number.isFinite(di) ? -(di / dv) * hv : NaN;

    const extL = Math.max(zeroPower ? 0 : g, dv, di < 0 ? -di : 0);
    const extR = Math.max(zeroPower ? 0 : g, di > 0 ? di : 0, AP_MIN_R);
    const span = Math.max(extL + extR, MIN_SPAN);
    const maxH = Math.max(hv, Number.isFinite(hi) ? Math.abs(hi) : 0, MIN_H);
    const s = Math.min((w - PAD_X * 2) / span, (h / 2 - PAD_Y) / maxH);
    const lensX = PAD_X + (w - PAD_X * 2) * (extL / span);
    const apHalf = Math.min(
      Math.max(
        APERTURE,
        hv * s + 12,
        Number.isFinite(hi) ? Math.abs(hi) * s + 12 : 0
      ),
      h / 2 - 16
    );
    const apWorld = apHalf / s;

    if (!zeroPower) {
      glowDot(ctx, lensX - g * s, ay, 3.5, MUTED);
      glowDot(ctx, lensX + g * s, ay, 3.5, MUTED);
      ctx.font = MONO_SMALL;
      ctx.fillStyle = MUTED;
      ctx.textAlign = "center";
      ctx.fillText("F", lensX - g * s, ay + 18);
      ctx.fillText("F′", lensX + g * s, ay + 18);
    }

    const tipX = lensX - dv * s;
    const tipY = ay - hv * s;
    const imgX = Number.isFinite(di) ? lensX + di * s : 0;
    const imgY = Number.isFinite(hi) ? ay - hi * s : 0;
    const xr = (w + EPAD - lensX) / s;
    const mA = zeroPower ? 0 : -hv / fv;
    const mC = -hv / dv;
    const virtualImg = Number.isFinite(di) && di < 0;

    if (showFan) {
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = FAN_C;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = 0; k < FAN_N; k += 1) {
        const yk = ((k / (FAN_N - 1)) * 2 - 1) * apWorld;
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(lensX, ay - yk * s);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let k = 0; k < FAN_N; k += 1) {
        const yk = ((k / (FAN_N - 1)) * 2 - 1) * apWorld;
        const mOut = zeroPower
          ? (yk - hv) / dv
          : atInf
            ? 0
            : (hi - yk) / di;
        ctx.moveTo(lensX, ay - yk * s);
        ctx.lineTo(w + EPAD, ay - (yk + mOut * xr) * s);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (showExt && virtualImg) {
        ctx.setLineDash([3, 7]);
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = FAN_C;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let k = 0; k < FAN_N; k += 1) {
          const yk = ((k / (FAN_N - 1)) * 2 - 1) * apWorld;
          ctx.moveTo(lensX, ay - yk * s);
          ctx.lineTo(imgX, imgY);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
    }

    ctx.lineWidth = 2;
    ctx.strokeStyle = CYAN;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(lensX, tipY);
    ctx.lineTo(w + EPAD, ay - (hv + mA * xr) * s);
    ctx.stroke();

    if (!zeroPower && !atInf) {
      const hitBy = ay - hi * s;
      ctx.strokeStyle = VIOLET;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(lensX, hitBy);
      ctx.lineTo(w + EPAD, hitBy);
      ctx.stroke();
    }

    ctx.strokeStyle = GREEN;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(lensX, ay);
    ctx.lineTo(w + EPAD, ay - mC * xr * s);
    ctx.stroke();

    if (showExt && virtualImg) {
      const hitBy = ay - hi * s;
      dashSeg(ctx, lensX, tipY, imgX, imgY, CYAN);
      dashSeg(ctx, lensX, hitBy, imgX, imgY, VIOLET);
      dashSeg(ctx, lensX, ay, imgX, imgY, GREEN);
    }

    drawLens(ctx, lensX, ay, apHalf, zeroPower ? 0 : fv > 0 ? 1 : -1);

    drawArrow(ctx, tipX, ay, tipX, tipY, OBJ_C, 2.5);
    if (Number.isFinite(di)) {
      if (virtualImg) dashedArrowV(ctx, imgX, ay, imgY, IMG_C);
      else drawArrow(ctx, imgX, ay, imgX, imgY, IMG_C, 2.5);
      glowDot(ctx, imgX, imgY, 4, IMG_C);
    }

    ctx.font = MONO_SMALL;
    ctx.textAlign = "left";
    ctx.lineWidth = 2;
    ctx.strokeStyle = CYAN;
    ctx.beginPath();
    ctx.moveTo(14, 19);
    ctx.lineTo(30, 19);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.fillText("parallel → F′", 36, 22);
    ctx.strokeStyle = VIOLET;
    ctx.beginPath();
    ctx.moveTo(14, 35);
    ctx.lineTo(30, 35);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.fillText("via F → parallel", 36, 38);
    ctx.strokeStyle = GREEN;
    ctx.beginPath();
    ctx.moveTo(14, 51);
    ctx.lineTo(30, 51);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.fillText("through center", 36, 54);
  });

  const zeroPower = f === 0;
  const den = distO - f;
  const atInf = !zeroPower && Math.abs(den) < 1e-9;
  const di = atInf ? Infinity : zeroPower ? NaN : (f * distO) / den;
  const mag = Number.isFinite(di) ? -(di / distO) : NaN;
  const virtual = Number.isFinite(di) && di < 0;
  const diText = zeroPower ? "—" : atInf ? "∞" : fmt(di, 1);
  const magText = Number.isFinite(mag) ? `${fmt(mag, 3)}×` : "—";
  const badge = zeroPower ? "NO IMAGE" : atInf ? "PARALLEL" : virtual ? "VIRTUAL" : "REAL";
  const badgeClass = `ml-1 rounded px-1.5 py-px text-[10px] font-semibold tracking-wider ${
    virtual
      ? "border border-[#b48cf2]/40 bg-[#b48cf2]/10 text-[#b48cf2]"
      : atInf || zeroPower
        ? "border border-line text-muted"
        : "border border-accent/40 bg-accent/10 text-accent"
  }`;
  const subTex = zeroPower
    ? "\\frac{1}{f}=\\frac{1}{d_o}+\\frac{1}{d_i}"
    : `\\frac{1}{${fmt(f, 0)}}=\\frac{1}{${fmt(distO, 0)}}+\\frac{1}{${
        atInf ? "\\infty" : fmt(di, 1)
      }}`;
  const modeWord = zeroPower ? "no optical power" : f > 0 ? "converging" : "diverging";

  const aria = `Ray-optics construction for a thin ${
    f > 0 ? "converging" : f < 0 ? "diverging" : "flat"
  } lens on a dark canvas: an amber object arrow stands ${distO} pixels left of the lens at height ${objH}, and three colored principal rays — cyan parallel-to-focus, violet through-focus, green through-center — refract at the lens${
    showFan ? ", joined by a seven-ray fan spread across the aperture" : ""
  }. The ${
    zeroPower ? "no-image" : atInf ? "image at infinity" : virtual ? "virtual" : "real"
  } outcome is drawn ${
    virtual
      ? "as a dashed upright arrow on the object side"
      : atInf || zeroPower
        ? "by rays that never converge on the canvas"
        : "as a solid inverted arrow on the far side"
  }${showExt && virtual ? ", with dashed backward extensions meeting at the image point" : ""}${
    Number.isFinite(mag) ? `, magnification ${fmt(mag, 2)}` : ""
  }.`;

  return (
    <SimFrame
      title="Thin Lens Ray Construction"
      subtitle="Three principal rays locate the image — real or virtual"
      controls={
        <>
          <div className="block min-w-36">
            <Slider
              label="Focal length f"
              value={f}
              min={-200}
              max={200}
              step={5}
              unit="px"
              onChange={(v) => updateParams({ f: v })}
            />
            <span className="mt-0.5 block text-[10px] uppercase tracking-widest text-muted">
              {modeWord}
            </span>
          </div>
          <Slider
            label="Object distance d_o"
            value={distO}
            min={30}
            max={500}
            step={5}
            unit="px"
            onChange={(v) => updateParams({ do: v })}
          />
          <Slider
            label="Object height"
            value={objH}
            min={20}
            max={80}
            step={2}
            unit="px"
            onChange={(v) => updateParams({ ho: v })}
          />
          <Toggle
            label="Virtual extensions"
            checked={showExt}
            onChange={(v) => updateParams({ ext: v })}
          />
          <Toggle
            label="Ray fan"
            checked={showFan}
            onChange={(v) => updateParams({ fan: v })}
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
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX tex={subTex} className="text-sm" />
          <p className="font-mono text-xs">
            <span className="text-muted">d</span>
            <sub className="text-muted">i</sub>
            <span className="text-muted"> = </span>
            <span className="text-accent">{diText}</span>
            <span className="text-muted"> px </span>
            <span className={badgeClass}>{badge}</span>
            <span className="text-muted"> · m = </span>
            <span className="text-accent">{magText}</span>
          </p>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={aria}
      />
    </SimFrame>
  );
}
