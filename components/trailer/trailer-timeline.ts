import { gsap } from 'gsap';
import { B, b, BREAKS, DROP, DURATION, projects, SCAN, scannedCount, scenes, shift3d, SHUTTER, type SceneId } from './trailer-data';

type Opts = { mobile: boolean; gentle: boolean };

const wdth = (n: number) => `'wdth' ${n}`;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const prog = (t: number, at: number, d: number) => clamp01((t - at) / d);
const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);

const hudColor: Record<SceneId, string> = {
  open: '#dfe4ff', counter: '#fcd38a', innerself: '#3b2378', voice: '#ffd0bd', trash: '#c6f432', face: '#8fefff', hand: '#ffffff',
  stock: '#ffd60a', payroll: '#1d2a22', laptop: '#dbe9ff', math: '#7dff6b', recap: '#dfe4ff', outro: '#dfe4ff',
};

/**
 * The whole trailer as one paused GSAP timeline, every cut placed on the
 * pacing grid (event n at n × B). The player sets it to the clock of the
 * sound-effects track each frame; the 3D world reads the same clock.
 */
export function buildTrailerTimeline(root: HTMLElement, { mobile, gentle }: Opts) {
  const q = (s: string) => root.querySelector(s) as HTMLElement;
  const qa = (s: string) => Array.from(root.querySelectorAll(s)) as HTMLElement[];
  const k = gentle ? 0.35 : 1;
  const vw = window.innerWidth, vh = window.innerHeight;
  const portrait = mobile;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', immediateRender: false } });

  const show = (t: number, target: gsap.TweenTarget, d = 0.3, from: gsap.TweenVars = {}, to: gsap.TweenVars = {}) =>
    tl.fromTo(target, { autoAlpha: 0, ...from }, { autoAlpha: 1, duration: d, immediateRender: true, ...to }, t);
  const hide = (t: number, target: gsap.TweenTarget, d = 0.22, to: gsap.TweenVars = {}, from: gsap.TweenVars = {}) =>
    tl.fromTo(target, { autoAlpha: 1, ...from }, { autoAlpha: 0, duration: d, ease: 'power2.in', ...to }, t);
  const screen = q('.tv-screen');
  const shake = (t: number, amp = 14) => tl.fromTo(screen, { x: amp * k, y: -amp * 0.6 * k, rotation: amp * 0.04 * k }, { x: 0, y: 0, rotation: 0, duration: 0.42, ease: 'elastic.out(1.1, 0.3)' }, t);
  const flash = (t: number, o = 0.5) => tl.fromTo('.x-flash', { opacity: o * (gentle ? 0.35 : 1) }, { opacity: 0, duration: 0.36, ease: 'power2.out' }, t);
  const sceneOn = (id: SceneId, t: number, d = 0.01) => tl.fromTo([`.bg-${id}`, `.fg-${id}`], { autoAlpha: 0 }, { autoAlpha: 1, duration: d, ease: 'none' }, t);
  const sceneOff = (id: SceneId, t: number, d = 0.01) => tl.fromTo([`.bg-${id}`, `.fg-${id}`], { autoAlpha: 1 }, { autoAlpha: 0, duration: d, ease: 'none' }, t);
  const kick = (id: SceneId, t: number) => show(t, `.fg-${id} .kick`, 0.4, { x: -16 }, { x: 0 });
  // Where the 3D subject sits on screen (the world shifts its camera by the same amount).
  const subject = (id: keyof typeof shift3d) => {
    const [sx, sy] = shift3d[id];
    return portrait ? { x: vw * 0.5, y: vh * (0.5 + sy) } : { x: vw * (0.5 + sx), y: vh * 0.5 };
  };
  const center = (el: HTMLElement) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  // ── HUD ───────────────────────────────────────────────────
  show(0.35, '.hud', 0.6);

  // ── OPENING (0 – 12.0): light → sparkle → name → particle "10" → dark AI prompt → 4 build beats ──
  tl.fromTo('.op-streak', { autoAlpha: 0, scaleX: 0.04, x: vw * 0.45 }, { autoAlpha: 1, scaleX: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0.04);
  tl.fromTo('.op-streak', { scaleX: 1, autoAlpha: 1 }, { scaleX: 0, autoAlpha: 0, duration: 0.26, ease: 'power3.in' }, b(1) - 0.22);
  tl.fromTo('.op-halo', { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1.25, duration: 0.7, ease: 'expo.out' }, b(1));
  hide(b(1) + 0.45, '.op-halo', 0.7, { scale: 1.6 }, { scale: 1.25 });
  const word = q('.op-word'), mark = q('.op-mark');
  const markShift = (word.getBoundingClientRect().width + (parseFloat(getComputedStyle(mark).columnGap) || 0)) / 2;
  tl.fromTo('.op-spark', { scale: 0, rotation: -140, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.75, ease: 'back.out(2.2)', immediateRender: true }, b(1) - 0.05);
  tl.fromTo(mark, { x: markShift }, { x: 0, duration: 0.65, ease: 'expo.inOut', immediateRender: true }, b(2) - 0.12);
  tl.fromTo('.op-word .ch', { autoAlpha: 0, y: 22, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.38, stagger: 0.06, ease: 'expo.out', immediateRender: true }, b(2) + 0.04);
  tl.fromTo('.op-sub', { autoAlpha: 0, y: 10, letterSpacing: '0.6em' }, { autoAlpha: 1, y: 0, letterSpacing: portrait ? '0.14em' : '0.24em', duration: 0.7, ease: 'expo.out' }, b(3));
  tl.fromTo([mark, '.op-sub'], { autoAlpha: 1, scale: 1, filter: 'blur(0px)' }, { autoAlpha: 0, scale: 0.84, filter: 'blur(12px)', duration: 0.45, ease: 'power2.in' }, b(4) - 0.32);
  tl.fromTo('.op-dark', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.inOut' }, b(4) - 0.25);
  show(b(5), '.op-numlabel', 0.6, { y: 18 }, { y: 0, ease: 'expo.out' });
  hide(b(7.55), '.op-numlabel', 0.3, { y: -12 });
  tl.fromTo('.op-hi', { autoAlpha: 0, y: 16, filter: 'blur(8px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'expo.out' }, b(8) + 0.1);
  tl.fromTo('.op-q .w > span', { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.07, ease: 'expo.out', immediateRender: true }, b(9));
  tl.fromTo('.op-card', { autoAlpha: 0, y: 70, rotationX: 30, scale: 0.92 }, { autoAlpha: 1, y: 0, rotationX: 0, scale: 1, duration: 0.95, ease: 'expo.out' }, b(9) + 0.12);
  tl.fromTo('.op-ui', { rotationX: 12, rotationY: -10, z: -90 }, { rotationX: 4, rotationY: 5, z: 0, duration: b(12) - b(9), ease: 'none', immediateRender: true }, b(9));
  tl.fromTo('.op-chips span', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.4 }, b(9.6));
  const send = center(q('.op-send'));
  tl.fromTo('.op-cursor', { autoAlpha: 0, x: vw * 0.92, y: vh * 0.96 }, { autoAlpha: 1, x: send.x - 6, y: send.y - 4, duration: 0.62, ease: 'power3.inOut' }, b(11.2));
  tl.fromTo(['.op-cursor', '.op-send'], { scale: 1 }, { scale: 0.82, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, b(12) - 0.06);
  hide(b(12) + 0.12, '.op-cursor', 0.15);
  tl.fromTo('.op-ui', { rotationX: 4, rotationY: 5, rotationZ: 0, z: 0, scale: 1, autoAlpha: 1 },
    { rotationX: 42, rotationY: -16, rotationZ: -7, z: -300, scale: 0.7, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, b(12) + 0.08);
  // Beat 1 (9.17): the prompt becomes a glowing "analysing" pill; repositories gather around it.
  tl.fromTo('.op-pill', { autoAlpha: 0, scaleX: 0.25, scaleY: 0.5 }, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.42, ease: 'back.out(1.7)' }, b(13) - 0.24);
  const repos = qa('.op-repo');
  const rx = portrait ? vw * 0.36 : Math.min(vw * 0.36, 560), ry = vh * 0.3;
  repos.forEach((el, i) => {
    const a = -Math.PI / 2 + (i / repos.length) * Math.PI * 2;
    const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    tl.fromTo(el, { autoAlpha: 0, x: x * 1.5, y: y * 1.5, xPercent: -50, yPercent: -50, scale: 0.6 }, { autoAlpha: 1, x, y, xPercent: -50, yPercent: -50, scale: 1, duration: 0.45, ease: 'expo.out', immediateRender: true }, b(13) + 0.04 + i * 0.022);
    // Beat 2 (9.88): they are pulled into the pill.
    tl.fromTo(el, { x, y, scale: 1, autoAlpha: 1 }, { x: 0, y: 0, scale: 0.15, autoAlpha: 0, duration: 0.34, ease: 'power3.in' }, b(14) - 0.08 + i * 0.026);
  });
  tl.fromTo('.op-pill', { scale: 1.14 }, { scale: 1, duration: 0.35 }, b(14) + 0.32);
  // Beat 3 (10.59): the pill opens into a tilted results panel listing the projects.
  hide(b(15) - 0.06, '.op-pill', 0.16, { scaleX: 1.8 });
  tl.fromTo('.op-doc', { autoAlpha: 0, scaleX: 0.3, scaleY: 0.1, rotationX: 0, rotationY: 0 }, { autoAlpha: 1, scaleX: 1, scaleY: 1, rotationX: 14, rotationY: -18, duration: 0.5, ease: 'expo.out' }, b(15) - 0.06);
  tl.fromTo('.op-doc li', { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, stagger: 0.034, duration: 0.25 }, b(15) + 0.1);
  tl.fromTo('.op-doc', { rotationX: 14, rotationY: -18 }, { rotationX: 6, rotationY: 12, duration: b(16) - b(15) - 0.44, ease: 'none' }, b(15) + 0.44);
  // Beat 4 (11.29): the panel folds into a core of light that rushes the camera into the drop.
  tl.fromTo('.op-doc', { scale: 1, autoAlpha: 1 }, { scale: 0.2, autoAlpha: 0, duration: 0.3, ease: 'power3.in' }, b(16) - 0.06);
  tl.fromTo('.op-core', { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, b(16) + 0.16);
  tl.fromTo('.op-core', { scale: 1, rotation: 0 }, { scale: 16, rotation: 10, duration: DROP - b(16) - 0.4, ease: 'expo.in' }, b(16) + 0.4);
  tl.fromTo('.x-flash', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.in' }, DROP - 0.2);
  sceneOff('open', DROP);

  // ── 01 DENSE OBJECT COUNTER (12.0 – 14.82) ─────────────────
  sceneOn('counter', DROP);
  tl.fromTo('.x-flash', { opacity: gentle ? 0.35 : 1 }, { opacity: 0, duration: 0.55, ease: 'power2.out' }, DROP);
  shake(DROP, 18);
  const cnTitle = qa('.cn-title span');
  tl.fromTo(cnTitle, { autoAlpha: 0, yPercent: 70, scale: 1.45, fontVariationSettings: wdth(62) },
    { autoAlpha: 1, yPercent: 0, scale: 1, fontVariationSettings: wdth(125), duration: 0.62, stagger: 0.07, ease: 'expo.out', immediateRender: true }, DROP + 0.02);
  kick('counter', DROP + 0.2);
  qa('.cn-steps li').forEach((el, i) => show([b(17.6), b(18), b(19), b(19.5)][i], el, 0.32, { x: -24 }, { x: 0, ease: 'expo.out' }));
  show(SCAN[0], '.cn-count', 0.35, { scale: 1.3, transformOrigin: '100% 0%' }, { scale: 1, ease: 'expo.out' });
  show(b(18.2), '.cn-cam', 0.3, { y: 10 }, { y: 0 });
  flash(SHUTTER, 0.5);
  show(b(20) + 0.42, '.cn-json', 0.35, { y: 20 }, { y: 0 });
  hide(b(20.6), ['.cn-head', '.cn-steps', '.cn-count', '.cn-cam', '.cn-json'], 0.24, { scale: 1.08, filter: 'blur(8px)' }, { scale: 1, filter: 'blur(0px)' });
  const dive = subject('counter');
  const irisAt = `${(dive.x / vw) * 100}% ${(dive.y / vh) * 100}%`;
  tl.fromTo('.x-iris', { autoAlpha: 1, clipPath: `circle(0% at ${irisAt})` }, { clipPath: `circle(150% at ${irisAt})`, duration: 0.34, ease: 'expo.in' }, b(21) - 0.32);
  sceneOff('counter', b(21));

  // ── 02 INNERSELF (14.82 – 16.94) ─────────────────────────────
  sceneOn('innerself', b(21));
  hide(b(21) + 0.02, '.x-iris', 0.3);
  tl.fromTo('.in-title .ic', { autoAlpha: 0, yPercent: 90, rotation: 14, fontVariationSettings: "'SOFT' 0, 'WONK' 0, 'opsz' 144, 'wght' 180" },
    { autoAlpha: 1, yPercent: 0, rotation: 0, fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144, 'wght' 420", stagger: 0.035, duration: 0.7, ease: 'expo.out', immediateRender: true }, b(21) + 0.04);
  kick('innerself', b(21) + 0.1);
  tl.fromTo('.in-sub', { autoAlpha: 0, letterSpacing: '1.4em' }, { autoAlpha: 1, letterSpacing: '0.6em', duration: 0.7, ease: 'expo.out', immediateRender: true }, b(21) + 0.3);
  const orb = subject('innerself');
  qa('.in-r').forEach((el, i) => {
    show(b(21.4) + i * 0.05, el, 0.3, { scale: 0.7, y: 14 }, { scale: 1, y: 0, ease: 'back.out(2)' });
    const c = center(el);
    tl.fromTo(el, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: orb.x - c.x, y: orb.y - c.y, scale: 0.15, autoAlpha: 0, duration: 0.4, ease: 'power3.in' }, b(22) - 0.1 + i * 0.06);
  });
  show(b(22) + 0.25, '.in-model', 0.35, { y: 12 }, { y: 0 });
  hide(b(23) - 0.08, '.in-model', 0.16);
  show(b(23), '.in-result', 0.01);
  tl.fromTo('.in-stack > *', { autoAlpha: 0, yPercent: 60, scale: 0.8 }, { autoAlpha: 1, yPercent: 0, scale: 1, stagger: 0.045, duration: 0.42, ease: 'back.out(2)' }, b(23));
  show(b(23) + 0.3, '.in-facts', 0.3);
  flash(b(23), 0.18);
  hide(b(24) - 0.3, '.fg-innerself > *', 0.24, { filter: 'blur(10px)', scale: 0.96 }, { filter: 'blur(0px)', scale: 1 });
  sceneOff('innerself', b(24));

  // ── 03 VOICE DATASET (16.94 – 18.35) ────────────────────────
  sceneOn('voice', b(24));
  tl.fromTo('.vo-wave', { y: portrait ? -(0.7 - 0.57) * vh : -(0.73 - 0.5) * vh, scaleX: 0.45 }, { y: 0, scaleX: 1, duration: 0.55, ease: 'expo.out' }, b(24));
  tl.fromTo('.vo-t1', { autoAlpha: 0, yPercent: 90, fontWeight: 100 }, { autoAlpha: 1, yPercent: 0, fontWeight: 900, duration: 0.6, ease: 'expo.out', immediateRender: true }, b(24) + 0.04);
  tl.fromTo('.vo-t2', { autoAlpha: 0, yPercent: 90, fontWeight: 100 }, { autoAlpha: 1, yPercent: 0, fontWeight: 900, duration: 0.6, ease: 'expo.out', immediateRender: true }, b(24) + 0.14);
  kick('voice', b(24) + 0.12);
  show(b(24) + 0.22, '.vo-rec', 0.3, { x: 20 }, { x: 0 });
  tl.fromTo('.vo-specs span', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.3 }, b(24.5));
  tl.fromTo('.vo-pipe li', { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, stagger: 0.05, duration: 0.3 }, b(25) - 0.05);
  // Bars rise and become green stripes: wipe to Smart Trash.
  show(b(26) - 0.24, '.x-bars', 0.01);
  tl.fromTo('.x-bars i', { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.22, ease: 'power3.in', stagger: { each: 0.01, from: 'center' } }, b(26) - 0.24);
  sceneOff('voice', b(26));

  // ── 04 SMART TRASH (18.35 – 20.47) ──────────────────────────
  sceneOn('trash', b(26));
  tl.fromTo('.x-bars i', { scaleY: 1, transformOrigin: '50% 0%' }, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.34, ease: 'expo.out', stagger: { each: 0.012, from: 'edges' } }, b(26) + 0.02);
  hide(b(26) + 0.5, '.x-bars', 0.01);
  tl.fromTo('.t4-title span', { autoAlpha: 0, x: -70, skewX: -14 }, { autoAlpha: 1, x: 0, skewX: 0, stagger: 0.08, duration: 0.5, ease: 'expo.out', immediateRender: true }, b(26) + 0.06);
  tl.fromTo('.t4-tape', { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'expo.out', immediateRender: true }, b(26) + 0.24);
  kick('trash', b(26) + 0.16);
  tl.fromTo('.t4-flow li', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25 }, b(26.5));
  qa('.t4-flow li').forEach((el, i) => tl.fromTo(el, { backgroundColor: 'rgba(198,244,50,0)', color: '#e9ffc0' }, { backgroundColor: 'rgba(198,244,50,1)', color: '#08170d', duration: 0.1 }, b(26.55) + i * 0.08));
  show(b(26.6), '.t4-blynk', 0.3, { y: -10 }, { y: 0 });
  show(b(27), '.t4-l', 0.3, { x: -50, scale: 1.3 }, { x: 0, scale: 1, ease: 'expo.out' });
  hide(b(28) - 0.06, '.t4-l', 0.12);
  show(b(28), '.t4-r', 0.3, { x: 50, scale: 1.3 }, { x: 0, scale: 1, ease: 'expo.out' });
  // Bass cut (19.9): CRT switch-off to a single dot.
  tl.fromTo(screen, { scaleY: 1 }, { scaleY: 0.006, duration: 0.12, ease: 'power3.in' }, BREAKS[0]);
  tl.fromTo(screen, { scaleX: 1 }, { scaleX: 0, duration: 0.14, ease: 'power3.in' }, BREAKS[0] + 0.13);
  show(BREAKS[0] + 0.2, '.x-dot', 0.06);
  sceneOff('trash', BREAKS[0] + 0.28);
  tl.fromTo(screen, { scaleX: 0, scaleY: 0.006 }, { scaleX: 1, scaleY: 1, duration: 0.01 }, b(29) - 0.02);

  // ── 05 FACE RECOGNITION (20.47 – 22.58) ─────────────────────
  sceneOn('face', b(29));
  hide(b(29) + 0.02, '.x-dot', 0.08);
  tl.fromTo('.fc-scan', { autoAlpha: 1, x: vw * 0.5, scaleY: 0 }, { scaleY: 1, duration: 0.14, ease: 'expo.out' }, b(29));
  tl.fromTo('.fc-scan', { x: vw * 0.5 }, { x: vw * 0.98, duration: 0.5, ease: 'power2.inOut' }, b(29) + 0.14);
  hide(b(29) + 0.62, '.fc-scan', 0.1);
  show(b(29) + 0.06, '.fc-title span', 0.2);
  kick('face', b(29) + 0.15);
  show(b(29) + 0.25, '.fc-frame', 0.4, { scale: 1.35 }, { scale: 1, ease: 'expo.out' });
  show(b(30), '.fc-stack', 0.35, { y: 10 }, { y: 0 });
  show(b(30.5) + 0.06, '.fc-live', 0.25, { x: -14 }, { x: 0 });
  show(b(31), '.fc-ok', 0.32, { scale: 0.85, x: -20 }, { scale: 1, x: 0, ease: 'back.out(2)' });
  tl.fromTo('.fc-frame i', { borderColor: '#5ff3ff' }, { borderColor: '#8cffbe', duration: 0.15 }, b(31));
  flash(b(31), 0.16);
  // b32: points fly into a hand; the hot gradient bursts out from the face.
  hide(b(32) - 0.05, '.fg-face > *', 0.18);
  const face = subject('face');
  const at = `${(face.x / vw) * 100}% ${(face.y / vh) * 100}%`;
  tl.fromTo('.bg-hand', { autoAlpha: 1, clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: 0.5, ease: 'expo.inOut' }, b(32));
  tl.fromTo('.fg-hand', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, b(32));
  sceneOff('face', b(32) + 0.5);

  // ── 06 HAND GESTURE (22.58 – 24.70) ─────────────────────────
  tl.fromTo('.hd-title .hc', { autoAlpha: 0, yPercent: 130, rotation: (i: number) => (i % 2 ? 16 : -16) }, { autoAlpha: 1, yPercent: 0, rotation: 0, stagger: 0.035, duration: 0.55, ease: 'back.out(2.4)', immediateRender: true }, b(32) + 0.22);
  kick('hand', b(32) + 0.3);
  const gestures = [b(33), b(33.5), b(34), b(34.5)];
  const chips = qa('.hd-chip');
  gestures.forEach((t, i) => {
    show(t, chips[i], 0.22, { scale: 0.55, rotation: -8 }, { scale: 1, rotation: 0, ease: 'back.out(2.6)' });
    if (i < 3) hide(gestures[i + 1] - 0.04, chips[i], 0.08, { scale: 0.8 });
  });
  show(b(33) + 0.1, '.hd-facts', 0.3, { y: 10 }, { y: 0 });
  hide(b(35) - 0.2, '.fg-hand > *', 0.12, { x: vw * 0.06 });
  tl.fromTo('.x-swipe', { autoAlpha: 1, xPercent: -120, skewX: -12 }, { xPercent: 0, duration: 0.2, ease: 'power3.in' }, b(35) - 0.2);
  sceneOff('hand', b(35));

  // ── 07 STOCK RECORDING (24.70 – 26.11) ──────────────────────
  sceneOn('stock', b(35));
  tl.fromTo('.x-swipe', { xPercent: 0 }, { xPercent: 125, duration: 0.3, ease: 'power3.out' }, b(35) + 0.01);
  hide(b(35) + 0.32, '.x-swipe', 0.01);
  tl.fromTo('.st-title span', { autoAlpha: 0, scaleY: 0, transformOrigin: '50% 100%' }, { autoAlpha: 1, scaleY: 1, stagger: 0.08, duration: 0.45, ease: 'expo.out', immediateRender: true }, b(35) + 0.08);
  kick('stock', b(35) + 0.16);
  show(b(35) + 0.12, '.st-label', 0.45, { y: 80, rotation: -14 }, { y: 0, rotation: 0, ease: 'expo.out' });
  const labelH = q('.st-label').getBoundingClientRect().height;
  tl.fromTo('.st-laser', { y: 0 }, { y: labelH * 0.62, duration: 0.24, yoyo: true, repeat: 3, ease: 'sine.inOut' }, b(35) + 0.3);
  ['.st-s1', '.st-s2', '.st-s3'].forEach((s, i) => tl.fromTo(s, { color: 'rgba(255,255,255,0.22)' }, { color: i === 2 ? '#7dff6b' : '#ffd60a', duration: 0.1 }, b(35.5) + i * (B * 0.25)));
  tl.fromTo('.st-tech span', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.25 }, b(35.6));
  tl.fromTo('.st-stamp', { autoAlpha: 0, scale: 2.8 }, { autoAlpha: 1, scale: 1, duration: 0.16, ease: 'power4.in' }, b(36) - 0.14);
  shake(b(36), 16);
  // Bass cut (25.5): pixel staircase into paper.
  show(BREAKS[1], '.x-pix', 0.01);
  const pix = qa('.x-pix i');
  tl.fromTo(pix, { scale: 0 }, { scale: 1.04, duration: 0.12, ease: 'power2.out', stagger: (i: number) => ((i % 12) + Math.floor(i / 12)) * 0.024 }, BREAKS[1]);
  sceneOff('stock', b(37) - 0.04);

  // ── 08 PAYROLL (26.11 – 28.23) ──────────────────────────────
  sceneOn('payroll', b(37) - 0.03);
  tl.fromTo(pix, { scale: 1.04 }, { scale: 0, duration: 0.1, ease: 'power2.in', stagger: (i: number) => (18 - (i % 12) - Math.floor(i / 12)) * 0.011 }, b(37) - 0.06);
  hide(b(37) + 0.3, '.x-pix', 0.01);
  tl.fromTo('.pr-a', { autoAlpha: 0, yPercent: 80 }, { autoAlpha: 1, yPercent: 0, duration: 0.5, ease: 'expo.out', immediateRender: true }, b(37) + 0.05);
  tl.fromTo('.pr-b', { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut', immediateRender: true }, b(37) + 0.22);
  kick('payroll', b(37) + 0.1);
  tl.fromTo('.pr-slip', { clipPath: 'inset(0% 0% 100% 0%)', y: -24 }, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 0.65, ease: 'power2.out' }, b(37) + 0.3);
  tl.fromTo('.pr-card', { autoAlpha: 0, y: 24, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.3, ease: 'back.out(2)' }, b(38) - 0.06);
  show(b(38) + 0.25, '.pr-tags', 0.3);
  tl.fromTo('.pr-total', { y: 0, scale: 1 }, { y: -vh * 0.45, scale: 0.5, autoAlpha: 0, duration: 0.3, ease: 'power3.in' }, b(39) - 0.3);
  tl.fromTo('.x-sheet', { autoAlpha: 1, yPercent: 102 }, { yPercent: 0, duration: 0.3, ease: 'power3.in' }, b(39) - 0.3);
  sceneOff('payroll', b(39));

  // ── 09 LAPTOP BST (27.52 – 28.94) ───────────────────────────
  sceneOn('laptop', b(39));
  hide(b(39) + 0.01, '.x-sheet', 0.01);
  tl.fromTo('.lp-title span', { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, stagger: 0.08, duration: 0.4, ease: 'expo.out', immediateRender: true }, b(39) + 0.03);
  kick('laptop', b(39) + 0.1);
  show(b(39) + 0.25, '.lp-sub', 0.3);
  [0, 1, 2, 3].forEach(d => {
    tl.fromTo(`.lp-node.d${d}`, { autoAlpha: 0, scale: 0.2, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.28, ease: 'back.out(2.4)', stagger: 0.02 }, b(39) + 0.06 + d * 0.09);
  });
  qa('.lp-edge').forEach(el => {
    const d = Math.round(parseFloat(el.getAttribute('y2') || '0') / 1.1);
    tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.12, ease: 'none' }, b(39) + 0.02 + (d - 1) * 0.09);
  });
  show(b(39.6), '.lp-range', 0.25);
  tl.fromTo('.lp-range i', { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'expo.out' }, b(39.6));
  tl.fromTo('.lp-node.in circle', { fill: '#0d3b8c' }, { fill: '#ffd60a', duration: 0.12, stagger: 0.03 }, b(40));
  tl.fromTo('.lp-node.in text', { fill: '#ffffff' }, { fill: '#0d3b8c', duration: 0.12, stagger: 0.03 }, b(40));
  tl.fromTo('.lp-node.out', { opacity: 1 }, { opacity: 0.25, duration: 0.2 }, b(40));
  tl.fromTo('.lp-edge.in', { stroke: '#dbe9ff' }, { stroke: '#ffd60a', duration: 0.15 }, b(40));
  tl.fromTo('.lp-filters span', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.25 }, b(40) + 0.12);
  show(b(41) - 0.34, '.x-mosaic', 0.01);
  const mosaic = qa('.x-mosaic i');
  const order = mosaic.map((_, i) => hash(i + 3));
  tl.fromTo(mosaic, { opacity: 0 }, { opacity: 1, duration: 0.04, ease: 'steps(1)', stagger: (i: number) => order[i] * 0.3 }, b(41) - 0.34);
  sceneOff('laptop', b(41));

  // ── 10 MATH GAME (28.94 – 30.35) ────────────────────────────
  sceneOn('math', b(41));
  tl.fromTo(mosaic, { opacity: 1 }, { opacity: 0, duration: 0.04, ease: 'steps(1)', stagger: (i: number) => (1 - order[i]) * 0.26 }, b(41) + 0.02);
  hide(b(41) + 0.34, '.x-mosaic', 0.01);
  tl.fromTo('.mt-title', { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'steps(5)', immediateRender: true }, b(41) + 0.04);
  show(b(41) + 0.2, '.mt-kick', 0.2, {}, { ease: 'steps(3)' });
  show(b(41) + 0.1, '.mt-hud', 0.2, {}, { ease: 'steps(3)' });
  tl.fromTo('.mt-eq', { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.3, ease: 'steps(6)', immediateRender: true }, b(41) + 0.12);
  tl.fromTo('.mt-a', { scale: 1.6 }, { scale: 1, duration: 0.2, ease: 'steps(3)' }, b(41.6));
  show(b(41.6) + 0.04, '.mt-ok', 0.16, { y: 10 }, { y: 0, ease: 'steps(3)' });
  hide(b(42.6), '.mt-ok', 0.1);
  tl.fromTo('.mt-timer i', { scaleX: 1 }, { scaleX: 0.3, duration: b(43) - b(41), ease: 'none' }, b(41));
  const lvColors = ['#7dff6b', '#2bf6ff', '#ff2bd6'];
  qa('.mt-levels span').forEach((el, i) => tl.fromTo(el, { borderColor: '#3a3a46', color: '#6a6a7a' }, { borderColor: lvColors[i], color: lvColors[i], duration: 0.08 }, b(42) + i * B * 0.33));
  tl.fromTo('.mt-ops span', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.12, ease: 'steps(2)', immediateRender: true }, b(42.2));
  flash(b(43) - 0.04, 0.7);
  sceneOff('math', b(43));

  // ── RECAP (30.35 – 31.76) ───────────────────────────────────
  sceneOn('recap', b(43));
  show(b(43) + 0.05, '.rc-title', 0.35, { y: 20 }, { y: 0, ease: 'expo.out' });
  tl.fromTo('.rc-tile', { autoAlpha: 0, rotationY: -95, z: -240 }, { autoAlpha: 1, rotationY: 0, z: 0, stagger: 0.045, duration: 0.42, ease: 'expo.out' }, b(43) + 0.04);
  tl.fromTo('.rc-grid', { scale: 1.3, rotationX: 28, rotationZ: -6 }, { scale: 1, rotationX: 14, rotationZ: -2, duration: B * 1.6, ease: 'power2.out', immediateRender: true }, b(43));
  const mid = { x: vw / 2, y: vh / 2 };
  qa('.rc-tile').forEach((el, i) => {
    const c = center(el);
    tl.fromTo(el, { x: 0, y: 0, scale: 1, autoAlpha: 1 }, { x: mid.x - c.x, y: mid.y - c.y, scale: 0.08, autoAlpha: 0, duration: 0.34, ease: 'power3.in' }, BREAKS[2] + i * 0.018);
  });
  hide(BREAKS[2], '.rc-title', 0.2, { y: -14 });
  tl.fromTo('.rc-spark', { autoAlpha: 0, scale: 0, rotation: -90 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(2.4)' }, BREAKS[2] + 0.3);
  tl.fromTo('.rc-spark', { scale: 1 }, { scale: 0.7, duration: 0.2, yoyo: true, repeat: 1 }, BREAKS[2] + 0.42);
  sceneOff('recap', b(45));

  // ── OUTRO (31.76 – 34.64) ───────────────────────────────────
  sceneOn('outro', b(45));
  flash(b(45), 0.55);
  tl.fromTo('.ou-spark', { autoAlpha: 0, scale: 2.4, rotation: -60, y: vh * 0.19 }, { autoAlpha: 1, scale: 1, rotation: 0, y: 0, duration: 0.6, ease: 'expo.out' }, b(45));
  tl.fromTo('.ou-name .oc', { autoAlpha: 0, y: 30, filter: 'blur(10px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', stagger: 0.028, duration: 0.55, ease: 'expo.out' }, b(45) + 0.06);
  show(b(45.7), '.ou-role', 0.45, { y: 14 }, { y: 0, ease: 'expo.out' });
  show(b(46) + 0.06, '.ou-link', 0.4, { y: 12 }, { y: 0, ease: 'expo.out' });
  tl.fromTo('.ou-spark', { rotation: 0, scale: 1 }, { rotation: 90, scale: 1.25, duration: 0.5, ease: 'expo.out' }, b(47));
  flash(b(47), 0.2);
  tl.fromTo('.tv', { autoAlpha: 1 }, { autoAlpha: 0, duration: DURATION - b(47.85), ease: 'power1.in' }, b(47.85));

  // ── Small story moments (pictures that move, not bouncing type) ──
  // Smart Trash: a leaf falls into the sorter on b27 and is flicked left; a bottle on b28, flicked right.
  [['.drop-leaf', 27, -1], ['.drop-bottle', 28, 1]].forEach(([sel, beat, dir]) => {
    const t = b(beat as number), dx = (dir as number) * (portrait ? vw * 0.62 : vw * 0.42);
    tl.fromTo(sel as string, { autoAlpha: 1, x: 0, y: -vh * 0.55, rotation: -50 * (dir as number) }, { y: 0, rotation: 8 * (dir as number), duration: 0.32, ease: 'power2.in', immediateRender: false }, t - 0.32);
    tl.fromTo(sel as string, { x: 0, y: 0, rotation: 8 * (dir as number), autoAlpha: 1 }, { x: dx, y: vh * 0.1, rotation: 260 * (dir as number), autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, t);
  });

  // Payroll: coins land one by one and stack.
  const coins = qa('.coin');
  const coinH = coins[0]?.getBoundingClientRect().height || 40;
  coins.forEach((el, i) => {
    const t = b(37.5) + i * B * 0.25;
    tl.fromTo(el, { autoAlpha: 1, y: -vh * 0.7, scaleY: 1 }, { y: -i * coinH * 0.34, duration: 0.24, ease: 'power3.in', immediateRender: false }, t - 0.24);
    tl.fromTo(el, { scaleY: 0.7, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.2, ease: 'back.out(3)' }, t);
  });
  hide(b(39) - 0.02, '.coin', 0.01);

  // Laptop BST: a lens hops down the search path on quarter beats; laptops drop under the results.
  const nodes = qa('.lp-node');
  const nodeAt = (i: number) => { const r = nodes[i].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; };
  const path = [0, 1, 4, 10, 5, 11];
  const lens = q('.lens');
  path.forEach((n, j) => {
    const p = nodeAt(n), t = b(39.5) + j * B * 0.25;
    if (j === 0) tl.fromTo(lens, { autoAlpha: 0, x: p.x, y: p.y - 60, scale: 0.4 }, { autoAlpha: 1, y: p.y, scale: 1, duration: 0.16, ease: 'back.out(2)', immediateRender: false }, t - 0.16);
    else {
      const prev = nodeAt(path[j - 1]);
      tl.fromTo(lens, { x: prev.x, y: prev.y }, { x: p.x, duration: 0.15, ease: 'power2.inOut' }, t - 0.15);
      tl.fromTo(lens, { y: prev.y }, { keyframes: [{ y: Math.min(prev.y, p.y) - p.h * 0.9, duration: 0.075, ease: 'power2.out' }, { y: p.y, duration: 0.075, ease: 'power2.in' }] }, t - 0.15);
    }
  });
  hide(b(41) - 0.02, lens, 0.01);
  qa('.lap').forEach((el, i) => {
    const p = nodeAt([9, 10, 11][i]);
    tl.fromTo(el, { autoAlpha: 0, x: p.x, y: p.y + p.h * 0.55 - 40, scale: 0.3 }, { autoAlpha: 1, y: p.y + p.h * 0.62, scale: 1, duration: 0.3, ease: 'back.out(3)', immediateRender: false }, b(40.75) + i * 0.06);
  });
  hide(b(41) - 0.02, '.lap', 0.01);

  // Math Game: pixel coins burst from the answer on b41.6 and again on b42.5.
  const ans = center(q('.mt-a'));
  const pcoins = qa('.pcoin');
  [b(41.6), b(42.5)].forEach((t, burst) => pcoins.forEach((el, i) => {
    const a = (i / pcoins.length) * Math.PI * 2 + burst * 0.4, r = (portrait ? vw * 0.36 : vh * 0.3) * (burst ? 1.25 : 1);
    tl.fromTo(el, { autoAlpha: 1, x: ans.x, y: ans.y, scale: 0.5 }, { x: ans.x + Math.cos(a) * r, y: ans.y + Math.sin(a) * r, scale: 1.2, duration: 0.42, ease: 'steps(6)' }, t);
    tl.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.12, ease: 'steps(2)' }, t + 0.42);
  }));

  // Outro: sparkles scatter from the name on the closing hits.
  const sparks = qa('.spk');
  [b(46), b(47)].forEach((t, burst) => sparks.forEach((el, i) => {
    const a = (i / sparks.length) * Math.PI * 2 + burst * 0.3, r = (portrait ? vw * 0.42 : vh * 0.42) * (0.7 + (i % 3) * 0.2);
    tl.fromTo(el, { autoAlpha: 1, x: 0, y: 0, scale: 0.2, rotation: 0 }, { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8, scale: 1, rotation: 120, duration: 0.6, ease: 'expo.out' }, t);
    tl.fromTo(el, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3 }, t + 0.35);
  }));

  // ── Cinematic layer: fade from black, letterbox, slow push-ins, light leaks, lens flares ──
  tl.fromTo('.x-black', { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.1, ease: 'power2.inOut' }, 0.05);
  tl.fromTo('.cine i', { scaleY: 0 }, { scaleY: 1, duration: 1.6, ease: 'expo.inOut', immediateRender: true }, 0.25);
  scenes.forEach(sc => tl.fromTo([`.bg-${sc.id}`, `.fg-${sc.id}`], { scale: 1 }, { scale: sc.id === 'open' ? 1.03 : 1.05, duration: sc.to - sc.from, ease: 'none' }, sc.from));
  const leak = (sel: string, t: number, dir = 1) => {
    tl.fromTo(sel, { x: dir > 0 ? -vw * 0.7 : vw * 1.0 }, { x: dir > 0 ? vw * 1.0 : -vw * 0.7, duration: 1.1, ease: 'sine.inOut' }, t);
    tl.fromTo(sel, { autoAlpha: 0 }, { keyframes: [{ autoAlpha: 0.85, duration: 0.4, ease: 'sine.out' }, { autoAlpha: 0, duration: 0.7, ease: 'sine.in' }] }, t);
  };
  leak('.leak-a', DROP - 0.25); leak('.leak-b', b(21) - 0.3, -1); leak('.leak-a', b(29) - 0.1, -1);
  leak('.leak-b', b(37) - 0.25); leak('.leak-a', b(45) - 0.2); leak('.leak-b', b(45.4), -1);
  const flare = (t: number, y = 0.5, s = 1) => {
    tl.fromTo('.flare', { autoAlpha: 1, top: `${y * 100}%`, scaleX: 0.15, scaleY: 1.4 * s }, { scaleX: 1.25, scaleY: 0.6, duration: 0.55, ease: 'expo.out' }, t);
    tl.fromTo('.flare', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t + 0.2);
  };
  flare(DROP); flare(SHUTTER, portrait ? 0.36 : 0.22, 0.8); flare(b(31), 0.5, 0.7); flare(b(36), portrait ? 0.7 : 0.74, 0.9); flare(b(45) + 0.05, 0.47, 1.2);
  tl.fromTo('.ou-rule', { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.out', transformOrigin: (i: number) => (i ? '0% 50%' : '100% 50%'), immediateRender: true }, b(45.5));

  // ── Per-frame text: HUD, counters, waveform, typing, scramble ──
  const hud = q('.hud'), tc = q('.hud-tc'), idx = q('.hud-idx'), repo = q('.hud-repo'), sc = q('.hud-sc'), bar = q('.hud-bar i');
  const typed = qa('.op-typed .tc');
  const waveBars = qa('.vo-wave i');
  const voTime = q('.vo-time');
  const cnN = q('.cn-n'), t4c1 = q('.t4-c1'), t4c2 = q('.t4-c2'), prAmt = q('.pr-amt'), mtA = q('.mt-a'), mtScore = q('.mt-score');
  const scr = qa('.scr');
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$';
  const last = { scene: '', typed: -1, hud: '', light: null as boolean | null };
  const vignette = q('.tv-vignette');
  const rupiah = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
  const tvEl = q('.tv');
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    // Handheld camera: a slow, tiny drift of the whole frame.
    if (!gentle) tvEl.style.transform = `translate(${(Math.sin(t * 0.9) * 2.2 + Math.sin(t * 2.3) * 0.7).toFixed(2)}px, ${(Math.cos(t * 0.7) * 1.8 + Math.sin(t * 1.9) * 0.6).toFixed(2)}px) rotate(${(Math.sin(t * 0.5) * 0.12).toFixed(3)}deg) scale(1.012)`;
    const s = Math.floor(t), f = Math.floor((t - s) * 24);
    tc.textContent = `00:00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
    bar.style.transform = `scaleX(${(t / DURATION).toFixed(4)})`;
    const cur = scenes.find(x => t >= x.from && t < x.to) ?? scenes[scenes.length - 1];
    const color = cur.id === 'open' && t < b(4) ? '#1b1f2e' : hudColor[cur.id];
    if (color !== last.hud) { hud.style.setProperty('--hud', color); last.hud = color; }
    const light = (cur.id === 'open' && t < b(4)) || cur.id === 'innerself' || cur.id === 'payroll';
    if (light !== last.light) { vignette.style.opacity = light ? '0.2' : '1'; last.light = light; }
    if (cur.id !== last.scene) {
      last.scene = cur.id;
      const p = projects.find(x => x.id === cur.id);
      idx.textContent = p ? `PROYEK ${p.n}` : cur.id === 'open' ? 'PEMBUKA' : 'PENUTUP';
      repo.textContent = p ? p.repo : 'github.com/Hwarinn66';
      sc.textContent = cur.label.toUpperCase();
    }
    // Typing the prompt
    const n = Math.floor(prog(t, b(10), B * 1.15) * typed.length);
    if (n !== last.typed) { typed.forEach((el, i) => { el.style.opacity = i < n ? '1' : '0'; }); last.typed = n; }
    // Counters
    if (t > DROP && t < b(21)) cnN.textContent = String(scannedCount(t));
    if (t > b(26) && t < b(29)) { t4c1.textContent = t > b(27) + 0.15 ? '1' : '0'; t4c2.textContent = t > b(28) + 0.15 ? '1' : '0'; }
    if (t > b(37) && t < b(39)) prAmt.textContent = rupiah(outCubic(prog(t, b(38) + 0.25, 0.6)) * 5487500);
    if (t > b(41) && t < b(43)) {
      mtA.textContent = t > b(41.6) ? '56' : '?';
      const score = t < b(41.6) ? 0 : t < b(42) ? 10 : Math.round(10 + outCubic(prog(t, b(42), B)) * 120);
      mtScore.textContent = String(score).padStart(4, '0');
    }
    // Voice: waveform + recorded time
    if (t > b(24) - 0.05 && t < b(26) + 0.05) {
      const env = outCubic(prog(t, b(24), 0.35));
      const pump = Math.exp(-(t % B) * 5);
      const N = waveBars.length;
      waveBars.forEach((el, i) => {
        const u = i / (N - 1);
        const w = 0.5 + 0.5 * Math.cos((u - 0.5) * Math.PI);
        const v = 0.32 * Math.abs(Math.sin(i * 0.45 + t * 7.3)) + 0.34 * Math.abs(Math.sin(i * 0.13 - t * 4.1 + Math.sin(t * 2 + i * 0.05))) + 0.34 * pump;
        el.style.transform = `scaleY(${Math.max(0.015, env * w * v).toFixed(3)})`;
      });
      const rec = prog(t, b(24) + 0.2, B * 1.4) * (23 * 60 + 9);
      voTime.textContent = `00:${String(Math.floor(rec / 60)).padStart(2, '0')}:${String(Math.floor(rec % 60)).padStart(2, '0')}`;
    }
    // Face title decodes like a scanner
    if (t > b(29) - 0.05 && t < b(32)) {
      scr.forEach((el, j) => {
        const text = el.dataset.text || '';
        const settled = Math.floor(prog(t, b(29) + 0.08 + j * 0.1, 0.5) * text.length);
        const tick = Math.floor(t * 30);
        el.textContent = Array.from(text).map((c, i) => (i < settled ? c : glyphs[Math.floor(hash(i * 7 + tick + j * 31) * glyphs.length)])).join('');
      });
    }
  });
  tl.set({}, {}, DURATION);
  return tl;
}
