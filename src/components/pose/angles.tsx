type Point = { x: number; y: number };

// Angle at point b, formed by the lines b→a and b→c, in degrees (0 to 180).
// `aspect` is the video's width / height. MediaPipe's x and y are normalized
// separately (0 to 1 each), so on a non-square frame the x axis is stretched.
// Passing the aspect ratio corrects for that. It defaults to 1 (no correction).
export function angle(a: Point, b: Point, c: Point, aspect = 1): number {
  const ab = { x: (a.x - b.x) * aspect, y: a.y - b.y };
  const cb = { x: (c.x - b.x) * aspect, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (mag === 0) return 0; // avoid dividing by zero if two points coincide

  // Clamp to [-1, 1] so rounding errors can't make acos return NaN
  const cos = Math.min(1, Math.max(-1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}