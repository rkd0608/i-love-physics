"use client";

import { useEffect, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import { Slider, Toggle, ActionButton } from "@/components/sim/controls";
import { useSimLoop, prefersReducedMotion } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import TeX from "@/components/math/TeX";
import { paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const CAP = 5000;
const BINS = 128;
const TICK = 1 / 120;
const MAX_TICKS = 48;
const TOP_PAD = 18;
const AXIS_PAD = 38;
const CURVE_STEP = 3;
const ROW_GAP = 2.4;
const EDGE_PAD = 22;
const READ_EVERY = 10;

const CYAN_BAR = "rgba(83,214,242,0.45)";
const CYAN_DOT = "#7ee7ff";
const VIOLET = "#a78bfa";
const CURVE_COLOR = "rgba(255,255,255,0.85)";
const AXIS_LINE = "rgba(139,147,184,0.35)";
const LABEL_COLOR = "rgba(139,147,184,0.7)";
const MONO_LABEL = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";

interface Readout {
  mx2: number;
  ticks: number;
}

export default function DiffusionWalkLab() {
  const [{ n, step, ts, hist }, updateParams] = useSimParams<{
    n: number;
    step: number;
    ts: number;
    hist: boolean;
  }>({ n: 1500, step: 1, ts: 1, hist: true });
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [seq, setSeq] = useState(0);
  const [readout, setReadout] = useState<Readout>({ mx2: 0, ticks: 0 });

  const ensRef = useRef<Float32Array | null>(null);
  const countsRef = useRef(new Uint32Array(BINS));
  const rowsRef = useRef(new Int32Array(BINS));
  const pausedRef = useRef(false);
  const nRef = useRef(n);
  const activeRef = useRef(0);
  const ticksRef = useRef(0);
  const accRef = useRef(0);
  const frameRef = useRef(0);
  const dimRef = useRef({ w: 640, h: 360 });

  useEffect(() => {
    if (!ensRef.current) ensRef.current = new Float32Array(CAP);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    nRef.current = n;
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

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const ens = ensRef.current;
      if (!ens) return;
      if (n > activeRef.current) ens.fill(0, activeRef.current, n);
      activeRef.current = n;
    });
    return () => cancelAnimationFrame(id);
  }, [n]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const ens = ensRef.current;
      if (!ens) return;
      ens.fill(0);
      activeRef.current = nRef.current;
      ticksRef.current = 0;
      accRef.current = 0;
      setReadout({ mx2: 0, ticks: 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [seq]);

  const draw = useSimLoop(
    (ctx, w, h, _t, dt) => {
      dimRef.current.w = w;
      dimRef.current.h = h;
      const ens = ensRef.current;
      if (!ens) return;
      const count = n;
      const s = step;
      const running = !pausedRef.current && ts > 0 && count > 0;

      if (running) {
        accRef.current += dt * ts;
        let done = 0;
        while (accRef.current >= TICK && done < MAX_TICKS) {
          for (let i = 0; i < count; i++) {
            ens[i] += Math.random() < 0.5 ? -s : s;
          }
          ticksRef.current++;
          accRef.current -= TICK;
          done++;
        }
        if (done === MAX_TICKS) accRef.current = 0;
      }

      paintSky(ctx, w, h);

      const half = w / 2;
      const binW = w / BINS;
      const axisY = h - AXIS_PAD;
      const ax = hist ? axisY : h / 2;
      const tE = ticksRef.current * TICK;
      const D = (s * s) / (2 * TICK);

      let sum2 = 0;
      const counts = countsRef.current;
      const rows = rowsRef.current;

      if (hist) {
        counts.fill(0);
        for (let i = 0; i < count; i++) {
          const xi = ens[i];
          sum2 += xi * xi;
          const b = ((xi + half) / binW) | 0;
          if (b >= 0 && b < BINS) counts[b]++;
        }
        const amp =
          tE > 0 ? count / Math.sqrt(4 * Math.PI * D * tE) : count / binW;
        const vSpan = ax - 6 - TOP_PAD;
        const scale = (vSpan * 0.92) / amp;
        ctx.fillStyle = CYAN_BAR;
        ctx.beginPath();
        for (let b = 0; b < BINS; b++) {
          const c = counts[b];
          if (c === 0) continue;
          let bh = (c / binW) * scale;
          if (bh > vSpan) bh = vSpan;
          ctx.rect(b * binW + 0.5, ax - bh, binW - 1, bh);
        }
        ctx.fill();
        if (tE > 0) {
          ctx.strokeStyle = CURVE_COLOR;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 5]);
          ctx.beginPath();
          const denom = 4 * D * tE;
          for (let sx = 0; sx <= w; sx += CURVE_STEP) {
            const wx = sx - half;
            const y = ax - amp * Math.exp(-(wx * wx) / denom) * scale;
            if (sx === 0) ctx.moveTo(sx, y);
            else ctx.lineTo(sx, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        rows.fill(0);
        ctx.strokeStyle = AXIS_LINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, ax);
        ctx.lineTo(w, ax);
        ctx.stroke();
        ctx.fillStyle = CYAN_DOT;
        for (let i = 0; i < count; i++) {
          const xi = ens[i];
          sum2 += xi * xi;
          const b = ((xi + half) / binW) | 0;
          if (b < 0 || b >= BINS) continue;
          const k = rows[b]++;
          const mag = Math.ceil(k / 2) * ROW_GAP;
          let y = ax + (k % 2 === 0 ? mag : -mag);
          if (y < EDGE_PAD) y = EDGE_PAD;
          else if (y > h - EDGE_PAD) y = h - EDGE_PAD;
          ctx.fillRect(xi - 0.75, y - 0.75, 1.5, 1.5);
        }
      }

      const mx2 = count > 0 ? sum2 / count : 0;
      const xr = Math.sqrt(mx2);
      const txL = half - Math.min(xr, half - 4);
      const txR = half + Math.min(xr, half - 4);

      if (hist) {
        ctx.strokeStyle = AXIS_LINE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, ax);
        ctx.lineTo(w, ax);
        ctx.stroke();
      }

      ctx.font = MONO_LABEL;
      ctx.fillStyle = LABEL_COLOR;
      ctx.textAlign = "center";
      ctx.fillText("0", half, ax + 16);

      ctx.strokeStyle = VIOLET;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(txL, ax - 6);
      ctx.lineTo(txL, ax + 6);
      ctx.moveTo(txR, ax - 6);
      ctx.lineTo(txR, ax + 6);
      ctx.stroke();

      frameRef.current++;
      if (frameRef.current % READ_EVERY === 0) {
        setReadout({ mx2, ticks: ticksRef.current });
      }
    }
  );

  const tLive = readout.ticks * TICK;
  const dCal = 60 * step * step;

  return (
    <SimFrame
      title="Point-Source Random Walk"
      subtitle="Fair-coin lurches on one axis; the crowd becomes a bell"
      controls={
        <>
          <Slider
            label="Walkers"
            value={n}
            min={200}
            max={5000}
            step={100}
            onChange={(v) => updateParams({ n: v })}
          />
          <Slider
            label="Step size"
            value={step}
            min={1}
            max={4}
            step={1}
            unit="px"
            onChange={(v) => updateParams({ step: v })}
          />
          <Slider
            label="Time scale"
            value={ts}
            min={0}
            max={5}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ ts: v })}
          />
          <Toggle
            label="Histogram view"
            checked={hist}
            onChange={(v) => updateParams({ hist: v })}
          />
          <ActionButton onClick={() => setSeq((v) => v + 1)}>
            Reset ensemble
          </ActionButton>
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
          <TeX
            tex={String.raw`\langle x^2 \rangle = 2Dt`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">⟨x²⟩ = </span>
            <span className="text-accent">{fmt(readout.mx2)}</span>
            <span className="text-muted"> px²</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">2Dt = </span>
            <span className="text-accent">{fmt(2 * dCal * tLive)}</span>
            <span className="text-muted"> px²</span>
          </span>
          <span className="font-mono text-xs">
            <span className="text-muted">x_rms = </span>
            <span className="text-accent">{fmt(Math.sqrt(readout.mx2))}</span>
            <span className="text-muted"> px</span>
          </span>
          <p className="w-full text-xs leading-relaxed">
            Each tick spends 1/120 s of sim time, so the calibrated coefficient
            is D = s²/(2Δt) = {fmt(dCal)} px²/s; violet ticks mark ±x_rms on the
            axis. Reset reseeds every walker at the origin and zeroes the clock.
          </p>
        </div>
      }
    >
      <canvas
        ref={draw}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Dark canvas where thousands of random walkers released from the center of one horizontal axis pile into a cyan histogram bell that widens like root-t, overlaid by a dashed white Gaussian prediction with violet ticks marking plus and minus the RMS spread; toggled to a swarm view the walkers appear as tiny cyan dots jittering around the center line"
      />
    </SimFrame>
  );
}
