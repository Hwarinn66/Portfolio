'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CornerDownLeft } from 'lucide-react';
import { categories, learning, projects, skillGroups, type Category } from '@/lib/projects';
import { certificates, education, experience, profile } from '@/lib/profile';

export type TerminalActions = {
  openProject: (id: string) => void;
  copyEmail: () => void;
  openTrailer: () => void;
};

type Line = { id: number; kind: 'in' | 'out' | 'err' | 'ok'; content: ReactNode };

const help: [string, string][] = [
  ['proyek', 'daftar tujuh proyek'],
  ['buka <nomor|nama>', 'studi kasus, mis. buka 2'],
  ['filter <ml|cv|iot|web>', 'proyek per bidang'],
  ['skill', 'teknologi per bidang'],
  ['tentang', 'siapa saya'],
  ['pendidikan', 'kampus dan jurusan'],
  ['pengalaman', 'riwayat kerja'],
  ['sertifikat', 'pelatihan dan sertifikasi'],
  ['kontak', 'email, LinkedIn, GitHub'],
  ['cv', 'unduh CV (PDF)'],
  ['salin-email', 'salin alamat email'],
  ['github', 'buka GitHub di tab baru'],
  ['trailer', 'putar trailer 40 detik (bersuara)'],
  ['bersihkan', 'kosongkan layar'],
];
const commandList = ['bantuan', 'tentang', 'proyek', 'buka', 'filter', 'skill', 'pendidikan', 'pengalaman', 'sertifikat', 'kontak', 'cv', 'github', 'salin-email', 'trailer', 'tanggal', 'echo', 'bersihkan'];
const quick = ['proyek', 'buka 2', 'filter cv', 'skill', 'kontak', 'bantuan'];
const aliases: Record<string, string> = {
  help: 'bantuan', '?': 'bantuan', about: 'tentang', whoami: 'tentang', projects: 'proyek', ls: 'proyek', open: 'buka', skills: 'skill', stack: 'skill',
  edu: 'pendidikan', education: 'pendidikan', experience: 'pengalaman', riwayat: 'pengalaman', certificates: 'sertifikat', contact: 'kontak', copy: 'salin-email',
  date: 'tanggal', clear: 'bersihkan', cls: 'bersihkan', reel: 'trailer', video: 'trailer',
};

let lineId = 0;
const line = (kind: Line['kind'], content: ReactNode): Line => ({ id: ++lineId, kind, content });

const helpGrid = () => <dl className="term-grid">{help.map(([c, d]) => <div key={c}><dt>{c}</dt><dd>{d}</dd></div>)}</dl>;

export default function MiniTerminal({ actions }: { actions: TerminalActions }) {
  const [lines, setLines] = useState<Line[]>(() => [
    line('out', <>Perintah yang tersedia. Ketik <b>bantuan</b> untuk menampilkan daftar ini lagi.</>),
    line('out', helpGrid()),
  ]);
  const [value, setValue] = useState('');
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const output = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  // Keep the newest output in view, but never on first render (that would scroll the page).
  useEffect(() => {
    if (!started.current) { started.current = true; return; }
    const el = output.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const findProject = (query: string) => {
    const n = Number(query);
    if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1];
    return projects.find(p => p.id.startsWith(query) || p.name.toLowerCase().includes(query));
  };

  const projectButton = (id: string, label: ReactNode) => <button type="button" className="term-link" onClick={() => actions.openProject(id)}>{label}</button>;
  const projectList = (list: typeof projects) => <ol className="term-list">{list.map(p => {
    const n = projects.indexOf(p) + 1;
    return <li key={p.id}>{projectButton(p.id, <><b>{n}</b>{p.name}</>)}<i>{p.tags.join(', ')}</i></li>;
  })}</ol>;

  const run = (raw: string): Line[] => {
    const text = raw.trim();
    if (!text) return [];
    const [first, ...rest] = text.toLowerCase().split(/\s+/);
    const command = aliases[first] ?? first;
    const arg = rest.join(' ');

    switch (command) {
      case 'bantuan': return [line('out', helpGrid())];
      case 'tentang': return [line('out', <>{profile.name}, mahasiswa Informatika di {profile.campus}, {profile.location}. Membangun aplikasi web, model machine learning, computer vision, dan perangkat IoT. {profile.status}.</>)];
      case 'proyek': return [line('out', projectList(projects)), line('out', <>Pilih nama proyek, atau ketik <b>buka 1</b>.</>)];
      case 'buka': {
        if (!arg) return [line('err', 'Sebutkan proyeknya, misalnya: buka 3 atau buka smart')];
        const project = findProject(arg);
        if (!project) return [line('err', `Proyek "${arg}" tidak ditemukan. Ketik proyek untuk melihat daftarnya.`)];
        window.setTimeout(() => actions.openProject(project.id), 120);
        return [line('ok', <>Membuka studi kasus {project.name}.</>)];
      }
      case 'filter': {
        const match = categories.find(c => c.short === arg || c.id === arg || c.label.toLowerCase() === arg);
        if (!match) return [line('err', 'Pilih salah satu: ml, cv, iot, web, atau semua.')];
        const list = match.id === 'all' ? projects : projects.filter(p => p.tags.includes(match.id as Category));
        return [line('out', <>{match.label}: {list.length} proyek</>), line('out', projectList(list))];
      }
      case 'skill': return [line('out', <dl className="term-grid">
        {skillGroups.map(g => <div key={g.id}><dt>{g.label}</dt><dd>{g.items.join(', ')}</dd></div>)}
        <div><dt>Sedang dipelajari</dt><dd>{learning.join(', ')}</dd></div>
      </dl>)];
      case 'pendidikan': return [line('out', <ul className="term-list">{education.map(e => <li key={e.title}><span><b>{e.title}</b> {e.place}</span><i>{e.period}</i></li>)}</ul>)];
      case 'pengalaman': return [line('out', <ul className="term-list">{experience.map(e => <li key={e.role}><span><b>{e.role}</b> {e.company}</span><i>{e.period}</i></li>)}</ul>)];
      case 'sertifikat': return [line('out', <ul className="term-list">{certificates.map(c => <li key={c.id}><span><b>{c.title}</b> {c.issuer}</span><i>{c.date ?? c.pending}</i></li>)}</ul>)];
      case 'kontak': return [line('out', <dl className="term-grid">
        <div><dt>email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
        <div><dt>linkedin</dt><dd><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">efriza-taufiqurrohman</a></dd></div>
        <div><dt>github</dt><dd><a href={profile.github} target="_blank" rel="noopener noreferrer">github.com/Hwarinn66</a></dd></div>
        <div><dt>whatsapp</dt><dd><a href={profile.whatsapp} target="_blank" rel="noopener noreferrer">{profile.whatsappLabel}</a></dd></div>
      </dl>)];
      case 'cv': {
        const a = document.createElement('a'); a.href = profile.cv; a.download = ''; a.click();
        return [line('ok', 'Mengunduh CV-Efriza-Taufiqurrohman.pdf.')];
      }
      case 'github': window.open(profile.github, '_blank', 'noopener'); return [line('ok', 'GitHub dibuka di tab baru.')];
      case 'salin-email': actions.copyEmail(); return [line('ok', `Menyalin ${profile.email}.`)];
      case 'trailer': actions.openTrailer(); return [line('ok', 'Memutar trailer. Tekan Esc untuk menutup.')];
      case 'tanggal': return [line('out', new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }))];
      case 'echo': return [line('out', arg || ' ')];
      case 'sudo': {
        if (/^(hire|rekrut) efriza$/.test(arg)) return [line('ok', <>Tidak perlu sudo. Kirim email ke <a href={`mailto:${profile.email}`}>{profile.email}</a>.</>)];
        return [line('err', 'sudo tidak tersedia di terminal ini.')];
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
    setValue('');
    if (command === 'bersihkan') { setLines([]); return; }
    setLines(current => [...current.slice(-60), line('in', text), ...run(text)]);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = Math.max(-1, Math.min(history.current.length - 1, cursor.current + (event.key === 'ArrowUp' ? 1 : -1)));
      cursor.current = next;
      setValue(next === -1 ? '' : history.current[next]);
    } else if (event.key === 'Tab' && value) {
      const match = commandList.find(c => c.startsWith(value.toLowerCase()) && c !== value.toLowerCase());
      if (match) { event.preventDefault(); setValue(match); }
    } else if (event.key === 'Escape') {
      event.currentTarget.blur();
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault(); setLines([]);
    }
  };

  return <div className="terminal" onClick={event => {
    if (window.matchMedia('(pointer: fine)').matches && !(event.target as HTMLElement).closest('button, a, input')) input.current?.focus();
  }}>
    <div className="terminal-bar">
      <span>efriza@portfolio:~</span>
      <button type="button" onClick={() => setLines([])}>Bersihkan</button>
    </div>
    <div className="terminal-output" ref={output} role="log" aria-live="polite" aria-label="Keluaran terminal" tabIndex={0}>
      {lines.map(item => <div key={item.id} className={`term-line term-${item.kind}`}>
        {item.kind === 'in' ? <><span className="term-prompt" aria-hidden="true">$</span><span>{item.content}</span></> : item.content}
      </div>)}
    </div>
    <form className="terminal-input" onSubmit={event => { event.preventDefault(); submit(value); }}>
      <label htmlFor="terminal-command" className="term-prompt" aria-hidden="true">$</label>
      <input id="terminal-command" ref={input} value={value} onChange={event => setValue(event.target.value)} onKeyDown={onKeyDown}
        aria-label="Ketik perintah terminal" aria-describedby="terminal-keys" placeholder="ketik perintah, mis. proyek" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
      <button type="submit" aria-label="Jalankan perintah"><CornerDownLeft size={17} strokeWidth={1.75} /></button>
    </form>
    <div className="terminal-chips" role="group" aria-label="Contoh perintah">
      {quick.map(command => <button type="button" key={command} onClick={() => submit(command)}><code>{command}</code></button>)}
    </div>
  </div>;
}
