/**
 * Pacing unit. The trailer used to be cut to a song at 85 BPM; it now runs on
 * sound effects alone, stretched to 40 s, so every cue keeps its place on the
 * same grid: event n sits at n × B seconds.
 * - b13–b16: the four steps of the opening that lead into the projects
 * - b17: the first project lands
 * - b28.2, b36.1 and b44.1: the three "breaks" (CRT off, pixel staircase, collapse into the sparkle)
 */
export const B = (40 / 34.64) * (60 / 85.0185);
export const b = (n: number) => n * B;
export const DROP = b(17);
export const DURATION = 40;
export const BREAKS = [b(28.2), b(36.1), b(44.11)];

export type SceneId = 'open' | 'counter' | 'innerself' | 'voice' | 'trash' | 'face' | 'hand' | 'stock' | 'payroll' | 'laptop' | 'math' | 'recap' | 'outro';

export const scenes: { id: SceneId; from: number; to: number; label: string }[] = [
  { id: 'open', from: 0, to: b(17), label: 'Pembuka' },
  { id: 'counter', from: b(17), to: b(21), label: 'Dense Object Counter' },
  { id: 'innerself', from: b(21), to: b(24), label: 'InnerSelf Cognitive' },
  { id: 'voice', from: b(24), to: b(26), label: 'Voice Dataset' },
  { id: 'trash', from: b(26), to: b(29), label: 'Smart Trash' },
  { id: 'face', from: b(29), to: b(32), label: 'Face Recognition' },
  { id: 'hand', from: b(32), to: b(35), label: 'Hand Gesture' },
  { id: 'stock', from: b(35), to: b(37), label: 'Stock Recording' },
  { id: 'payroll', from: b(37), to: b(39), label: 'Payroll System' },
  { id: 'laptop', from: b(39), to: b(41), label: 'Laptop Recommendation' },
  { id: 'math', from: b(41), to: b(43), label: 'Math Game' },
  { id: 'recap', from: b(43), to: b(45), label: 'Semua proyek' },
  { id: 'outro', from: b(45), to: DURATION, label: 'Penutup' },
];

/** Where each 3D subject sits: [x shift on landscape, y shift on portrait], as a fraction of the screen. */
export const shift3d = {
  counter: [0.15, 0.17], innerself: [0.17, 0.06], trash: [0.11, 0.1], face: [0.17, 0.08],
} as const;

export const chapters = [
  { t: 0, label: 'Pembuka' },
  ...scenes.filter(s => s.id !== 'open' && s.id !== 'outro').map(s => ({ t: s.from, label: s.label })),
];

/** Every public project repository on github.com/Hwarinn66 (the profile README and this site excluded). */
export const projects = [
  { id: 'counter', n: '01', name: 'Dense Object Counter', repo: 'Dense-Object-Counter', kind: 'Computer vision', hud: '#fca50a' },
  { id: 'innerself', n: '02', name: 'InnerSelf Cognitive', repo: 'MBTI-Test-With-ML', kind: 'NLP · machine learning', hud: '#4b2a8c' },
  { id: 'voice', n: '03', name: 'Voice Dataset', repo: 'Voice-Dataset', kind: 'Audio · RVC', hud: '#ff6a4d' },
  { id: 'trash', n: '04', name: 'Smart Trash', repo: 'Smart-Trash', kind: 'ML + IoT', hud: '#c6f432' },
  { id: 'face', n: '05', name: 'Face Recognition', repo: 'face-recognition', kind: 'Computer vision', hud: '#5ff3ff' },
  { id: 'hand', n: '06', name: 'Hand Gesture', repo: 'Gesture-Hand', kind: 'Computer vision', hud: '#fff4e8' },
  { id: 'stock', n: '07', name: 'Stock Recording', repo: 'Stock-Recording-Laravel · -TypeScript', kind: 'Web · QR', hud: '#ffd60a' },
  { id: 'payroll', n: '08', name: 'Payroll System', repo: 'Payroll-System', kind: 'Web', hud: '#1d2a22' },
  { id: 'laptop', n: '09', name: 'Laptop Recommendation', repo: 'laptop-recomendation-with-binary-tree', kind: 'Web · struktur data', hud: '#dbe9ff' },
  { id: 'math', n: '10', name: 'Math Game', repo: 'math-game', kind: 'Web · game', hud: '#7dff6b' },
] as const;

export const repoNames = [
  'Dense-Object-Counter', 'MBTI-Test-With-ML', 'Voice-Dataset', 'Smart-Trash', 'face-recognition', 'Gesture-Hand',
  'Stock-Recording-Laravel', 'Stock-Recording-TypeScript', 'Payroll-System', 'laptop-recomendation-with-binary-tree', 'math-game',
];
export const repoLangs = ['Python', 'Python', 'Audio', 'Python', 'Python', 'Python', 'PHP', 'TypeScript', 'PHP', 'Python', 'Python'];

/** Deterministic pseudo-random numbers so every play draws the same scene. */
export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Region of interest and 3×3 tiles with 15% overlap, in the tray's 0–1000 coordinate space. */
export const ROI = { x: 100, y: 100, size: 800 };
const TILE = ROI.size / (3 - 2 * 0.15);
const STRIDE = TILE * 0.85;
export const tiles = [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({ x: ROI.x + c * STRIDE, y: ROI.y + r * STRIDE, size: TILE })));

export type Obj = { x: number; y: number; r: number; rot: number };

/** 50 objects packed densely inside the ROI. */
export const objects: Obj[] = (() => {
  const rand = rng(61);
  const list: Obj[] = [];
  const fits = (x: number, y: number, r: number) => list.every(o => Math.hypot(o.x - x, o.y - y) > o.r + r + 8);
  for (let tries = 0; list.length < 50 && tries < 30000; tries++) {
    const r = 24 + rand() * 9;
    const x = ROI.x + r + 8 + rand() * (ROI.size - 2 * r - 16), y = ROI.y + r + 8 + rand() * (ROI.size - 2 * r - 16);
    if (fits(x, y, r)) list.push({ x, y, r, rot: rand() * Math.PI });
  }
  return list;
})();

const inferno: [number, [number, number, number]][] = [
  [0, [0, 0, 4]], [0.13, [27, 12, 65]], [0.25, [74, 12, 107]], [0.38, [120, 28, 109]], [0.5, [165, 44, 96]],
  [0.63, [207, 68, 70]], [0.75, [237, 105, 37]], [0.88, [251, 155, 6]], [1, [252, 255, 164]],
];
const sample = (v: number) => {
  const t = Math.max(0, Math.min(1, v));
  for (let i = 1; i < inferno.length; i++) {
    const [p1, c1] = inferno[i], [p0, c0] = inferno[i - 1];
    if (t <= p1) { const k = (t - p0) / (p1 - p0); return c0.map((c, j) => Math.round(c + (c1[j] - c) * k)); }
  }
  return inferno[inferno.length - 1][1];
};

/** Density map of the objects, coloured with the inferno colormap. */
export function renderHeatmap(size = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const scale = size / 1000;
  const field = new Float32Array(size * size);
  const sigma = 48 * scale;
  for (const o of objects) {
    const cx = o.x * scale, cy = o.y * scale, reach = Math.ceil(sigma * 3);
    for (let y = Math.max(0, Math.floor(cy - reach)); y < Math.min(size, cy + reach); y++) {
      for (let x = Math.max(0, Math.floor(cx - reach)); x < Math.min(size, cx + reach); x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        field[y * size + x] += Math.exp(-d2 / (2 * sigma * sigma));
      }
    }
  }
  let max = 0;
  for (const v of field) if (v > max) max = v;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < field.length; i++) {
    const v = field[i] / max;
    const [r, g, bl] = sample(Math.pow(v, 0.8));
    img.data[i * 4] = r; img.data[i * 4 + 1] = g; img.data[i * 4 + 2] = bl;
    img.data[i * 4 + 3] = Math.round(Math.min(1, v * 1.6) * 255);
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** A small QR-like module grid (decorative, not a scannable code) with the three finder squares. */
export const qrGrid: boolean[][] = (() => {
  const n = 25, rand = rng(7);
  const g = Array.from({ length: n }, () => Array.from({ length: n }, () => rand() > 0.52));
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r < 8; r++) for (let c = -1; c < 8; c++) {
      const rr = r0 + r, cc = c0 + c;
      if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
      const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
      g[rr][cc] = r >= 0 && c >= 0 && r < 7 && c < 7 && (ring === 3 || ring <= 1);
    }
  };
  finder(0, 0); finder(0, n - 7); finder(n - 7, 0);
  return g;
})();

/** Laptop prices (juta rupiah) inserted into a binary search tree in this order. */
export const laptopPrices = [12, 7, 18, 5, 9, 15, 22, 4, 6, 8, 11, 14, 16, 20, 25];
export type BstNode = { v: number; x: number; y: number; depth: number; parent: number };
export const bst: BstNode[] = (() => {
  const nodes: BstNode[] = [];
  const left: Record<number, number> = {}, right: Record<number, number> = {};
  for (const v of laptopPrices) {
    if (!nodes.length) { nodes.push({ v, x: 0.5, y: 0, depth: 0, parent: -1 }); continue; }
    let i = 0, depth = 0;
    for (;;) {
      depth++;
      const side = v <= nodes[i].v ? left : right;
      if (side[i] === undefined) {
        const spread = 0.25 / 2 ** (depth - 1);
        nodes.push({ v, x: nodes[i].x + (v <= nodes[i].v ? -spread : spread), y: depth, depth, parent: i });
        side[i] = nodes.length - 1;
        break;
      }
      i = side[i];
    }
  }
  return nodes;
})();
/** Dense Object Counter: the webcam takes its snapshot, then a scan line sweeps the tray (tray units, −0.92 → 0.92). */
export const SHUTTER = b(18.6);
export const SCAN = [b(18.8), b(19.75)] as const;
export function scanX(t: number) {
  const k = Math.min(1, Math.max(0, (t - SCAN[0]) / (SCAN[1] - SCAN[0])));
  return -0.92 + 1.84 * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
}
/** Objects the scan line has passed, in tray units. */
export const scannedCount = (t: number) => (t < SCAN[0] ? 0 : objects.filter(o => (o.x - 500) / 500 <= scanX(t)).length);

/** Search range for the BST shot: 8 – 15 juta. Nodes outside are pruned. */
export const bstRange = [8, 15] as const;
