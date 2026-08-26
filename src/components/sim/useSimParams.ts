"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SimParamValue = number | boolean;

type ParamMap = Record<string, SimParamValue>;

function parseEntry(
  raw: string,
  def: SimParamValue
): SimParamValue | undefined {
  if (typeof def === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }
  if (raw === "1" || raw === "true") return true;
  if (raw === "0" || raw === "false") return false;
  return undefined;
}

export function useSimParams<T extends ParamMap>(defaults: T): [T, (patch: Partial<T>) => void] {
  const [params, setParams] = useState<T>(defaults);
  const defaultsRef = useRef(defaults);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const d = defaultsRef.current;
    const sp = new URLSearchParams(window.location.search);
    const patch: Record<string, SimParamValue> = {};
    for (const key of Object.keys(d)) {
      const raw = sp.get(key);
      if (raw === null) continue;
      const v = parseEntry(raw, d[key]);
      if (v !== undefined) patch[key] = v;
    }
    if (Object.keys(patch).length > 0) setParams({ ...d, ...patch });
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const d = defaultsRef.current;
    const sp = new URLSearchParams();
    for (const key of Object.keys(params)) {
      if (params[key] !== d[key]) sp.set(key, String(params[key]));
    }
    const qs = sp.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [params]);

  const update = useCallback((patch: Partial<T>) => {
    setParams((prev) => ({ ...prev, ...patch }));
  }, []);

  return [params, update];
}
