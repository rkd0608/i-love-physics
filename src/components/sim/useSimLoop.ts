"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export type SimDrawFn = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  dt: number
) => void;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useSimLoop(draw: SimDrawFn): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef<SimDrawFn>(draw);

  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let dpr = 1;
    let cssW = 0;
    let cssH = 0;
    let t = 0;
    let last = -1;
    let raf = 0;
    let visible = true;
    let disposed = false;

    const onResize = (entries: ResizeObserverEntry[]): void => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      cssW = rect.width;
      cssH = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    };

    const onIntersect = (entries: IntersectionObserverEntry[]): void => {
      visible = entries[0]?.isIntersecting ?? true;
    };

    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
    const io = new IntersectionObserver(onIntersect);
    io.observe(canvas);

    const frame = (now: number): void => {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden || !visible || cssW <= 0 || cssH <= 0 || last < 0) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawRef.current(ctx, cssW, cssH, t, dt);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return canvasRef;
}
