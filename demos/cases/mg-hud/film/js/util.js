// deterministic helpers — everything is a pure function of t
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, t0, d) => clamp((t - t0) / d);
export const E = {
  lin: (x) => x,
  inQ: (x) => x * x,
  outC: (x) => 1 - Math.pow(1 - x, 3),
  outQ: (x) => 1 - Math.pow(1 - x, 4),
  outE: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutC: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  inOutQ: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
};
// integer hash -> [0,1)
export function hash(...a) {
  let h = 2166136261 >>> 0;
  for (const v of a) {
    h ^= (v * 2654435761) >>> 0; h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; h ^= h >>> 16;
  }
  return (h >>> 0) / 4294967296;
}
export const mulberry = MotionKit.rng;
export const FPS = 30;
// nearest frame: motion-blur sub-samples (±0.19 frame) of frame f all map to f, so per-frame states never smear across frames
export const frameOf = (t) => Math.floor(t * FPS + 0.5);
// rolling digits: before t0 -> placeholder, t0..t0+n frames -> random glyphs (same length), then final
const DIG = '0123456789';
export function roll(t, t0, final, id = 0, nFrames = 4) {
  if (t < t0) return null;
  const f = frameOf(t) - frameOf(t0);
  if (f >= nFrames) return final;
  let s = '';
  for (let i = 0; i < final.length; i++) {
    const c = final[i];
    s += /[0-9]/.test(c) ? DIG[Math.floor(hash(id, i, f + 7) * 10)] : c;
  }
  return s;
}
// typewriter: returns visible substring
export function typed(t, t0, str, cps = 90) {
  if (t < t0) return '';
  return str.slice(0, Math.floor((t - t0) * cps + 1e-6));
}
// hermite
export function hermite(s, p0, p1, m0, m1) {
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
}
export const DEG = Math.PI / 180;
export const TARGET = { lat: 31 + 14 / 60, lon: 121 + 29 / 60 };
export const CND = [ { lat: 13.75, lon: 100.5 }, { lat: 43.8, lon: 87.6 } ];
export const HUB = { x: 960, y: 540 };
export const LOCK = 6.4;
