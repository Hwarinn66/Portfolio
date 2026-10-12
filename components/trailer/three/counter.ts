import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { b, objects, ROI, SCAN, scanX, SHUTTER, tiles } from '../trailer-data';
import { canvasTexture, clamp01, fitFactor, inExpo, keys, outBack, outBounce, outExpo, prog, type Rig } from './util';

const S = 1 / 500;
const X = (x: number) => (x - 500) * S;
const Z = (y: number) => (y - 500) * S;

/**
 * Dense Object Counter: a tray of 50 objects drops in, a USB webcam on an
 * overhead arm lowers in, focuses, takes its snapshot with a flash, then a scan
 * line sweeps the tray: each object gets its bounding box as the line passes
 * and the density map is revealed behind it. The camera then dives into one object.
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
  // Reveal the density map only where the scan line has already passed.
  const heatReveal = { value: -2 };
  heatMat.onBeforeCompile = shader => {
    shader.uniforms.uReveal = heatReveal;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying float vX;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvX = position.x;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uReveal; varying float vX;')
      .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb *= smoothstep(uReveal + 0.04, uReveal - 0.04, vX);');
  };
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

  // USB webcam on an overhead arm: it lowers in, takes a snapshot, then sweeps a scan line across the tray.
  const cam3 = new THREE.Group();
  const graphite = new THREE.MeshStandardMaterial({ color: '#1b1b22', roughness: 0.55, metalness: 0.35 });
  const glass = new THREE.MeshStandardMaterial({ color: '#05060a', roughness: 0.08, metalness: 0.6 });
  const silver = new THREE.MeshStandardMaterial({ color: '#c9ced6', roughness: 0.25, metalness: 1 });
  const head = new THREE.Group(); // modelled facing +z, turned to look straight down
  head.rotation.x = Math.PI / 2;
  cam3.add(head);
  head.add(new THREE.Mesh(new RoundedBoxGeometry(0.94, 0.3, 0.3, 5, 0.14), graphite));
  const face = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.24, 0.04, 4, 0.1), glass);
  face.position.z = 0.14; head.add(face);
  const focusRing = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.018, 12, 48), silver);
  focusRing.position.z = 0.165; head.add(focusRing);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 40), new THREE.MeshStandardMaterial({ color: '#0b0c12', roughness: 0.3, metalness: 0.5 }));
  barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.15; head.add(barrel);
  const lensGlassMat = new THREE.MeshStandardMaterial({ color: '#1a2a6a', roughness: 0.04, metalness: 0.9, emissive: '#3b5bff', emissiveIntensity: 0.15 });
  const lensGlass = new THREE.Mesh(new THREE.SphereGeometry(0.075, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), lensGlassMat);
  lensGlass.rotation.x = Math.PI / 2; lensGlass.position.z = 0.165; lensGlass.scale.set(1, 0.35, 1); head.add(lensGlass);
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, toneMapped: false }));
  iris.position.z = 0.192; head.add(iris);
  const ledMat = new THREE.MeshStandardMaterial({ color: '#2b2b2b', emissive: '#7dff6b', emissiveIntensity: 0 });
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.014, 16), ledMat);
  led.position.set(0.2, 0, 0.162); head.add(led);
  for (const x of [-0.3, 0.32]) { const hole = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), new THREE.MeshBasicMaterial({ color: '#000000' })); hole.position.set(x, 0, 0.162); head.add(hole); }
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.05), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTexture(256, 64, (ctx, w, h) => {
    ctx.fillStyle = 'rgba(220,224,232,.85)'; ctx.font = '600 34px "JetBrains Mono Variable", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('HD 1080p', w / 2, h / 2);
  }) }));
  label.position.set(-0.3, -0.07, 0.162); label.visible = false; head.add(label);
  // clip, hinge and the arm it hangs from
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 20), silver);
  hinge.rotation.z = Math.PI / 2; hinge.position.y = 0.2; cam3.add(hinge);
  const clip = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.22, 0.12, 2, 0.03), graphite);
  clip.position.y = 0.33; cam3.add(clip);
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 5, 16), silver);
  arm.position.y = 2.9; cam3.add(arm);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.45, 0.02, 0), new THREE.Vector3(0.62, 0.3, 0.02), new THREE.Vector3(0.12, 0.9, 0.05), new THREE.Vector3(0.06, 5.4, 0.05)]), 40, 0.014, 8), new THREE.MeshStandardMaterial({ color: '#0d0d10', roughness: 0.6 }));
  cam3.add(cable);
  cam3.rotation.y = 0.35;
  group.add(cam3);
  const lens = new THREE.Vector3(0, -0.17, 0);
  const corners = [[r0, r0], [r1, r0], [r1, r1], [r0, r1]];
  const fr = new THREE.BufferGeometry().setFromPoints(corners.flatMap(([x, z]) => [new THREE.Vector3(), new THREE.Vector3(x, 0.01, z)]));
  const frustum = new THREE.LineSegments(fr, new THREE.LineDashedMaterial({ color: '#fcffa4', dashSize: 0.06, gapSize: 0.04, transparent: true, opacity: 0, toneMapped: false }));
  group.add(frustum);
  const coneGeo = new THREE.BufferGeometry();
  const coneArr = new THREE.BufferAttribute(new Float32Array(36), 3);
  coneGeo.setAttribute('position', coneArr);
  const coneMat = new THREE.MeshBasicMaterial({ color: '#fca50a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  group.add(cone);
  // Scan: a laser sheet from the lens to a bright line that crosses the tray.
  const sheetGeo = new THREE.BufferGeometry();
  const sheetArr = new THREE.BufferAttribute(new Float32Array(9), 3);
  sheetGeo.setAttribute('position', sheetArr);
  const sheetMat = new THREE.MeshBasicMaterial({ color: '#ff5a3c', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const sheet = new THREE.Mesh(sheetGeo, sheetMat);
  group.add(sheet);
  const lineMat = new THREE.MeshBasicMaterial({ color: '#fff2c8', transparent: true, opacity: 0, toneMapped: false });
  const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(0.018, r1 - r0 + 0.12), lineMat);
  scanLine.rotation.x = -Math.PI / 2; scanLine.position.y = 0.012;
  group.add(scanLine);
  const glowMat = new THREE.MeshBasicMaterial({ color: '#ff5a3c', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const scanGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.16, r1 - r0 + 0.2), glowMat);
  scanGlow.rotation.x = -Math.PI / 2; scanGlow.position.y = 0.011;
  group.add(scanGlow);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), pos = new THREE.Vector3(), scl = new THREE.Vector3();
  const camPos = new THREE.Vector3(), look = new THREE.Vector3(), lensW = new THREE.Vector3();
  const dive = objects[order[3]];
  // When the sweep reaches each object (inverse of scanX, by bisection).
  const scanPassAt = objects.map(o => {
    const target = X(o.x);
    let lo = SCAN[0], hi = SCAN[1];
    for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; if (scanX(mid) < target) lo = mid; else hi = mid; }
    return hi;
  });
  const diveTarget = new THREE.Vector3(), diveCam = new THREE.Vector3(), diveOffset = new THREE.Vector3(0.02, 0.12, 0.08);

  return {
    from: T - 0.05, to: b(21), group,
    update(t, cam, aspect) {
      // Objects fall onto the tray on the drop, nearest the centre first.
      for (let i = 0; i < n; i++) {
        const o = objects[i];
        const k = prog(t, T + rank[i] * 0.009, 0.62);
        const h = o.r * S * 0.55;
        const y = h + (1 - outBounce(k)) * (1.7 + (i % 7) * 0.12);
        const s = k <= 0 ? 0 : 0.55 + 0.45 * outExpo(Math.min(1, k * 2));
        e.set(0, o.rot, 0.12 * Math.sin(i)); q.setFromEuler(e);
        scl.set(o.r * S * s, h * s, o.r * S * 0.74 * s);
        pos.set(X(o.x), y, Z(o.y));
        beads.setMatrixAt(i, m4.compose(pos, q, scl));
        // Each box pops the moment the scan line passes its object.
        const passed = scanPassAt[i];
        const bk = prog(t, passed, 0.24);
        const bs = bk <= 0 ? 0 : outBack(bk, 2.4) * o.r * S * 2.5;
        q.identity(); pos.set(X(o.x), h * 2 + 0.006, Z(o.y)); scl.set(bs, 1, bs);
        boxes.setMatrixAt(i, m4.compose(pos, q, scl));
      }
      beads.instanceMatrix.needsUpdate = true;
      boxes.instanceMatrix.needsUpdate = true;
      (boxes.material as THREE.MeshBasicMaterial).opacity = keys(t, [[b(20.6), 1], [b(21), 0.4]]);

      heatMat.opacity = keys(t, [[SCAN[0], 0], [SCAN[0] + 0.1, 0.95], [b(20), 0.75], [b(20.5), 0.55]]);
      heatReveal.value = t < SCAN[0] ? -2 : t > SCAN[1] ? 2 : scanX(t);
      roiGeo.setDrawRange(0, Math.floor(prog(t, b(17.6), 0.4) * 201));
      tileLines.forEach((line, i) => { (line.material as THREE.LineDashedMaterial).opacity = prog(t, b(18) + i * 0.035, 0.1) * 0.7; });
      tileFlash.forEach((f, i) => {
        const at = b(18) + i * 0.035;
        (f.material as THREE.MeshBasicMaterial).opacity = t < at ? 0 : Math.exp(-(t - at) * 7) * 0.55;
      });

      // Webcam lowers in, focuses, flashes its snapshot, then scans.
      const pk = outExpo(prog(t, b(17.75), 0.7));
      cam3.position.set(0.15, 1.5 + (1 - pk) * 3.2, 0.05);
      cam3.visible = t > b(17.7);
      head.rotation.z = Math.sin(t * 1.3) * 0.02;
      focusRing.rotation.z = keys(t, [[b(18.2), 0], [b(18.5), 2.4]], x => 1 - Math.pow(1 - x, 3));
      const flashK = t >= SHUTTER ? Math.exp(-(t - SHUTTER) * 9) : 0;
      ledMat.emissive.set(t > SHUTTER - 0.25 && t < SCAN[1] ? '#ff3b30' : '#7dff6b');
      ledMat.emissiveIntensity = t > b(18.1) ? (t > SHUTTER - 0.25 && t < SHUTTER ? (Math.floor(t * 12) % 2 ? 4 : 0.5) : 3) : 0;
      lensGlassMat.emissiveIntensity = 0.15 + flashK * 8;
      (iris.material as THREE.MeshBasicMaterial).opacity = flashK;
      iris.scale.setScalar(1 + flashK * 2);
      key.intensity = 2.4 + flashK * 7;
      cam3.updateMatrixWorld();
      lensW.copy(lens).applyMatrix4(cam3.matrixWorld);
      const arr = fr.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < 4; i++) arr.setXYZ(i * 2, lensW.x, lensW.y, lensW.z);
      arr.needsUpdate = true; frustum.computeLineDistances();
      const show = prog(t, b(18.2), 0.3);
      (frustum.material as THREE.LineDashedMaterial).opacity = show * 0.85;
      for (let i = 0; i < 4; i++) {
        const [ax, az] = corners[i], [bx, bz] = corners[(i + 1) % 4];
        coneArr.setXYZ(i * 3, lensW.x, lensW.y, lensW.z); coneArr.setXYZ(i * 3 + 1, ax, 0.01, az); coneArr.setXYZ(i * 3 + 2, bx, 0.01, bz);
      }
      coneArr.needsUpdate = true; coneGeo.computeBoundingSphere();
      coneMat.color.set(flashK > 0.05 ? '#ffffff' : '#fca50a');
      coneMat.opacity = Math.max(show * 0.06, flashK * 0.36);
      // Scan line and laser sheet
      const sx = scanX(t);
      const scanning = t > SCAN[0] && t < SCAN[1] + 0.15;
      const sOn = scanning ? Math.min(1, (t - SCAN[0]) / 0.08) * (t > SCAN[1] ? 1 - (t - SCAN[1]) / 0.15 : 1) : 0;
      sheetArr.setXYZ(0, lensW.x, lensW.y, lensW.z); sheetArr.setXYZ(1, sx, 0.012, r0 - 0.06); sheetArr.setXYZ(2, sx, 0.012, r1 + 0.06);
      sheetArr.needsUpdate = true; sheetGeo.computeBoundingSphere();
      sheetMat.opacity = sOn * 0.32;
      scanLine.position.x = sx; scanGlow.position.x = sx;
      lineMat.opacity = sOn; glowMat.opacity = sOn * 0.55;
      sheet.visible = scanLine.visible = scanGlow.visible = sOn > 0.001;

      // Camera: top-down on the drop → 3/4 orbit → pull up to show the webcam → dive into one object.
      const f = fitFactor(aspect, 1.5);
      const orbit = keys(t, [[T, -0.55], [b(20), 0.25]], x => x);
      const radius = keys(t, [[T, 0.3], [T + 0.9, 3.1], [b(18.1), 3.7], [b(20), 3.6], [b(20) + 0.5, 4.0]], outExpo) * f;
      const height = keys(t, [[T, 4.4], [T + 0.9, 2.05], [b(18.1), 1.55], [b(20), 1.75], [b(20) + 0.5, 3.0]], outExpo) * (0.8 + 0.2 * f);
      camPos.set(Math.sin(orbit) * radius, height, Math.cos(orbit) * radius);
      look.set(0, keys(t, [[T + 0.9, 0], [b(18.1), 0.72], [b(20), 0.72], [b(20) + 0.5, 0.55]], outExpo), 0);
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
