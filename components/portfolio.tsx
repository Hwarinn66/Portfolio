'use client';

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown, ArrowUpRight, Award, BadgeCheck, BriefcaseBusiness, CircuitBoard, Copy, FileDown, Github,
  GraduationCap, Layers, LayoutGrid, Linkedin, Mail, MapPin, MessageCircle, Pause, Play, Plus, Route,
  Clapperboard, Smartphone, SquareTerminal, User, X,
} from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { ambient, burstField, haptic } from '@/lib/ambient';
import { categories, projects, projectsUsing, techName, technologies, type Category, type Project, type TechId } from '@/lib/projects';
import { certificates, experience, profile } from '@/lib/profile';
import BackgroundField from '@/components/background-field';
import GlassDialog from '@/components/glass-dialog';
import MiniTerminal from '@/components/mini-terminal';
import Opening from '@/components/opening';
import ProjectDetail from '@/components/project-detail';
import ProjectVisual from '@/components/project-visual';
import { useAmbientMotion } from '@/components/use-ambient-motion';
import { useTilt } from '@/components/use-tilt';
import dynamic from 'next/dynamic';
import { getTrailerAudio, startTrailerAudio } from '@/lib/trailer-audio';

// The trailer (scenes, timeline, player) loads only when someone opens it.
const Trailer = dynamic(() => import('@/components/trailer/trailer'), { ssr: false });

const sections = [
  { id: 'projects', label: 'Proyek', icon: LayoutGrid },
  { id: 'terminal', label: 'Terminal', icon: SquareTerminal },
  { id: 'toolkit', label: 'Toolkit', icon: Layers },
  { id: 'about', label: 'Tentang', icon: User },
  { id: 'journey', label: 'Perjalanan', icon: Route },
];

/** Words wrapped in masks so they can rise into place as the heading scrolls in. */
function Split({ text }: { text: string }) {
  const words = text.split(' ');
  return <>{words.map((word, i) => <Fragment key={i}><span className="word-mask"><span className="word">{word}</span></span>{i < words.length - 1 ? ' ' : ''}</Fragment>)}</>;
}

type OrbProps = { shape?: 'circle' | 'pill' | 'square'; depth: number; d: number; style: CSSProperties; className?: string };
/** Decorative glass shape that drifts at its own depth while scrolling. */
function Orb({ shape = 'circle', depth: z, d, style, className = '' }: OrbProps) {
  return <span className={`orb orb-${shape} ${className}`} data-depth={z} data-shift={d} style={style} aria-hidden="true" />;
}

const bandRows = [
  [['Software', false], ['Machine learning', true], ['Computer vision', false], ['Internet of Things', true]],
  [['Python', true, 'python'], ['TensorFlow', false, 'tensorflow'], ['OpenCV', true, 'opencv'], ['ESP32', false, 'arduino'], ['Flask', true, 'flask'], ['PHP', false, 'php']],
] as [string, boolean, string?][][];

function GlassBand() {
  return <div className="band" aria-hidden="true">
    {bandRows.map((row, r) => <div className={`band-strip band-strip-${r} glass`} key={r}>
      <div className="band-row">
        {[0, 1, 2].map(copy => <span className="band-set" key={copy}>
          {row.map(([word, outline, logo]) => <Fragment key={word}>
            <span className={outline ? 'band-word is-outline' : 'band-word'}>{word}</span>
            <span className="band-dot">{logo ? <img src={assetPath(`/assets/logos/${logo}.svg`)} alt="" width={26} height={26} loading="lazy" /> : <i />}</span>
          </Fragment>)}
        </span>)}
      </div>
    </div>)}
  </div>;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  const tilt = useTilt<HTMLElement>(project.featured ? 7 : 10);
  return <div className={`card-shell ${project.featured ? 'is-featured' : ''}`}><div className="card-lift">
  <article ref={tilt} className={`project-card glass tilt ${project.featured ? 'is-featured' : ''}`} style={{ viewTransitionName: `card-${project.id}` } as CSSProperties}>
    <div className="card-visual"><ProjectVisual id={project.id} /></div>
    <div className="card-body">
      <p className="card-kind">{project.kind}</p>
      <h3>{project.name}</h3>
      <p className="card-subtitle">{project.subtitle}</p>
      <div className="card-foot">
        <span className="card-logos">{project.stack.map(id => <img key={id} src={assetPath(`/assets/logos/${id}.svg`)} alt={techName(id)} title={techName(id)} width={22} height={22} loading="lazy" />)}
          {project.extras.slice(0, 1).map(name => <span key={name}>{name}</span>)}</span>
        <span className="card-open" aria-hidden="true">Detail <Plus size={16} /></span>
      </div>
    </div>
    <button className="card-hit" onClick={() => { haptic(); onOpen(project.id); }} aria-haspopup="dialog" aria-label={`Lihat detail ${project.name}`} />
  </article></div></div>;
}

function ToolTile({ tech, count, onPick }: { tech: (typeof technologies)[number]; count: number; onPick: (id: TechId) => void }) {
  const tilt = useTilt<HTMLButtonElement>(14);
  const content = <>
    <span className="tool-logo"><img src={assetPath(`/assets/logos/${tech.id}.svg`)} alt="" width={30} height={30} loading="lazy" /></span>
    <strong>{tech.name}</strong>
    <span className="tool-group">{tech.group}</span>
    <span className="tool-count">{tech.filterable ? `${count} proyek` : tech.caption}</span>
  </>;
  if (!tech.filterable) return <div className="tool-tile glass is-static">{content}</div>;
  return <button ref={tilt} className="tool-tile glass tilt" onClick={() => { haptic(); onPick(tech.id); }} aria-label={`${tech.name}: lihat ${count} proyek`}>{content}</button>;
}

function CertificateCard({ certificate, onOpen }: { certificate: (typeof certificates)[number]; onOpen: (id: string) => void }) {
  const tilt = useTilt<HTMLElement>(8);
  return <div className="cert-shell"><article ref={tilt} className={`cert-card glass tilt ${certificate.pending ? 'is-pending' : ''}`}>
    <div className="cert-media">
      {certificate.image
        ? <Image src={certificate.image.src} alt={certificate.image.alt} width={certificate.image.width} height={certificate.image.height} sizes="(max-width: 700px) 80vw, 360px" />
        : <BadgeCheck size={64} strokeWidth={1} aria-hidden="true" />}
    </div>
    <p className="cert-date">{certificate.date}</p>
    <h3>{certificate.title}</h3>
    <p className="cert-issuer">{certificate.issuer}</p>
    {certificate.pending && <p className="cert-pending">{certificate.pending}</p>}
    {certificate.image && <button className="card-hit" onClick={() => onOpen(certificate.id)} aria-haspopup="dialog" aria-label={`Perbesar sertifikat ${certificate.title}`} />}
  </article></div>;
}

export default function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const paused = motionPaused || systemReduced;
  const { gyro, requestGyro } = useAmbientMotion(paused);
  const lens = useTilt<HTMLElement>(10);

  const [category, setCategory] = useState<Category | 'all'>('all');
  const [tech, setTech] = useState<TechId | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [certId, setCertId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null);
  const [active, setActive] = useState('');
  const [scanKey, setScanKey] = useState(0);
  const [trailerOpen, setTrailerOpen] = useState(false);

  // Sound must start inside the click (mobile browsers), so the shared audio plays before the player mounts.
  const openTrailer = useCallback(() => {
    haptic(10);
    void startTrailerAudio();
    setTrailerOpen(true);
  }, []);
  const preloadTrailer = useCallback(() => { getTrailerAudio(); void import('@/components/trailer/trailer'); }, []);

  const visible = useMemo(() => projects.filter(p => (category === 'all' || p.tags.includes(category)) && (!tech || p.stack.includes(tech))), [category, tech]);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    update();
    try { setMotionPaused(sessionStorage.getItem('efriza-motion-paused') === 'true'); } catch { /* Storage is optional. */ }
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((text: string) => setToast({ key: Date.now(), text }), []);

  const toggleMotion = useCallback(() => {
    setMotionPaused(current => {
      const next = !current;
      try { sessionStorage.setItem('efriza-motion-paused', String(next)); } catch { /* Preference still works without storage. */ }
      return next;
    });
  }, []);

  const scrollToId = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: ambient.paused ? 'auto' : 'smooth', block: 'start' });
  }, []);

  // Animate the grid reflow when the filter changes (View Transitions where supported).
  const withTransition = useCallback((update: () => void) => {
    const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    if (doc.startViewTransition && !ambient.paused) doc.startViewTransition(() => flushSync(update));
    else update();
  }, []);

  const pickCategory = (id: Category | 'all') => { haptic(); withTransition(() => setCategory(id)); };
  // When the grid is off screen, skip the transition: update, let ScrollTrigger re-measure, then scroll.
  const filterAndReveal = useCallback((update: () => void) => {
    flushSync(update);
    requestAnimationFrame(() => requestAnimationFrame(() => { ScrollTrigger.refresh(); scrollToId('projects'); }));
  }, [scrollToId]);
  const pickTech = useCallback((id: TechId) => filterAndReveal(() => { setTech(id); setCategory('all'); }), [filterAndReveal]);

  const copyEmail = useCallback(() => {
    haptic(12);
    navigator.clipboard?.writeText(profile.email).then(() => notify('Email disalin ke clipboard'), () => notify(`Salin manual: ${profile.email}`));
  }, [notify]);

  const terminalActions = useMemo(() => ({
    openProject: (id: string) => setOpenId(id),
    filterProjects: (id: Category | 'all') => { window.setTimeout(() => filterAndReveal(() => { setCategory(id); setTech(null); }), 350); },
    copyEmail,
    toggleMotion,
    burst: () => burstField(window.innerWidth / 2, window.innerHeight * 0.45),
    openTrailer,
  }), [copyEmail, filterAndReveal, openTrailer, toggleMotion]);

  // Scroll spy for both navigations.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', ...sections.map(s => s.id), 'contact'].forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Background mood: the aurora shifts colour as you move between sections (desktop, motion on).
  useEffect(() => {
    const field = root.current?.querySelector<HTMLElement>('.field');
    if (!field) return;
    const moods: Record<string, string> = { home: 'a', projects: 'a', terminal: 'b', toolkit: 'b', about: 'b', journey: 'c', contact: 'c' };
    const wide = window.matchMedia('(min-width: 900px)').matches;
    field.dataset.mood = !paused && wide ? moods[active] ?? 'a' : 'a';
  }, [active, paused]);

  // Sliding glass indicators under the active nav link and filter.
  useLayoutEffect(() => {
    const place = (container: HTMLElement | null, selector: string) => {
      if (!container) return;
      const target = container.querySelector<HTMLElement>(selector);
      container.style.setProperty('--ind-x', target ? `${target.offsetLeft}px` : '0px');
      container.style.setProperty('--ind-w', target ? `${target.offsetWidth}px` : '0px');
      container.style.setProperty('--ind-o', target ? '1' : '0');
    };
    const update = () => { place(navRef.current, '[aria-current="true"]'); place(segmentRef.current, '[aria-pressed="true"]'); };
    update();
    window.addEventListener('resize', update);
    document.fonts?.ready.then(update);
    return () => window.removeEventListener('resize', update);
  }, [active, category]);

  // Scroll choreography (GSAP ScrollTrigger). Pointer and gyroscope depth is handled in CSS.
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    scope.classList.toggle('motion-paused', paused);
    if (paused) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(scope);
    mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)', tall: '(min-height: 700px)' }, context => {
      const { desktop = false, tall = false } = (context.conditions ?? {}) as Record<string, boolean>;
      const k = desktop ? 1 : 0.55;
      const vw = (n: number) => () => window.innerWidth * n * k;
      const vh = (n: number) => () => window.innerHeight * n * k;
      scope.classList.add('has-scroll-fx');

      // 1. The hero comes apart: lines split sideways, the photo card leans in, chips scatter.
      const pin = desktop && tall;
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
        trigger: '#home', start: 'top top', end: pin ? '+=85%' : 'bottom top', scrub: 0.4, pin, anticipatePin: 1, invalidateOnRefresh: true,
      } })
        .to('.hero-title .line:nth-child(1)', { x: vw(-0.2) }, 0)
        .to('.hero-title .line:nth-child(2)', { x: vw(0.16) }, 0)
        .to('.hero-title .line:nth-child(3)', { x: vw(-0.1) }, 0)
        .to('.hero-title', { y: vh(-0.06), scale: 0.9, transformOrigin: '0% 50%' }, 0)
        // These wrappers carry no CSS animation (their children do), so the two never fight over the same element.
        .fromTo('.hero-status', { y: 0, autoAlpha: 1 }, { y: vh(-0.12), autoAlpha: 0, immediateRender: false }, 0)
        .fromTo('.hero-copy', { y: 0, autoAlpha: 1 }, { y: vh(-0.1), autoAlpha: 0, immediateRender: false }, 0.1)
        .fromTo('.hero-facts', { y: 0, autoAlpha: 1 }, { y: vh(0.05), autoAlpha: 0, immediateRender: false }, 0)
        .to('.hero-stage', { y: vh(-0.14), scale: desktop ? 1.16 : 1.06, rotation: -5, transformOrigin: '50% 40%' }, 0)
        .to('.chip-wrap.chip-a', { x: vw(-0.24), y: vh(-0.22), rotation: -26 }, 0)
        .to('.chip-wrap.chip-b', { x: vw(0.2), y: vh(-0.14), rotation: 20 }, 0)
        .to('.chip-wrap.chip-c', { x: vw(-0.16), y: vh(0.2), rotation: 16 }, 0);

      // 2. Glass band: the two rows slide against each other; scroll speed skews them.
      gsap.utils.toArray<HTMLElement>('.band-row', scope).forEach((row, i) => {
        gsap.fromTo(row, { xPercent: i % 2 ? -34 : -2 }, { xPercent: i % 2 ? -2 : -34, ease: 'none',
          scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: 0.3 } });
      });
      const skew = gsap.quickTo('.band-row', 'skewX', { duration: 0.45, ease: 'power3' });
      ScrollTrigger.create({ trigger: '.band', start: 'top bottom', end: 'bottom top',
        onUpdate: self => skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -260)) });
      const settle = () => skew(0);
      ScrollTrigger.addEventListener('scrollEnd', settle);

      // 3. Headings rise word by word out of a mask, from blur into focus.
      gsap.utils.toArray<HTMLElement>('.split', scope).forEach(heading => {
        const words = Array.from(heading.querySelectorAll<HTMLElement>('.word'));
        gsap.fromTo(words,
          { yPercent: 115, rotation: 7, ...(desktop ? { filter: 'blur(10px)' } : {}) },
          { yPercent: 0, rotation: 0, ...(desktop ? { filter: 'blur(0px)' } : {}), stagger: 0.14, ease: 'none',
            scrollTrigger: { trigger: heading, start: 'top 94%', end: 'top 60%', scrub: 0.35 },
            // A leftover blur(0px) still costs a filter pass every frame; drop it whenever the reveal is at rest.
            onUpdate() { const p = this.progress(); if (desktop && (p === 0 || p === 1)) words.forEach(w => { w.style.filter = 'none'; }); } });
      });
      gsap.utils.toArray<HTMLElement>('.section-head p', scope).forEach(lead => {
        gsap.fromTo(lead, { y: 40 * k, autoAlpha: 0.15 }, { y: 0, autoAlpha: 1, ease: 'none',
          scrollTrigger: { trigger: lead, start: 'top 98%', end: 'top 72%', scrub: 0.35 } });
      });

      // 4. The terminal opens like a laptop lid.
      gsap.fromTo('.terminal-frame', { rotationX: desktop ? 34 : 20, y: 110 * k, scale: 0.86, transformPerspective: 1400, transformOrigin: '50% 100%' },
        { rotationX: 0, y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.terminal-layout', start: 'top bottom', end: 'top 30%', scrub: 0.4 } });

      // 5. Toolkit tiles fly in from scattered positions and assemble the grid.
      const seeded = (i: number, salt: number) => { const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453; return x - Math.floor(x); };
      gsap.utils.toArray<HTMLElement>('.tool-cell', scope).forEach((cell, i) => {
        gsap.fromTo(cell, { x: (seeded(i, 1) - 0.5) * 380 * k, y: (0.3 + seeded(i, 2)) * 220 * k, rotation: (seeded(i, 3) - 0.5) * 56, scale: 0.7 },
          { x: 0, y: 0, rotation: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.tool-grid', start: 'top 100%', end: 'top 38%', scrub: 0.45 } });
      });

      // 6. About: the portrait opens from a small window while the photo settles.
      gsap.fromTo('.about-frame', { clipPath: 'inset(18% 16% 18% 16% round 80px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', ease: 'none',
        scrollTrigger: { trigger: '.about-visual', start: 'top 95%', end: 'top 35%', scrub: 0.35 } });
      gsap.fromTo('.about-photo img', { scale: 1.32 }, { scale: 1, ease: 'none',
        scrollTrigger: { trigger: '.about-visual', start: 'top bottom', end: 'bottom top', scrub: 0.35 } });

      // 7. Journey: the timeline draws itself; each stop slides in and lights its dot.
      gsap.fromTo('.edu-card', { x: -70 * k, rotationY: 14, transformPerspective: 1200 }, { x: 0, rotationY: 0, ease: 'none',
        scrollTrigger: { trigger: '.journey-layout', start: 'top bottom', end: 'top 55%', scrub: 0.35 } });
      gsap.fromTo('.timeline-line', { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 55%', scrub: 0.3 } });
      gsap.utils.toArray<HTMLElement>('.timeline li', scope).forEach(item => {
        gsap.fromTo(item, { x: 100 * k, rotationY: -18, transformPerspective: 1200 }, { x: 0, rotationY: 0, ease: 'none',
          scrollTrigger: { trigger: item, start: 'top bottom', end: 'top 68%', scrub: 0.35 } });
        ScrollTrigger.create({ trigger: item, start: 'top 62%', onEnter: () => item.classList.add('is-reached'), onLeaveBack: () => item.classList.remove('is-reached') });
      });

      // 8. Certificates fan out from the middle.
      gsap.utils.toArray<HTMLElement>('.cert-shell', scope).forEach((shell, i) => {
        const side = desktop ? [-1, 0, 1][i % 3] : (i % 2 ? 1 : -1);
        gsap.fromTo(shell, { y: 150 * k, x: -side * 70 * k, rotation: side * 10 * k }, { y: 0, x: 0, rotation: 0, ease: 'none',
          scrollTrigger: { trigger: desktop ? '.cert-grid' : shell, start: 'top bottom', end: desktop ? 'top 45%' : 'top 70%', scrub: 0.4 } });
      });

      // 9. The contact panel grows into place.
      gsap.fromTo('.contact-panel', { scale: 0.84, y: 90 * k, borderRadius: desktop ? 120 : 60 }, { scale: 1, y: 0, borderRadius: desktop ? 34 : 28, ease: 'none',
        scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'top 25%', scrub: 0.4 } });

      // 10. Glass orbs and floating badges drift at their own depth.
      gsap.utils.toArray<HTMLElement>('[data-depth]', scope).forEach(el => {
        const d = Number(el.dataset.depth) * k * 120;
        const spin = el.classList.contains('orb') ? 40 : 0;
        const inHero = pin && el.closest('#home');
        gsap.fromTo(el, { y: d, rotation: -spin }, { y: -d, rotation: spin, ease: 'none',
          scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: 0.45, pinnedContainer: inHero ? '#home' : undefined } });
      });

      // 11. The aurora slowly turns through the page (desktop). Its colours follow the section (see the mood effect).
      if (desktop) gsap.to('.aurora-spin', { rotation: 28, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '#main', start: 'top top', end: 'bottom bottom', scrub: 1 } });

      return () => {
        scope.classList.remove('has-scroll-fx');
        scope.querySelectorAll('.is-reached').forEach(el => el.classList.remove('is-reached'));
        ScrollTrigger.removeEventListener('scrollEnd', settle);
      };
    });
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) { ScrollTrigger.sort(); ScrollTrigger.refresh(); } });
    return () => { alive = false; mm.revert(); };
  }, [paused]);

  // Project cards rise in 3D and their diagrams drift inside the frame. Rebuilt when the filter changes.
  const visibleKey = visible.map(p => p.id).join(',');
  useEffect(() => {
    const scope = root.current;
    if (!scope || paused) return;
    const mm = gsap.matchMedia(scope);
    mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, context => {
      const desktop = Boolean(context.conditions?.desktop);
      const k = desktop ? 1 : 0.55;
      gsap.utils.toArray<HTMLElement>('.card-shell', scope).forEach(shell => {
        const lift = shell.querySelector('.card-lift');
        const svg = shell.querySelector('.card-visual svg');
        const grid = shell.parentElement;
        const lag = desktop && grid ? Math.round((shell.offsetLeft / grid.offsetWidth) * 14) : 0;
        if (lift) gsap.fromTo(lift, { y: 170 * k, rotationX: 24 * k, scale: 0.9, transformPerspective: 1200, transformOrigin: '50% 0%' },
          { y: 0, rotationX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: shell, start: `top ${100 + lag}%`, end: `top ${62 + lag}%`, scrub: 0.4 } });
        if (svg) gsap.fromTo(svg, { yPercent: 10 }, { yPercent: -10, ease: 'none',
          scrollTrigger: { trigger: shell, start: 'top bottom', end: 'bottom top', scrub: 0.3 } });
      });
    });
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, [paused, visibleKey]);

  const openIndex = openId ? projects.findIndex(p => p.id === openId) : -1;
  const navigateProject = useCallback((direction: 1 | -1) => {
    setOpenId(current => {
      const index = projects.findIndex(p => p.id === current);
      return projects[(index + direction + projects.length) % projects.length].id;
    });
  }, []);
  const certificate = certificates.find(c => c.id === certId);
  const motionLabel = systemReduced ? 'Gerakan dikurangi sesuai pengaturan perangkat' : paused ? 'Aktifkan animasi' : 'Jeda animasi';

  return <div ref={root} className={`site ${paused ? 'motion-paused' : ''}`}>
    <BackgroundField paused={paused} />
    <Opening />
    <a className="skip-link" href="#main">Langsung ke konten</a>

    <header className="site-header">
      <div className="header-pill glass">
        <a href="#home" className="brand" aria-label="Efriza, kembali ke awal"><span className="brand-mark">e.</span><span className="brand-name">efriza</span></a>
        <nav ref={navRef} className="desktop-nav" aria-label="Navigasi utama">
          <span className="nav-indicator" aria-hidden="true" />
          {sections.map(s => <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>{s.label}</a>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={toggleMotion} aria-label={motionLabel} title={motionLabel} aria-pressed={paused} disabled={systemReduced}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>
          <a className="btn btn-solid btn-small header-cta" href="#contact">Hubungi saya</a>
          <a className="btn btn-glass btn-small header-cv" href={profile.cv} download>CV <FileDown size={15} /></a>
        </div>
      </div>
    </header>

    <nav className="mobile-dock glass" aria-label="Navigasi bagian">
      {[...sections.filter(s => s.id !== 'journey'), { id: 'contact', label: 'Kontak', icon: Mail }].map(s => {
        const Icon = s.icon;
        return <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined} onClick={() => haptic()}><Icon size={20} strokeWidth={1.8} /><span>{s.label}</span></a>;
      })}
    </nav>

    <main id="main">
      <section id="home" className="hero">
        <Orb depth={0.9} d={40} style={{ right: '3%', top: '12%', '--s': '130px' } as CSSProperties} />
        <Orb shape="square" depth={1.3} d={-28} style={{ left: '44%', bottom: '7%', '--s': '74px' } as CSSProperties} className="orb-hide-sm" />
        <div className="wrap hero-grid">
          <div className="hero-status"><p className="status-pill glass"><span className="pulse-dot" aria-hidden="true" />Terbuka untuk magang IT</p></div>
          <h1 className="hero-title" aria-label="Dari ide menjadi sistem.">
            {['Dari ide', 'menjadi', 'sistem.'].map((text, i) => <span className="line" key={text} aria-hidden="true"><span style={{ '--i': i } as CSSProperties}>{text}</span></span>)}
          </h1>

          <div className="hero-stage">
            <div className="lens-enter">
              <figure ref={lens} className="hero-lens glass tilt ambient-tilt" data-shift={16} onPointerDown={() => setScanKey(k => k + 1)}>
                <div className="lens-photo">
                  <Image src={assetPath('/assets/efriza-hero.webp')} alt="Potret Efriza Taufiqurrohman di depan gedung BNI pada malam hari" width={1152} height={1536} priority sizes="(max-width: 899px) 60vw, 360px" />
                  <div className="face-box" key={scanKey} style={scanKey ? { '--fd': '0s' } as CSSProperties : undefined} aria-hidden="true"><i /><i /><i /><i /><span>Efriza, terdeteksi</span></div>
                </div>
                <figcaption><strong>{profile.name}</strong><span>Mahasiswa Informatika, UBSI</span></figcaption>
              </figure>
            </div>
            <span className="chip-wrap chip-a" data-shift={34} aria-hidden="true"><span className="hero-chip glass"><img src={assetPath('/assets/logos/python.svg')} alt="" width={22} height={22} />Python</span></span>
            <span className="chip-wrap chip-b" data-shift={52} aria-hidden="true"><span className="hero-chip glass"><img src={assetPath('/assets/logos/tensorflow.svg')} alt="" width={22} height={22} />TensorFlow</span></span>
            <span className="chip-wrap chip-c" data-shift={24} aria-hidden="true"><span className="hero-chip glass"><CircuitBoard size={20} strokeWidth={1.6} />ESP32</span></span>
          </div>

          <div className="hero-copy">
            <p className="hero-lead">Saya {profile.shortName}. Saya menghubungkan software, machine learning, dan perangkat untuk membangun sesuatu yang bisa digunakan.</p>
            <div className="hero-actions">
              <a className="btn btn-solid" href="#projects">Lihat proyek <ArrowDown size={18} /></a>
              <a className="btn btn-glass" href={profile.cv} download>Unduh CV <FileDown size={18} /></a>
              <button className="btn btn-trailer" onClick={openTrailer} onPointerEnter={preloadTrailer} onFocus={preloadTrailer}><Clapperboard size={18} />Lihat trailer</button>
            </div>
            {gyro === 'needs-permission' && <button className="gyro-button" onClick={requestGyro}><Smartphone size={16} />Aktifkan efek gerak ponsel</button>}
          </div>

          <ul className="hero-facts">
            <li><GraduationCap size={17} />Informatika, {profile.campus}</li>
            <li><MapPin size={16} />{profile.location}</li>
            <li><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={16} />7 proyek di GitHub<ArrowUpRight size={14} /></a></li>
          </ul>
        </div>
      </section>

      <GlassBand />

      <section id="projects" className="section">
        <Orb depth={1.4} d={36} style={{ left: '-50px', top: '6%', '--s': '190px' } as CSSProperties} />
        <Orb shape="pill" depth={0.9} d={-30} style={{ right: '-70px', top: '46%', '--w': '260px', '--h': '96px' } as CSSProperties} />
        <div className="wrap">
          <header className="section-head">
            <h2 className="split"><Split text="Proyek pilihan" /></h2>
            <p>Eksperimen yang tumbuh menjadi aplikasi, model, dan perangkat. Saring berdasarkan bidang, lalu buka kartu untuk melihat cara kerjanya.</p>
          </header>
          <div className="filter-row">
            <div ref={segmentRef} className="segmented glass" role="group" aria-label="Saring proyek berdasarkan bidang">
              <span className="segment-indicator" aria-hidden="true" />
              {categories.map(c => {
                const count = c.id === 'all' ? projects.length : projects.filter(p => p.tags.includes(c.id as Category)).length;
                return <button key={c.id} aria-pressed={category === c.id} onClick={() => pickCategory(c.id)}>{c.label}<span>{count}</span></button>;
              })}
            </div>
            {tech && <button className="tech-filter" onClick={() => withTransition(() => setTech(null))} aria-label={`Hapus saringan ${techName(tech)}`}>
              <img src={assetPath(`/assets/logos/${tech}.svg`)} alt="" width={18} height={18} />Memakai {techName(tech)}<X size={16} /></button>}
          </div>
          <p className="sr-only" aria-live="polite">{visible.length} proyek ditampilkan</p>
          <div className="project-grid">
            {visible.map(project => <ProjectCard key={project.id} project={project} onOpen={setOpenId} />)}
            {visible.length === 0 && <div className="empty-state glass">
              <p>Belum ada proyek {categories.find(c => c.id === category)?.label} yang memakai {tech ? techName(tech) : 'teknologi ini'}.</p>
              <button className="btn btn-glass" onClick={() => withTransition(() => { setCategory('all'); setTech(null); })}>Tampilkan semua proyek</button>
            </div>}
          </div>
          <a className="more-link" href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={18} />Semua repositori di GitHub<ArrowUpRight size={16} /></a>
        </div>
      </section>

      <section id="terminal" className="section terminal-section">
        <Orb depth={1.1} d={30} style={{ right: '7%', top: '8%', '--s': '96px' } as CSSProperties} />
        <div className="wrap terminal-layout">
          <header className="section-head">
            <h2 className="split"><Split text="Lebih suka mengetik?" /></h2>
            <p>Jelajahi portofolio ini lewat terminal kecil. Ketik <code>proyek</code>, <code>buka 2</code>, atau <code>filter cv</code>. Di ponsel, ketuk perintah di bawah terminal.</p>
          </header>
          <div className="terminal-frame"><MiniTerminal actions={terminalActions} /></div>
        </div>
      </section>

      <section id="toolkit" className="section">
        <Orb shape="square" depth={1.3} d={-34} style={{ left: '3%', bottom: '8%', '--s': '118px' } as CSSProperties} />
        <Orb depth={0.8} d={26} style={{ right: '5%', top: '14%', '--s': '64px' } as CSSProperties} className="orb-hide-sm" />
        <div className="wrap">
          <header className="section-head">
            <h2 className="split"><Split text="Alat yang saya pakai" /></h2>
            <p>Dari melatih model, merancang API, hingga menghubungkan perangkat. Ketuk sebuah teknologi untuk melihat proyek yang memakainya.</p>
          </header>
          <div className="tool-grid">
            {technologies.map(t => <div className="tool-cell" key={t.id}>
              <ToolTile tech={t} count={projectsUsing(t.id).length} onPick={pickTech} />
            </div>)}
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <Orb depth={1.0} d={32} style={{ right: '2%', top: '10%', '--s': '150px' } as CSSProperties} />
        <div className="wrap about-layout">
          <div className="about-visual">
            <figure className="about-frame glass" data-depth="0.12">
              <div className="about-photo"><Image src={assetPath('/assets/efriza-about.webp')} alt="Potret studio Efriza Taufiqurrohman" width={1024} height={1536} sizes="(max-width: 899px) 78vw, 400px" /></div>
            </figure>
            <div className="about-badge glass" data-depth="0.4" data-shift={30}><GraduationCap size={22} /><span><strong>{profile.semester}</strong>{profile.degree}</span></div>
            <div className="about-chip glass" data-depth="0.6" data-shift={46}><MapPin size={16} />Bekasi, Indonesia</div>
          </div>
          <div className="about-copy">
            <header className="section-head">
              <h2 className="split"><Split text="Halo, saya Efriza." /></h2>
            </header>
            <p>Saya mahasiswa Informatika di {profile.campus}, dengan ketertarikan pada pengembangan aplikasi, machine learning, computer vision, dan IoT.</p>
            <p>Bagi saya, belajar menjadi lebih menarik ketika sebuah konsep bisa dicoba langsung. Dari gestur tangan yang membuka website sampai kamera yang menggerakkan pemilah sampah, setiap proyek menjadi kesempatan untuk memahami sistem lebih jauh.</p>
            <div className="focus-card glass"><BriefcaseBusiness size={24} /><div><strong>Mencari kesempatan magang IT</strong><span>Siap belajar bersama tim dan berkontribusi melalui proyek nyata.</span></div></div>
            <a className="text-link" href={profile.portfolioPdf} download>Unduh portofolio lengkap (PDF) <FileDown size={18} /></a>
          </div>
        </div>
      </section>

      <section id="journey" className="section">
        <Orb shape="pill" depth={1.2} d={-30} style={{ left: '-60px', top: '34%', '--w': '210px', '--h': '82px' } as CSSProperties} />
        <div className="wrap">
          <header className="section-head">
            <h2 className="split"><Split text="Perjalanan sejauh ini" /></h2>
            <p>Pengalaman kerja membentuk cara saya bekerja dalam tim. Kuliah memperluas apa yang bisa saya bangun.</p>
          </header>
          <div className="journey-layout">
            <article className="edu-card glass">
              <GraduationCap size={30} strokeWidth={1.5} />
              <p className="edu-period">2023 sampai sekarang</p>
              <h3>{profile.campus}</h3>
              <p>{profile.degree}</p>
              <span className="edu-tag">Mahasiswa {profile.semester.toLowerCase()}</span>
            </article>
            <div className="timeline-wrap"><span className="timeline-line" aria-hidden="true" /><ol className="timeline">
              {experience.map(item => <li key={item.role} className="glass">
                <time>{item.period}</time>
                <h3>{item.role}</h3>
                <p className="timeline-company">{item.company}</p>
                <p>{item.description}</p>
              </li>)}
            </ol></div>
          </div>
          <h3 className="sub-head"><Award size={24} />Pelatihan dan sertifikasi</h3>
          <div className="cert-grid">{certificates.map(c => <CertificateCard key={c.id} certificate={c} onOpen={setCertId} />)}</div>
        </div>
      </section>

      <section id="contact" className="section contact-section">
        <Orb depth={1.2} d={36} style={{ right: '9%', top: '4%', '--s': '140px' } as CSSProperties} />
        <Orb shape="square" depth={0.8} d={-24} style={{ left: '5%', bottom: '6%', '--s': '80px' } as CSSProperties} className="orb-hide-sm" />
        <div className="wrap">
          <div className="contact-panel glass">
            <p className="status-pill"><span className="pulse-dot" aria-hidden="true" />Terbuka untuk kesempatan baru</p>
            <h2 className="split"><Split text="Punya ruang untuk belajar dan berkarya?" /></h2>
            <p className="contact-lead">Saya siap membicarakan kesempatan magang, kolaborasi, atau ide proyek yang menarik.</p>
            <div className="email-row">
              <a className="email-link" href={`mailto:${profile.email}`}>{profile.email}</a>
              <button className="btn btn-glass" onClick={copyEmail}><Copy size={17} />Salin email</button>
            </div>
            <div className="channels">
              <a className="btn btn-solid" href={`mailto:${profile.email}`}><Mail size={18} />Kirim email</a>
              <a className="btn btn-glass" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18} />LinkedIn<ArrowUpRight size={15} /></a>
              <a className="btn btn-glass" href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={18} />GitHub<ArrowUpRight size={15} /></a>
              <a className="btn btn-glass" href={profile.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />WhatsApp<ArrowUpRight size={15} /></a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>© {new Date().getFullYear()} {profile.name}</p>
        <p className="built-with">Dibangun dengan Next.js, Tailwind CSS, dan GSAP</p>
        <button className="footer-motion" onClick={toggleMotion} aria-pressed={paused} disabled={systemReduced}>{paused ? <Play size={14} /> : <Pause size={14} />}{motionLabel}</button>
      </div>
    </footer>

    <div className="toast-region" aria-live="polite">{toast && <p key={toast.key} className="toast glass">{toast.text}</p>}</div>

    <GlassDialog open={openIndex >= 0} onClose={() => setOpenId(null)} labelledBy="project-dialog-title">
      {openIndex >= 0 && <ProjectDetail project={projects[openIndex]} index={openIndex} total={projects.length}
        previous={projects[(openIndex - 1 + projects.length) % projects.length]} next={projects[(openIndex + 1) % projects.length]} onNavigate={navigateProject} />}
    </GlassDialog>

    {trailerOpen && <Trailer onClose={() => setTrailerOpen(false)} onSeeProjects={() => { getTrailerAudio().pause(); setTrailerOpen(false); window.setTimeout(() => scrollToId('projects'), 60); }} />}

    <GlassDialog open={Boolean(certificate)} onClose={() => setCertId(null)} labelledBy="cert-dialog-title" size="narrow">
      {certificate?.image && <div className="cert-viewer">
        <Image src={certificate.image.src} alt={certificate.image.alt} width={certificate.image.width} height={certificate.image.height} sizes="(max-width: 700px) 92vw, 640px" />
        <h2 id="cert-dialog-title">{certificate.title}</h2>
        <p>{certificate.issuer}, {certificate.date}</p>
      </div>}
    </GlassDialog>
  </div>;
}
