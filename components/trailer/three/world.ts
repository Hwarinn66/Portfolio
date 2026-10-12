import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { makeBioRig } from './bio';
import { makeCounterRig } from './counter';
import { makeEsp32Rig } from './esp32';
import { makeNumeralRig } from './numeral';
import { makeOrbRig } from './orb';
import { shift3d } from '../trailer-data';
import { makeView, type Rig } from './util';

export type World = { render: (t: number) => void; resize: (w: number, h: number) => void; dispose: () => void };

/**
 * One WebGL canvas shared by every 3D shot. Each rig owns a time window and
 * poses itself (and the camera) from the playhead; outside every window the
 * canvas is hidden and nothing is drawn.
 */
export function createWorld(canvas: HTMLCanvasElement, opts: { mobile: boolean; heat: HTMLCanvasElement }): World {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, opts.mobile ? 1.75 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 100);
  const view = makeView();

  const rigs: Rig[] = [
    makeNumeralRig({ mobile: opts.mobile }, view),
    { ...makeCounterRig(opts), shift: shift3d.counter },
    { ...makeOrbRig(opts), shift: shift3d.innerself },
    { ...makeEsp32Rig(opts), shift: shift3d.trash },
    { ...makeBioRig(opts, view), shift: shift3d.face },
  ];
  rigs.forEach(r => { r.group.visible = false; scene.add(r.group); });

  let aspect = 1, W = 1, H = 1;
  let shown = false;
  const resize = (w: number, h: number) => {
    renderer.setSize(w, h, false);
    W = Math.max(1, w); H = Math.max(1, h);
    aspect = W / H;
    camera.aspect = aspect; camera.updateProjectionMatrix();
    view.height = h * dpr;
  };
  // Shift the picture (not the perspective) so the subject sits beside the type.
  const applyShift = (shift?: readonly [number, number]) => {
    if (!shift) { camera.clearViewOffset(); return; }
    if (aspect >= 1) camera.setViewOffset(W, H, -shift[0] * W, 0, W, H);
    else camera.setViewOffset(W, H, 0, -shift[1] * H, W, H);
  };
  resize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || window.innerHeight);

  // Compile every rig's shaders up front (each with its own lights), so no shot stutters on its first frame.
  for (const rig of rigs) {
    rigs.forEach(r => { r.group.visible = r === rig; });
    rig.update(rig.from + 0.5, camera, aspect);
    renderer.compile(scene, camera);
    renderer.render(scene, camera);
  }
  rigs.forEach(r => { r.group.visible = false; });
  renderer.clear();

  return {
    resize,
    render(t) {
      let any = false;
      for (const rig of rigs) {
        const on = t >= rig.from && t < rig.to;
        rig.group.visible = on;
        if (on) { rig.update(t, camera, aspect); applyShift(rig.shift); any = true; }
      }
      if (any !== shown) { canvas.style.visibility = any ? 'visible' : 'hidden'; shown = any; }
      if (any) renderer.render(scene, camera);
    },
    dispose() {
      rigs.forEach(r => r.dispose?.());
      scene.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(m) ? m : m ? [m] : []).forEach(mat => {
          Object.values(mat).forEach(v => { if (v instanceof THREE.Texture) v.dispose(); });
          mat.dispose();
        });
      });
      env.dispose(); pmrem.dispose(); renderer.dispose();
    },
  };
}
