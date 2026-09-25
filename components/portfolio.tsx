'use client';

import { assetPath } from '@/lib/asset-path';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown, ArrowRight, ArrowUpRight, Award, BadgeCheck, BookOpen,
  Braces, BriefcaseBusiness, Calculator, CalendarDays, Camera, Check,
  ChevronDown, CircuitBoard, Code2, Cpu, FileDown, Github, GraduationCap,
  Hand, Laptop, Linkedin, Mail, MapPin, Menu, Network, Pause, Play,
  Radio, ScanFace, Terminal, Users, Wallet, X,
} from 'lucide-react';
import { featuredProjects, otherProjects, technologies, type Project } from '@/lib/projects';
import ScrollStory from '@/components/scroll-story';

const github = 'https://github.com/Hwarinn66';
const cv = assetPath('/documents/CV-Efriza-Taufiqurrohman.pdf');
const navigation = [ ['Proyek', '#projects'], ['Toolkit', '#toolkit'], ['Tentang', '#about'], ['Perjalanan', '#journey'] ];

function TechLogo({ name, logo, compact = false }: { name: string; logo: string; compact?: boolean }) {
  return <span className={compact ? 'tech-logo compact' : 'tech-logo'}><img src={assetPath(`/assets/logos/${logo}.svg`)} alt={name} width={32} height={32} loading="lazy" /></span>;
}

function SectionTitle({ number, label, title, accent, light = false }: { number: string; label: string; title: string; accent: string; light?: boolean }) {
  return <div className={`section-title ${light ? 'on-dark' : ''}`} data-reveal>
    <div className="section-kicker"><span>{number}</span><span>{label}</span><span className="kicker-line" /></div>
    <h2>{title}<br /><span>{accent}</span></h2>
  </div>;
}

function ProjectArtwork({ id }: { id: string }) {
  if (id === 'innerself') return <div className="project-art inner-art" aria-label="Alur InnerSelf: 32 jawaban dianalisis dengan TF-IDF dan Logistic Regression menjadi delapan fungsi kognitif.">
    <div className="art-topbar"><span><Braces size={20} /> InnerSelf</span><span className="art-pill">COGNITIVE EXPLORER</span></div>
    <div className="inner-model parallax-art">
      <div className="question-block"><span className="tiny-label">IT STARTS WITH A QUESTION</span><strong>32<span>pertanyaan</span></strong><div className="answer-lines"><i /><i /><i /></div><span className="art-muted">Pilihan + alasan tertulis</span></div>
      <div className="model-connector"><ArrowRight size={23} /></div>
      <div className="model-block"><Cpu size={40} strokeWidth={1.4} /><strong>TF-IDF</strong><span>Logistic Regression</span><i className="model-pulse" /></div>
    </div>
    <div className="function-grid" aria-hidden="true">{['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'].map((f, i) => <span key={f} style={{ '--i': i } as CSSProperties}>{f}<i /></span>)}</div>
    <div className="art-footer"><span>8 fungsi kognitif</span><span>16 susunan fungsi <ArrowUpRight size={16} /></span></div>
  </div>;

  if (id === 'smart-trash') return <div className="project-art trash-art" aria-label="Alur Smart Trash: kamera, klasifikasi MobileNetV2, lalu ESP32 menggerakkan servo pemilah.">
    <div className="art-topbar"><span><CircuitBoard size={20} /> SMART TRASH</span><span className="art-pill"><Radio size={13} /> IOT PROTOTYPE</span></div>
    <h4>Lihat.<br />Kenali. <em>Pilah.</em></h4>
    <div className="trash-flow parallax-art">
      <div className="flow-node"><div><Camera size={32} strokeWidth={1.5} /></div><strong>Kamera</strong><span>OpenCV</span></div>
      <span className="signal-path" aria-hidden="true"><i /></span>
      <div className="flow-node"><div><Cpu size={32} strokeWidth={1.5} /></div><strong>Klasifikasi</strong><span>MobileNetV2</span></div>
      <span className="signal-path" aria-hidden="true"><i /></span>
      <div className="flow-node"><div><CircuitBoard size={32} strokeWidth={1.5} /></div><strong>Pemilahan</strong><span>ESP32 + servo</span></div>
    </div>
    <div className="trash-categories"><span><i /> Organik</span><span><i /> Nonorganik</span></div>
    <div className="art-footer"><span>Vision → action</span><span>HTTP / Blynk IoT</span></div>
  </div>;

  if (id === 'face-recognition') return <div className="project-art face-art" aria-label="Absensi wajah: pemeriksaan kedipan, pengenalan identitas, dan pencatatan di server Flask dengan tiga client.">
    <div className="art-topbar"><span><ScanFace size={20} /> FACE RECOGNITION</span><span className="art-pill">ATTENDANCE</span></div>
    <div className="face-visual parallax-art"><div className="scan-frame"><ScanFace size={95} strokeWidth={.9} /><span className="scan-line" /><i /><i /><i /><i /></div>
      <div className="scan-steps"><span><b>01</b> Periksa kedipan</span><span><b>02</b> Kenali identitas</span><span><b>03</b> Catat kehadiran</span></div>
    </div>
    <div className="server-label"><Network size={20} /><strong>Server pusat</strong><span>Flask + Socket.IO</span></div>
    <div className="client-branches"><span><Camera size={18} /> Alat absensi</span><span><BookOpen size={18} /> Guru</span><span><GraduationCap size={18} /> Siswa</span></div>
    <div className="art-footer"><span>One connected system</span><span>3 client <ArrowUpRight size={16} /></span></div>
  </div>;

  return <div className="project-art payroll-art" aria-label="Modul HR dan Payroll: karyawan, absensi, cuti, dan penggajian hingga slip gaji.">
    <div className="art-topbar"><span><Wallet size={20} /> HR & PAYROLL</span><span className="art-pill">CODEIGNITER 4</span></div>
    <div className="payroll-heading"><span className="tiny-label">CONNECTED ADMINISTRATION</span><h4>People. Process.<br /><em>Payroll.</em></h4></div>
    <div className="payroll-modules parallax-art">{[[Users, 'Karyawan'], [CalendarDays, 'Absensi'], [BookOpen, 'Cuti'], [Wallet, 'Payroll']].map(([Icon, label]) => {
      const ModuleIcon = Icon as typeof Users;
      return <div key={label as string}><ModuleIcon size={24} strokeWidth={1.6} /><span>{label as string}</span><ArrowUpRight size={15} /></div>;
    })}</div>
    <div className="payroll-process"><span>Data karyawan</span><ArrowRight size={16} /><span>Proses payroll</span><ArrowRight size={16} /><span>Slip gaji</span></div>
    <div className="art-footer"><span>From data to payslip</span><span>PHP / JavaScript</span></div>
  </div>;
}

function ProjectCard({ project }: { project: Project }) {
  return <article className={`project-card project-${project.id}`} id={project.id}>
    <div className="project-art-column"><span className="project-depth-number" aria-hidden="true">{project.number}</span><div className="project-art-wrap"><ProjectArtwork id={project.id} /></div><span className="art-caption">GAMBARAN ALUR & MODUL PROYEK</span></div>
    <div className="project-copy" data-reveal>
      <div className="project-eyebrow"><span>{project.category}</span><span>/{project.number}</span></div>
      <h3>{project.name}</h3><p className="project-subtitle">{project.subtitle}</p><p className="project-description">{project.description}</p>
      <div className="project-technologies">{project.technologies.map(tech => <span key={tech.name}>{tech.logo && <img src={assetPath(`/assets/logos/${tech.logo}.svg`)} alt="" width={19} height={19} loading="lazy" />}{tech.name}</span>)}</div>
      <details className="project-details"><summary>Detail implementasi <ChevronDown size={18} /></summary><ul>{project.highlights.map(point => <li key={point}><Check size={16} /><span>{point}</span></li>)}</ul></details>
      <a href={project.repository} className="repository-link" target="_blank" rel="noopener noreferrer"><Github size={19} /> Jelajahi source code <ArrowUpRight size={19} /></a>
      {project.note && <p className="project-note">{project.note}</p>}
    </div>
  </article>;
}

export default function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const paused = motionPaused || systemReduced;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    update();
    try { setMotionPaused(sessionStorage.getItem('efriza-motion-paused') === 'true'); } catch { /* Storage is optional. */ }
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    const scope = root.current;
    scope.classList.toggle('motion-paused', paused);
    document.documentElement.classList.toggle('scroll-reduced', paused);
    if (paused) return () => document.documentElement.classList.remove('scroll-reduced');
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    let active = true;
    mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)', short: '(max-height: 620px)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
      if (context.conditions?.reduced) return;
      const desktop = Boolean(context.conditions?.desktop);
      // CSS sticky holds the opening in the viewport. Native scrolling drives
      // the timeline; there is no wheel/touch interception or mandatory snapping.
      if (!context.conditions?.short) {
        scope.classList.add('has-scroll-story');
        const story = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          trigger: '.scroll-story',
          start: () => `top ${scope.querySelector<HTMLElement>('.site-header')?.offsetHeight ?? 82}px`,
          end: 'bottom bottom', scrub: .65, invalidateOnRefresh: true,
        } });
        story.to('.story-landscape', { scale: 1.28, yPercent: -7, duration: 1 }, 0)
          .to('.story-foreground-left', { xPercent: desktop ? -30 : -39, yPercent: 23, scale: 1.45, duration: .66 }, 0)
          .to('.story-foreground-right', { xPercent: desktop ? 30 : 39, yPercent: 23, scale: 1.45, duration: .66 }, 0)
          .fromTo('.story-core', { scale: .7, y: 24, rotation: -9 }, { scale: 1.15, y: -14, rotation: 1, duration: .4 }, 0)
          .to('.story-core', { scale: desktop ? 4.8 : 3.8, y: desktop ? -90 : -35, rotation: 9, duration: .34 }, .4)
          .to('.story-core', { autoAlpha: 0, duration: .14 }, .65)
          .to('.story-intro', { y: -60, autoAlpha: 0, duration: .14 }, .06)
          .fromTo('.story-middle', { y: 35, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .12 }, .24)
          .to('.story-middle', { y: -35, autoAlpha: 0, duration: .12 }, .5)
          .to('.story-warmth', { opacity: 0, duration: .38 }, .25)
          .to('.story-night', { opacity: .6, duration: .45 }, .4)
          .to('.story-halo', { scale: 2.6, opacity: .75, duration: .35 }, .28)
          .to('.story-halo', { scale: 3.7, opacity: 0, duration: .22 }, .63)
          .to('.story-dusk', { opacity: .88, duration: .25 }, .66)
          .fromTo('.story-outro', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .17 }, .8)
          .to('.story-phase-one', { autoAlpha: 0, duration: .05 }, .26)
          .to('.story-phase-two', { autoAlpha: 1, duration: .05 }, .3)
          .to('.story-phase-two', { autoAlpha: 0, duration: .05 }, .7)
          .to('.story-phase-three', { autoAlpha: 1, duration: .05 }, .76)
          .fromTo('.story-progress span', { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0);
      }
      // Every layer follows the same native scroll position with its own depth.
      // Scrubbing works in both directions without intercepting touch or wheel events.
      const hero = gsap.timeline({ defaults: { ease: 'none', duration: 1 }, scrollTrigger: {
        trigger: desktop ? '#intro' : '.hero-scene',
        start: desktop ? 'top 82px' : 'top 80%', end: 'bottom top',
        scrub: .8, invalidateOnRefresh: true,
      } });
      hero.to('.hero-grid', { y: desktop ? 180 : 65 }, 0)
        .to('.hero-depth-word', { yPercent: 42, xPercent: -9, scale: 1.12 }, 0)
        .to('.scene-outline', { y: desktop ? 115 : 35, rotation: -9, scale: .92 }, 0);
      if (desktop) hero.to('.hero-copy', { y: 92 }, 0);
      const spread = [20, -72, -38, 70, 35];
      gsap.utils.toArray<HTMLElement>('[data-hero-depth]', scope).forEach((layer, index) => {
        hero.to(layer, {
          y: () => Number(layer.dataset.heroDepth) * window.innerHeight * (desktop ? 1.25 : .3),
          x: (spread[index] ?? 0) * (desktop ? 1 : .23),
          rotationY: desktop ? (index % 2 ? -12 : 10) : 0,
          rotation: (index % 2 ? -6 : 5) * (desktop ? 1 : .4),
          scale: index === 0 ? (desktop ? 1.09 : 1.025) : 1,
          transformOrigin: '50% 65%',
        }, 0);
      });
      gsap.to('.scroll-ribbon-track', { xPercent: -17, ease: 'none', scrollTrigger: { trigger: '.scroll-ribbon', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.utils.toArray<HTMLElement>('.project-card', scope).forEach((card, index) => {
        const art = card.querySelector('.project-art-wrap');
        const number = card.querySelector('.project-depth-number');
        const foreground = card.querySelector('.parallax-art');
        const direction = index % 2 ? -1 : 1;
        const scene = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
          trigger: card, start: 'top 94%', end: 'bottom 8%', scrub: .8, invalidateOnRefresh: true,
        } });
        scene.fromTo(art, {
          y: desktop ? 92 : 32, rotationX: desktop ? 12 : 0,
          rotationY: desktop ? -12 * direction : 0, rotation: desktop ? -3 * direction : -1 * direction,
          scale: desktop ? .88 : .97,
        }, { y: 0, rotationX: 0, rotationY: 0, rotation: 0, scale: 1, duration: .4 }, 0)
          .to(art, { y: desktop ? -54 : -18, rotationX: desktop ? -5 : 0,
            rotationY: desktop ? 5 * direction : 0, duration: .6 }, .4)
          .fromTo(number, { y: desktop ? 110 : 30 }, { y: desktop ? -90 : -28, duration: 1 }, 0);
        if (foreground) scene.fromTo(foreground, { y: desktop ? 19 : 8 }, { y: desktop ? -23 : -8, duration: 1 }, 0);
      });
      // The portrait and its caption travel independently, like the foreground
      // and middle ground in the supplied reference video.
      const about = gsap.timeline({ defaults: { ease: 'none', duration: 1 }, scrollTrigger: {
        trigger: '.about-image-column', start: 'top 90%', end: 'bottom 10%', scrub: .8,
      } });
      about.fromTo('.about-photo', { y: desktop ? 65 : 24, rotation: -6 }, { y: desktop ? -45 : -18, rotation: 1 }, 0)
        .fromTo('.education-note', { y: desktop ? 85 : 32, rotation: 7 }, { y: desktop ? -24 : -10, rotation: -2 }, 0)
        .fromTo('.about-new-photo', { objectPosition: 'center 24%' }, { objectPosition: 'center 58%' }, 0);
      gsap.utils.toArray<HTMLElement>('.technology-tile', scope).forEach((tile, index) => {
        const depth = desktop ? [18, 38, 58][index % 3] : [8, 18][index % 2];
        gsap.fromTo(tile, { y: depth }, { y: -depth, ease: 'none', scrollTrigger: {
          trigger: '.technology-grid', start: 'top bottom', end: 'bottom top', scrub: 1,
        } });
      });
      gsap.fromTo('.contact-heading', { y: desktop ? 65 : 24 }, { y: 0, ease: 'none', scrollTrigger: {
        trigger: '#contact', start: 'top 90%', end: 'top 25%', scrub: .7,
      } });
      gsap.utils.toArray<HTMLElement>('.section-title h2', scope).forEach(heading => {
        gsap.fromTo(heading, { y: desktop ? 30 : 12 }, { y: 0, ease: 'none', scrollTrigger: {
          trigger: heading.closest('.section-title'), start: 'top bottom', end: 'top 55%', scrub: .6,
        } });
      });
      gsap.utils.toArray<HTMLElement>('[data-reveal]:not(.contact-heading)', scope).forEach(item => {
        gsap.from(item, { y: 32, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: item, start: 'top 94%', once: true } });
      });
      return () => scope.classList.remove('has-scroll-story');
    }, scope);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting)), { rootMargin: '80px' });
    scope.querySelectorAll('.project-art, .logo-marquee, .hero-scene').forEach(item => observer.observe(item));
    const refresh = () => ScrollTrigger.refresh();
    const details = [...scope.querySelectorAll('details')];
    details.forEach(item => item.addEventListener('toggle', refresh));
    document.fonts.ready.then(() => { if (active) refresh(); });
    return () => { active = false; observer.disconnect(); details.forEach(item => item.removeEventListener('toggle', refresh)); mm.revert(); document.documentElement.classList.remove('scroll-reduced'); };
  }, [paused]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    const onResize = () => { if (window.innerWidth >= 900) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [menuOpen]);

  const toggleMotion = () => {
    const next = !motionPaused;
    setMotionPaused(next);
    try { sessionStorage.setItem('efriza-motion-paused', String(next)); } catch { /* Preference still works without storage. */ }
  };
  const motionLabel = systemReduced ? 'Animasi mengikuti pengaturan perangkat' : paused ? 'Aktifkan animasi' : 'Jeda animasi';

  return <div ref={root} className={`portfolio-root ${paused ? 'motion-paused' : ''}`}>
    <a className="skip-link" href="#main">Langsung ke konten</a>
    <header className="site-header"><div className="container-main header-inner">
      <a href="#home" className="brand" aria-label="Efriza, kembali ke awal"><span className="brand-mark">e<span>.</span></span><span>efriza<span className="brand-dot">.</span></span></a>
      <nav aria-label="Navigasi utama" className="desktop-navigation">{navigation.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <div className="header-actions"><button className="motion-button" onClick={toggleMotion} aria-label={motionLabel} title={motionLabel} aria-pressed={paused} disabled={systemReduced}>{paused ? <Play size={16} /> : <Pause size={16} />}</button><a href="#contact" className="header-contact">Mari terhubung <ArrowUpRight size={17} /></a><button ref={menuButton} className="menu-button" aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button></div>
    </div><nav id="mobile-navigation" className="mobile-navigation" aria-label="Navigasi seluler" hidden={!menuOpen}>{[...navigation, ['Mari terhubung', '#contact']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={17} /></a>)}</nav></header>

    <main id="main">
      <ScrollStory />
      <section id="intro" className="hero-section"><div className="hero-grid" aria-hidden="true" /><div className="hero-depth-word" aria-hidden="true">BUILD</div><div className="container-main hero-layout">
        <div className="hero-copy"><div className="hero-eyebrow"><i /> TERBUKA UNTUK MAGANG IT</div><h2 className="intro-heading">Dari ide<br /><span>menjadi</span><br />sistem<span className="hero-period">.</span></h2><p className="hero-name">Efriza Taufiqurrohman</p><p className="hero-description">Saya menghubungkan software, machine learning, dan perangkat untuk membangun sesuatu yang bisa digunakan.</p>
          <div className="hero-buttons"><a className="button-primary" href="#projects">Jelajahi proyek <ArrowDown size={18} /></a><a className="button-secondary" href={cv} download>Unduh CV <FileDown size={18} /></a></div><div className="hero-facts"><span><GraduationCap size={17} /> Mahasiswa Informatika · UBSI</span><span><MapPin size={16} /> Kab. Bekasi, Jawa Barat</span></div>
        </div>
        <div className="hero-scene"><div className="scene-outline" aria-hidden="true" /><div className="scene-coordinates">SOFTWARE × INTELLIGENT SYSTEMS</div>
          <div className="portrait-layer" data-hero-depth="-0.18"><div className="portrait-card"><span className="portrait-index">ET / 2026 <span>01</span></span><Image className="hero-photo" src={assetPath('/assets/efriza-hero.webp')} alt="Potret Efriza Taufiqurrohman di depan gedung BNI" width={1152} height={1536} sizes="(max-width: 599px) 254px, (max-width: 1199px) 270px, 306px" /><div className="portrait-caption"><strong>Efriza T.</strong><span>DEVELOPER IN THE MAKING <ArrowUpRight size={17} /></span></div></div></div>
          <div className="floating-layer python-layer" data-hero-depth="-0.28"><div className="floating-card python-card"><TechLogo name="Python" logo="python" /><div><strong>Python</strong><span>BUILD THE LOGIC</span></div><Code2 size={20} /></div></div>
          <div className="floating-layer ml-layer" data-hero-depth="-0.12"><div className="floating-card ml-card"><TechLogo name="TensorFlow" logo="tensorflow" /><div><strong>Machine Learning</strong><span>TRAIN. EVALUATE. ITERATE.</span></div></div></div>
          <div className="floating-layer iot-layer" data-hero-depth="-0.36"><div className="floating-card iot-card"><CircuitBoard size={35} strokeWidth={1.4} /><strong>ESP32<br />& IoT</strong><span>CODE MEETS HARDWARE</span></div></div>
          <div className="code-layer" data-hero-depth="-0.08"><div className="code-fragment"><div><Terminal size={15} /><span>the way I build</span><i /></div><p><span>idea</span> → prototype<br /><span>learn</span> → iterate</p></div></div>
          <div className="scene-bottom">CURIOUS MIND. HANDS-ON APPROACH.<span>✳</span></div>
        </div>
      </div><div className="container-main hero-bottom"><a href={github} target="_blank" rel="noopener noreferrer"><Github size={18} /><span>7 proyek yang bisa dijelajahi</span><ArrowUpRight size={16} /></a><a href="#projects" className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={15} /></a></div></section>

      <div className="scroll-ribbon" aria-hidden="true"><div className="scroll-ribbon-track">{[0, 1, 2].map(i => <span key={i}>SOFTWARE <b>✳</b> MACHINE LEARNING <b>✳</b> COMPUTER VISION <b>✳</b> INTERNET OF THINGS <b>✳</b> </span>)}</div></div>

      <section id="projects" className="projects-section section-space"><div className="container-main"><div className="section-intro"><SectionTitle number="01" label="SELECTED WORK" title="Dari eksplorasi." accent="Menjadi implementasi." /><p data-reveal>Eksperimen yang tumbuh menjadi aplikasi, model, dan perangkat. Berikut cara saya menerjemahkan rasa ingin tahu menjadi karya.</p></div>
        <div className="featured-projects">{featuredProjects.map(project => <ProjectCard key={project.id} project={project} />)}</div>
        <div className="more-projects-heading" data-reveal><h3>Eksperimen lainnya<span> (03)</span></h3><a href={github} target="_blank" rel="noopener noreferrer">Semua repository <ArrowUpRight size={17} /></a></div>
        <div className="other-projects">{otherProjects.map((project, i) => { const Icon = [Laptop, Hand, Calculator][i]; return <a href={project.repository} className={`other-project other-${project.id}`} key={project.id} target="_blank" rel="noopener noreferrer" data-reveal><div className="other-project-top"><span className="other-project-icon"><Icon size={32} strokeWidth={1.4} /></span><span>/{project.number}</span><ArrowUpRight className="other-arrow" size={25} /></div><span className="tiny-label">{project.kind}</span><h4>{project.name}</h4><p>{project.description}</p><span className="other-tech">{project.tech}</span></a>; })}</div>
      </div></section>

      <section id="toolkit" className="toolkit-section section-space"><div className="container-main toolkit-layout"><div><SectionTitle number="02" label="MY TOOLKIT" title="Beragam teknologi." accent="Satu rasa ingin tahu." light /><p className="toolkit-description" data-reveal>Dari melatih model, merancang API, hingga menghubungkan perangkat. Saya memilih alat yang sesuai dengan masalahnya, lalu belajar sambil membangun.</p><div className="toolkit-note" data-reveal><Braces size={23} /><span>Selalu ada hal baru<br /><strong>untuk dipelajari.</strong></span><ArrowUpRight size={24} /></div></div>
        <div className="technology-grid" data-reveal>{technologies.map(tech => <div className="technology-tile" key={tech.name}><TechLogo name={tech.name} logo={tech.logo} /><strong>{tech.name}</strong><span>{tech.group}</span></div>)}</div>
      </div><div className="logo-marquee" aria-label="Teknologi: Python, TensorFlow, OpenCV, scikit-learn, FastAPI, Flask, Flutter, PHP, JavaScript"><div className="logo-marquee-track">{[0, 1].map(copy => <div className="logo-marquee-set" key={copy} aria-hidden="true">{technologies.slice(0, 9).map(tech => <span key={tech.name}><img src={assetPath(`/assets/logos/${tech.logo}.svg`)} alt="" width={28} height={28} loading="lazy" />{tech.name}<i>✳</i></span>)}</div>)}</div></div></section>

      <section id="about" className="about-section section-space"><div className="container-main about-layout"><div className="about-image-column"><div className="about-photo"><Image className="about-new-photo" src={assetPath('/assets/efriza-about.webp')} alt="Potret studio Efriza Taufiqurrohman" width={1024} height={1536} sizes="(max-width: 599px) 80vw, 370px" /><span>BEKASI, INDONESIA<br />6° S · 107° E</span></div><div className="education-note"><GraduationCap size={27} /><span>INFORMATIKA · S1<strong>Semester 7</strong><span>Universitas Bina Sarana Informatika</span></span><i>✳</i></div></div>
        <div className="about-copy"><SectionTitle number="03" label="A LITTLE ABOUT ME" title="Halo, saya Efriza." accent="Senang membuat hal bekerja." /><p data-reveal>Saya mahasiswa Informatika di Universitas Bina Sarana Informatika, dengan ketertarikan pada pengembangan aplikasi, machine learning, computer vision, dan IoT.</p><p data-reveal>Bagi saya, belajar menjadi lebih menarik ketika sebuah konsep bisa dicoba langsung. Dari gestur tangan yang membuka website sampai kamera yang menggerakkan pemilah sampah, setiap proyek menjadi kesempatan untuk memahami sistem lebih jauh.</p><div className="about-focus" data-reveal><BriefcaseBusiness size={23} /><div><strong>Mencari kesempatan magang IT</strong><span>Siap belajar bersama tim dan berkontribusi melalui proyek nyata.</span></div></div><a className="text-link" href={assetPath('/documents/Portfolio-Efriza-Taufiqurrohman.pdf')} download data-reveal>Lihat portofolio lengkap <FileDown size={19} /></a></div>
      </div></section>

      <section id="journey" className="journey-section section-space"><div className="container-main"><SectionTitle number="04" label="THE JOURNEY SO FAR" title="Pengalaman membentuk cara kerja." accent="Belajar memperluas kemungkinan." /><div className="journey-layout"><div className="education-card" data-reveal><div><GraduationCap size={29} /><span>2023 — SEKARANG</span></div><span className="tiny-label">PENDIDIKAN</span><h3>Universitas Bina<br />Sarana Informatika</h3><p>S1 Informatika (Ilmu Komputer)</p><span className="education-tag">Mahasiswa semester 7</span><span className="education-decoration" aria-hidden="true">✳</span></div><div className="experience-list" data-reveal>{[
        { period: 'JUN 2023 — OKT 2023', role: 'Store Assistant', company: 'Pet Shop', description: 'Mendukung operasional harian toko selama lima bulan.' },
        { period: 'NOV 2022 — MEI 2023', role: 'Warehouse Loading Crew', company: 'PT Prakarsa Alam Segar · Daily Worker', description: 'Mendukung aktivitas pemuatan barang dan operasional gudang.' },
        { period: 'SEP 2021 — SEP 2022', role: 'Production Operator', company: 'PT Abdi Putra Pratama', description: 'Bekerja dalam alur produksi dan koordinasi operasional tim.' },
      ].map(item => <article key={item.role}><span className="timeline-point" /><time>{item.period}</time><div><h3>{item.role}</h3><strong>{item.company}</strong><p>{item.description}</p></div></article>)}</div></div>
      <div className="certificates-heading" data-reveal><h3>Pelatihan & sertifikasi</h3><Award size={26} /></div><div className="certificates-grid"><a className="certificate-card" href={assetPath('/assets/mtcna-certificate.webp')} target="_blank" rel="noopener noreferrer" data-reveal><div className="certificate-image"><Image src={assetPath('/assets/mtcna-certificate.webp')} alt="Sertifikat MikroTik Certified Network Associate milik Efriza" width={491} height={694} sizes="(max-width: 599px) 85vw, 350px" /></div><span className="certificate-date">JANUARI 2026 <ArrowUpRight size={17} /></span><h4>MikroTik Certified<br />Network Associate</h4><p>MTCNA · Credential 2601NA3035</p></a><a className="certificate-card" href={assetPath('/assets/iot-certificate.webp')} target="_blank" rel="noopener noreferrer" data-reveal><div className="certificate-image"><Image src={assetPath('/assets/iot-certificate.webp')} alt="Sertifikat bootcamp IoT dan AI Universitas Bina Sarana Informatika" width={891} height={630} sizes="(max-width: 599px) 85vw, 350px" /></div><span className="certificate-date">JULI 2025 <ArrowUpRight size={17} /></span><h4>Bootcamp<br />IoT & Artificial Intelligence</h4><p>Universitas Bina Sarana Informatika</p></a><div className="certificate-card pending-certificate" data-reveal><div className="certificate-pending-art"><BadgeCheck size={70} strokeWidth={.9} /><span>PROFESSIONAL DEVELOPMENT</span></div><span className="certificate-date">SERTIFIKASI PROFESI</span><h4>Analis Program</h4><p>BNSP</p><span className="pending-label">Menunggu penerbitan sertifikat</span></div></div>
      </div></section>

      <section id="contact" className="contact-section"><div className="container-main contact-inner"><div className="contact-topline"><span><i /> TERBUKA UNTUK KESEMPATAN BARU</span><span>LET’S MAKE SOMETHING WORK</span></div><div className="contact-heading" data-reveal><h2>Punya ruang untuk<br /><span>belajar & berkarya?</span></h2><a className="contact-circle" href="mailto:efrizataufiq@gmail.com" aria-label="Kirim email ke Efriza"><ArrowUpRight size={57} strokeWidth={1.1} /></a></div><p data-reveal>Saya siap membicarakan kesempatan magang, kolaborasi,<br className="desktop-break" /> atau ide proyek yang menarik. Mari mulai percakapan.</p><a className="contact-email" href="mailto:efrizataufiq@gmail.com" data-reveal>efrizataufiq@gmail.com <ArrowUpRight size={23} /></a><div className="contact-channels"><a href="mailto:efrizataufiq@gmail.com"><Mail size={19} /> Email <ArrowUpRight size={18} /></a><a href={github} target="_blank" rel="noopener noreferrer"><Github size={19} /> GitHub <ArrowUpRight size={18} /></a><a href="https://www.linkedin.com/in/efriza-taufiqurrohman-07b31221b" target="_blank" rel="noopener noreferrer"><Linkedin size={19} /> LinkedIn <ArrowUpRight size={18} /></a><a href="https://wa.me/6281456081822" target="_blank" rel="noopener noreferrer"><Hand size={19} /> WhatsApp <ArrowUpRight size={18} /></a></div></div></section>
    </main>
    <footer className="site-footer"><div className="container-main footer-main"><a href="#home" className="brand"><span className="brand-mark">e<span>.</span></span><span>efriza.</span></a><p>© {new Date().getFullYear()} Efriza Taufiqurrohman</p><a href="#home" className="back-top">Kembali ke atas <ArrowUpRight size={18} /></a></div><div className="container-main footer-bottom"><span className="built-with">Dibangun dengan <img src={assetPath('/assets/logos/nextjs.svg')} alt="" width={18} height={18} /> Next.js <span>+</span><img src={assetPath('/assets/logos/tailwindcss.svg')} alt="" width={20} height={18} /> Tailwind CSS</span><button onClick={toggleMotion} aria-pressed={paused} disabled={systemReduced} title={motionLabel}>{paused ? <Play size={14} /> : <Pause size={14} />}{systemReduced ? 'Gerakan dikurangi sesuai perangkat' : paused ? 'Aktifkan animasi' : 'Jeda animasi'}</button></div></footer>
  </div>;
}
