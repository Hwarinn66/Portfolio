import { gsap } from 'gsap';
import { b, DROP, DURATION, objects } from './trailer-data';

type Opts = { mobile: boolean; gentle: boolean };

const pseudo = (i: number, salt: number) => { const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); };
const wdth = (n: number) => `'wdth' ${n}`;

/**
 * The whole trailer as one paused GSAP timeline, every tween placed on the
 * soundtrack's beat grid (83 BPM). The player drives it with tl.time(audio.currentTime),
 * so picture and music stay locked even when frames drop, and scrubbing works.
 */
export function buildTrailerTimeline(root: HTMLElement, { mobile, gentle }: Opts) {
  const one = (s: string) => root.querySelector(s) as HTMLElement;
  const all = (s: string) => Array.from(root.querySelectorAll(s)) as HTMLElement[];
  const k = gentle ? 0.35 : 1;
  const vw = window.innerWidth, vh = window.innerHeight;

  const cam = one('.tr-cam'), punchEl = one('.tr-punch'), flashEl = one('.tr-flash');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out', immediateRender: false } });

  const show = (t: number, target: gsap.TweenTarget, d = 0.3, from: gsap.TweenVars = {}, to: gsap.TweenVars = {}) =>
    tl.fromTo(target, { autoAlpha: 0, ...from }, { autoAlpha: 1, duration: d, ...to }, t);
  const hide = (t: number, target: gsap.TweenTarget, d = 0.22, to: gsap.TweenVars = {}) =>
    tl.fromTo(target, { autoAlpha: 1 }, { autoAlpha: 0, duration: d, ease: 'power2.in', ...to }, t);
  const punch = (t: number, s = 1.06) => tl.fromTo(punchEl, { scale: 1 + (s - 1) * k }, { scale: 1, duration: 0.4, ease: 'power3.out' }, t);
  const shake = (t: number, amp = 16) => tl.fromTo(punchEl, { x: amp * k, y: -amp * 0.6 * k, rotation: amp * 0.04 * k }, { x: 0, y: 0, rotation: 0, duration: 0.45, ease: 'elastic.out(1.1, 0.28)' }, t);
  const flash = (t: number, o = 0.5) => tl.fromTo(flashEl, { opacity: o * (gentle ? 0.35 : 1) }, { opacity: 0, duration: 0.34, ease: 'power2.out' }, t);
  const secs = all('.tr-sec');
  const section = (t: number, i: number) => {
    if (i > 0) hide(t, secs[i - 1], 0.15);
    show(t + 0.05, secs[i], 0.3, { y: 8 }, { y: 0 });
  };

  // ── HUD and ignition (0 – 2.9) ──────────────────────────────
  tl.fromTo('.tr-c', { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 1.3, stagger: 0.08, ease: 'expo.out' }, 0.25);
  show(0.7, '.tr-hud-tl', 0.6, { x: -16 }, { x: 0 });
  show(0.9, '.tr-hud-tr', 0.6, { x: 16 }, { x: 0 });
  show(1.1, '.tr-hud-br', 0.6);
  section(1.1, 0);
  const core = one('.tr-core');
  tl.fromTo(core, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(3)' }, 0.06)
    .fromTo(core, { scaleX: 1, scaleY: 1 }, { scaleX: mobile ? 24 : 52, scaleY: 0.2, duration: 2.1, ease: 'expo.inOut' }, 0.7);

  // ── Kinetic type: "SETIAP GAMBAR / MENYIMPAN / ANGKA." on the intro phrase hits ──
  const words = all('.tr-word');
  const charsOf = (w: HTMLElement) => Array.from(w.querySelectorAll('.tr-ch')) as HTMLElement[];
  const typeIn = (t: number, w: HTMLElement, opts: gsap.TweenVars = {}) => {
    tl.fromTo(w, { fontVariationSettings: wdth(62) }, { fontVariationSettings: wdth(125), duration: 0.8, ease: 'expo.out' }, t);
    tl.fromTo(charsOf(w), { autoAlpha: 0, yPercent: 115, rotation: 10 }, { autoAlpha: 1, yPercent: 0, rotation: 0, duration: 0.55, stagger: 0.035, ease: 'expo.out', ...opts }, t);
  };
  typeIn(b(4), words[0]);              // 2.96 SETIAP
  tl.fromTo(core, { opacity: 1 }, { opacity: 0.25, duration: 0.6 }, b(4));
  typeIn(b(5), words[1]);              // 3.68 GAMBAR
  typeIn(b(6), words[2]);              // 4.40 MENYIMPAN
  tl.fromTo(core, { opacity: 0.25 }, { opacity: 0.1, duration: 0.5 }, b(6));
  tl.fromTo(charsOf(words[3]), { autoAlpha: 0, scale: 2.6, yPercent: -20 }, { autoAlpha: 1, scale: 1, yPercent: 0, duration: 0.5, stagger: 0.05, ease: 'expo.out' }, b(8)); // 5.85 ANGKA.
  tl.fromTo(words[3], { fontVariationSettings: wdth(62) }, { fontVariationSettings: wdth(125), duration: 0.9, ease: 'expo.out' }, b(8));
  flash(b(8), 0.35); punch(b(8), 1.05);

  // Letters scatter and the objects appear where they land (6.57).
  const allChars = all('.tr-ch');
  tl.fromTo(allChars, { x: 0, y: 0, rotation: 0, autoAlpha: 1 },
    { x: i => (pseudo(i, 1) - 0.5) * vw * 0.9, y: i => (pseudo(i, 2) - 0.5) * vh * 0.8, rotation: i => (pseudo(i, 3) - 0.5) * 220, autoAlpha: 0, scale: 0.3, duration: 0.7, ease: 'power3.in', stagger: 0.008 }, b(9));
  tl.fromTo(core, { autoAlpha: 0.1 }, { autoAlpha: 0, duration: 0.3 }, b(9) + 0.3);
  show(b(9) + 0.15, '.tr-field-layer', 0.01);
  show(b(9) + 0.15, '.tr-frame', 0.8, { scale: 1.08, transformOrigin: '50% 50%' }, { scale: 1, ease: 'expo.out' });
  const objs = all('.tr-obj');
  tl.fromTo(objs, { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'back.out(2.4)', stagger: i => 0.04 * i * (0.6 + pseudo(i, 4) * 0.4) }, b(9) + 0.3);
  show(b(10) + 0.2, '.tr-q', 0.5, { y: 14 }, { y: 0 });
  tl.fromTo(cam, { scale: 1, rotation: 0, rotationX: 0 }, { scale: 1.07, rotation: -1.4, duration: b(13) - b(9), ease: 'none' }, b(9));

  // ── Build: ROI draws, tiles light on each kick of the roll (9.46 – 12.35) ──
  hide(b(13), '.tr-q', 0.2);
  tl.fromTo('.tr-roi', { autoAlpha: 1, strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, b(13));
  show(b(13) + 0.1, '.tr-roi-mask', 0.5, {}, { autoAlpha: 0.6 });
  const kicks = [9.72, 9.94, 10.4, 10.64, 10.86, 11.26, 11.51, 11.72, 12.05];
  const order = [0, 1, 2, 5, 4, 3, 6, 7, 8];
  const tileEls = all('.tr-tile'), tileHi = all('.tr-tile-hi');
  kicks.forEach((t, i) => {
    const n = order[i];
    show(t, tileEls[n], 0.08);
    tl.fromTo(tileHi[n], { autoAlpha: 0.75 }, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' }, t);
    punch(t, 1.02);
  });
  tl.fromTo(cam, { scale: 1.07, rotation: -1.4, rotationX: 0 }, { scale: 1.34, rotation: 3, rotationX: 16 * k, duration: DROP - 11.0, ease: 'power2.in' }, 11.0);
  tl.fromTo('.tr-grain', { opacity: 0.1 }, { opacity: 0.22, duration: DROP - 11.0, ease: 'none' }, 11.0);
  tl.fromTo('.tr-dip', { autoAlpha: 0 }, { autoAlpha: 0.88, duration: 0.18, ease: 'power2.in' }, DROP - 0.2);

  // ── DROP (12.35): title slam, boxes pop outward, density map blooms, count rolls ──
  tl.fromTo(cam, { scale: 1.34, rotation: 3, rotationX: 16 * k }, { scale: 1, rotation: 0, rotationX: 0, duration: 0.6, ease: 'expo.out' }, DROP);
  tl.fromTo('.tr-dip', { autoAlpha: 0.88 }, { autoAlpha: 0, duration: 0.12 }, DROP);
  tl.fromTo('.tr-grain', { opacity: 0.22 }, { opacity: 0.12, duration: 0.5 }, DROP);
  flash(DROP, 0.75); shake(DROP, 22);
  tl.fromTo('.tr-bars i', { scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: 'expo.out' }, DROP);
  section(DROP, 1);
  const titleLines = all('.tr-title span');
  tl.fromTo(titleLines, { autoAlpha: 0, yPercent: 60, scale: 1.45, fontVariationSettings: wdth(62) },
    { autoAlpha: 1, yPercent: 0, scale: 1, fontVariationSettings: wdth(125), duration: 0.6, stagger: 0.07, ease: 'expo.out' }, DROP);
  show(DROP + 0.05, '.tr-heat', 0.9, { scale: 0.75 }, { autoAlpha: 0.95, scale: 1, ease: 'expo.out' });
  const boxes = all('.tr-box');
  const dist = objects.map(o => Math.hypot(o.x - 500, o.y - 500));
  const maxD = Math.max(...dist);
  tl.fromTo(boxes, { autoAlpha: 0, scale: 1.7, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 0.24, ease: 'back.out(2)', stagger: i => (dist[i] / maxD) * 1.1 }, DROP + 0.05);
  const counter = { n: 0 };
  const countEls = [one('.tr-count-n'), one('.tr-hud-count b')];
  const writeCount = () => { const v = Math.round(counter.n); countEls[0].textContent = String(v); countEls[1].textContent = String(v).padStart(2, '0'); };
  tl.fromTo(counter, { n: 0 }, { n: objects.length, duration: 1.9, ease: 'power2.inOut', onUpdate: writeCount }, DROP + 0.1);
  [b(18), b(19), b(20)].forEach(t => {
    punch(t, 1.05);
    tl.fromTo(titleLines, { fontVariationSettings: wdth(100) }, { fontVariationSettings: wdth(125), duration: 0.35, ease: 'expo.out', stagger: 0.03 }, t);
  });
  tl.fromTo(titleLines, { x: 0, autoAlpha: 1 }, { x: i => (i % 2 ? 1 : -1) * vw * 0.7, autoAlpha: 0, duration: 0.42, ease: 'power3.in', stagger: 0.04 }, b(20) + 0.3);

  // ── Pipeline, one step per beat (15.24 – 20.3) ──────────────
  const stepNames = all('.tr-sn'), stepItems = all('.tr-steps li');
  show(b(21), '.tr-steps', 0.4, { y: 24 }, { y: 0 });
  const step = (i: number, t: number) => {
    if (i > 0) hide(t, stepNames[i - 1], 0.08, { x: -50 });
    show(t + 0.07, stepNames[i], 0.35, { x: 60, fontVariationSettings: wdth(62) }, { x: 0, fontVariationSettings: wdth(125), ease: 'expo.out' });
    tl.fromTo(stepItems[i], { color: '#6f6880', borderColor: 'rgba(236,233,242,.18)' }, { color: '#fca50a', borderColor: '#fca50a', duration: 0.2 }, t);
    if (i > 0) tl.fromTo(stepItems[i - 1], { color: '#fca50a', borderColor: '#fca50a' }, { color: '#bdb6cc', borderColor: 'rgba(236,233,242,.32)', duration: 0.2 }, t);
    punch(t, 1.04);
  };
  const wrap = one('.tr-field-wrap');
  // 1 Kamera: the frame reads as a phone screen, then a snapshot flash ("HITUNG").
  step(0, b(21));
  tl.fromTo('.tr-frame', { strokeWidth: 3 }, { strokeWidth: 14, duration: 0.3 }, b(21));
  tl.fromTo('.tr-snap', { autoAlpha: 0.95 }, { autoAlpha: 0, duration: 0.45, ease: 'power2.out' }, b(21.5));
  // 2 ROI: outside darkens, inside pulses.
  step(1, b(22));
  tl.fromTo('.tr-frame', { strokeWidth: 14 }, { strokeWidth: 3, duration: 0.3 }, b(22));
  tl.fromTo('.tr-roi-mask', { autoAlpha: 0.6 }, { autoAlpha: 0.88, duration: 0.3 }, b(22));
  tl.fromTo('.tr-roi', { strokeWidth: 4 }, { strokeWidth: 10, duration: 0.15, yoyo: true, repeat: 1 }, b(22));
  // 3 Tile: zoom into the centre tile; all tiles flash.
  step(2, b(23));
  tl.fromTo(tileHi, { autoAlpha: 0.6 }, { autoAlpha: 0, duration: 0.35, stagger: 0.03 }, b(23));
  tl.fromTo(wrap, { scale: 1 }, { scale: 1.55, duration: 0.55, ease: 'expo.inOut' }, b(23));
  // 4 YOLO: boxes re-detect inside the tile.
  step(3, b(24));
  tl.fromTo(boxes, { autoAlpha: 0, scale: 1.5 }, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: i => pseudo(i, 6) * 0.45, ease: 'back.out(2)' }, b(24));
  // 5 NMS: duplicates on the seams collapse into one box.
  step(4, b(25));
  tl.fromTo(wrap, { scale: 1.55 }, { scale: 1.12, duration: 0.5, ease: 'expo.inOut' }, b(25));
  show(b(25), '.tr-dups', 0.12);
  const dupRects = all('.tr-dup rect');
  tl.fromTo(dupRects, { x: 0, y: 0, autoAlpha: 1 }, { x: i => (i % 2 ? -7 : 7), y: i => (i % 2 ? -4 : 4), autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, b(25) + 0.3);
  hide(b(25) + 0.7, '.tr-dups', 0.01);
  // 6 Hitung: the field steps back, the count takes the screen; JSON result slides in.
  step(5, b(26));
  tl.fromTo(wrap, { scale: 1.12, autoAlpha: 1 }, { scale: 0.92, autoAlpha: 0.22, duration: 0.45 }, b(26));
  show(b(26), '.tr-count', 0.45, { scale: 1.35 }, { scale: 1, ease: 'expo.out' });
  tl.fromTo(counter, { n: 0 }, { n: objects.length, duration: 0.55, ease: 'power3.out', onUpdate: writeCount }, b(26));
  flash(b(26), 0.4); shake(b(26), 12);
  show(b(27), '.tr-json', 0.4, { x: mobile ? 0 : 80, y: mobile ? 40 : 0 }, { x: 0, y: 0 });
  punch(b(27), 1.03);
  // Bass break (≈20.0 – 20.5): glitch, cut to black, a breath.
  tl.fromTo('.tr-count', { x: 0, skewX: 0 }, { x: () => 18 * k, skewX: 14 * k, duration: 0.05, yoyo: true, repeat: 5, ease: 'steps(1)' }, 19.98);
  hide(b(28), ['.tr-count', '.tr-json', '.tr-steps', stepNames[5]], 0.08);
  hide(b(28), '.tr-field-layer', 0.08);
  hide(b(28), '.tr-heat', 0.08);
  tl.fromTo('.tr-dip', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, b(28));
  show(b(28) + 0.08, '.tr-breath', 0.25, { y: 10 }, { y: 0 });
  hide(b(29) - 0.12, '.tr-breath', 0.1);
  tl.fromTo('.tr-dip', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, b(29));

  // ── Other ML projects, two beats each (21.03 – 26.81) ────────
  section(b(29), 2);
  const vig = (cls: string, t: number, inner: (t: number) => void) => {
    const el = one(`.tr-v-${cls}`);
    tl.fromTo(el, { autoAlpha: 0, x: vw * 0.35, rotationY: -28 * k, filter: 'blur(10px)' }, { autoAlpha: 1, x: 0, rotationY: 0, filter: 'blur(0px)', duration: 0.42, ease: 'expo.out' }, t);
    tl.fromTo(el.querySelector('.tr-v-cap h3'), { fontVariationSettings: wdth(62), yPercent: 40 }, { fontVariationSettings: wdth(125), yPercent: 0, duration: 0.6, ease: 'expo.out' }, t + 0.05);
    flash(t, 0.35); punch(t, 1.05);
    inner(t);
    tl.fromTo(el, { autoAlpha: 1, x: 0, filter: 'blur(0px)' }, { autoAlpha: 0, x: -vw * 0.35, filter: 'blur(10px)', duration: 0.3, ease: 'power3.in' }, t + BEATS2 - 0.3);
  };
  const BEATS2 = 2 * (b(1) - b(0));
  vig('inner', b(29), t => {
    tl.fromTo('.tr-in-word', { x: -120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.25, stagger: 0.04 }, t);
    tl.fromTo('.tr-in-word', { x: 0, autoAlpha: 1, scale: 1 }, { x: 380, autoAlpha: 0, scale: 0.4, duration: 0.35, stagger: 0.035, ease: 'power3.in' }, t + 0.35);
    tl.fromTo('.tr-in-orb', { scale: 0.6, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, .4)' }, t + 0.55);
    tl.fromTo('.tr-in-fn', { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.12, stagger: 0.07 }, t + 0.72);
  });
  vig('trash', b(31), t => {
    tl.fromTo('.tr-st-scan', { y: 0 }, { y: 480, duration: 0.6, ease: 'power1.inOut' }, t);
    show(t + 0.36, '.tr-st-tag', 0.2, { scale: 1.5, transformOrigin: '50% 50%' }, { scale: 1, ease: 'back.out(2)' });
    tl.fromTo('.tr-st-servo', { rotation: 0, svgOrigin: '500 745' }, { rotation: 38, svgOrigin: '500 745', duration: 0.3, ease: 'back.out(2)' }, t + BEATS2 / 2);
  });
  vig('face', b(33), t => {
    tl.fromTo('.tr-fc-mesh', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, t);
    tl.fromTo('.tr-fc-dot', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.2, stagger: 0.012, ease: 'back.out(3)' }, t);
    [0.36, 0.55].forEach(d => tl.fromTo('.tr-fc-eye', { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.1, duration: 0.06, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t + d));
    show(t + BEATS2 / 2, '.tr-fc-lock', 0.25, { scale: 1.3, transformOrigin: '50% 50%' }, { scale: 1, ease: 'expo.out' });
    show(t + BEATS2 / 2 + 0.1, '.tr-fc-tag', 0.2, { y: 20 }, { y: 0 });
  });
  vig('hand', b(35), t => {
    tl.fromTo('.tr-hd-bones', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, t);
    tl.fromTo('.tr-hd-pt', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.18, stagger: 0.015, ease: 'back.out(3)' }, t + 0.05);
    tl.fromTo('.tr-hd-pt', { fill: '#fca50a' }, { fill: '#fcffa4', duration: 0.1, yoyo: true, repeat: 3 }, 25.62);
    show(t + BEATS2 / 2, '.tr-hd-win', 0.3, { scale: 0.6, transformOrigin: '0% 50%' }, { scale: 1, ease: 'back.out(1.8)' });
    show(t + BEATS2 / 2, '.tr-hd-arrow', 0.2);
  });

  // ── From data to model (26.81 – 29.71) ──────────────────────
  section(b(37), 3);
  show(b(37), '.tr-field-layer', 0.01);
  tl.fromTo(wrap, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 0.92, duration: 0.35, ease: 'expo.out' }, b(37));
  hide(b(37), ['.tr-boxes', '.tr-tiles', '.tr-roi', '.tr-roi-mask'], 0.01);
  show(b(37), '.tr-annots', 0.01);
  show(b(37) + 0.05, '.tr-annot-label', 0.3, { y: -16 }, { y: 0 });
  flash(b(37), 0.3); punch(b(37), 1.04);
  const targets = [objects[3], objects[17], objects[29]];
  tl.fromTo('.tr-cursor', { x: 920, y: 980, autoAlpha: 1 }, { x: targets[0].x - targets[0].r - 8, y: targets[0].y - targets[0].r - 8, duration: 0.18, ease: 'power2.inOut' }, b(37) + 0.02);
  const annots = all('.tr-annot');
  targets.forEach((o, i) => {
    const t0 = b(37) + 0.2 + i * 0.17;
    if (i > 0) tl.fromTo('.tr-cursor', { x: targets[i - 1].x + targets[i - 1].r + 8, y: targets[i - 1].y + targets[i - 1].r + 8 }, { x: o.x - o.r - 8, y: o.y - o.r - 8, duration: 0.08 }, t0 - 0.08);
    tl.fromTo(annots[i], { autoAlpha: 1, strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.12, ease: 'none' }, t0);
    tl.fromTo('.tr-cursor', { x: o.x - o.r - 8, y: o.y - o.r - 8 }, { x: o.x + o.r + 8, y: o.y + o.r + 8, duration: 0.1, ease: 'power1.inOut' }, t0);
  });
  hide(b(38), ['.tr-field-layer', '.tr-annot-label'], 0.15);
  show(b(38), '.tr-wf-split', 0.25, { y: 30 }, { y: 0 }); punch(b(38), 1.04);
  tl.fromTo('.tr-split span', { flexGrow: 1, marginRight: 0 }, { flexGrow: (i: number) => [7, 2, 1][i], marginRight: (i: number) => (i < 2 ? 10 : 0), duration: 0.45, ease: 'expo.out' }, b(38) + 0.1);
  hide(b(39), '.tr-wf-split', 0.12);
  show(b(39), '.tr-wf-train', 0.25, { y: 30 }, { y: 0 }); punch(b(39), 1.04);
  tl.fromTo('.tr-curve-line', { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.62, ease: 'power2.out' }, b(39) + 0.05);
  hide(b(40), '.tr-wf-train', 0.12);
  show(b(40), '.tr-wf-eval', 0.25, { y: 30 }, { y: 0 }); punch(b(40), 1.04);
  tl.fromTo('.tr-eval span', { autoAlpha: 0.2, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.18, stagger: 0.09, ease: 'back.out(2)' }, b(40) + 0.08);
  hide(b(41) - 0.08, '.tr-wf-eval', 0.08);

  // ── Stack flashes on half beats, then everything collapses into one point (29.71 – 31.9) ──
  section(b(41), 4);
  const stackEls = all('.tr-stack span');
  const half = (b(1) - b(0)) / 2;
  show(b(41), '.tr-stack', 0.01);
  stackEls.forEach((el, i) => {
    const t = b(41) + i * half;
    tl.fromTo(el, { autoAlpha: 0, scale: 1.4, fontVariationSettings: wdth(62) }, { autoAlpha: 1, scale: 1, fontVariationSettings: wdth(125), duration: 0.16, ease: 'expo.out' }, t);
    if (i < stackEls.length - 1) hide(t + half - 0.04, el, 0.04);
    flash(t, 0.22); punch(t, 1.04);
  });
  const last = stackEls[stackEls.length - 1];
  tl.fromTo(last, { scaleX: 1, scaleY: 1 }, { scaleX: 0.02, scaleY: 0.02, duration: 0.45, ease: 'expo.in' }, 31.35);
  tl.fromTo(core, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1.6, duration: 0.25, ease: 'back.out(3)' }, 31.75);

  // ── Name (31.88 → 32.60 slam), two closing hits, fade (33.7 – 34.64) ──
  show(b(44), '.tr-outro', 0.01);
  const nameLines = all('.tr-name span');
  tl.fromTo(nameLines, { autoAlpha: 0, scale: 0.15, letterSpacing: '0.6em', fontVariationSettings: wdth(62) },
    { autoAlpha: 1, scale: 1, letterSpacing: '-0.01em', fontVariationSettings: wdth(125), duration: b(45) - b(44), ease: 'expo.in', stagger: 0.06 }, b(44));
  hide(b(45), core, 0.1);
  flash(b(45), 0.85); shake(b(45), 24);
  show(b(45) + 0.15, '.tr-role', 0.35, { y: 16 }, { y: 0 });
  show(b(45) + 0.3, '.tr-link', 0.35, { y: 16 }, { y: 0 });
  show(b(45), '.tr-heat', 0.6, { scale: 1.6 }, { autoAlpha: 0.55, scale: 1.25 });
  [33.22, 33.33].forEach((t, i) => {
    tl.fromTo(nameLines, { x: 0, skewX: 0 }, { x: () => (i ? -12 : 12) * k, skewX: (i ? -10 : 10) * k, duration: 0.04, yoyo: true, repeat: 1, ease: 'steps(1)' }, t);
    flash(t, 0.3);
  });
  tl.fromTo(['.tr-cam', '.tr-hud', '.tr-steps-names'], { autoAlpha: 1 }, { autoAlpha: 0, duration: DURATION - 33.75, ease: 'power1.in' }, 33.75);

  // Timecode in the HUD follows the playhead.
  const tc = one('.tr-tc');
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    const s = Math.floor(t), f = Math.floor((t - s) * 24);
    tc.textContent = `00:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  });
  tl.set({}, {}, DURATION);
  return tl;
}
