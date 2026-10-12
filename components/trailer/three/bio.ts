import * as THREE from 'three';
import { b } from '../trailer-data';
import { dotTexture, fitFactor, hump, inExpo, inOutCubic, keys, kickEnv, outBack, outExpo, prog, type Rig, type View } from './util';
import { blendCurl, GESTURES, HAND_CONNECTIONS, handPose, TIPS, type Curl } from './hand-pose';

/** Head-shaped surface: z offset of the face features at (x, y) on the front. */
function faceRelief(x: number, y: number) {
  let z = 0;
  z += 0.2 * Math.exp(-(x * x) / 0.008) * Math.exp(-((y + 0.08) ** 2) / 0.05); // nose bridge
  z += 0.08 * Math.exp(-(x * x + (y + 0.26) ** 2) / 0.01); // nose tip
  z -= 0.1 * Math.exp(-((Math.abs(x) - 0.3) ** 2 + (y - 0.1) ** 2) / 0.012); // eye sockets
  z += 0.05 * Math.exp(-((y - 0.27) ** 2) / 0.004) * (Math.abs(x) < 0.55 ? 1 : 0); // brow
  z += 0.05 * Math.exp(-(x * x) / 0.04 - ((y + 0.52) ** 2) / 0.004); // lips
  z += 0.04 * Math.exp(-((Math.abs(x) - 0.42) ** 2 + (y + 0.08) ** 2) / 0.02); // cheekbones
  return z;
}
function headPoint(theta: number, phi: number, out: THREE.Vector3) {
  // theta: around the vertical axis (0 = facing +z), phi: elevation
  let x = Math.sin(theta) * Math.cos(phi), y = Math.sin(phi), z = Math.cos(theta) * Math.cos(phi);
  const jaw = y < -0.2 ? 1 - 0.32 * Math.min(1, (-0.2 - y) / 0.75) : 1;
  x *= 0.78 * jaw; z *= 0.9 * (y < -0.2 ? 1 - 0.12 * Math.min(1, (-0.2 - y) / 0.75) : 1);
  y *= 1.05;
  if (z > 0) z += faceRelief(x, y) * Math.min(1, z * 3);
  return out.set(x, y + 0.05, z);
}

/**
 * Face Recognition → Hand Gesture. A point-cloud head is scanned, its face mesh
 * wires up, it blinks (liveness) and is recognised; then every point flies into
 * the shape of a hand, which becomes a glossy 21-landmark skeleton that signs
 * peace, rock, thumbs-up and open palm on the beat, then swipes away.
 */
export function makeBioRig(opts: { mobile: boolean }, view: View): Rig {
  const group = new THREE.Group();
  const T = b(29), MORPH = b(32), END = b(35);
  const N = opts.mobile ? 3200 : 5200;

  // ── Point cloud: face (A) and hand (B) positions ─────────────
  const posA = new Float32Array(N * 3), posB = new Float32Array(N * 3), rand = new Float32Array(N), eye = new Float32Array(N), feat = new Float32Array(N);
  let seed = 5;
  const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const p = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    rand[i] = r();
    if (i < N * 0.08) {
      // neck
      const a = r() * Math.PI * 2, y = -0.95 - r() * 0.55;
      p.set(Math.sin(a) * 0.34, y, Math.cos(a) * 0.3);
    } else {
      const front = r() < 0.72;
      const theta = front ? (r() - 0.5) * Math.PI * 1.05 : r() * Math.PI * 2;
      const phi = Math.asin(r() * 2 - 1) * (front ? 0.92 : 1);
      headPoint(theta, phi, p);
      if (p.z > 0.2 && Math.hypot(Math.abs(p.x) - 0.3, p.y - 0.12) < 0.11) eye[i] = 1;
      if (p.z > 0.3) feat[i] = Math.min(1, faceRelief(p.x, p.y) * 9 + Math.max(0, -faceRelief(p.x, p.y)) * 10 + eye[i]);
    }
    posA.set([p.x, p.y, p.z], i * 3);
  }
  // Hand target: points scattered along the open-hand skeleton.
  const joints = Array.from({ length: 21 }, () => new THREE.Vector3());
  handPose(GESTURES.open, joints);
  const lens = HAND_CONNECTIONS.map(([a, c]) => joints[a].distanceTo(joints[c]));
  const total = lens.reduce((x, y) => x + y, 0);
  const HAND_SCALE = 1.0, HAND_Y = -0.5;
  for (let i = 0; i < N; i++) {
    let pick = r() * total, k = 0;
    while (pick > lens[k] && k < lens.length - 1) { pick -= lens[k]; k++; }
    const [a, c] = HAND_CONNECTIONS[k];
    p.lerpVectors(joints[a], joints[c], r());
    const rr = 0.04 + r() * 0.05, ang = r() * Math.PI * 2;
    p.x += Math.cos(ang) * rr; p.z += Math.sin(ang) * rr; p.y += (r() - 0.5) * 0.04;
    posB.set([p.x * HAND_SCALE, p.y * HAND_SCALE + HAND_Y, p.z * HAND_SCALE], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posA, 3));
  geo.setAttribute('aB', new THREE.BufferAttribute(posB, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aEye', new THREE.BufferAttribute(eye, 1));
  geo.setAttribute('aFeat', new THREE.BufferAttribute(feat, 1));
  const uniforms = {
    uForm: { value: 0 }, uMorph: { value: 0 }, uScan: { value: 2 }, uBlink: { value: 0 }, uAlpha: { value: 1 },
    uSize: { value: 0.022 }, uScale: { value: 1000 }, uMap: { value: dotTexture() }, uTime: { value: 0 },
    uColA: { value: new THREE.Color('#5ff3ff') }, uColB: { value: new THREE.Color('#fff4e8') }, uOk: { value: 0 }, uPulse: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aB; attribute float aRand; attribute float aEye; attribute float aFeat;
      uniform float uForm, uMorph, uScan, uBlink, uSize, uScale, uTime, uPulse;
      varying float vGlow; varying float vRand; varying float vM;
      void main() {
        vec3 a = position;
        // blink: eye points collapse vertically toward the eye line
        a.y = mix(a.y, 0.15, uBlink * aEye * 0.85);
        // beat pulse: the cloud breathes outward
        a += normalize(a + vec3(0.0001)) * uPulse * (0.04 + aRand * 0.12);
        vec3 scatter = a * (2.2 + aRand * 2.0) + vec3(sin(aRand * 50.0), cos(aRand * 70.0), sin(aRand * 90.0)) * 1.5;
        float f = clamp(uForm * 1.5 - aRand * 0.5, 0.0, 1.0);
        a = mix(scatter, a, 1.0 - pow(1.0 - f, 3.0));
        float m = clamp(uMorph * 1.6 - aRand * 0.6, 0.0, 1.0);
        float me = m < 0.5 ? 4.0 * m * m * m : 1.0 - pow(-2.0 * m + 2.0, 3.0) / 2.0;
        vec3 mid = mix(a, aB, 0.5) + normalize(a + vec3(0.0001)) * 1.4 * (0.4 + aRand);
        vec3 p = mix(mix(a, mid, me * 2.0), mix(mid, aB, me * 2.0 - 1.0), step(0.5, me));
        p += vec3(sin(uTime * 3.0 + aRand * 20.0), cos(uTime * 2.4 + aRand * 13.0), 0.0) * 0.006;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float scan = exp(-pow((position.y - uScan) * 9.0, 2.0));
        vGlow = 0.5 + scan * 2.4 + (aEye * 0.6 + aFeat * 0.9) * (1.0 - uMorph);
        vRand = aRand; vM = me;
        gl_PointSize = uSize * uScale * (0.6 + aRand * 0.8) * (1.0 + scan * 0.8) / -mv.z;
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform float uAlpha, uOk; uniform vec3 uColA, uColB;
      varying float vGlow; varying float vRand; varying float vM;
      void main() {
        float a = texture2D(uMap, gl_PointCoord).a;
        vec3 face = mix(uColA, vec3(0.55, 1.0, 0.75), uOk);
        vec3 col = mix(face, uColB, vM) * vGlow;
        gl_FragColor = vec4(col, a * uAlpha * (0.55 + vRand * 0.45));
      }`,
  });
  const cloud = new THREE.Points(geo, mat);
  cloud.frustumCulled = false;
  const head = new THREE.Group();
  head.add(cloud);
  group.add(head);

  // Face mesh wireframe (landmark grid over the front of the face)
  const gx = 11, gy = 13, grid: THREE.Vector3[][] = [];
  for (let j = 0; j < gy; j++) {
    const row: THREE.Vector3[] = [];
    for (let i = 0; i < gx; i++) {
      const theta = ((i / (gx - 1)) - 0.5) * 1.5, phi = -0.82 + (j / (gy - 1)) * 1.32;
      row.push(headPoint(theta, phi, new THREE.Vector3()).multiplyScalar(1.012));
    }
    grid.push(row);
  }
  const segs: number[] = [];
  for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) {
    const q = grid[j][i];
    if (i < gx - 1) segs.push(q.x, q.y, q.z, grid[j][i + 1].x, grid[j][i + 1].y, grid[j][i + 1].z);
    if (j < gy - 1) segs.push(q.x, q.y, q.z, grid[j + 1][i].x, grid[j + 1][i].y, grid[j + 1][i].z);
    if (i < gx - 1 && j < gy - 1 && (i + j) % 2 === 0) segs.push(q.x, q.y, q.z, grid[j + 1][i + 1].x, grid[j + 1][i + 1].y, grid[j + 1][i + 1].z);
  }
  const meshGeo = new THREE.BufferGeometry();
  meshGeo.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3));
  const meshLines = new THREE.LineSegments(meshGeo, new THREE.LineBasicMaterial({ color: '#5ff3ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  head.add(meshLines);
  const segCount = segs.length / 3;

  // Scan ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 6, 160), new THREE.MeshBasicMaterial({ color: '#b8ffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, toneMapped: false }));
  ring.rotation.x = Math.PI / 2;
  head.add(ring);

  // ── Hand skeleton ────────────────────────────────────────────
  const hand = new THREE.Group();
  hand.scale.setScalar(HAND_SCALE);
  group.add(hand);
  group.add(new THREE.HemisphereLight('#ffffff', '#ff3d7f', 1.3));
  const key = new THREE.DirectionalLight('#ffffff', 2.6); key.position.set(1.5, 2.5, 4); group.add(key);
  const back = new THREE.DirectionalLight('#ffd166', 2); back.position.set(-2, 1, -3); group.add(back);
  const jointMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 28, 18), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.15 }), 21);
  const tipColor = new THREE.Color('#ff2e88'), baseColor = new THREE.Color('#ffffff'), wristColor = new THREE.Color('#ffd166');
  for (let i = 0; i < 21; i++) jointMesh.setColorAt(i, TIPS.includes(i) ? tipColor : i === 0 ? wristColor : baseColor);
  const boneMesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 18), new THREE.MeshPhysicalMaterial({ color: '#ffe3ef', roughness: 0.25, clearcoat: 0.8 }), HAND_CONNECTIONS.length);
  hand.add(jointMesh, boneMesh);
  const pose = Array.from({ length: 21 }, () => new THREE.Vector3());
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), mid = new THREE.Vector3(), sc = new THREE.Vector3();

  const gestureKeys: [number, Curl][] = [
    [MORPH, GESTURES.open], [b(33), GESTURES.peace], [b(33.5), GESTURES.rock], [b(34), GESTURES.thumbs], [b(34.5), GESTURES.open],
  ];
  const gestureBeats = [b(33), b(33.5), b(34), b(34.5)];
  const curlAt = (t: number): Curl => {
    let cur = gestureKeys[0][1];
    for (let i = 1; i < gestureKeys.length; i++) {
      const [at, g] = gestureKeys[i];
      if (t < at) break;
      cur = blendCurl(cur, g, outBack(prog(t, at, 0.17), 1.4));
    }
    return cur;
  };

  return {
    from: T - 0.02, to: END + 0.08, group,
    update(t, cam, aspect) {
      uniforms.uTime.value = t;
      uniforms.uScale.value = view.pxScale(cam.fov);
      // Face
      uniforms.uForm.value = outExpo(prog(t, T, 0.6));
      uniforms.uScan.value = keys(t, [[T, 1.4], [b(30), -1.5], [b(30.01), 1.4], [b(31), -1.5]], inOutCubic);
      (ring.material as THREE.MeshBasicMaterial).opacity = t < b(31) ? 0.85 : 0;
      ring.position.y = uniforms.uScan.value;
      const yy = ring.position.y;
      const rad = Math.max(0.05, Math.sqrt(Math.max(0, 1 - (yy / 1.05) ** 2)) * 0.95);
      ring.scale.set(rad * 0.85, rad, 1);
      uniforms.uBlink.value = [b(30.5), b(30.85)].reduce((acc, at) => Math.max(acc, t > at && t < at + 0.18 ? Math.sin(((t - at) / 0.18) * Math.PI) : 0), 0);
      uniforms.uOk.value = prog(t, b(31), 0.2);
      uniforms.uPulse.value = kickEnv(t, [b(30), b(31)], 6) + kickEnv(t, [b(29.5), b(30.5), b(31.5)], 8) * 0.5;
      meshGeo.setDrawRange(0, Math.floor(prog(t, b(30), 0.45) * segCount / 2) * 2);
      (meshLines.material as THREE.LineBasicMaterial).opacity = keys(t, [[b(30), 0], [b(30) + 0.1, 0.55], [MORPH, 0.45], [MORPH + 0.1, 0]]);
      head.rotation.y = keys(t, [[T, -0.85], [b(31), -0.38], [MORPH, -0.2]], inOutCubic) * (1 - prog(t, MORPH, 0.3));
      head.rotation.x = keys(t, [[T, 0.12], [b(31), 0]], inOutCubic);
      // Morph into the hand
      const morph = prog(t, MORPH, 0.55);
      uniforms.uMorph.value = morph;
      const solid = outExpo(prog(t, MORPH + 0.4, 0.35));
      uniforms.uAlpha.value = (t < T + 0.02 ? 0 : 1) * (1 - solid);
      uniforms.uSize.value = 0.022 + morph * 0.008;

      // Hand
      hand.visible = solid > 0.001;
      if (hand.visible) {
        handPose(curlAt(t), pose);
        const thumbsK = outBack(prog(t, b(34), 0.2), 1.4) * (1 - outExpo(prog(t, b(34.5), 0.2)));
        const swipe = inExpo(prog(t, END - 0.16, 0.24));
        hand.rotation.set(-0.08 + Math.sin(t * 1.4) * 0.05, Math.sin(t * 0.9) * 0.22 - thumbsK * 0.55, thumbsK * 0.86 - swipe * 0.6);
        hand.position.set(swipe * 7, HAND_Y + Math.sin(t * 2.1) * 0.04, 0);
        for (let i = 0; i < 21; i++) {
          const rr = (i === 0 ? 0.11 : TIPS.includes(i) ? 0.085 : 0.075) * solid * (1 + hump(t, gestureBeats, 0.22) * (TIPS.includes(i) ? 0.6 : 0.25));
          jointMesh.setMatrixAt(i, m4.compose(pose[i], q.identity(), sc.setScalar(Math.max(0.0001, rr))));
        }
        HAND_CONNECTIONS.forEach(([a, c], i) => {
          dir.subVectors(pose[c], pose[a]);
          const len = dir.length();
          mid.addVectors(pose[a], pose[c]).multiplyScalar(0.5);
          q.setFromUnitVectors(up, dir.normalize());
          boneMesh.setMatrixAt(i, m4.compose(mid, q, sc.set(0.042 * solid, len, 0.042 * solid)));
        });
        jointMesh.instanceMatrix.needsUpdate = true; boneMesh.instanceMatrix.needsUpdate = true;
      }

      const f = fitFactor(aspect, 1.35);
      const d = keys(t, [[T, 5.6], [b(31), 4.8], [MORPH, 5.0], [MORPH + 0.5, 5.6], [END, 5.2]], inOutCubic) * f;
      const az = keys(t, [[T, 0.35], [b(31), 0.05], [END, -0.12]], inOutCubic);
      cam.fov = 35;
      cam.position.set(Math.sin(az) * d, 0.12, Math.cos(az) * d);
      cam.lookAt(0, keys(t, [[MORPH, -0.1], [MORPH + 0.5, 0.0]], inOutCubic), 0); cam.updateProjectionMatrix();
    },
  };
}
