"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SimFrame from "@/components/sim/SimFrame";
import TeX from "@/components/math/TeX";
import { ActionButton, Slider, Toggle } from "@/components/sim/controls";
import { prefersReducedMotion, useSimLoop } from "@/components/sim/useSimLoop";
import { useSimParams } from "@/components/sim/useSimParams";
import { glowDot, paintSky } from "@/lib/canvas";
import { fmt } from "@/lib/format";

const G = 9.81;
const STEP = 1 / 240;
const TABLE_PTS = 512;

const CYAN = "#53d6f2";
const VIOLET = "#c084fc";
const SLATE = "#8b93b8";
const GOLD = "#ffd27a";
const SILVER = "#cdd6f4";
const BRONZE = "#e0a370";

const RAIL_COLORS = [SLATE, CYAN, VIOLET];
const RAIL_WIDTHS = [2, 2, 2.25];
const RAIL_LABELS = ["straight", "arc", "cycloid"];
const RANK_COLORS = [GOLD, SILVER, BRONZE];
const RANK_LABELS = ["1st", "2nd", "3rd"];
const RANK_TEXT_CLASSES = [
  "border-[#ffd27a]/40 text-[#ffd27a]",
  "border-[#cdd6f4]/40 text-[#cdd6f4]",
  "border-[#e0a370]/40 text-[#e0a370]",
];

const MONO_SMALL = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
const MONO_LABEL = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

type Pt = { x: number; y: number };
type Rail = { xs: Float64Array; ys: Float64Array; ss: Float64Array; len: number };
type Geom = {
  rails: [Rail, Rail, Rail];
  amp: number;
  thetaEnd: number;
  tTheory: number;
};

const LOOK: Pt = { x: 0, y: 0 };

let geomCacheKey = "";
let geomCache: Geom | null = null;

function cycloidRatio(th: number): number {
  return (th - Math.sin(th)) / (1 - Math.cos(th));
}

function solveCycloid(span: number, drop: number): { amp: number; thetaEnd: number } {
  const target = span / drop;
  let lo = 1e-9;
  let hi = 2 * Math.PI - 1e-9;
  while (hi - lo > 1e-13) {
    const mid = (lo + hi) * 0.5;
    if (cycloidRatio(mid) < target) lo = mid;
    else hi = mid;
  }
  const thetaEnd = (lo + hi) * 0.5;
  return { amp: drop / (1 - Math.cos(thetaEnd)), thetaEnd };
}

function buildRail(sample: (u: number, out: Pt) => void): Rail {
  const xs = new Float64Array(TABLE_PTS);
  const ys = new Float64Array(TABLE_PTS);
  const ss = new Float64Array(TABLE_PTS);
  for (let i = 0; i < TABLE_PTS; i++) {
    sample(i / (TABLE_PTS - 1), LOOK);
    xs[i] = LOOK.x;
    ys[i] = LOOK.y;
    if (i > 0) {
      ss[i] = ss[i - 1] + Math.hypot(xs[i] - xs[i - 1], ys[i] - ys[i - 1]);
    }
  }
  return { xs, ys, ss, len: ss[TABLE_PTS - 1] };
}

function ensureGeom(span: number, drop: number): Geom {
  const key = `${span}|${drop}`;
  if (geomCacheKey !== key || !geomCache) {
    const { amp, thetaEnd } = solveCycloid(span, drop);
    const radius = (span * span + drop * drop) / (2 * drop);
    const phiEnd = Math.atan2(span, radius - drop);
    const straight = buildRail((u, out) => {
      out.x = u * span;
      out.y = -u * drop;
    });
    const arc = buildRail((u, out) => {
      const phi = u * phiEnd;
      out.x = radius * Math.sin(phi);
      out.y = -radius + radius * Math.cos(phi);
    });
    const cycloid = buildRail((u, out) => {
      const th = u * thetaEnd;
      out.x = amp * (th - Math.sin(th));
      out.y = -amp * (1 - Math.cos(th));
    });
    geomCache = {
      rails: [straight, arc, cycloid],
      amp,
      thetaEnd,
      tTheory: Math.PI * Math.sqrt(amp / G),
    };
    geomCacheKey = key;
  }
  return geomCache;
}

function sampleAt(rail: Rail, s: number, out: Pt): void {
  const n = rail.xs.length;
  const sc = s < 0 ? 0 : s > rail.len ? rail.len : s;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (rail.ss[mid] <= sc) lo = mid;
    else hi = mid;
  }
  const seg = rail.ss[hi] - rail.ss[lo];
  const f = seg > 0 ? (sc - rail.ss[lo]) / seg : 0;
  out.x = rail.xs[lo] + (rail.xs[hi] - rail.xs[lo]) * f;
  out.y = rail.ys[lo] + (rail.ys[hi] - rail.ys[lo]) * f;
}

export default function BrachistochroneLab() {
  const [{ span, drop, tscale, times }, updateParams] = useSimParams<{
    span: number;
    drop: number;
    tscale: number;
    times: boolean;
  }>({ span: 2.5, drop: 1.5, tscale: 1, times: true });

  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [raceSeq, setRaceSeq] = useState(0);
  const [outcome, setOutcome] = useState<{
    finishTimes: [number, number, number];
    ranks: [number, number, number];
  } | null>(null);

  const spanRef = useRef(span);
  const dropRef = useRef(drop);
  const tscaleRef = useRef(tscale);
  const pausedRef = useRef(paused);

  useEffect(() => {
    spanRef.current = span;
    dropRef.current = drop;
    tscaleRef.current = tscale;
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

  const sPosRef = useRef(new Float64Array(3));
  const doneRef = useRef(new Uint8Array(3));
  const finishRef = useRef(new Float64Array(3));
  const rankRef = useRef(new Int8Array(3).fill(-1));
  const clockRef = useRef(0);
  const accRef = useRef(0);
  const arrivedRef = useRef(0);
  const publishedRef = useRef(0);
  const camScaleRef = useRef(0);
  const camOxRef = useRef(0);
  const camOyRef = useRef(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      spanRef.current = span;
      dropRef.current = drop;
      const geom = ensureGeom(span, drop);
      for (let i = 0; i < 3; i++) {
        sPosRef.current[i] = geom.rails[i].len * 1e-6;
      }
      doneRef.current.fill(0);
      finishRef.current.fill(0);
      rankRef.current.fill(-1);
      clockRef.current = 0;
      accRef.current = 0;
      arrivedRef.current = 0;
      publishedRef.current = 0;
      setOutcome(null);
    });
    return () => cancelAnimationFrame(id);
  }, [span, drop, raceSeq]);

  const draw = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    _t: number,
    dt: number
  ): void => {
    const sp = spanRef.current;
    const dp = dropRef.current;
    const geom = ensureGeom(sp, dp);
    const rails = geom.rails;

    if (!pausedRef.current && arrivedRef.current < 3) {
      accRef.current += dt * tscaleRef.current;
      let guard = 0;
      while (accRef.current >= STEP && guard < 64) {
        guard++;
        accRef.current -= STEP;
        clockRef.current += STEP;
        for (let i = 0; i < 3; i++) {
          if (doneRef.current[i]) continue;
          const rail = rails[i];
          sampleAt(rail, sPosRef.current[i], LOOK);
          const v = Math.sqrt(Math.max(0, -2 * G * LOOK.y));
          sPosRef.current[i] += v * STEP;
          if (sPosRef.current[i] >= rail.len) {
            sPosRef.current[i] = rail.len;
            doneRef.current[i] = 1;
            finishRef.current[i] = clockRef.current;
            rankRef.current[i] = arrivedRef.current;
            arrivedRef.current++;
          }
        }
      }
      if (guard >= 64) accRef.current = 0;
      if (arrivedRef.current > publishedRef.current) {
        publishedRef.current = arrivedRef.current;
        const f = finishRef.current;
        const r = rankRef.current;
        setOutcome({
          finishTimes: [f[0], f[1], f[2]],
          ranks: [r[0], r[1], r[2]],
        });
      }
    }

    const targetScale = Math.min(w / (sp * 1.15), h / (dp * 1.15));
    const targetOx = (w - sp * targetScale) / 2;
    const targetOy = (h - dp * targetScale) / 2;
    if (camScaleRef.current <= 0) {
      camScaleRef.current = targetScale;
      camOxRef.current = targetOx;
      camOyRef.current = targetOy;
    } else {
      camScaleRef.current += (targetScale - camScaleRef.current) * 0.08;
      camOxRef.current += (targetOx - camOxRef.current) * 0.08;
      camOyRef.current += (targetOy - camOyRef.current) * 0.08;
    }
    const scl = camScaleRef.current;
    const ox = camOxRef.current;
    const oy = camOyRef.current;

    paintSky(ctx, w, h);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.textBaseline = "alphabetic";

    ctx.setLineDash([3, 6]);
    ctx.strokeStyle = "rgba(139,147,184,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(oy) + 0.5);
    ctx.lineTo(w, Math.round(oy) + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(139,147,184,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    const ex = ox + sp * scl;
    const ey = oy + dp * scl;
    ctx.moveTo(ex + 4, ey);
    ctx.arc(ex, ey, 4, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const winner = rankRef.current[i] === 0;
      ctx.shadowColor = winner ? RAIL_COLORS[i] : "transparent";
      ctx.shadowBlur = winner ? 12 : 0;
      ctx.strokeStyle = RAIL_COLORS[i];
      ctx.lineWidth = RAIL_WIDTHS[i];
      ctx.globalAlpha = winner ? 1 : 0.8;
      ctx.beginPath();
      const rail = rails[i];
      const stride = 4;
      for (let j = 0; j < TABLE_PTS; j += stride) {
        const px = ox + rail.xs[j] * scl;
        const py = oy - rail.ys[j] * scl;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    ctx.font = MONO_SMALL;
    ctx.textAlign = "center";
    for (let i = 0; i < 3; i++) {
      sampleAt(rails[i], rails[i].len * 0.5, LOOK);
      ctx.fillStyle = RAIL_COLORS[i];
      ctx.globalAlpha = 0.85;
      ctx.fillText(RAIL_LABELS[i], ox + LOOK.x * scl, oy - LOOK.y * scl - 9);
      ctx.globalAlpha = 1;
    }

    if (times) {
      ctx.font = MONO_LABEL;
      ctx.textAlign = "left";
      for (let k = 0; k < arrivedRef.current; k++) {
        let holder = -1;
        for (let i = 0; i < 3; i++) {
          if (rankRef.current[i] === k) {
            holder = i;
            break;
          }
        }
        if (holder < 0) continue;
        const sy = ey - 4 - k * 16;
        ctx.fillStyle = RANK_COLORS[k];
        ctx.beginPath();
        ctx.arc(ex + 16, sy - 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText(RANK_LABELS[k], ex + 23, sy);
      }
    }

    const stripY = h - 16;
    const sx0 = 22;
    const sx1 = w - 22;
    const elapsed = clockRef.current;
    const tMax = Math.max(geom.tTheory * 1.15, elapsed * 1.08, 1e-4);
    ctx.strokeStyle = "rgba(139,147,184,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx0, stripY + 0.5);
    ctx.lineTo(sx1, stripY + 0.5);
    ctx.stroke();
    const fillFrac = Math.min(1, elapsed / tMax);
    ctx.strokeStyle = VIOLET;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx0, stripY + 0.5);
    ctx.lineTo(sx0 + fillFrac * (sx1 - sx0), stripY + 0.5);
    ctx.stroke();
    if (times) {
      for (let i = 0; i < 3; i++) {
        if (!doneRef.current[i]) continue;
        const tx = sx0 + (finishRef.current[i] / tMax) * (sx1 - sx0);
        ctx.strokeStyle = RAIL_COLORS[i];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tx, stripY - 5);
        ctx.lineTo(tx, stripY + 5);
        ctx.stroke();
      }
    }
    const thX = sx0 + (geom.tTheory / tMax) * (sx1 - sx0);
    const lx = Math.min(Math.max(thX, sx0 + 34), sx1 - 34);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(230,235,255,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(thX, stripY - 6);
    ctx.lineTo(thX, stripY + 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = MONO_SMALL;
    ctx.fillStyle = "rgba(230,235,255,0.55)";
    ctx.textAlign = "center";
    ctx.fillText("π√(a/g)", lx, stripY - 22);
    ctx.fillStyle = VIOLET;
    ctx.textAlign = "left";
    ctx.fillText(`${fmt(elapsed, 2)} s`, sx0, stripY - 10);

    for (let i = 0; i < 3; i++) {
      sampleAt(rails[i], sPosRef.current[i], LOOK);
      glowDot(ctx, ox + LOOK.x * scl, oy - LOOK.y * scl, 5, RAIL_COLORS[i]);
    }
  };

  const canvasRef = useSimLoop(draw);

  const geoNow = useMemo(() => solveCycloid(span, drop), [span, drop]);
  const tTheory = Math.PI * Math.sqrt(geoNow.amp / G);

  const ordered = outcome
    ? ([0, 1, 2]
        .map((i) => ({ i, rank: outcome.ranks[i], time: outcome.finishTimes[i] }))
        .filter((row) => row.rank >= 0)
        .sort((a, b) => a.rank - b.rank) as {
        i: number;
        rank: number;
        time: number;
      }[])
    : [];

  return (
    <SimFrame
      title="Brachistochrone"
      subtitle="Straight vs. arc vs. cycloid — fastest descent wins"
      controls={
        <>
          <Slider
            label="Span"
            value={span}
            min={1}
            max={4}
            step={0.1}
            unit="m"
            onChange={(v) => updateParams({ span: v })}
          />
          <Slider
            label="Drop"
            value={drop}
            min={0.5}
            max={3}
            step={0.1}
            unit="m"
            onChange={(v) => updateParams({ drop: v })}
          />
          <Slider
            label="Time scale"
            value={tscale}
            min={0}
            max={3}
            step={0.1}
            unit="×"
            onChange={(v) => updateParams({ tscale: v })}
          />
          <Toggle
            label="Finish times"
            checked={times}
            onChange={(v) => updateParams({ times: v })}
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
          <ActionButton onClick={() => setRaceSeq((s) => s + 1)}>
            Restart race
          </ActionButton>
        </>
      }
      footnote={
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <TeX
            tex={String.raw`\sqrt{2g\,(y_0 - y)}`}
            className="text-sm"
          />
          {times ? (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
              {ordered.length > 0
                ? ordered.map((row) => (
                    <span key={row.i} className="flex items-center gap-1">
                      <span
                        className={`rounded border px-1 ${RANK_TEXT_CLASSES[row.rank]}`}
                      >
                        {RANK_LABELS[row.rank]}
                      </span>
                      <span className="text-accent">{fmt(row.time, 2)}</span>
                      <span className="text-muted">s</span>
                    </span>
                  ))
                : null}
              {ordered.length < 3 ? (
                <span className="text-muted">racing…</span>
              ) : null}
            </p>
          ) : (
            <p className="font-mono text-xs text-muted">finish times hidden</p>
          )}
          <TeX
            tex={String.raw`t_{\text{full}} = \pi\sqrt{a/g}`}
            className="text-sm"
          />
          <span className="font-mono text-xs">
            <span className="text-muted">= </span>
            <span className="text-accent">{fmt(tTheory, 2)}</span>
            <span className="text-muted">
              {" "}
              s · a = {fmt(geoNow.amp, 2)} m · θ = {fmt(geoNow.thetaEnd, 2)} rad
            </span>
          </span>
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Brachistochrone bead race: three glowing beads descend a straight ramp, a circular arc and a cycloid from a shared start to a shared endpoint, with podium stamps at the arrival point and a timer strip whose dashed tick marks the full-cycloid theory time"
      />
    </SimFrame>
  );
}
