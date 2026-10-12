import * as THREE from 'three';

/** Pure functions of time: every 3D pose is computed from the playhead, so scrubbing just works. */
export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const prog = (t: number, at: number, dur: number) => clamp01((t - at) / dur);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const inExpo = (x: number) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10));
export const inOutExpo = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const inCubic = (x: number) => x * x * x;
export const inOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const inOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
export const outBack = (x: number, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const outElastic = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1);
export const outBounce = (x: number) => {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

/** Piecewise keyframes: [time, value][] with an easing per segment. */
export function keys(t: number, frames: [number, number][], ease: (x: number) => number = inOutCubic) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i], [t0, v0] = frames[i - 1];
    if (t <= t1) return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
  }
  return frames[frames.length - 1][1];
}

/** Vector keyframes. */
export function vkeys(t: number, frames: [number, [number, number, number]][], ease: (x: number) => number = inOutCubic, out = new THREE.Vector3()) {
  if (t <= frames[0][0]) return out.set(...frames[0][1]);
  for (let i = 1; i < frames.length; i++) {
    const [t1, v1] = frames[i], [t0, v0] = frames[i - 1];
    if (t <= t1) { const k = ease((t - t0) / (t1 - t0)); return out.set(lerp(v0[0], v1[0], k), lerp(v0[1], v1[1], k), lerp(v0[2], v1[2], k)); }
  }
  return out.set(...frames[frames.length - 1][1]);
}

/** Cheap deterministic noise for idle motion. */
export const wobble = (t: number, seed: number) => Math.sin(t * 1.3 + seed) * 0.6 + Math.sin(t * 2.7 + seed * 1.7) * 0.4;

export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  if (ctx) draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Soft round sprite for point clouds. */
export function dotTexture() {
  return canvasTexture(64, 64, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  });
}

/** Camera distance multiplier so a subject framed for 16:9 still fits a portrait phone. */
export const fitFactor = (aspect: number, base = 1.6) => (aspect >= base ? 1 : Math.min(2.35, Math.pow(base / aspect, 0.72)));

export type Rig = {
  from: number;
  to: number;
  group: THREE.Group;
  update: (t: number, cam: THREE.PerspectiveCamera, aspect: number) => void;
  /** Screen offset of the subject: [x on landscape, y on portrait]. */
  shift?: readonly [number, number];
  dispose?: () => void;
};

/** Drawing-buffer height in device pixels, for point sprites sized in world units. */
export type View = { height: number; pxScale: (fovDeg: number) => number };
export function makeView(): View {
  const v: View = { height: 800, pxScale: fov => v.height / (2 * Math.tan((fov * Math.PI) / 360)) };
  return v;
}
