export function paintSky(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#060a17");
  sky.addColorStop(1, "#0a0f22");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
}

export function glowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
): void {
  ctx.save();
  const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  halo.addColorStop(0, color);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width?: number
): void {
  const lw = width ?? 1.5;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return;
  const ux = dx / len;
  const uy = dy / len;
  const headLen = Math.max(lw * 4, 6);
  const halfHead = headLen * 0.35;
  const bx = x2 - ux * headLen;
  const by = y2 - uy * headLen;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(bx - uy * halfHead, by + ux * halfHead);
  ctx.lineTo(bx + uy * halfHead, by - ux * halfHead);
  ctx.closePath();
  ctx.fill();
}
