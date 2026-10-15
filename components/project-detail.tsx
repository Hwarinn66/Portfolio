'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from 'lucide-react';
import { categories, repoPath, techName, type Project } from '@/lib/projects';
import ProjectVisual from '@/components/project-visual';

type Props = { project: Project; previous: Project; next: Project; onNavigate: (direction: 1 | -1) => void };

/** Full case study for one project, shown in the dialog / bottom sheet. */
export default function ProjectDetail({ project, previous, next, onNavigate }: Props) {
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [playing, setPlaying] = useState(false);
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setCanAnimate(!query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest('input, textarea')) return;
      if (event.key === 'ArrowRight') onNavigate(1);
      if (event.key === 'ArrowLeft') onNavigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNavigate]);

  useEffect(() => {
    setPlaying(false);
    titleRef.current?.closest('.sheet-body')?.scrollTo({ top: 0 });
  }, [project.id]);

  const stack = [...project.stack.map(techName), ...project.extras];
  const fields = project.tags.map(tag => categories.find(c => c.id === tag)?.label).filter(Boolean).join(', ');

  return <article className="case" key={project.id}
    onTouchStart={event => { const t = event.touches[0]; swipe.current = { x: t.clientX, y: t.clientY }; }}
    onTouchEnd={event => {
      const start = swipe.current; swipe.current = null;
      const t = event.changedTouches[0];
      if (!start || !t || (event.target as HTMLElement).closest('.pv')) return;
      const dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) onNavigate(dx < 0 ? 1 : -1);
    }}>
    <header className="case-head">
      <h2 id="project-dialog-title" ref={titleRef}>{project.name}</h2>
      <p className="case-dek">{project.subtitle}</p>
      <p className="case-kind">{project.kind}</p>
    </header>

    <figure className="case-figure">
      <ProjectVisual id={project.id} playing={playing} />
      <figcaption>
        <span>Diagram alur, digambar ulang dari README repositori. Bukan screenshot aplikasi.</span>
        {canAnimate && <button type="button" className="text-button" onClick={() => setPlaying(p => !p)} aria-pressed={playing}>
          {playing ? <><Pause size={15} strokeWidth={1.75} />Hentikan animasi</> : <><Play size={15} strokeWidth={1.75} />Putar alur</>}
        </button>}
      </figcaption>
    </figure>

    <dl className="case-sheet">
      <div><dt>Konteks</dt><dd><p>{project.context}</p></dd></div>
      {project.role && <div><dt>Peran saya</dt><dd><p>{project.role}</p></dd></div>}
      {project.flow.length > 0 && <div><dt>Alur sistem</dt><dd><ol className="case-steps">{project.flow.map(step => <li key={step}>{step}</li>)}</ol></dd></div>}
      {project.highlights.length > 0 && <div><dt>Pendekatan teknis</dt><dd><ul className="case-list">{project.highlights.map(point => <li key={point}>{point}</li>)}</ul></dd></div>}
      {project.decisions.length > 0 && <div><dt>Keputusan teknis</dt><dd><ul className="case-decisions">
        {project.decisions.map(d => <li key={d.choice}><strong>{d.choice}</strong>{d.reason && <span>{d.reason}</span>}</li>)}
      </ul></dd></div>}
      {project.limits.length > 0 && <div><dt>Batasan</dt><dd><ul className="case-list">{project.limits.map(item => <li key={item}>{item}</li>)}</ul></dd></div>}
      <div><dt>Teknologi</dt><dd><p>{stack.join(', ')}</p><p className="case-fields">Bidang: {fields}</p></dd></div>
      <div><dt>Kode sumber</dt><dd className="case-repos">
        <a href={project.repository} target="_blank" rel="noopener noreferrer"><code>{repoPath(project.repository)}</code>{project.repositoryLabel && <span>{project.repositoryLabel}</span>}<ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" /><span className="sr-only">(membuka GitHub di tab baru)</span></a>
        {project.repositoryAlt && <a href={project.repositoryAlt.url} target="_blank" rel="noopener noreferrer"><code>{repoPath(project.repositoryAlt.url)}</code><span>{project.repositoryAlt.label}</span><ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" /><span className="sr-only">(membuka GitHub di tab baru)</span></a>}
      </dd></div>
    </dl>

    <nav className="case-nav" aria-label="Proyek lain">
      <button type="button" onClick={() => onNavigate(-1)}><ArrowLeft size={17} strokeWidth={1.75} aria-hidden="true" /><span><small>Sebelumnya</small>{previous.name}</span></button>
      <button type="button" onClick={() => onNavigate(1)}><span><small>Berikutnya</small>{next.name}</span><ArrowRight size={17} strokeWidth={1.75} aria-hidden="true" /></button>
    </nav>
    <p className="case-hint"><span className="hint-touch">Geser ke kiri atau kanan untuk berpindah proyek.</span><span className="hint-mouse">Tombol panah kiri dan kanan juga berpindah proyek.</span></p>
  </article>;
}
