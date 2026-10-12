import * as THREE from 'three';

/** MediaPipe hand topology: 21 landmarks and the connections drawn between them. */
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];
export const TIPS = [4, 8, 12, 16, 20];

/** Curl per finger: [thumb, index, middle, ring, pinky], 0 = straight, 1 = folded. */
export type Curl = [number, number, number, number, number];
export const GESTURES: Record<'open' | 'peace' | 'rock' | 'thumbs' | 'fist', Curl> = {
  open: [0, 0, 0, 0, 0],
  peace: [1, 0, 0, 1, 1],
  rock: [1, 0, 1, 1, 0],
  thumbs: [0, 1, 1, 1, 1],
  fist: [1, 1, 1, 1, 1],
};

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const fingers = [
  { idx: [5, 6, 7, 8], base: v(0.36, 0.42, 0), dir: v(0.1, 1, 0).normalize(), lens: [0.6, 0.36, 0.28] },
  { idx: [9, 10, 11, 12], base: v(0.02, 0.5, 0), dir: v(0, 1, 0), lens: [0.66, 0.4, 0.3] },
  { idx: [13, 14, 15, 16], base: v(-0.3, 0.44, 0), dir: v(-0.1, 1, 0).normalize(), lens: [0.6, 0.38, 0.28] },
  { idx: [17, 18, 19, 20], base: v(-0.56, 0.3, 0), dir: v(-0.24, 1, 0).normalize(), lens: [0.48, 0.3, 0.25] },
];
const ANG = [1.25, 1.65, 1.1];
const thumb = { idx: [1, 2, 3, 4], base: v(0.3, -0.5, 0.14), dir: v(0.72, 0.62, 0.3).normalize(), lens: [0.44, 0.38, 0.3], axis: v(0.226, -0.623, 0.745).normalize(), ang: [0.8, 0.55, 0.55] };
const WRIST = v(0, -0.85, 0);

/** Forward kinematics: fills out[0..20] with landmark positions in hand space (palm faces +z). */
export function handPose(curl: Curl, out: THREE.Vector3[]) {
  out[0].copy(WRIST);
  const d = new THREE.Vector3(), axis = new THREE.Vector3(), n = new THREE.Vector3(0, 0, 1);
  // Thumb
  out[1].copy(thumb.base);
  d.copy(thumb.dir);
  for (let s = 0; s < 3; s++) {
    d.applyAxisAngle(thumb.axis, thumb.ang[s] * curl[0]);
    out[thumb.idx[s + 1]].copy(out[thumb.idx[s]]).addScaledVector(d, thumb.lens[s]);
  }
  // Fingers
  fingers.forEach((f, i) => {
    const c = curl[i + 1];
    out[f.idx[0]].copy(f.base);
    d.copy(f.dir);
    axis.crossVectors(f.dir, n).normalize();
    for (let s = 0; s < 3; s++) {
      d.applyAxisAngle(axis, ANG[s] * c);
      out[f.idx[s + 1]].copy(out[f.idx[s]]).addScaledVector(d, f.lens[s]);
    }
  });
  return out;
}

export const blendCurl = (a: Curl, b: Curl, k: number): Curl => a.map((x, i) => x + (b[i] - x) * k) as Curl;
