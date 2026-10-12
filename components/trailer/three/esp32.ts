import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { b } from '../trailer-data';
import { canvasTexture, fitFactor, hump, keys, outBack, outExpo, prog, type Rig } from './util';

/**
 * Smart Trash: an ESP32 dev board and a micro servo, modelled in millimetres.
 * The board spins in, its LED wakes, a command travels down the signal wire
 * and the servo arm swings left (organik) then right (non-organik) on the beat.
 */
export function makeEsp32Rig(opts: { mobile: boolean }): Rig {
  const group = new THREE.Group();
  const T = b(26), END = b(29);
  const rig = new THREE.Group(); // millimetre space
  rig.scale.setScalar(0.05);
  group.add(rig);

  group.add(new THREE.HemisphereLight('#eaffd8', '#0b1a10', 0.9));
  const key = new THREE.DirectionalLight('#ffffff', 2.6); key.position.set(-2, 5, 3); group.add(key);
  const rim = new THREE.DirectionalLight('#c6f432', 2.2); rim.position.set(3, 1.5, -4); group.add(rim);

  // ── PCB with silkscreen ──────────────────────────────────────
  const silk = canvasTexture(1080, 560, (ctx, w, h) => {
    ctx.fillStyle = '#10141d'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(236,240,232,.85)'; ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    const top = ['3V3', 'EN', 'VP', 'VN', '34', '35', '32', '33', '25', '26', '27', '14', '12', 'GND', '13', 'D2', 'D3', 'CMD', '5V'];
    const bot = ['GND', '23', '22', 'TX', 'RX', '21', 'GND', '19', '18', '5', '17', '16', '4', '0', '2', '15', 'D1', 'D0', 'CLK'];
    const px = (i: number) => w / 2 + (i - 9) * 50.8;
    ctx.font = '600 17px "JetBrains Mono Variable", monospace'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(236,240,232,.9)';
    for (let i = 0; i < 19; i++) {
      for (const [row, y, ly] of [[top, 26, 70], [bot, h - 26, h - 56]] as const) {
        ctx.fillStyle = '#c99a2e'; ctx.beginPath(); ctx.arc(px(i), y, 17, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#10141d'; ctx.beginPath(); ctx.arc(px(i), y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(236,240,232,.9)'; ctx.fillText(row[i], px(i), ly);
      }
    }
    ctx.textAlign = 'left'; ctx.font = '700 26px "Chakra Petch", sans-serif'; ctx.fillStyle = 'rgba(236,240,232,.92)';
    ctx.fillText('ESP32 DEVKIT', 130, h / 2 - 70);
    ctx.font = '500 18px "JetBrains Mono Variable", monospace'; ctx.fillText('smarttrash-esp32.local', 130, h / 2 + 96);
    ctx.strokeStyle = 'rgba(236,240,232,.6)'; ctx.lineWidth = 2;
    ctx.strokeRect(70, h / 2 - 50, 110, 90); ctx.strokeRect(220, h / 2 - 40, 90, 90); ctx.strokeRect(60, 120, 80, 50); ctx.strokeRect(60, h - 170, 80, 50);
    ctx.fillText('EN', 64, 112); ctx.fillText('BOOT', 64, h - 180);
    // traces
    ctx.strokeStyle = 'rgba(80,110,90,.55)'; ctx.lineWidth = 4;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(340 + i * 22, 110); ctx.lineTo(340 + i * 22, 200 + (i % 3) * 30); ctx.lineTo(470 + i * 18, 260 + (i % 4) * 22); ctx.stroke(); }
  });
  const pcbMat = new THREE.MeshStandardMaterial({ color: '#10141d', roughness: 0.6, metalness: 0.15 });
  const silkMat = new THREE.MeshStandardMaterial({ map: silk, roughness: 0.55, metalness: 0.1 });
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(54, 1.6, 28), [pcbMat, pcbMat, silkMat, pcbMat, pcbMat, pcbMat]);
  rig.add(pcb);

  // ── WROOM module: board, antenna meander, metal can ─────────
  const antenna = canvasTexture(512, 360, (ctx, w, h) => {
    ctx.fillStyle = '#0b0b10'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#d8a737'; ctx.lineWidth = 10; ctx.beginPath();
    let x = 60; ctx.moveTo(x, h - 30);
    for (let i = 0; i < 6; i++) { ctx.lineTo(x, 40); x += 34; ctx.lineTo(x, 40); ctx.lineTo(x, h - 80); x += 34; ctx.lineTo(x, h - 80); }
    ctx.stroke();
  });
  const modBase = new THREE.MeshStandardMaterial({ color: '#0b0b10', roughness: 0.5 });
  const modTop = new THREE.MeshStandardMaterial({ map: antenna, roughness: 0.4, metalness: 0.3 });
  const module = new THREE.Mesh(new THREE.BoxGeometry(25.5, 0.8, 18), [modBase, modBase, modTop, modBase, modBase, modBase]);
  module.position.set(15.3, 1.2, 0);
  rig.add(module);
  const canTop = canvasTexture(512, 480, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d9dde3'); g.addColorStop(1, '#aab0ba');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(40,44,52,.75)'; ctx.font = '700 46px "Chakra Petch", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('ESP32-WROOM-32', w / 2, h / 2 - 40);
    ctx.font = '500 30px "JetBrains Mono Variable", monospace'; ctx.fillText('Wi-Fi · Bluetooth', w / 2, h / 2 + 20);
    ctx.strokeStyle = 'rgba(40,44,52,.4)'; ctx.lineWidth = 4; ctx.strokeRect(30, 30, w - 60, h - 60);
  });
  const canSide = new THREE.MeshStandardMaterial({ color: '#c9ced6', roughness: 0.28, metalness: 1 });
  const can = new THREE.Mesh(new THREE.BoxGeometry(17.6, 2.4, 16), [canSide, canSide, new THREE.MeshStandardMaterial({ map: canTop, roughness: 0.32, metalness: 0.85 }), canSide, canSide, canSide]);
  can.position.set(11.9, 2.8, 0);
  rig.add(can);

  // ── Headers: plastic strip under the board, gold pins, solder joints ──
  const black = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.7 });
  for (const z of [-12.7, 12.7]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(48.3, 2.5, 2.5), black);
    strip.position.set(0, -2.05, z); rig.add(strip);
  }
  const pins = new THREE.InstancedMesh(new THREE.BoxGeometry(0.64, 8.5, 0.64), new THREE.MeshStandardMaterial({ color: '#e0b24a', metalness: 1, roughness: 0.25 }), 38);
  const joints = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.95, 1.1, 0.6, 12), new THREE.MeshStandardMaterial({ color: '#d7dbe0', metalness: 1, roughness: 0.2 }), 38);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 19; i++) for (let r = 0; r < 2; r++) {
    const x = (i - 9) * 2.54, z = r ? 12.7 : -12.7;
    pins.setMatrixAt(i * 2 + r, m4.makeTranslation(x, -5.1, z));
    joints.setMatrixAt(i * 2 + r, m4.makeTranslation(x, 1.05, z));
  }
  rig.add(pins, joints);

  // ── Small parts ──────────────────────────────────────────────
  const usb = new THREE.Mesh(new RoundedBoxGeometry(7.5, 2.6, 5.8, 2, 0.4), new THREE.MeshStandardMaterial({ color: '#cfd4da', metalness: 1, roughness: 0.25 }));
  usb.position.set(-25.4, 2.1, 0); rig.add(usb);
  for (const z of [-8, 8]) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 3.4), new THREE.MeshStandardMaterial({ color: '#cfd4da', metalness: 0.9, roughness: 0.35 }));
    base.position.set(-20.5, 1.5, z);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.9, 16), black);
    cap.position.set(-20.5, 2.6, z);
    rig.add(base, cap);
  }
  const chip = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 5), new THREE.MeshStandardMaterial({ color: '#1b1b1f', roughness: 0.45 }));
  chip.position.set(-12.5, 1.3, 3.5); rig.add(chip);
  const ldo = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.6, 3.6), new THREE.MeshStandardMaterial({ color: '#1b1b1f', roughness: 0.45 }));
  ldo.position.set(-13, 1.6, -7.5); rig.add(ldo);
  const ledMat = new THREE.MeshStandardMaterial({ color: '#ff2a1a', emissive: '#ff2a1a', emissiveIntensity: 0, roughness: 0.3 });
  const led = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.9), ledMat);
  led.position.set(-18.2, 1.15, 0.6); rig.add(led);
  const ledBlueMat = new THREE.MeshStandardMaterial({ color: '#3a7bff', emissive: '#3a7bff', emissiveIntensity: 0, roughness: 0.3 });
  const ledBlue = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.9), ledBlueMat);
  ledBlue.position.set(-18.2, 1.15, -2); rig.add(ledBlue);
  const smd = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.55, 0.85), new THREE.MeshStandardMaterial({ color: '#b98d55', roughness: 0.5 }), 16);
  for (let i = 0; i < 16; i++) smd.setMatrixAt(i, m4.makeTranslation(-6 - (i % 4) * 2.8, 1.08, -8 + Math.floor(i / 4) * 4.6 + (i % 2) * 0.7));
  rig.add(smd);

  // ── Micro servo ──────────────────────────────────────────────
  const servo = new THREE.Group();
  servo.position.set(46, 9, -6); servo.rotation.set(0, -0.5, 0);
  rig.add(servo);
  const blue = new THREE.MeshStandardMaterial({ color: '#2f6be0', roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.93 });
  const sticker = canvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#2f6be0'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2f5ff'; ctx.fillRect(40, 150, w - 80, 210);
    ctx.fillStyle = '#183b86'; ctx.font = '800 64px "Chakra Petch", sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('MICRO', w / 2, 240); ctx.fillText('SERVO 9g', w / 2, 320);
  });
  const stickerMat = new THREE.MeshStandardMaterial({ map: sticker, roughness: 0.3 });
  const sbody = new THREE.Mesh(new RoundedBoxGeometry(22.8, 22.7, 12.2, 3, 0.8), blue);
  servo.add(sbody);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(20, 18), stickerMat);
  face.position.set(0, -1, 6.15); servo.add(face);
  const tabs = new THREE.Mesh(new THREE.BoxGeometry(32.2, 2.5, 12.2), blue);
  tabs.position.set(0, 5.2, 0); servo.add(tabs);
  const gear = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 4.2, 32), blue);
  gear.position.set(5.4, 13.4, 0); servo.add(gear);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 3, 20), new THREE.MeshStandardMaterial({ color: '#f4f4f4', roughness: 0.4 }));
  shaft.position.set(5.4, 16.6, 0); servo.add(shaft);
  const horn = new THREE.Group(); horn.position.set(5.4, 18.4, 0); servo.add(horn);
  const white = new THREE.MeshStandardMaterial({ color: '#fbfbfb', roughness: 0.35 });
  const arm = new THREE.Mesh(new RoundedBoxGeometry(22, 1.8, 5.2, 2, 0.8), white);
  arm.position.set(8.5, 0, 0); horn.add(arm);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 2.2, 24), white); horn.add(hub);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12), new THREE.MeshStandardMaterial({ color: '#c6f432', emissive: '#c6f432', emissiveIntensity: 0.6 }));
  tip.position.set(18, 1.2, 0); horn.add(tip);

  // ── Wires from the servo to the header ───────────────────────
  servo.updateMatrix();
  const wireColors = ['#6b3d1f', '#e23b2e', '#f39a1e'];
  const wires: THREE.CatmullRomCurve3[] = [];
  wireColors.forEach((c, i) => {
    const a = new THREE.Vector3(-11, -9 + i * 0.1, -2 + i * 2).applyMatrix4(servo.matrix);
    const end = new THREE.Vector3(22.86 - i * 2.54, -9.4, -12.7);
    const curve = new THREE.CatmullRomCurve3([a, a.clone().add(new THREE.Vector3(-4, -16, 2)), new THREE.Vector3(30, -22, -10 + i * 1.5), end.clone().add(new THREE.Vector3(2, -6, 0)), end]);
    wires.push(curve);
    rig.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.6, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 })));
  });
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12), new THREE.MeshBasicMaterial({ color: '#f6ffb0', toneMapped: false }));
  rig.add(pulse);

  const v = new THREE.Vector3();
  return {
    from: T - 0.02, to: END, group,
    update(t, cam, aspect) {
      const k = outExpo(prog(t, T, 0.85));
      group.rotation.y = -2.4 * (1 - k) + 0.25 + Math.sin(t * 0.5) * 0.05;
      group.rotation.x = 0.25 * (1 - k);
      // The board hops on every beat and half beat.
      const hopBeats = [b(26.5), b(27), b(27.5), b(28)];
      group.position.y = -1.2 * (1 - k) + Math.sin(t * 1.6) * 0.04 + hump(t, hopBeats, 0.26) * 0.12;
      group.rotation.z = hump(t, [b(26.5), b(27.5)], 0.26) * 0.05 - hump(t, [b(27), b(28)], 0.26) * 0.05;
      group.scale.setScalar(0.35 + 0.65 * k);
      ledMat.emissiveIntensity = t > T + 0.38 ? 3 : 0;
      ledBlueMat.emissiveIntensity = [b(26.5), b(26.75), b(27), b(27.5), b(27.75), b(28)].some(at => t > at && t < at + 0.14) ? 4 : 0;
      // Servo: left (organik) on b27, right (non-organik) on b28.
      const left = outBack(prog(t, b(27), 0.32), 2.2), right = outBack(prog(t, b(28), 0.32), 2.2);
      horn.rotation.y = -1.25 * left + 2.5 * right;
      // A command travels down the signal wire before each swing.
      const p1 = prog(t, b(26.7), 0.28), p2 = prog(t, b(27.7), 0.28);
      const p = p2 > 0 ? p2 : p1;
      pulse.visible = p > 0 && p < 1;
      if (pulse.visible) { wires[2].getPointAt(1 - p, v); pulse.position.copy(v); }
      const f = fitFactor(aspect, 1.5);
      const az = keys(t, [[T, 0.9], [END, 0.1]], x => x);
      const el = keys(t, [[T, 0.25], [T + 0.9, 0.62], [END, 0.72]], outExpo);
      const d = keys(t, [[T, 5.4], [T + 0.9, 6.7], [END, 6.3]], outExpo) * f;
      cam.fov = 36;
      cam.position.set(0.95 + Math.sin(az) * d * Math.cos(el), Math.sin(el) * d, Math.cos(az) * d * Math.cos(el));
      cam.lookAt(0.95, 0.25, -0.1); cam.updateProjectionMatrix();
    },
  };
}
