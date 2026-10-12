import * as THREE from 'three';
import { b } from '../trailer-data';
import { canvasTexture, fitFactor, inExpo, keys, outElastic, outExpo, prog, type Rig } from './util';

/**
 * InnerSelf Cognitive: a pearlescent "mind" orb with the eight cognitive
 * functions orbiting on two rings. Reasons stream in, the functions wire up,
 * and the dominant stack (Te – Ni – Se – Fi) lights up.
 */
export function makeOrbRig(opts: { mobile: boolean }): Rig {
  const group = new THREE.Group();
  const T = b(21), END = b(24);

  group.add(new THREE.HemisphereLight('#ffffff', '#b9a6ff', 1.4));
  const key = new THREE.DirectionalLight('#fff4ea', 2); key.position.set(2, 3, 4); group.add(key);

  const uniforms = { uTime: { value: 0 }, uGlow: { value: 0 } };
  const orbMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */`
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        vP = position;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform float uTime, uGlow;
      varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main() {
        float fr = pow(1.0 - max(dot(vN, vV), 0.0), 2.0);
        float flow = sin(vP.y * 3.2 + uTime * 1.4 + sin(vP.x * 2.3 + uTime * 0.9) * 1.6) * 0.5 + 0.5;
        float flow2 = sin(vP.z * 4.0 - uTime * 1.1 + vP.y * 2.0) * 0.5 + 0.5;
        vec3 lilac = vec3(0.80, 0.72, 1.0), peach = vec3(1.0, 0.80, 0.68), mint = vec3(0.70, 0.95, 0.88), deep = vec3(0.36, 0.24, 0.80);
        vec3 col = mix(lilac, peach, flow);
        col = mix(col, mint, flow2 * 0.35);
        col = mix(col, deep, (1.0 - fr) * 0.42);
        float spec = pow(max(dot(reflect(-vV, vN), normalize(vec3(0.4, 0.8, 0.5))), 0.0), 28.0);
        col += fr * 0.55 + spec * 0.6 + uGlow * vec3(1.0, 0.75, 0.35) * 0.35;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(1, opts.mobile ? 64 : 96, opts.mobile ? 48 : 64), orbMat);
  group.add(orb);

  // Contact shadow
  const shadowTex = canvasTexture(128, 128, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(60,30,130,.55)'); g.addColorStop(1, 'rgba(60,30,130,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, w);
  });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.position.set(0, -1.75, 0); shadow.rotation.x = -Math.PI / 2.2;
  group.add(shadow);

  const fns = [
    { n: 'Te', ring: 0, a: 0 }, { n: 'Ne', ring: 0, a: 1 }, { n: 'Se', ring: 0, a: 2 }, { n: 'Fe', ring: 0, a: 3 },
    { n: 'Ti', ring: 1, a: 0.5 }, { n: 'Ni', ring: 1, a: 1.5 }, { n: 'Si', ring: 1, a: 2.5 }, { n: 'Fi', ring: 1, a: 3.5 },
  ];
  const stackFns = ['Te', 'Ni', 'Se', 'Fi'];
  const ringDefs = [{ r: 1.62, tilt: new THREE.Euler(1.18, 0, 0.38) }, { r: 1.95, tilt: new THREE.Euler(1.32, 0, -0.62) }];
  const ringGroups = ringDefs.map(def => {
    const g = new THREE.Group(); g.rotation.copy(def.tilt);
    const torus = new THREE.Mesh(new THREE.TorusGeometry(def.r, 0.007, 6, 240), new THREE.MeshBasicMaterial({ color: '#4b2a8c', transparent: true, opacity: 0.45 }));
    g.add(torus); group.add(g); return g;
  });
  const nodeMat = (stack: boolean) => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.18, metalness: 0.05, emissive: stack ? '#ff9b3d' : '#9a7cff', emissiveIntensity: 0 });
  const nodes = fns.map(fn => {
    const holder = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 16), nodeMat(stackFns.includes(fn.n)));
    const label = new THREE.Sprite(new THREE.SpriteMaterial({
      map: canvasTexture(256, 160, (ctx, w, h) => {
        ctx.fillStyle = '#2d1767'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `italic 600 120px "Fraunces Variable", Georgia, serif`;
        ctx.fillText(fn.n, w / 2, h / 2 + 6);
      }), transparent: true, depthWrite: false,
    }));
    label.scale.set(0.34, 0.21, 1); label.position.set(0.22, 0.16, 0);
    holder.add(mesh, label);
    ringGroups[fn.ring].add(holder);
    return { ...fn, holder, mesh, label, stack: stackFns.includes(fn.n) };
  });

  // Wires from the orb to each function
  const wireGeo = new THREE.BufferGeometry();
  const wireArr = new THREE.BufferAttribute(new Float32Array(fns.length * 6), 3);
  wireGeo.setAttribute('position', wireArr);
  const wires = new THREE.LineSegments(wireGeo, new THREE.LineBasicMaterial({ color: '#6a3fd6', transparent: true, opacity: 0 }));
  group.add(wires);
  const wp = new THREE.Vector3();
  const white = new THREE.Color('#ffffff'), amber = new THREE.Color('#ff9a3c');

  return {
    from: T - 0.02, to: END, group,
    update(t, cam, aspect) {
      uniforms.uTime.value = t;
      uniforms.uGlow.value = prog(t, b(23), 0.3);
      const pop = outElastic(prog(t, T, 0.75));
      const squash = inExpo(prog(t, END - 0.26, 0.26));
      orb.scale.set(pop * (1 + squash * 1.6), pop * (1 - squash * 0.97), pop * (1 + squash * 0.3));
      orb.rotation.y = t * 0.6;
      shadow.scale.setScalar(pop); (shadow.material as THREE.MeshBasicMaterial).opacity = pop * (1 - squash);
      const spin = t * 0.55;
      ringGroups.forEach((g, i) => {
        g.scale.setScalar(outExpo(prog(t, T + 0.12 + i * 0.08, 0.6)) * (1 + squash * 0.6));
        g.rotation.z = ringDefs[i].tilt.z + Math.sin(t * 0.4 + i) * 0.08;
        g.rotation.x = ringDefs[i].tilt.x - squash * 0.25;
      });
      const hot = prog(t, b(23), 0.25);
      nodes.forEach((node, i) => {
        const def = ringDefs[node.ring];
        const a = (node.a / 4) * Math.PI * 2 + spin * (node.ring ? -1 : 1);
        node.holder.position.set(Math.cos(a) * def.r, Math.sin(a) * def.r, 0);
        const appear = outExpo(prog(t, T + 0.3 + i * 0.05, 0.4));
        const s = appear * (node.stack ? 1 + hot * 0.9 : 1 - hot * 0.45);
        node.holder.scale.setScalar(Math.max(0.0001, s));
        const nm = node.mesh.material as THREE.MeshStandardMaterial;
        nm.emissiveIntensity = node.stack ? hot * 1.2 : 0.25 + prog(t, b(22), 0.3) * 0.4;
        if (node.stack) nm.color.copy(white).lerp(amber, hot);
        (node.label.material as THREE.SpriteMaterial).opacity = node.stack ? 1 : 1 - hot * 0.6;
        // Undo the ring's rotation so labels stay upright: sprites already face the camera.
        node.holder.getWorldPosition(wp);
        group.worldToLocal(wp);
        wireArr.setXYZ(i * 2, 0, 0, 0); wireArr.setXYZ(i * 2 + 1, wp.x, wp.y, wp.z);
      });
      wireArr.needsUpdate = true;
      (wires.material as THREE.LineBasicMaterial).opacity = keys(t, [[b(22), 0], [b(22) + 0.2, 0.55], [b(23), 0.35], [END - 0.2, 0.35], [END, 0]]);
      group.position.y = Math.sin(t * 1.8) * 0.05;
      const f = fitFactor(aspect, 1.45);
      const d = keys(t, [[T, 7.0], [END, 6.3]], x => x) * f;
      const az = keys(t, [[T, -0.35], [END, 0.25]], x => x);
      cam.fov = 34; cam.position.set(Math.sin(az) * d, 0.35 * f, Math.cos(az) * d);
      cam.lookAt(0, 0, 0); cam.updateProjectionMatrix();
    },
  };
}
