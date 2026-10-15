'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CornerDownLeft, Github, Search } from 'lucide-react';

const NAME = 'Efriza Taufiqurrohman';
const SEEN_KEY = 'efriza-intro-seen';
const suggestions = ['portofolio', 'github', 'machine learning'];
const results = [
  { url: 'hwarinn66.github.io › Portfolio', title: 'Efriza Taufiqurrohman — Software, AI & IoT', snippet: 'Dari ide menjadi sistem. Tujuh proyek software, machine learning, computer vision, dan IoT.', site: true },
  { url: 'github.com › Hwarinn66 › MBTI-test', title: 'InnerSelf Cognitive', snippet: 'Web refleksi 32 pertanyaan dengan klasifikasi teks lokal.' },
  { url: 'github.com › Hwarinn66 › Smart-Trash', title: 'Smart Trash', snippet: 'Pemilah sampah dengan MobileNetV2, OpenCV, dan ESP32.' },
  { url: 'github.com › Hwarinn66 › face-recognition', title: 'Face Recognition Attendance', snippet: 'Absensi wajah dengan cek kedipan dan tiga client.' },
];

/**
 * First-visit opening (~5 s): a glass search bar types the owner's name,
 * suggestions drop in, Enter is pressed, results fly in on a tilted plane,
 * the top result is clicked and the camera dives through it into the hero.
 * Every shot changes the camera angle. A script in <head> decides whether it
 * plays (once per tab session, never with reduced motion), so there is no flash.
 */
export default function Opening() {
  const root = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const el = root.current;
    if (!el || !html.classList.contains('intro-pending')) { setDone(true); return; }

    const one = (selector: string) => el.querySelector<HTMLElement>(selector) as HTMLElement;
    const all = (selector: string) => Array.from(el.querySelectorAll<HTMLElement>(selector));
    const world = one('.op-world');
    const bar = one('.op-search');
    const typedEl = one('.op-typed');
    const panel = one('.op-suggest');
    const rows = all('.op-suggest li');
    const key = one('.op-key');
    const cards = all('.op-result');
    const top = cards[0];
    const pointer = one('.op-pointer');
    const progress = one('.opening-progress span');
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    const k = mobile ? 0.62 : 1;
    // The app started: cancel the head script's failsafe and keep the overlay up independently of the class.
    window.clearTimeout((window as Window & { __introFailsafe?: number }).__introFailsafe);
    el.style.display = 'block';
    const shell = Array.from(document.querySelectorAll<HTMLElement>('.site-header, main, .mobile-dock, .site-footer'));
    shell.forEach(node => node.setAttribute('inert', ''));
    window.scrollTo(0, 0);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      shell.forEach(node => node.removeAttribute('inert'));
      html.classList.remove('intro-pending');
      try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* Storage is optional. */ }
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const typed = { n: 0 };
    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onUpdate: () => { progress.style.transform = `scaleX(${tl.progress()})`; },
      onComplete: () => setDone(true),
    });

    // Shot 1: low, tilted angle; the bar rises in and the camera dollies closer while the name is typed.
    gsap.set(world, { rotationX: 34 * k, rotationY: -26 * k, rotation: 5 * k, z: -200, y: 60, x: 0 });
    tl.fromTo(bar, { autoAlpha: 0, y: 34, z: -80 }, { autoAlpha: 1, y: 0, z: 0, duration: 0.65, ease: 'power3.out' }, 0)
      .to(world, { rotationX: 16 * k, rotationY: -12 * k, rotation: 1.5 * k, z: 60, y: 22, duration: 1.7, ease: 'power2.inOut' }, 0)
      .to(typed, { n: NAME.length, duration: 1.15, ease: 'none',
        onUpdate: () => { typedEl.textContent = NAME.slice(0, Math.round(typed.n)); } }, 0.42)

    // Shot 2: the camera swings round to the side; suggestions drop in layers; Enter is pressed.
      .to(world, { rotationX: 8 * k, rotationY: 24 * k, rotation: -2 * k, z: -40, x: -40 * k, y: -6, duration: 0.95 }, 1.6)
      .fromTo(panel, { autoAlpha: 0, y: -16, rotationX: -40 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.45, ease: 'power3.out' }, 1.68)
      .fromTo(rows, { autoAlpha: 0, y: -22, rotationX: -70, z: -40 }, { autoAlpha: 1, y: 0, rotationX: 0, z: (i: number) => 26 - i * 13,
        stagger: 0.08, duration: 0.5, ease: 'back.out(1.7)' }, 1.72)
      .call(() => rows[0]?.classList.add('is-hot'), [], 2.12)
      .to(key, { scale: 0.84, y: 3, duration: 0.09, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 2.36)
      .call(() => bar.classList.add('is-sent'), [], 2.4)

    // Shot 3: overhead sweep; the search lifts away and results fly onto a tilted plane.
      .to([bar, panel], { y: -280, z: -220, autoAlpha: 0, duration: 0.55, ease: 'power3.in', stagger: 0.04 }, 2.55)
      .to(world, { rotationX: 44 * k, rotationY: 0, rotation: -7 * k, z: 50, x: 0, y: 40, duration: 1.0 }, 2.5)
      .fromTo(cards, { autoAlpha: 0, z: -520, y: 130, rotationX: 32 }, { autoAlpha: 1, z: 0, y: 0, rotationX: 0,
        stagger: 0.085, duration: 0.72, ease: 'power3.out' }, 2.68)
      .to(world, { y: -8, duration: 0.6, ease: 'sine.inOut' }, 3.3)
      .fromTo(pointer, { autoAlpha: 0, x: 150, y: 130 }, { autoAlpha: 1, x: 0, y: 0, duration: 0.45, ease: 'power2.out' }, 3.12)
      .to(pointer, { scale: 0.7, duration: 0.1, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 3.6)
      .call(() => top?.classList.add('is-clicked'), [], 3.64)

    // Shot 4: the camera levels out and dives through the top result into the site.
      .to(world, { rotationX: 0, rotationY: 0, rotation: 0, z: 0, y: 0, duration: 0.6 }, 3.78)
      .to([...cards.slice(1), pointer], { autoAlpha: 0, y: 90, duration: 0.35, ease: 'power2.in', stagger: 0.03 }, 3.78)
      .to(top ? Array.from(top.children) : [], { autoAlpha: 0, duration: 0.22, ease: 'power1.out' }, 3.98)
      .to(top, { scale: mobile ? 5.5 : 7, z: 120, duration: 0.9, ease: 'power4.in' }, 4.0)
      .call(finish, [], 4.45)
      .to(el, { autoAlpha: 0, duration: 0.5, ease: 'power1.out' }, 4.5);

    const skip = () => {
      if (finished) return;
      tl.kill();
      finish();
      gsap.to(el, { autoAlpha: 0, duration: 0.35, ease: 'power1.out', onComplete: () => setDone(true) });
    };
    skipRef.current = skip;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') skip(); };
    window.addEventListener('keydown', onKey);
    one('.opening-skip')?.focus({ preventScroll: true });
    return () => { window.removeEventListener('keydown', onKey); tl.kill(); finish(); };
  }, []);

  if (done) return null;

  return <div ref={root} className="opening">
    <div className="op-stage" aria-hidden="true">
      <div className="op-world">
        <div className="op-search-group">
          <div className="op-search glass">
            <span className="op-search-icon"><Search size={20} strokeWidth={2.4} /></span>
            <span className="op-query"><span className="op-typed" /><span className="op-placeholder">Cari di web</span><i className="op-caret" /></span>
            <span className="op-key"><CornerDownLeft size={17} strokeWidth={2.4} /><span>Enter</span></span>
          </div>
          <ul className="op-suggest glass">
            {suggestions.map(s => <li key={s}><Search size={16} /><span>efriza taufiqurrohman <b>{s}</b></span></li>)}
          </ul>
        </div>
        <div className="op-results">
          {results.map((r, i) => <article key={r.url} className={`op-result glass ${i === 0 ? 'is-top' : ''}`}>
            <span className="op-fav">{r.site ? <b>e.</b> : <Github size={17} />}</span>
            <span className="op-url">{r.url}</span>
            <span className="op-title">{r.title}</span>
            <span className="op-snippet">{r.snippet}</span>
            {i === 0 && <i className="op-pointer" />}
          </article>)}
        </div>
      </div>
    </div>
    <button className="opening-skip btn btn-glass btn-small" onClick={() => skipRef.current()}>Lewati</button>
    <div className="opening-progress" aria-hidden="true"><span /></div>
  </div>;
}
