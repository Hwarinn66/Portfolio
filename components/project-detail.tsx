'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Github, Info } from 'lucide-react';
import { assetPath } from '@/lib/asset-path';
import { categories, techName, type Project } from '@/lib/projects';
import ProjectVisual from '@/components/project-visual';

type Props = { project: Project; index: number; total: number; previous: Project; next: Project; onNavigate: (direction: 1 | -1) => void };

export default function ProjectDetail({ project, index, total, previous, next, onNavigate }: Props) {
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest('input, textarea')) return;
      if (event.key === 'ArrowRight') onNavigate(1);
      if (event.key === 'ArrowLeft') onNavigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNavigate]);

  useEffect(() => { titleRef.current?.closest('.sheet-body')?.scrollTo({ top: 0, behavior: 'smooth' }); }, [project.id]);

  return <article className="detail" key={project.id}
    onTouchStart={event => { const t = event.touches[0]; swipe.current = { x: t.clientX, y: t.clientY }; }}
    onTouchEnd={event => {
      const start = swipe.current; swipe.current = null;
      const t = event.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x, dy = t.clientY - start.y;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) onNavigate(dx < 0 ? 1 : -1);
    }}>
    <div className="detail-visual"><ProjectVisual id={project.id} /></div>
    <div className="detail-body">
      <p className="detail-kind">{project.kind}<span className="detail-count">{index + 1} dari {total}</span></p>
      <h2 id="project-dialog-title" ref={titleRef}>{project.name}</h2>
      <p className="detail-subtitle">{project.subtitle}</p>
      <p className="detail-description">{project.description}</p>

      {project.highlights.length > 0 && <>
        <h3 className="detail-heading">Detail implementasi</h3>
        <ul className="detail-list">{project.highlights.map(point => <li key={point}><Check size={17} /><span>{point}</span></li>)}</ul>
      </>}

      <h3 className="detail-heading">Teknologi</h3>
      <ul className="detail-tech">
        {project.stack.map(id => <li key={id}><img src={assetPath(`/assets/logos/${id}.svg`)} alt="" width={18} height={18} />{techName(id)}</li>)}
        {project.extras.map(name => <li key={name}>{name}</li>)}
      </ul>
      <p className="detail-tags">Bidang: {project.tags.map(tag => categories.find(c => c.id === tag)?.label).join(', ')}</p>

      {project.note && <p className="detail-note"><Info size={17} /><span>{project.note}</span></p>}

      <div className="detail-repos">
        <a className="btn btn-solid" href={project.repository} target="_blank" rel="noopener noreferrer"><Github size={18} />{project.repositoryLabel ?? 'Lihat source code'}<ArrowUpRight size={17} /></a>
        {project.repositoryAlt && <a className="btn btn-glass" href={project.repositoryAlt.url} target="_blank" rel="noopener noreferrer"><Github size={18} />{project.repositoryAlt.label}<ArrowUpRight size={17} /></a>}
      </div>

      <nav className="detail-nav" aria-label="Proyek lain">
        <button onClick={() => onNavigate(-1)}><ArrowLeft size={18} /><span><small>Sebelumnya</small>{previous.name}</span></button>
        <button onClick={() => onNavigate(1)}><span><small>Berikutnya</small>{next.name}</span><ArrowRight size={18} /></button>
      </nav>
      <p className="detail-hint"><span className="hint-touch">Geser ke kiri atau kanan untuk berpindah proyek.</span><span className="hint-mouse">Tombol panah kiri dan kanan juga bisa dipakai untuk berpindah proyek.</span></p>
    </div>
  </article>;
}
