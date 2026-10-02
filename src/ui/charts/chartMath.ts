export interface Pt {
  x: number;
  y: number;
}

const sign = (n: number) => (n < 0 ? -1 : 1);

function slope3(a: Pt, b: Pt, c: Pt): number {
  const h0 = b.x - a.x || 1e-9;
  const h1 = c.x - b.x || 1e-9;
  const s0 = (b.y - a.y) / h0;
  const s1 = (c.y - b.y) / h1;
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

const slope2 = (a: Pt, b: Pt, t: number) => {
  const h = b.x - a.x;
  return h ? (3 * (b.y - a.y)) / h / 2 - t / 2 : t;
};

export interface SplinePath {
  /** SVG path data for the line. */
  d: string;
  /** Approximate arc length — drives the stroke draw-in. */
  length: number;
}

/**
 * Monotone cubic interpolation (the same family as d3's curveMonotoneX):
 * smooth, but never overshoots the data — a balance can't visually dip
 * below a value it never reached.
 */
export function monotonePath(pts: Pt[]): SplinePath {
  const n = pts.length;
  if (n === 0) return { d: "", length: 0 };
  if (n === 1) return { d: `M${pts[0].x} ${pts[0].y}`, length: 0 };

  let length = 0;
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  if (n === 2) {
    d += ` L${pts[1].x.toFixed(2)} ${pts[1].y.toFixed(2)}`;
    return { d, length: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) };
  }

  const m = new Array<number>(n);
  for (let i = 1; i < n - 1; i++) m[i] = slope3(pts[i - 1], pts[i], pts[i + 1]);
  m[0] = slope2(pts[0], pts[1], m[1]);
  m[n - 1] = slope2(pts[n - 2], pts[n - 1], m[n - 2]);

  for (let i = 0; i < n - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dx = (b.x - a.x) / 3;
    const c1 = { x: a.x + dx, y: a.y + dx * m[i] };
    const c2 = { x: b.x - dx, y: b.y - dx * m[i + 1] };
    d += ` C${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;

    // arc length by sampling
    let prev = a;
    for (let s = 1; s <= 14; s++) {
      const t = s / 14;
      const u = 1 - t;
      const x = u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x;
      const y = u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y;
      length += Math.hypot(x - prev.x, y - prev.y);
      prev = { x, y };
    }
  }
  return { d, length };
}

export function areaPath(line: string, first: Pt, last: Pt, baselineY: number): string {
  return `${line} L${last.x.toFixed(2)} ${baselineY.toFixed(2)} L${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

export function nearestIndex(x: number, xs: number[]): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < xs.length; i++) {
    const dist = Math.abs(xs[i] - x);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}

/** Which x-axis labels to show so they never collide. */
export function labelStride(count: number, plotWidth: number, minSpacing = 46): number {
  if (count <= 1) return 1;
  const fit = Math.max(1, Math.floor(plotWidth / minSpacing));
  return Math.max(1, Math.ceil(count / fit));
}
