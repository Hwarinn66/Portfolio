import * as THREE from 'three';
import { b } from '../trailer-data';
import { dotTexture, fitFactor, keys, outExpo, inOutSine, prog, type Rig, type View } from './util';

/**
 * Opening: a glowing particle camera aperture (six iris blades) that assembles
 * out of a scattered field, turns slowly, then blows out toward the camera.
 */
export function makeNumeralRig(opts: { mobile: boolean }, view: View): Rig {
  const group = new THREE.Group();
  const N = opts.mobile ? 2200 : 3600;

  // Draw the aperture on a canvas, then sample its pixels.
  const cw = 640, ch = 400;
  const c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const ctx = c.getContext('2d')!;
  const cx = cw / 2, cy = ch / 2, R = 186;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff';
  ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R - 26, 0, Math.PI * 2); ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  const hex = (k: number) => { const a = (k / 6) * Math.PI * 2 + 0.3; return [cx + Math.cos(a) * 64, cy + Math.sin(a) * 64]; };
  ctx.beginPath(); for (let k = 0; k < 6; k++) { const [x, y] = hex(k); if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.closePath(); ctx.fill();
  ctx.lineWidth = 7;
  for (let k = 0; k < 6; k++) {
    const [x0, y0] = hex(k), [x1, y1] = hex(k + 1);
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + (dx / len) * 260, y0 + (dy / len) * 260); ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const filled: number[] = [];
  for (let y = 0; y < ch; y += 2) for (let x = 0; x < cw; x += 2) if (data[(y * cw + x) * 4 + 3] > 140) filled.push(x, y);

  const target = new Float32Array(N * 3), start = new Float32Array(N * 3), rand = new Float32Array(N), color = new Float32Array(N * 3);
  const cA = new THREE.Color('#5b8cff'), cB = new THREE.Color('#a77bff'), cC = new THREE.Color('#ffb27a');
  const tmp = new THREE.Color();
  let seed = 11;
  const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const W = 3.6, scale = W / cw;
  for (let i = 0; i < N; i++) {
    const k = Math.floor(r() * (filled.length / 2)) * 2;
    const x = (filled[k] - cw / 2) * scale + (r() - 0.5) * 0.02, y = -(filled[k + 1] - ch / 2) * scale + (r() - 0.5) * 0.02;
    target[i * 3] = x; target[i * 3 + 1] = y; target[i * 3 + 2] = (r() - 0.5) * 0.28;
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), rad = 2.5 + r() * 4.5;
    start[i * 3] = Math.sin(ph) * Math.cos(th) * rad; start[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * rad * 0.7; start[i * 3 + 2] = Math.cos(ph) * rad - 1.5;
    rand[i] = r();
    const u = (x / W + 0.5);
    if (u < 0.5) tmp.copy(cA).lerp(cB, u * 2); else tmp.copy(cB).lerp(cC, (u - 0.5) * 2);
    color[i * 3] = tmp.r; color[i * 3 + 1] = tmp.g; color[i * 3 + 2] = tmp.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(target, 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
  const uniforms = {
    uForm: { value: 0 }, uBlow: { value: 0 }, uTime: { value: 0 }, uAlpha: { value: 0 },
    uSize: { value: 0.034 }, uScale: { value: 1000 }, uMap: { value: dotTexture() }, uPulse: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute vec3 aStart; attribute float aRand; attribute vec3 aColor;
      uniform float uForm, uBlow, uTime, uSize, uScale, uPulse;
      varying vec3 vColor; varying float vFade;
      void main() {
        float k = clamp(uForm * 1.55 - aRand * 0.55, 0.0, 1.0);
        k = 1.0 - pow(2.0, -10.0 * k);
        vec3 p = mix(aStart, position, k);
        p += vec3(sin(uTime * 2.1 + aRand * 40.0), cos(uTime * 1.7 + aRand * 31.0), sin(uTime * 1.3 + aRand * 17.0)) * 0.018 * k;
        p *= 1.0 + uPulse * 0.05;
        vec3 dir = normalize(position + vec3(0.0, 0.0, 1.6) + vec3(aRand - 0.5) * 0.6);
        p += dir * uBlow * (2.5 + aRand * 5.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uScale * (0.55 + aRand * 0.9) * (1.0 + uPulse * 0.4) / -mv.z;
        vColor = aColor * (0.95 + uPulse * 0.6); vFade = 1.0 - uBlow * (0.4 + aRand * 0.6);
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uMap; uniform float uAlpha;
      varying vec3 vColor; varying float vFade;
      void main() {
        float a = texture2D(uMap, gl_PointCoord).a;
        gl_FragColor = vec4(vColor, a * uAlpha * clamp(vFade, 0.0, 1.0));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  group.add(points);

  const from = b(3.4), to = b(8.25);
  return {
    from, to, group,
    update(t, cam, aspect) {
      uniforms.uTime.value = t;
      uniforms.uScale.value = view.pxScale(38);
      uniforms.uAlpha.value = keys(t, [[from, 0], [from + 0.35, 1], [b(7.6), 1], [to, 0]]);
      uniforms.uForm.value = outExpo(prog(t, b(4) - 0.1, 1.5)) * 0.999 + 0.001;
      uniforms.uBlow.value = Math.pow(prog(t, b(7.55), 0.6), 1.6);
      uniforms.uPulse.value = 0;
      group.rotation.y = Math.sin(t * 0.6) * 0.22 + keys(t, [[b(4), -0.5], [b(5.5), 0]], outExpo);
      group.rotation.z = -t * 0.22;
      group.rotation.x = Math.sin(t * 0.45) * 0.06;
      const f = fitFactor(aspect, 1.3);
      cam.fov = 38; cam.position.set(0, 0.05, keys(t, [[from, 7.6], [b(6), 6.1], [b(8), 4.6]], inOutSine) * f);
      cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    },
  };
}
