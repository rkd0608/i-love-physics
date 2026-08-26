"use client";

import Link from "next/link";
import { paintSky } from "@/lib/canvas";
import {
  prefersReducedMotion,
  useSimLoop,
} from "@/components/sim/useSimLoop";

interface Star {
  x: number;
  y: number;
  r: number;
  drift: number;
  seed: number;
  tint: string;
}

const STAR_COUNT = 90;

function hash(i: number, s: number): number {
  const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

const STARS: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => ({
  x: hash(i, 1),
  y: hash(i, 2),
  r: 0.6 + hash(i, 3) * 1.3,
  drift: 0.004 + hash(i, 4) * 0.009,
  seed: hash(i, 5) * Math.PI * 2,
  tint:
    hash(i, 6) > 0.86
      ? "#ffd27a"
      : hash(i, 6) > 0.72
        ? "#53d6f2"
        : "#e8efff",
}));

const ARCS = [
  { cx: 0.56, cy: 0.32, rx: 0.42, ry: 0.22, rot: -0.35 },
  { cx: 0.44, cy: 0.5, rx: 0.54, ry: 0.28, rot: 0.22 },
  { cx: 0.5, cy: 0.38, rx: 0.64, ry: 0.34, rot: -0.08 },
];

const COMET_X = 0.36;
const COMET_Y = 0.21;

export default function Hero() {
  const canvasRef = useSimLoop((ctx, w, h, t) => {
    const reduced = prefersReducedMotion();
    const tt = reduced ? 0 : t;
    paintSky(ctx, w, h);

    for (const arc of ARCS) {
      ctx.save();
      ctx.translate(arc.cx * w, arc.cy * h);
      ctx.rotate(arc.rot);
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, arc.rx * w, arc.ry * h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const star of STARS) {
      const x = ((star.x + tt * star.drift) % 1) * w;
      const y = ((star.y + tt * star.drift * 0.35) % 1) * h;
      const twinkle = reduced
        ? 0.7
        : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(tt * 1.7 + star.seed));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = star.tint;
      ctx.shadowColor = star.tint;
      ctx.shadowBlur = star.r * 5;
      ctx.beginPath();
      ctx.arc(x, y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (!reduced) {
      const angle = tt * 0.22;
      for (let k = 7; k >= 1; k--) {
        const prev = angle - k * 0.055;
        ctx.globalAlpha = 0.45 * (1 - k / 8);
        drawComet(ctx, w, h, prev, 1.3);
      }
      ctx.globalAlpha = 1;
      drawComet(ctx, w, h, angle, 2.1);
    }
    ctx.globalAlpha = 1;
  });

  return (
    <section className="relative h-[68vh] min-h-[520px] w-full overflow-hidden bg-[#060a17]">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-bg" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xs tracking-[0.3em] text-accent">
          AN INTERACTIVE PHYSICS DATABASE
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-7xl">
          i love physics
        </h1>
        <p className="mt-4 text-lg text-white/60 sm:text-xl">
          Cinematic physics you can grab.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/explore"
            className="focus-ring rounded-full bg-accent px-5 py-2.5 font-medium text-[#04121a] transition hover:brightness-110"
          >
            Explore topics
          </Link>
          <Link
            href="/about"
            className="focus-ring rounded-full border border-white/20 px-5 py-2.5 text-white/80 transition hover:border-white/40"
          >
            About
          </Link>
        </div>
      </div>
    </section>
  );
}

function drawComet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  angle: number,
  radius: number
): void {
  const x = (0.5 + Math.cos(angle) * COMET_X) * w;
  const y = (0.34 + Math.sin(angle) * COMET_Y) * h;
  ctx.fillStyle = "#bfe9ff";
  ctx.shadowColor = "#53d6f2";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
