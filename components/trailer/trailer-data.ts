/** Beat grid measured from the soundtrack: 83 BPM, first beat at 0.064 s, drop on beat 17 (12.35 s). */
export const BEAT = 60 / 83;
export const T0 = 0.064;
export const b = (n: number) => T0 + n * BEAT;
export const DROP = b(17);
export const DURATION = 34.64;

export const chapters = [
  { t: 0, label: 'Intro' },
  { t: b(17), label: 'Penghitung' },
  { t: b(29), label: 'Proyek ML' },
  { t: b(37), label: 'Data ke model' },
  { t: b(41), label: 'Penutup' },
];

/** Deterministic pseudo-random numbers so every play draws the same scene. */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Region of interest and 3×3 tiles with 15% overlap, in the field's 0–1000 coordinate space. */
export const ROI = { x: 100, y: 100, size: 800 };
const TILE = ROI.size / (3 - 2 * 0.15);
const STRIDE = TILE * 0.85;
export const tiles = [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({ x: ROI.x + c * STRIDE, y: ROI.y + r * STRIDE, size: TILE })));
/** Overlap bands where neighbouring tiles both see the same object. */
const seams = [ROI.x + STRIDE, ROI.x + 2 * STRIDE].map(start => ({ from: start, to: start + TILE * 0.15 }));

export type Obj = { x: number; y: number; r: number; rot: number; seam: boolean };

/** 50 yellow objects packed densely inside the ROI, a few sitting on tile seams (for the NMS shot). */
export const objects: Obj[] = (() => {
  const rand = rng(61);
  const list: Obj[] = [];
  const fits = (x: number, y: number, r: number) => list.every(o => Math.hypot(o.x - x, o.y - y) > o.r + r + 6);
  // Six objects on the vertical seams first.
  for (let i = 0; i < 6; i++) {
    const seam = seams[i % 2];
    for (let tries = 0; tries < 200; tries++) {
      const x = seam.from + rand() * (seam.to - seam.from), y = ROI.y + 50 + rand() * (ROI.size - 100), r = 24 + rand() * 7;
      if (fits(x, y, r)) { list.push({ x, y, r, rot: rand() * 180, seam: true }); break; }
    }
  }
  for (let tries = 0; list.length < 50 && tries < 20000; tries++) {
    const r = 22 + rand() * 9;
    const x = ROI.x + r + 8 + rand() * (ROI.size - 2 * r - 16), y = ROI.y + r + 8 + rand() * (ROI.size - 2 * r - 16);
    if (fits(x, y, r)) list.push({ x, y, r, rot: rand() * 180, seam: false });
  }
  return list;
})();

/** Words that scatter into the objects at the end of the intro. */
export const introLines = [['SETIAP', 'GAMBAR'], ['MENYIMPAN'], ['ANGKA.']];

export const steps = ['Kamera', 'ROI', 'Tile', 'YOLO', 'NMS', 'Hitung'];
export const stepNotes = ['snapshot dari kamera HP', 'crop sebelum detector', '1024 px, overlap 15%', 'satu kelas: object', 'gabung duplikat di seam', 'jumlah akhir'];

export const stack = ['PYTHON', 'YOLO', 'OPENCV', 'TENSORFLOW', 'MEDIAPIPE'];

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

/** Density map of the objects, coloured with the inferno colormap. Rendered once, then animated as an image. */
export function renderHeatmap(size = 256): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const scale = size / 1000;
  const field = new Float32Array(size * size);
  const sigma = 46 * scale;
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
    img.data[i * 4 + 3] = Math.round(Math.min(1, v * 1.5) * 255);
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL('image/png');
}
