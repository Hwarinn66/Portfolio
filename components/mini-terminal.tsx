'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CornerDownLeft, Eraser, TerminalSquare } from 'lucide-react';
import { categories, projects, technologies, type Category } from '@/lib/projects';
import { experience, profile } from '@/lib/profile';
import { ambient } from '@/lib/ambient';

export type TerminalActions = {
  openProject: (id: string) => void;
  filterProjects: (category: Category | 'all') => void;
  copyEmail: () => void;
  toggleMotion: () => void;
  burst: () => void;
  openTrailer: () => void;
};

type Line = { id: number; kind: 'in' | 'out' | 'err' | 'ok'; content: ReactNode };

const commandList = ['trailer', 'bantuan', 'tentang', 'proyek', 'buka', 'filter', 'skill', 'pendidikan', 'pengalaman', 'kontak', 'cv', 'github', 'salin-email', 'gerak', 'tanggal', 'echo', 'bersihkan', 'sudo hire efriza'];
const quick = ['bantuan', 'proyek', 'trailer', 'tentang', 'skill', 'kontak', 'sudo hire efriza'];
const aliases: Record<string, string> = {
  help: 'bantuan', '?': 'bantuan', about: 'tentang', whoami: 'tentang', projects: 'proyek', ls: 'proyek', open: 'buka', skills: 'skill', stack: 'skill',
  edu: 'pendidikan', education: 'pendidikan', experience: 'pengalaman', contact: 'kontak', copy: 'salin-email', motion: 'gerak', date: 'tanggal',
  clear: 'bersihkan', cls: 'bersihkan', reel: 'trailer', video: 'trailer',
};

let lineId = 0;
const line = (kind: Line['kind'], content: ReactNode): Line => ({ id: ++lineId, kind, content });

export default function MiniTerminal({ actions }: { actions: TerminalActions }) {
  const [lines, setLines] = useState<Line[]>(() => [
    line('out', <>Selamat datang di terminal <b>efriza</b>.</>),
    line('out', <>Ketik <b>bantuan</b> untuk melihat perintah, atau ketuk salah satu tombol di bawah.</>),
  ]);
  const [value, setValue] = useState('');
  const [typing, setTyping] = useState(false);
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const output = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { output.current?.scrollTo({ top: output.current.scrollHeight, behavior: 'smooth' }); }, [lines]);

  // The first time the terminal scrolls into view, it demonstrates itself by typing `bantuan`.
  const frame = useRef<HTMLDivElement>(null);
  const demoed = useRef(false);
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || demoed.current) return;
      demoed.current = true;
      observer.disconnect();
      window.setTimeout(() => { if (!history.current.length) typeAndRunRef.current('bantuan'); }, 450);
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const findProject = (query: string) => {
    const n = Number(query);
    if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1];
    return projects.find(p => p.id.startsWith(query) || p.name.toLowerCase().includes(query));
  };

  const projectButton = (id: string, label: ReactNode) => <button className="term-link" onClick={() => actions.openProject(id)}>{label}</button>;

  const run = (raw: string): Line[] => {
    const text = raw.trim();
    if (!text) return [];
    const [first, ...rest] = text.toLowerCase().split(/\s+/);
    const command = aliases[first] ?? first;
    const arg = rest.join(' ');

    switch (command) {
      case 'bantuan': return [line('out', <div className="term-grid">
        {[['trailer', 'putar trailer machine learning'], ['tentang', 'siapa saya'], ['proyek', 'daftar tujuh proyek'], ['buka <nomor>', 'detail proyek, mis. buka 2'], ['filter <ml|cv|iot|web>', 'saring kartu proyek'], ['skill', 'teknologi yang saya pakai'],
          ['pendidikan', 'kampus dan jurusan'], ['pengalaman', 'riwayat kerja'], ['kontak', 'cara menghubungi saya'], ['cv', 'unduh CV (PDF)'], ['salin-email', 'salin alamat email'], ['gerak', 'jeda atau aktifkan animasi'], ['bersihkan', 'kosongkan layar']]
          .map(([c, d]) => <span key={c}><b>{c}</b><i>{d}</i></span>)}
      </div>), line('out', <>Ada satu perintah rahasia. Petunjuk: <b>sudo</b>.</>)];
      case 'trailer': actions.openTrailer(); return [line('ok', 'Memutar trailer… (Esc untuk menutup)')];
      case 'tentang': return [line('out', <>{profile.name}, mahasiswa Informatika di {profile.campus}, {profile.location}. Tertarik pada pengembangan aplikasi, machine learning, computer vision, dan IoT. Sedang mencari kesempatan magang IT.</>)];
      case 'proyek': return [line('out', <ol className="term-list">{projects.map((p, i) => <li key={p.id}>{projectButton(p.id, <><b>{i + 1}</b> {p.name}</>)}<i>{p.tags.join(', ')}</i></li>)}</ol>), line('out', <>Ketuk nama proyek, atau ketik <b>buka 1</b>.</>)];
      case 'buka': {
        if (!arg) return [line('err', 'Sebutkan proyeknya, misalnya: buka 3 atau buka smart')];
        const project = findProject(arg);
        if (!project) return [line('err', `Proyek "${arg}" tidak ditemukan. Ketik proyek untuk melihat daftarnya.`)];
        window.setTimeout(() => actions.openProject(project.id), 250);
        return [line('ok', <>Membuka {project.name}…</>)];
      }
      case 'filter': {
        const match = categories.find(c => c.short === arg || c.id === arg || c.label.toLowerCase() === arg);
        if (!match) return [line('err', 'Pilih salah satu: ml, cv, iot, web, atau semua.')];
        actions.filterProjects(match.id);
        return [line('ok', <>Kartu proyek disaring: {match.label}. Menggulir ke bagian proyek…</>)];
      }
      case 'skill': {
        const groups = [...new Set(technologies.map(t => t.group))];
        return [line('out', <div className="term-grid">{groups.map(g => <span key={g}><b>{g}</b><i>{technologies.filter(t => t.group === g).map(t => t.name).join(', ')}</i></span>)}</div>)];
      }
      case 'pendidikan': return [line('out', <>{profile.degree}, {profile.campus}. 2023 sampai sekarang, {profile.semester.toLowerCase()}.</>)];
      case 'pengalaman': return [line('out', <ul className="term-list">{experience.map(e => <li key={e.role}><b>{e.role}</b> {e.company}<i>{e.period}</i></li>)}</ul>)];
      case 'kontak': return [line('out', <div className="term-grid">
        <span><b>email</b><a href={`mailto:${profile.email}`}>{profile.email}</a></span>
        <span><b>github</b><a href={profile.github} target="_blank" rel="noopener noreferrer">github.com/Hwarinn66</a></span>
        <span><b>linkedin</b><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">efriza-taufiqurrohman</a></span>
        <span><b>whatsapp</b><a href={profile.whatsapp} target="_blank" rel="noopener noreferrer">+62 814-5608-1822</a></span>
      </div>)];
      case 'cv': {
        const a = document.createElement('a'); a.href = profile.cv; a.download = ''; a.click();
        return [line('ok', 'Mengunduh CV-Efriza-Taufiqurrohman.pdf…')];
      }
      case 'github': window.open(profile.github, '_blank', 'noopener'); return [line('ok', 'Membuka GitHub di tab baru…')];
      case 'salin-email': actions.copyEmail(); return [line('ok', `${profile.email} disalin.`)];
      case 'gerak': actions.toggleMotion(); return [line('ok', ambient.paused ? 'Animasi diaktifkan kembali.' : 'Animasi dijeda.')];
      case 'tanggal': return [line('out', new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }))];
      case 'echo': return [line('out', arg || ' ')];
      case 'sudo': {
        if (/^(hire|rekrut) efriza$/.test(arg)) {
          actions.burst();
          return [line('out', '[sudo] kata sandi untuk recruiter: ********'), line('ok', <>Akses diberikan. Langkah berikutnya: kirim email ke <a href={`mailto:${profile.email}`}>{profile.email}</a>.</>)];
        }
        return [line('err', 'Izin ditolak. Perintah sudo yang dikenal hanya satu, dan berawalan hire.')];
      }
      default: return [line('err', `Perintah tidak dikenal: ${first}. Ketik bantuan untuk melihat daftar perintah.`)];
    }
  };

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    history.current = [text, ...history.current.filter(h => h !== text)].slice(0, 30);
    cursor.current = -1;
    const command = aliases[text.toLowerCase()] ?? text.toLowerCase();
    if (command === 'bersihkan') { setLines([]); setValue(''); return; }
    setLines(current => [...current.slice(-60), line('in', text), ...run(text)]);
    setValue('');
  };

  // Chips "type" their command first, so the terminal visibly does the work.
  const typeAndRun = (command: string) => {
    if (typing) return;
    if (ambient.paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { submit(command); return; }
    setTyping(true);
    let i = 0;
    const step = () => {
      i += 1;
      setValue(command.slice(0, i));
      if (i < command.length) window.setTimeout(step, 28 + Math.random() * 26);
      else window.setTimeout(() => { submit(command); setTyping(false); }, 160);
    };
    step();
  };

  const typeAndRunRef = useRef(typeAndRun);
  typeAndRunRef.current = typeAndRun;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.max(-1, Math.min(history.current.length - 1, cursor.current + (event.key === 'ArrowUp' ? 1 : -1)));
      cursor.current = next;
      setValue(next === -1 ? '' : history.current[next]);
    } else if (event.key === 'Tab') {
      const match = commandList.find(c => value && c.startsWith(value.toLowerCase()) && c !== value.toLowerCase());
      if (match) { event.preventDefault(); setValue(match); }
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault(); setLines([]);
    }
  };

  return <div ref={frame} className="terminal" onClick={event => {
    if (window.matchMedia('(pointer: fine)').matches && !(event.target as HTMLElement).closest('button, a')) input.current?.focus();
  }}>
    <div className="terminal-bar">
      <span><TerminalSquare size={17} />efriza@portfolio: ~</span>
      <button onClick={() => setLines([])} aria-label="Bersihkan layar terminal"><Eraser size={16} /><span>Bersihkan</span></button>
    </div>
    <div className="terminal-output" ref={output} role="log" aria-live="polite" aria-label="Keluaran terminal">
      {lines.map(item => <div key={item.id} className={`term-line term-${item.kind}`}>
        {item.kind === 'in' ? <><span className="term-prompt" aria-hidden="true">❯</span><span>{item.content}</span></> : item.content}
      </div>)}
    </div>
    <form className="terminal-input" onSubmit={event => { event.preventDefault(); if (!typing) submit(value); }}>
      <span className="term-prompt" aria-hidden="true">❯</span>
      <input ref={input} value={value} onChange={event => setValue(event.target.value)} onKeyDown={onKeyDown} readOnly={typing}
        aria-label="Ketik perintah terminal" placeholder="ketik perintah…" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
      <button type="submit" aria-label="Jalankan perintah"><CornerDownLeft size={17} /></button>
    </form>
    <div className="terminal-chips" aria-label="Perintah cepat">
      {quick.map(command => <button key={command} onClick={() => typeAndRun(command)} disabled={typing}>{command}</button>)}
    </div>
  </div>;
}
