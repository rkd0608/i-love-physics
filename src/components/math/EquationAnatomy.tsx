"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import TeX from "@/components/math/TeX";
import { prefersReducedMotion } from "@/components/sim/useSimLoop";
import type { AnatomyPart } from "@/lib/anatomy/types";

const STAGGER_MS = 90;
const STEP_MS = 2400;

export default function EquationAnatomy({
  parts,
  label,
}: {
  parts: AnatomyPart[];
  label?: string;
}) {
  const total = parts.length;
  const [mountedCount, setMountedCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const touchedRef = useRef(false);

  const contentIndices = useMemo(
    () => parts.flatMap((part, index) => (part.glue ? [] : [index])),
    [parts],
  );

  useEffect(() => {
    if (total === 0 || mountedCount >= total) return;
    const reduced = prefersReducedMotion();
    const id = setTimeout(
      () => setMountedCount((count) => Math.min(count + 1, total)),
      reduced ? 0 : STAGGER_MS,
    );
    return () => clearTimeout(id);
  }, [mountedCount, total]);

  useEffect(() => {
    if (total === 0 || mountedCount < total) return;
    if (prefersReducedMotion()) return;
    if (touchedRef.current) return;
    const id = setTimeout(() => {
      setActiveIndex((current) => current ?? contentIndices[0] ?? null);
      setPlaying(true);
    }, 0);
    return () => clearTimeout(id);
  }, [mountedCount, total, contentIndices]);

  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      if (activeIndex === null) {
        const first = contentIndices[0];
        if (first === undefined) {
          setPlaying(false);
          return;
        }
        setActiveIndex(first);
        return;
      }
      const next = contentIndices.find((index) => index > activeIndex);
      if (next === undefined) {
        setPlaying(false);
        return;
      }
      setActiveIndex(next);
    }, STEP_MS);
    return () => clearTimeout(id);
  }, [playing, activeIndex, contentIndices]);

  if (total === 0) return null;

  const activePart = activeIndex === null ? null : parts[activeIndex];

  const select = (index: number): void => {
    touchedRef.current = true;
    setPlaying(false);
    setActiveIndex(index);
  };

  const togglePlay = (): void => {
    touchedRef.current = true;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (activeIndex === null) {
      const first = contentIndices[0];
      if (first === undefined) return;
      setActiveIndex(first);
    }
    setPlaying(true);
  };

  const stepPrev = (): void => {
    touchedRef.current = true;
    setPlaying(false);
    if (activeIndex === null) {
      const first = contentIndices[0];
      if (first !== undefined) setActiveIndex(first);
      return;
    }
    let previous: number | undefined;
    for (let i = contentIndices.length - 1; i >= 0; i -= 1) {
      const candidate = contentIndices[i];
      if (candidate < activeIndex) {
        previous = candidate;
        break;
      }
    }
    if (previous !== undefined) setActiveIndex(previous);
  };

  const stepNext = (): void => {
    touchedRef.current = true;
    setPlaying(false);
    const from = activeIndex ?? -1;
    const next = contentIndices.find((index) => index > from);
    if (next !== undefined) setActiveIndex(next);
  };

  const resetAll = (): void => {
    touchedRef.current = false;
    setPlaying(false);
    setActiveIndex(null);
    setMountedCount(0);
  };

  const hasPrevious =
    activeIndex !== null && contentIndices.some((index) => index < activeIndex);
  const hasNext =
    activeIndex === null
      ? contentIndices.length > 0
      : contentIndices.some((index) => index > activeIndex);

  const control =
    "focus-ring rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      role="group"
      aria-label="Equation dissection"
      className="mt-3 rounded-xl border border-line bg-bg px-4 py-4"
    >
      {label ? (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
          {label}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-2 text-lg">
        {parts.map((part, index) =>
          part.glue ? (
            <span key={`glue-${index}`} className="text-muted">
              <TeX tex={part.tex} />
            </span>
          ) : (
            <button
              key={`part-${index}`}
              type="button"
              aria-pressed={index === activeIndex}
              onClick={() => select(index)}
              className={`focus-ring inline-flex items-center rounded-md px-1.5 py-0.5 transition-all duration-300 ${
                index < mountedCount
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0"
              } ${
                index === activeIndex
                  ? "scale-105 bg-accent/15 text-accent shadow-md shadow-accent/20 ring-1 ring-accent/50"
                  : "hover:bg-fg/5"
              }`}
            >
              <TeX tex={part.tex} />
            </button>
          ),
        )}
      </div>
      <div
        aria-live="polite"
        className="mt-3 flex min-h-24 flex-col justify-center rounded-lg border border-line/60 bg-panel px-3 py-2"
      >
        {activePart ? (
          <>
            {activePart.label ? (
              <p className="text-sm font-semibold text-accent">
                {activePart.label}
              </p>
            ) : null}
            {activePart.meaning ? (
              <p className="text-sm leading-relaxed text-muted">
                {activePart.meaning}
              </p>
            ) : null}
            {activePart.value ? (
              <p className="mt-1.5 w-fit rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-fg">
                ≈ {activePart.value}
                {activePart.unit ? ` ${activePart.unit}` : ""}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">
            Press play or tap any piece of the equation.
          </p>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          disabled={contentIndices.length === 0}
          aria-pressed={playing}
          className={`${control} ${
            playing ? "border-accent/40 text-accent" : ""
          }`}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button type="button" onClick={stepPrev} disabled={!hasPrevious} className={control}>
          Prev
        </button>
        <button type="button" onClick={stepNext} disabled={!hasNext} className={control}>
          Next
        </button>
        <button type="button" onClick={resetAll} className={control}>
          Reset
        </button>
        <div className="ml-auto flex items-center gap-1.5" aria-hidden="true">
          {contentIndices.map((index) => (
            <span
              key={`dot-${index}`}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                index === activeIndex
                  ? "bg-accent"
                  : activeIndex !== null && index < activeIndex
                    ? "bg-fg/40"
                    : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
