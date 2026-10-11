'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowDown, ArrowUpRight, Award, BadgeCheck, BriefcaseBusiness, CircuitBoard, Copy, FileDown, Github,
  GraduationCap, Layers, LayoutGrid, Linkedin, Mail, MapPin, MessageCircle, Pause, Play, Plus, Route,
  Smartphone, SquareTerminal, User, X,
} from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { ambient, burstField, haptic } from '@/lib/ambient';
import { categories, projects, projectsUsing, techName, technologies, type Category, type Project, type TechId } from '@/lib/projects';
import { certificates, experience, profile } from '@/lib/profile';
import BackgroundField from '@/components/background-field';
import GlassDialog from '@/components/glass-dialog';
import MiniTerminal from '@/components/mini-terminal';
import ProjectDetail from '@/components/project-detail';
import ProjectVisual from '@/components/project-visual';
import { useAmbientMotion } from '@/components/use-ambient-motion';
import { useTilt } from '@/components/use-tilt';

const sections = [
  { id: 'projects', label: 'Proyek', icon: LayoutGrid },
  { id: 'terminal', label: 'Terminal', icon: SquareTerminal },
  { id: 'toolkit', label: 'Toolkit', icon: Layers },
  { id: 'about', label: 'Tentang', icon: User },
  { id: 'journey', label: 'Perjalanan', icon: Route },
];

const depth = (d: number) => ({ '--d': d }) as CSSProperties;

function ProjectCard({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  const tilt = useTilt<HTMLElement>(project.featured ? 7 : 10);
  return <article ref={tilt} className={`project-card glass tilt ${project.featured ? 'is-featured' : ''}`} style={{ viewTransitionName: `card-${project.id}` } as CSSProperties}>
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
  </article>;
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
  return <article ref={tilt} className={`cert-card glass tilt ${certificate.pending ? 'is-pending' : ''}`}>
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
  </article>;
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
  }), [copyEmail, filterAndReveal, toggleMotion]);

  // Scroll spy for both navigations.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', ...sections.map(s => s.id), 'contact'].forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

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

  // Scroll-linked parallax. Pointer and gyroscope depth is handled in CSS.
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    scope.classList.toggle('motion-paused', paused);
    if (paused) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia(scope);
    mm.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, context => {
      const k = context.conditions?.desktop ? 1 : 0.5;
      gsap.utils.toArray<HTMLElement>('[data-hero-layer]', scope).forEach(el => {
        const speed = Number(el.dataset.heroLayer);
        gsap.to(el, { y: () => speed * window.innerHeight * k, ease: 'none',
          scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 0.6, invalidateOnRefresh: true } });
      });
      gsap.utils.toArray<HTMLElement>('[data-depth]', scope).forEach(el => {
        const d = Number(el.dataset.depth) * k * 110;
        gsap.fromTo(el, { y: d }, { y: -d, ease: 'none',
          scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
      });
      gsap.utils.toArray<HTMLElement>('.section-head h2', scope).forEach(heading => {
        gsap.fromTo(heading, { '--sweep': '-40%' }, { '--sweep': '150%', ease: 'none',
          scrollTrigger: { trigger: heading, start: 'top 92%', end: 'top 45%', scrub: 0.5 } });
      });
    });
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; mm.revert(); };
  }, [paused]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [category, tech]);

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
      <section id="home" className="hero" data-ambient>
        <div className="wrap hero-grid">
          <p className="status-pill glass" data-hero-layer="0.05"><span className="pulse-dot" aria-hidden="true" />Terbuka untuk magang IT</p>
          <h1 className="hero-title" data-hero-layer="0.22" aria-label="Dari ide menjadi sistem.">
            {['Dari ide', 'menjadi', 'sistem.'].map((text, i) => <span className="line" key={text} aria-hidden="true"><span style={{ '--i': i } as CSSProperties}>{text}</span></span>)}
          </h1>

          <div className="hero-stage" data-hero-layer="-0.12">
            <div className="lens-enter">
              <figure ref={lens} className="hero-lens glass tilt ambient-tilt" onPointerDown={() => setScanKey(k => k + 1)}>
                <div className="lens-photo">
                  <Image src={assetPath('/assets/efriza-hero.webp')} alt="Potret Efriza Taufiqurrohman di depan gedung BNI pada malam hari" width={1152} height={1536} priority sizes="(max-width: 899px) 60vw, 360px" />
                  <div className="face-box" key={scanKey} style={scanKey ? { '--fd': '0s' } as CSSProperties : undefined} aria-hidden="true"><i /><i /><i /><i /><span>Efriza, terdeteksi</span></div>
                </div>
                <figcaption><strong>{profile.name}</strong><span>Mahasiswa Informatika, UBSI</span></figcaption>
              </figure>
            </div>
            <span className="hero-chip glass chip-a" style={depth(34)} aria-hidden="true"><img src={assetPath('/assets/logos/python.svg')} alt="" width={22} height={22} />Python</span>
            <span className="hero-chip glass chip-b" style={depth(52)} aria-hidden="true"><img src={assetPath('/assets/logos/tensorflow.svg')} alt="" width={22} height={22} />TensorFlow</span>
            <span className="hero-chip glass chip-c" style={depth(24)} aria-hidden="true"><CircuitBoard size={20} strokeWidth={1.6} />ESP32</span>
          </div>

          <div className="hero-copy" data-hero-layer="0.1">
            <p className="hero-lead">Saya {profile.shortName}. Saya menghubungkan software, machine learning, dan perangkat untuk membangun sesuatu yang bisa digunakan.</p>
            <div className="hero-actions">
              <a className="btn btn-solid" href="#projects">Lihat proyek <ArrowDown size={18} /></a>
              <a className="btn btn-glass" href={profile.cv} download>Unduh CV <FileDown size={18} /></a>
            </div>
            {gyro === 'needs-permission' && <button className="gyro-button" onClick={requestGyro}><Smartphone size={16} />Aktifkan efek gerak ponsel</button>}
          </div>

          <ul className="hero-facts" data-hero-layer="0.04">
            <li><GraduationCap size={17} />Informatika, {profile.campus}</li>
            <li><MapPin size={16} />{profile.location}</li>
            <li><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={16} />7 proyek di GitHub<ArrowUpRight size={14} /></a></li>
          </ul>
        </div>
      </section>

      <section id="projects" className="section" data-ambient>
        <div className="wrap">
          <header className="section-head">
            <h2>Proyek pilihan</h2>
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

      <section id="terminal" className="section terminal-section" data-ambient>
        <div className="wrap terminal-layout">
          <header className="section-head">
            <h2>Lebih suka mengetik?</h2>
            <p>Jelajahi portofolio ini lewat terminal kecil. Ketik <code>proyek</code>, <code>buka 2</code>, atau <code>filter cv</code>. Di ponsel, ketuk perintah di bawah terminal.</p>
          </header>
          <div className="terminal-frame" data-depth="0.12"><MiniTerminal actions={terminalActions} /></div>
        </div>
      </section>

      <section id="toolkit" className="section" data-ambient>
        <div className="wrap">
          <header className="section-head">
            <h2>Alat yang saya pakai</h2>
            <p>Dari melatih model, merancang API, hingga menghubungkan perangkat. Ketuk sebuah teknologi untuk melihat proyek yang memakainya.</p>
          </header>
          <div className="tool-grid">
            {technologies.map((t, i) => <div className="tool-cell" key={t.id} data-depth={[0.05, 0.22, 0.12, 0.3][i % 4]}>
              <ToolTile tech={t} count={projectsUsing(t.id).length} onPick={pickTech} />
            </div>)}
          </div>
        </div>
      </section>

      <section id="about" className="section" data-ambient>
        <div className="wrap about-layout">
          <div className="about-visual">
            <figure className="about-frame glass" data-depth="0.12">
              <Image src={assetPath('/assets/efriza-about.webp')} alt="Potret studio Efriza Taufiqurrohman" width={1024} height={1536} sizes="(max-width: 899px) 78vw, 400px" />
            </figure>
            <div className="about-badge glass" data-depth="0.4" style={depth(30)}><GraduationCap size={22} /><span><strong>{profile.semester}</strong>{profile.degree}</span></div>
            <div className="about-chip glass" data-depth="0.6" style={depth(46)}><MapPin size={16} />Bekasi, Indonesia</div>
          </div>
          <div className="about-copy">
            <header className="section-head">
              <h2>Halo, saya Efriza.</h2>
            </header>
            <p>Saya mahasiswa Informatika di {profile.campus}, dengan ketertarikan pada pengembangan aplikasi, machine learning, computer vision, dan IoT.</p>
            <p>Bagi saya, belajar menjadi lebih menarik ketika sebuah konsep bisa dicoba langsung. Dari gestur tangan yang membuka website sampai kamera yang menggerakkan pemilah sampah, setiap proyek menjadi kesempatan untuk memahami sistem lebih jauh.</p>
            <div className="focus-card glass"><BriefcaseBusiness size={24} /><div><strong>Mencari kesempatan magang IT</strong><span>Siap belajar bersama tim dan berkontribusi melalui proyek nyata.</span></div></div>
            <a className="text-link" href={profile.portfolioPdf} download>Unduh portofolio lengkap (PDF) <FileDown size={18} /></a>
          </div>
        </div>
      </section>

      <section id="journey" className="section" data-ambient>
        <div className="wrap">
          <header className="section-head">
            <h2>Perjalanan sejauh ini</h2>
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
            <ol className="timeline">
              {experience.map(item => <li key={item.role} className="glass">
                <time>{item.period}</time>
                <h3>{item.role}</h3>
                <p className="timeline-company">{item.company}</p>
                <p>{item.description}</p>
              </li>)}
            </ol>
          </div>
          <h3 className="sub-head"><Award size={24} />Pelatihan dan sertifikasi</h3>
          <div className="cert-grid">{certificates.map(c => <CertificateCard key={c.id} certificate={c} onOpen={setCertId} />)}</div>
        </div>
      </section>

      <section id="contact" className="section contact-section" data-ambient>
        <div className="wrap">
          <div className="contact-panel glass">
            <p className="status-pill"><span className="pulse-dot" aria-hidden="true" />Terbuka untuk kesempatan baru</p>
            <h2>Punya ruang untuk belajar dan berkarya?</h2>
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

    <GlassDialog open={Boolean(certificate)} onClose={() => setCertId(null)} labelledBy="cert-dialog-title" size="narrow">
      {certificate?.image && <div className="cert-viewer">
        <Image src={certificate.image.src} alt={certificate.image.alt} width={certificate.image.width} height={certificate.image.height} sizes="(max-width: 700px) 92vw, 640px" />
        <h2 id="cert-dialog-title">{certificate.title}</h2>
        <p>{certificate.issuer}, {certificate.date}</p>
      </div>}
    </GlassDialog>
  </div>;
}
