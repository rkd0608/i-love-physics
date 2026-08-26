export function fmt(n: number, d?: number): string {
  if (!Number.isFinite(n)) return "—";
  const decimals = d ?? 2;
  let s = n.toFixed(decimals);
  if (s.includes(".")) s = s.replace(/\.?0+$/, "");
  if (s === "-0") s = "0";
  return s;
}
