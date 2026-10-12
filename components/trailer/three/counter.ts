import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { b, objects, ROI, tiles } from '../trailer-data';
import { canvasTexture, clamp01, fitFactor, hump, inExpo, keys, outBack, outBounce, outExpo, prog, type Rig } from './util';

const S = 1 / 500;
const X = (x: number) => (x - 500) * S;
const Z = (y: number) => (y - 500) * S;

/**
 * Dense Object Counter: a tray of 50 objects drops in on the drop, tiles light
 * up, every object gets a bounding box, then the phone running IP Webcam is
 * revealed above with its view frustum, and the camera dives into one object.
 */
export function makeCounterRig(opts: { mobile: boolean; heat: HTMLCanvasElement }): Rig {
  const group = new THREE.Group();
  const T = b(17);

  // Lights for this rig only.
  const hemi = new THREE.HemisphereLight('#ffe2b0', '#1a0c2e', 0.75);
  const key = new THREE.DirectionalLight('#fff1d6', 2.4); key.position.set(2.5, 4, 1.5);
  const rim = new THREE.DirectionalLight('#ff4f9a', 1.6); rim.position.set(-3, 1.2, -2.5);
  group.add(hemi, key, rim);

  // Tray
  const tray = new THREE.Mesh(new RoundedBoxGeometry(2.24, 0.08, 2.24, 3, 0.03), new THREE.MeshStandardMaterial({ color: '#07040d', roughness: 0.92, metalness: 0, envMapIntensity: 0.25 }));
  tray.position.y = -0.04;
  group.add(tray);
  const heatTex = new THREE.CanvasTexture(opts.heat); heatTex.colorSpace = THREE.SRGBColorSpace;
  const heatMat = new THREE.MeshBasicMaterial({ map: heatTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const heat = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), heatMat);
  heat.rotation.x = -Math.PI / 2; heat.position.y = 0.002;
  group.add(heat);

  // ROI outline drawn progressively
  const roiPts: THREE.Vector3[] = [];
  const r0 = X(ROI.x), r1 = X(ROI.x + ROI.size);
  const perim = [[r0, r0], [r1, r0], [r1, r1], [r0, r1], [r0, r0]];
  for (let s = 0; s < 4; s++) for (let i = 0; i < 50; i++) {
    const [ax, az] = perim[s], [bx, bz] = perim[s + 1], k = i / 50;
    roiPts.push(new THREE.Vector3(ax + (bx - ax) * k, 0.006, az + (bz - az) * k));
  }
  roiPts.push(roiPts[0].clone());
  const roiGeo = new THREE.BufferGeometry().setFromPoints(roiPts);
  const roi = new THREE.Line(roiGeo, new THREE.LineBasicMaterial({ color: '#fcffa4', toneMapped: false }));
  group.add(roi);

  // Tiles (outline + flash plane)
  const tileGroup = new THREE.Group();
  const tileFlash: THREE.Mesh[] = [];
  const tileLines: THREE.LineSegments[] = [];
  for (const tile of tiles) {
    const x0 = X(tile.x), x1 = X(tile.x + tile.size), z0 = Z(tile.y), z1 = Z(tile.y + tile.size);
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x0, 0.008, z0), new THREE.Vector3(x1, 0.008, z0), new THREE.Vector3(x1, 0.008, z0), new THREE.Vector3(x1, 0.008, z1),
      new THREE.Vector3(x1, 0.008, z1), new THREE.Vector3(x0, 0.008, z1), new THREE.Vector3(x0, 0.008, z1), new THREE.Vector3(x0, 0.008, z0),
    ]);
    const line = new THREE.LineSegments(g, new THREE.LineDashedMaterial({ color: '#ece9f2', dashSize: 0.035, gapSize: 0.025, transparent: true, opacity: 0, toneMapped: false }));
    line.computeLineDistances();
    tileLines.push(line); tileGroup.add(line);
    const flash = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ color: '#fca50a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    flash.rotation.x = -Math.PI / 2; flash.position.set((x0 + x1) / 2, 0.01, (z0 + z1) / 2);
    tileFlash.push(flash); tileGroup.add(flash);
  }
  group.add(tileGroup);

  // Objects: glossy amber beans (instanced)
  const n = objects.length;
  const beadMat = new THREE.MeshStandardMaterial({ color: '#f2a516', roughness: 0.26, metalness: 0.25, emissive: '#6a2c00', emissiveIntensity: 0.3 });
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 22, 14), beadMat, n);
  const dist = objects.map(o => Math.hypot(o.x - 500, o.y - 500));
  const maxD = Math.max(...dist);
  const order = objects.map((_, i) => i).sort((a, c) => dist[a] - dist[c]);
  const rank = new Array<number>(n); order.forEach((i, k) => { rank[i] = k; });
  group.add(beads);

  // Bounding boxes: flat square brackets that pop over each object
  const ring = new THREE.Shape();
  ring.moveTo(-0.5, -0.5); ring.lineTo(0.5, -0.5); ring.lineTo(0.5, 0.5); ring.lineTo(-0.5, 0.5); ring.lineTo(-0.5, -0.5);
  const hole = new THREE.Path();
  hole.moveTo(-0.43, -0.43); hole.lineTo(-0.43, 0.43); hole.lineTo(0.43, 0.43); hole.lineTo(0.43, -0.43); hole.lineTo(-0.43, -0.43);
  ring.holes.push(hole);
  const boxGeo = new THREE.ShapeGeometry(ring); boxGeo.rotateX(-Math.PI / 2);
  const boxes = new THREE.InstancedMesh(boxGeo, new THREE.MeshBasicMaterial({ color: '#ffb21a', toneMapped: false, transparent: true, side: THREE.DoubleSide }), n);
  group.add(boxes);

  // Phone running IP Webcam above the tray, with its view frustum
  const phone = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.07, 1.3, 4, 0.06), new THREE.MeshStandardMaterial({ color: '#16161c', roughness: 0.35, metalness: 0.6 }));
  phone.add(body);
  const screenTex = canvasTexture(330, 650, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d0b12'); g.addColorStop(1, '#1d1230');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2a2140'; ctx.fillRect(18, 90, w - 36, w - 36);
    for (let i = 0; i < 26; i++) { ctx.fillStyle = '#f7b52b'; ctx.beginPath(); ctx.ellipse(40 + ((i * 97) % (w - 80)), 110 + ((i * 53) % (w - 80)), 9, 6, i, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#fca50a'; ctx.lineWidth = 3; ctx.strokeRect(30, 102, w - 60, w - 60);
    ctx.fillStyle = '#ece9f2'; ctx.font = '600 30px "JetBrains Mono Variable", monospace'; ctx.fillText('IP Webcam', 24, 54);
    ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(w - 40, 44, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8d86a3'; ctx.font = '500 20px "JetBrains Mono Variable", monospace'; ctx.fillText('snapshot · HITUNG', 24, w + 110);
    ctx.fillStyle = '#fca50a'; ctx.beginPath(); ctx.roundRect(24, h - 130, w - 48, 70, 35); ctx.fill();
    ctx.fillStyle = '#100a1c'; ctx.font = '800 30px "Archivo Variable", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('HITUNG', w / 2, h - 84);
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  screen.rotation.x = -Math.PI / 2; screen.position.y = 0.037;
  phone.add(screen);
  phone.rotation.set(0, 0.35, 0);
  group.add(phone);
  const lens = new THREE.Vector3(0, -0.04, -0.45);
  const corners = [[r0, r0], [r1, r0], [r1, r1], [r0, r1]];
  const fr = new THREE.BufferGeometry().setFromPoints(corners.flatMap(([x, z]) => [new THREE.Vector3(), new THREE.Vector3(x, 0.01, z)]));
  const frustum = new THREE.LineSegments(fr, new THREE.LineDashedMaterial({ color: '#fcffa4', dashSize: 0.06, gapSize: 0.04, transparent: true, opacity: 0, toneMapped: false }));
  group.add(frustum);
  const coneGeo = new THREE.BufferGeometry();
  const coneArr = new THREE.BufferAttribute(new Float32Array(36), 3);
  coneGeo.setAttribute('position', coneArr);
  const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: '#fca50a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
  group.add(cone);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), scl = new THREE.Vector3();
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), lensW = new THREE.Vector3();
  const dive = objects[order[3]];
  const hopBeats = [b(18), b(19), b(20)];
  const diveTarget = new THREE.Vector3(), diveCam = new THREE.Vector3(), diveOffset = new THREE.Vector3(0.02, 0.12, 0.08);

  return {
    from: T - 0.05, to: b(21), group,
    update(t, cam, aspect) {
      // Objects fall onto the tray on the drop, nearest the centre first.
      for (let i = 0; i < n; i++) {
        const o = objects[i];
        const k = prog(t, T + rank[i] * 0.009, 0.62);
        const h = o.r * S * 0.55;
        // On every beat the objects hop in a ripple from the centre outward.
        const hop = hump(t, hopBeats.map(at => at + (dist[i] / maxD) * 0.22), 0.3) * 0.1;
        const y = h + (1 - outBounce(k)) * (1.7 + (i % 7) * 0.12) + hop;
        const s = k <= 0 ? 0 : 0.55 + 0.45 * outExpo(Math.min(1, k * 2));
        e.set(0, o.rot, 0.12 * Math.sin(i)); q.setFromEuler(e);
        scl.set(o.r * S * s, h * s, o.r * S * 0.74 * s);
        pos.set(X(o.x), y, Z(o.y));
        beads.setMatrixAt(i, m4.compose(pos, q, scl));
        // Boxes pop outward from the centre on b19, again lighter on b20.
        const bk = prog(t, b(19) + (dist[i] / maxD) * 0.42, 0.24);
        const bs = bk <= 0 ? 0 : outBack(bk, 2.4) * o.r * S * 2.5;
        q.identity(); pos.set(X(o.x), h * 2 + 0.006 + hop, Z(o.y)); scl.set(bs, 1, bs);
        boxes.setMatrixAt(i, m4.compose(pos, q, scl));
      }
      beads.instanceMatrix.needsUpdate = true;
      boxes.instanceMatrix.needsUpdate = true;
      (boxes.material as THREE.MeshBasicMaterial).opacity = keys(t, [[b(20.6), 1], [b(21), 0.4]]);

      heatMat.opacity = keys(t, [[b(17.9), 0], [b(18.3), 0.95], [b(19), 0.75], [b(20), 0.55]]);
      roiGeo.setDrawRange(0, Math.floor(prog(t, b(17.6), 0.4) * 201));
      tileLines.forEach((line, i) => { (line.material as THREE.LineDashedMaterial).opacity = prog(t, b(18) + i * 0.035, 0.1) * 0.7; });
      tileFlash.forEach((f, i) => {
        const at = b(18) + i * 0.035;
        (f.material as THREE.MeshBasicMaterial).opacity = t < at ? 0 : Math.exp(-(t - at) * 7) * 0.55;
      });

      // Phone lowers in on b20 and shows its frustum.
      const pk = outExpo(prog(t, b(20), 0.55));
      phone.position.set(0.15, 1.65 + (1 - pk) * 2.5, 0.05);
      phone.visible = t > b(20) - 0.05;
      phone.updateMatrixWorld();
      lensW.copy(lens).applyMatrix4(phone.matrixWorld);
      const arr = fr.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < 4; i++) arr.setXYZ(i * 2, lensW.x, lensW.y, lensW.z);
      arr.needsUpdate = true; frustum.computeLineDistances();
      (frustum.material as THREE.LineDashedMaterial).opacity = prog(t, b(20) + 0.25, 0.3) * 0.85;
      for (let i = 0; i < 4; i++) {
        const [ax, az] = corners[i], [bx, bz] = corners[(i + 1) % 4];
        coneArr.setXYZ(i * 3, lensW.x, lensW.y, lensW.z); coneArr.setXYZ(i * 3 + 1, ax, 0.01, az); coneArr.setXYZ(i * 3 + 2, bx, 0.01, bz);
      }
      coneArr.needsUpdate = true; coneGeo.computeBoundingSphere();
      (cone.material as THREE.MeshBasicMaterial).opacity = prog(t, b(20) + 0.25, 0.3) * 0.07;

      // Camera: top-down on the drop → 3/4 orbit → pull up for the phone → dive into one object.
      const f = fitFactor(aspect, 1.5);
      const orbit = keys(t, [[T, -0.55], [b(20), 0.25]], x => x);
      const radius = keys(t, [[T, 0.3], [T + 0.9, 3.1], [b(20), 3.0], [b(20) + 0.5, 3.9]], outExpo) * f;
      const height = keys(t, [[T, 4.4], [T + 0.9, 2.05], [b(20), 1.9], [b(20) + 0.5, 3.2]], outExpo) * (0.8 + 0.2 * f);
      camPos.set(Math.sin(orbit) * radius, height, Math.cos(orbit) * radius);
      look.set(0, keys(t, [[b(20), 0], [b(20) + 0.5, 0.55]], outExpo), 0);
      const dk = inExpo(prog(t, b(20.55), b(21) - b(20.55)));
      if (dk > 0) {
        diveTarget.set(X(dive.x), dive.r * S * 0.55, Z(dive.y));
        diveCam.copy(diveTarget).add(diveOffset);
        camPos.lerp(diveCam, dk);
        look.lerp(diveTarget, clamp01(dk * 1.6));
      }
      cam.fov = t < b(20.55) ? keys(t, [[T, 52], [T + 0.9, 36]], outExpo) : keys(t, [[b(20.55), 36], [b(21), 58]], inExpo);
      cam.position.copy(camPos); cam.lookAt(look); cam.updateProjectionMatrix();
      heat.visible = heatMat.opacity > 0.001;
    },
  };
}
