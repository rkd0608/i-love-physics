"use client";

import type { ReactNode } from "react";
import type { JSX } from "react";
import { fmt } from "../../lib/format";

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}): JSX.Element {
  return (
    <label className="block min-w-36">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
        <span className="text-sm font-mono text-accent">
          {format ? (
            format(value)
          ) : (
            <>
              {fmt(value)}
              {unit ? <span className="text-muted"> {unit}</span> : null}
            </>
          )}
        </span>
      </span>
      <input
        type="range"
        className="w-full cursor-pointer"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        checked
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-line text-muted hover:text-fg"
      }`}
    >
      {label}
    </button>
  );
}

export function ActionButton({
  onClick,
  children,
  tone = "accent",
}: {
  onClick: () => void;
  children: ReactNode;
  tone?: "accent" | "ghost";
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        tone === "ghost"
          ? "border-line text-fg hover:border-accent/40"
          : "border-accent/40 text-accent hover:bg-accent/10"
      }`}
    >
      {children}
    </button>
  );
}
