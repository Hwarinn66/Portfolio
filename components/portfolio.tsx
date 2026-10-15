'use client';

import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Menu, Play, X } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { learning, projectById, projects, repoPath, skillGroups, techName, type Project } from '@/lib/projects';
import { certificates, education, experience, profile } from '@/lib/profile';
import SheetDialog from '@/components/sheet-dialog';
import MiniTerminal, { type TerminalActions } from '@/components/mini-terminal';
import ProjectDetail from '@/components/project-detail';
import ProjectVisual from '@/components/project-visual';
import { getTrailerAudio, startTrailerAudio } from '@/lib/trailer-audio';

// The trailer (scenes, timeline, player, Three.js) loads only when someone opens it.
const Trailer = dynamic(() => import('@/components/trailer/trailer'), { ssr: false });

const sections = [
  { id: 'projects', label: 'Proyek' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'toolkit', label: 'Teknologi' },
  { id: 'about', label: 'Tentang' },
  { id: 'journey', label: 'Riwayat' },
  { id: 'contact', label: 'Kontak' },
];

/** "A, B, dan C" with React nodes. */
function joinList(items: ReactNode[]) {
  return items.map((item, i) => <Fragment key={i}>{i > 0 && (i === items.length - 1 ? (items.length > 2 ? ', dan ' : ' dan ') : ', ')}{item}</Fragment>);
}

function External({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">
    {children}<ArrowUpRight className="ext" size={14} strokeWidth={1.75} aria-hidden="true" /><span className="sr-only"> (tab baru)</span>
  </a>;
}

const stackOf = (project: Project) => [...project.stack.map(techName), ...project.extras].join(', ');

function FeaturedProject({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  return <article className="feature" aria-labelledby={`feature-${project.id}`}>
    <div className="feature-text">
      <h3 id={`feature-${project.id}`}>{project.name}</h3>
      <p className="feature-dek">{project.subtitle}</p>
      <p className="feature-kind">{project.kind}</p>
      <p>{project.context}</p>
      <h4>Pendekatan teknis</h4>
      <ul className="feature-points">{project.highlights.map(point => <li key={point}>{point}</li>)}</ul>
      {project.limits[0] && <p className="feature-limit"><strong>Batasan:</strong> {project.limits[0]}</p>}
      <p className="feature-stack">{stackOf(project)}</p>
      <div className="feature-actions">
        <button type="button" className="button" onClick={() => onOpen(project.id)} aria-haspopup="dialog">Baca studi kasus<span className="sr-only"> {project.name}</span></button>
        <External className="code-link" href={project.repository}><code>{repoPath(project.repository)}</code></External>
      </div>
    </div>
    <div className="feature-figure">
      <ProjectVisual id={project.id} />
    </div>
  </article>;
}

function IndexRow({ project, onOpen }: { project: Project; onOpen: (id: string) => void }) {
  return <li className="index-row">
    <div className="index-name">
      <h4>{project.name}</h4>
      <p>{project.kind}</p>
    </div>
    <p className="index-desc">{project.description}</p>
    <p className="index-stack">{stackOf(project)}</p>
    <div className="index-actions">
      <button type="button" className="text-button" onClick={() => onOpen(project.id)} aria-haspopup="dialog" aria-label={`Studi kasus ${project.name}`}>Studi kasus</button>
      <External className="text-link" href={project.repository}>{project.repositoryAlt ? 'Laravel' : 'Kode'}<span className="sr-only"> {project.name}</span></External>
      {project.repositoryAlt && <External className="text-link" href={project.repositoryAlt.url}>Next.js<span className="sr-only"> {project.name}</span></External>}
    </div>
  </li>;
}

type Props = { year: number; cvSize: string; portfolioSize: string };

export default function Portfolio({ year, cvSize, portfolioSize }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [certId, setCertId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null);
  const [active, setActive] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const featured = useMemo(() => projects.filter(p => p.featured), []);
  const others = useMemo(() => projects.filter(p => !p.featured), []);

  // Sound must start inside the click (mobile browsers), so the shared audio plays before the player mounts.
  const openTrailer = useCallback(() => { void startTrailerAudio(); setTrailerOpen(true); }, []);
  const preloadTrailer = useCallback(() => { getTrailerAudio(); void import('@/components/trailer/trailer'); }, []);

  const notify = useCallback((text: string) => setToast({ key: Date.now(), text }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const copyEmail = useCallback(() => {
    if (!navigator.clipboard) { notify(`Salin manual: ${profile.email}`); return; }
    navigator.clipboard.writeText(profile.email).then(() => notify('Alamat email disalin'), () => notify(`Salin manual: ${profile.email}`));
  }, [notify]);

  const terminalActions = useMemo<TerminalActions>(() => ({ openProject: setOpenId, copyEmail, openTrailer }), [copyEmail, openTrailer]);

  // Scroll spy for the navigation.
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['home', ...sections.map(s => s.id)].forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // The mobile menu closes with Escape and when the layout widens.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      document.querySelector<HTMLButtonElement>('.menu-button')?.focus();
    };
    const wide = window.matchMedia('(min-width: 1000px)');
    const onWide = () => { if (wide.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { window.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); };
  }, [menuOpen]);

  const openIndex = openId ? projects.findIndex(p => p.id === openId) : -1;
  const navigateProject = useCallback((direction: 1 | -1) => {
    setOpenId(current => {
      const index = projects.findIndex(p => p.id === current);
      return projects[(index + direction + projects.length) % projects.length].id;
    });
  }, []);
  const certificate = certificates.find(c => c.id === certId);
  const projectLink = (id: string) => {
    const project = projectById(id);
    return project ? <button type="button" className="inline-button" onClick={() => setOpenId(id)} aria-haspopup="dialog">{project.name}</button> : null;
  };

  return <div className="site">
    <a className="skip-link" href="#main">Langsung ke konten</a>

    <header className="site-header">
      <div className="wrap header-inner">
        <a href="#home" className="brand">Efriza Taufiqurrohman</a>
        <button type="button" className="menu-button" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(open => !open)}>
          {menuOpen ? <X size={18} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={18} strokeWidth={1.75} aria-hidden="true" />}Menu
        </button>
        <nav id="site-nav" className="site-nav" data-open={menuOpen} aria-label="Navigasi utama">
          <ul>
            {sections.map(s => <li key={s.id}><a href={`#${s.id}`} aria-current={active === s.id ? 'location' : undefined} onClick={() => setMenuOpen(false)}>{s.label}</a></li>)}
            <li className="nav-cv"><a href={profile.cv} download onClick={() => setMenuOpen(false)}>Unduh CV</a></li>
          </ul>
        </nav>
      </div>
    </header>

    <main id="main">
      <section id="home" className="hero" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-byline">
            <p className="byline-name">{profile.name}</p>
            <p>{profile.degree}, {profile.campus}, {profile.semester.toLowerCase()}. {profile.location}.</p>
            <p className="byline-status"><span className="status-dot" aria-hidden="true" />{profile.status}</p>
          </div>
          <figure className="hero-portrait">
            <Image src={assetPath('/assets/efriza-about.webp')} alt="Potret studio Efriza Taufiqurrohman" width={1024} height={1536} priority sizes="(max-width: 899px) 96px, 300px" />
          </figure>
          <h1 id="hero-title" className="hero-title"><span>Dari ide</span> <span>menjadi</span> <span>sistem.</span></h1>
          <p className="hero-lead">Saya menyambungkan aplikasi web, model machine learning dan computer vision, serta perangkat ESP32 menjadi sistem yang bisa dipakai. Contohnya: kamera yang mengenali jenis sampah lalu menggerakkan servo pemilah.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projects">Lihat proyek</a>
            <a className="button" href={profile.cv} download>Unduh CV{cvSize && <>{' '}<span className="button-meta">PDF, {cvSize}</span></>}</a>
          </div>
        </div>
      </section>

      <section id="projects" className="section" aria-labelledby="projects-title">
        <div className="wrap">
          <header className="section-head">
            <h2 id="projects-title">Proyek</h2>
            <div className="section-intro">
              <p>Tiga proyek dibahas sebagai studi kasus: konteks, pendekatan teknis, dan batasannya. Diagram di setiap proyek digambar ulang dari README repositorinya, bukan screenshot. Empat proyek lain ada di daftar di bawah.</p>
              <button type="button" className="text-button" onClick={openTrailer} onPointerEnter={preloadTrailer} onFocus={preloadTrailer}>
                <Play size={15} strokeWidth={1.75} aria-hidden="true" />Putar trailer proyek (40 detik, bersuara)
              </button>
            </div>
          </header>

          <div className="features">
            {featured.map(project => <FeaturedProject key={project.id} project={project} onOpen={setOpenId} />)}
          </div>

          <div className="index">
            <h3 className="index-title">Proyek lainnya</h3>
            <ul className="project-index">{others.map(project => <IndexRow key={project.id} project={project} onOpen={setOpenId} />)}</ul>
            <p className="index-more"><External className="text-link" href={profile.github}>Semua repositori di GitHub</External></p>
          </div>
        </div>
      </section>

      <section id="terminal" className="section" aria-labelledby="terminal-title">
        <div className="wrap split">
          <header className="split-head">
            <h2 id="terminal-title">Lebih suka mengetik?</h2>
            <p>Terminal ini membaca data yang sama dengan halaman: proyek, teknologi, riwayat, dan kontak. Ketik perintah atau pilih contoh di bawahnya. Menu di atas tetap bisa dipakai kapan saja.</p>
            <ul id="terminal-keys" className="keys">
              <li><kbd>↑</kbd> <kbd>↓</kbd> perintah sebelumnya</li>
              <li><kbd>Tab</kbd> lengkapi perintah</li>
              <li><kbd>Esc</kbd> keluar dari kolom ketik</li>
            </ul>
          </header>
          <div className="split-body"><MiniTerminal actions={terminalActions} /></div>
        </div>
      </section>

      <section id="toolkit" className="section" aria-labelledby="toolkit-title">
        <div className="wrap split">
          <header className="split-head">
            <h2 id="toolkit-title">Teknologi</h2>
            <p>Dikelompokkan per bidang. Setiap baris menyebut proyek tempat teknologi itu benar-benar dipakai.</p>
          </header>
          <dl className="ledger split-body">
            {skillGroups.map(group => <div key={group.id}>
              <dt>{group.label}</dt>
              <dd>
                <p className="ledger-main">{group.items.join(', ')}</p>
                <p className="ledger-note">{group.projects.length ? <>Dipakai di {joinList(group.projects.map(projectLink))}.</> : `${group.evidence}.`}</p>
              </dd>
            </div>)}
            <div>
              <dt>Sedang dipelajari</dt>
              <dd>
                <p className="ledger-main">{learning.join(', ')}</p>
                <p className="ledger-note">Pengalaman belajar; belum ada proyek yang ditampilkan di sini.</p>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="about" className="section" aria-labelledby="about-title">
        <div className="wrap split">
          <header className="split-head">
            <h2 id="about-title">Halo, saya Efriza.</h2>
          </header>
          <div className="prose split-body">
            <p>Saya mahasiswa Informatika di {profile.campus}, dengan ketertarikan pada pengembangan aplikasi, machine learning, computer vision, dan IoT.</p>
            <p>Bagi saya, belajar menjadi lebih menarik ketika sebuah konsep bisa dicoba langsung. Dari gestur tangan yang membuka website sampai kamera yang menggerakkan pemilah sampah, setiap proyek menjadi kesempatan untuk memahami sistem lebih jauh.</p>
            <p><strong>Sedang mencari kesempatan magang IT.</strong> Siap belajar bersama tim dan berkontribusi melalui proyek nyata.</p>
            <p><a className="text-link" href={profile.portfolioPdf} download>Unduh portofolio lengkap</a>{portfolioSize && <span className="link-meta"> PDF, {portfolioSize}</span>}</p>
          </div>
        </div>
      </section>

      <section id="journey" className="section" aria-labelledby="journey-title">
        <div className="wrap split">
          <header className="split-head">
            <h2 id="journey-title">Riwayat</h2>
            <p>Pendidikan, pengalaman kerja, dan sertifikasi, dari yang terbaru.</p>
          </header>
          <div className="history split-body">
            <h3>Pendidikan</h3>
            <ol className="timeline">
              {education.map(item => <li key={item.title}>
                <p className="timeline-date">{item.period}</p>
                <div><h4>{item.title}</h4><p className="timeline-org">{item.place}</p><p>{item.detail}</p></div>
              </li>)}
            </ol>
            <h3>Pengalaman kerja</h3>
            <ol className="timeline">
              {experience.map(item => <li key={item.role}>
                <p className="timeline-date">{item.period}</p>
                <div><h4>{item.role}</h4><p className="timeline-org">{item.company}</p><p>{item.description}</p></div>
              </li>)}
            </ol>
            <h3>Pelatihan dan sertifikasi</h3>
            <ol className="timeline">
              {certificates.map(item => <li key={item.id} className={item.image ? 'has-thumb' : undefined}>
                <p className="timeline-date">{item.date ?? 'Dalam proses'}</p>
                <div>
                  <h4>{item.title}</h4>
                  <p className="timeline-org">{item.issuer}</p>
                  {item.pending && <p>{item.pending}.</p>}
                </div>
                {item.image && <button type="button" className="cert-thumb" onClick={() => setCertId(item.id)} aria-haspopup="dialog" aria-label={`Lihat sertifikat ${item.title}`}>
                  <Image src={item.image.src} alt="" width={item.image.width} height={item.image.height} sizes="96px" />
                </button>}
              </li>)}
            </ol>
          </div>
        </div>
      </section>

      <section id="contact" className="section contact" aria-labelledby="contact-title">
        <div className="wrap split">
          <header className="split-head">
            <h2 id="contact-title">Punya ruang untuk belajar dan berkarya?</h2>
            <p>Saya siap membicarakan kesempatan magang, kolaborasi, atau ide proyek. Email adalah cara paling mudah menghubungi saya.</p>
          </header>
          <div className="contact-body split-body">
            <div className="contact-actions">
              <a className="button button-primary" href={`mailto:${profile.email}`}>Kirim email</a>
              <button type="button" className="button" onClick={copyEmail}>Salin alamat email</button>
            </div>
            <dl className="contact-list">
              <div><dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
              <div><dt>LinkedIn</dt><dd><External href={profile.linkedin}>efriza-taufiqurrohman</External></dd></div>
              <div><dt>GitHub</dt><dd><External href={profile.github}>Hwarinn66</External></dd></div>
              <div><dt>WhatsApp</dt><dd><External href={profile.whatsapp}>{profile.whatsappLabel}</External></dd></div>
              <div><dt>Dokumen</dt><dd className="contact-docs">
                <span><a href={profile.cv} download>CV</a>{cvSize && <span className="link-meta"> PDF, {cvSize}</span>}</span>
                <span><a href={profile.portfolioPdf} download>Portofolio lengkap</a>{portfolioSize && <span className="link-meta"> PDF, {portfolioSize}</span>}</span>
              </dd></div>
            </dl>
          </div>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>© {year} {profile.name}</p>
        <p><External className="text-link" href={profile.source}>Kode sumber situs ini</External></p>
      </div>
    </footer>

    <div className="toast-region" aria-live="polite">{toast && <p key={toast.key} className="toast">{toast.text}</p>}</div>

    <SheetDialog open={openIndex >= 0} onClose={() => setOpenId(null)} labelledBy="project-dialog-title" label={openIndex >= 0 ? `Studi kasus ${openIndex + 1} dari ${projects.length}` : undefined}>
      {openIndex >= 0 && <ProjectDetail project={projects[openIndex]}
        previous={projects[(openIndex - 1 + projects.length) % projects.length]} next={projects[(openIndex + 1) % projects.length]} onNavigate={navigateProject} />}
    </SheetDialog>

    <SheetDialog open={Boolean(certificate)} onClose={() => setCertId(null)} labelledBy="cert-dialog-title" size="narrow" label="Sertifikat">
      {certificate?.image && <div className="cert-viewer">
        <Image src={certificate.image.src} alt={certificate.image.alt} width={certificate.image.width} height={certificate.image.height} sizes="(max-width: 700px) 92vw, 640px" />
        <h2 id="cert-dialog-title">{certificate.title}</h2>
        <p>{certificate.issuer}, {certificate.date}</p>
      </div>}
    </SheetDialog>

    {trailerOpen && <Trailer onClose={() => setTrailerOpen(false)} onSeeProjects={() => {
      getTrailerAudio().pause(); setTrailerOpen(false);
      window.setTimeout(() => document.getElementById('projects')?.scrollIntoView({ block: 'start' }), 60);
    }} />}
  </div>;
}
