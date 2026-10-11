'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

const v = (i: number) => ({ '--i': i }) as CSSProperties;

function InnerSelf() {
  return <>
    <text x="20" y="38" className="t-label">32 jawaban + alasan</text>
    {[70, 52, 78, 60].map((w, i) => <g key={i}>
      <rect x="20" y={50 + i * 26} width="92" height="14" rx="7" className="f-glass" />
      <rect x="25" y={54 + i * 26} width={w} height="6" rx="3" className="pv-type f-lilac" style={v(i)} />
    </g>)}
    <path d="M120 100 H146" className="s-flow" />
    <circle cx="176" cy="100" r="26" className="pv-ring" />
    <circle cx="176" cy="100" r="26" className="f-glass" />
    <text x="176" y="98" textAnchor="middle" className="t-strong">TF-IDF</text>
    <text x="176" y="111" textAnchor="middle" className="t-tiny">LogReg</text>
    <path d="M206 100 H228" className="s-flow" />
    {['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'].map((f, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      return <g key={f} className="pv-fn" style={v(i)}>
        <rect x={234 + col * 42} y={46 + row * 28} width="36" height="20" rx="6" />
        <text x={252 + col * 42} y={60 + row * 28} textAnchor="middle">{f}</text>
      </g>;
    })}
  </>;
}

function SmartTrash() {
  return <>
    <rect x="30" y="64" width="18" height="10" rx="4" className="f-glass" />
    <rect x="18" y="72" width="56" height="40" rx="11" className="f-glass" />
    <circle cx="46" cy="92" r="12" className="f-ink" />
    <circle cx="46" cy="92" r="5" className="f-lilac pv-lens" />
    <text x="46" y="132" textAnchor="middle" className="t-label">Kamera</text>
    <path d="M78 92 H96" className="s-flow" />
    <circle cx="118" cy="92" r="19" className="pv-ring" />
    <circle cx="118" cy="92" r="19" className="f-glass" />
    <text x="118" y="96" textAnchor="middle" className="t-strong">CNN</text>
    <text x="118" y="132" textAnchor="middle" className="t-label">MobileNetV2</text>
    <path d="M140 92 H156" className="s-flow" />
    {[0, 1, 2, 3].map(i => <g key={i}><path d={`M${166 + i * 10} 66 V72 M${166 + i * 10} 112 V118`} className="s-pin" /></g>)}
    <rect x="158" y="72" width="46" height="40" rx="8" className="f-ink" />
    <text x="181" y="96" textAnchor="middle" className="t-inverse">ESP32</text>
    <path d="M206 92 C 230 92, 240 96, 254 96" className="s-flow" />
    <path d="M222 140 H258 L253 182 H227 Z" className="f-mint s-bin" />
    <path d="M266 140 H302 L297 182 H271 Z" className="f-peach s-bin" />
    <text x="240" y="196" textAnchor="middle" className="t-tiny">Organik</text>
    <text x="284" y="196" textAnchor="middle" className="t-tiny">Nonorganik</text>
    <circle cx="262" cy="52" r="6" className="pv-item pv-item-a" />
    <circle cx="262" cy="52" r="6" className="pv-item pv-item-b" />
    <rect x="260" y="96" width="4" height="36" rx="2" className="f-iris pv-flap" />
    <circle cx="262" cy="96" r="6" className="f-ink" />
  </>;
}

function FaceRecognition() {
  const mesh = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return [110 + Math.cos(a) * 36, 98 + Math.sin(a) * 46];
  });
  return <>
    <ellipse cx="110" cy="98" rx="36" ry="46" className="f-glass" />
    <path d="M97 90 L110 104 L123 90 M110 104 L100 120 M110 104 L120 120 M97 90 L100 120 M123 90 L120 120" className="s-mesh" />
    {mesh.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.9" className="f-iris pv-dot" style={v(i)} />)}
    <ellipse cx="97" cy="90" rx="6" ry="3.6" className="f-ink pv-eye" />
    <ellipse cx="123" cy="90" rx="6" ry="3.6" className="f-ink pv-eye" />
    <path d="M100 120 Q110 127 120 120" className="s-line" />
    <rect x="62" y="30" width="96" height="2" rx="1" className="f-iris pv-scan" />
    <path d="M58 48 V28 H78 M142 28 H162 V48 M162 152 V172 H142 M78 172 H58 V152" className="s-bracket pv-bracket" />
    <rect x="186" y="28" width="118" height="24" rx="12" className="f-glass" />
    <circle cx="200" cy="40" r="4" className="f-lagoon pv-blinker" />
    <text x="210" y="44" className="t-label">Cek kedipan 2×</text>
    <circle cx="212" cy="116" r="18" className="f-ink" />
    <text x="212" y="119" textAnchor="middle" className="t-inverse">API</text>
    {[['Alat', 78], ['Guru', 116], ['Siswa', 154]].map(([label, y], i) => <g key={label}>
      <path d={`M230 116 C 246 116, 248 ${y}, 262 ${y}`} className="s-flow" style={v(i)} />
      <rect x="262" y={(y as number) - 12} width="48" height="24" rx="12" className="f-glass" />
      <text x="286" y={(y as number) + 4} textAnchor="middle" className="t-label">{label}</text>
    </g>)}
  </>;
}

function Payroll() {
  const modules: [string, string][] = [['Karyawan', 'f-iris'], ['Absensi', 'f-lagoon'], ['Cuti', 'f-coral'], ['Payroll', 'f-gold']];
  return <>
    {modules.map(([label, color], i) => <g key={label}>
      <path d={`M120 ${43 + i * 36} C 152 ${43 + i * 36}, 156 100, 186 100`} className="s-flow" style={v(i)} />
      <rect x="16" y={30 + i * 36} width="104" height="26" rx="13" className="f-glass" />
      <circle cx="32" cy={43 + i * 36} r="5.5" className={color} />
      <text x="44" y={47 + i * 36} className="t-label">{label}</text>
    </g>)}
    <rect x="186" y="24" width="118" height="152" rx="14" className="f-paper" />
    <text x="198" y="46" className="t-strong">Slip gaji</text>
    {[0, 1, 2, 3, 4].map(i => <g key={i} className="pv-row" style={v(i)}>
      <rect x="198" y={62 + i * 17} width={[44, 36, 50, 30, 40][i]} height="6" rx="3" className="f-muted" />
      <rect x={292 - [26, 20, 30, 18, 24][i]} y={62 + i * 17} width={[26, 20, 30, 18, 24][i]} height="6" rx="3" className={i > 1 ? 'f-coral-soft' : 'f-lilac'} />
    </g>)}
    <path d="M198 150 H292" className="s-line" />
    <rect x="198" y="158" width="34" height="7" rx="3.5" className="f-ink" />
    <rect x="252" y="158" width="40" height="7" rx="3.5" className="f-iris pv-row" style={v(5)} />
    <g className="pv-check"><circle cx="290" cy="42" r="9" className="f-lagoon" /><path d="M285.5 42 L289 45.5 L295 38.5" className="s-check" /></g>
  </>;
}

function Laptop() {
  const n = [[160, 36], [96, 92], [224, 92], [60, 150], [132, 150], [188, 150], [260, 150]];
  const edges = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
  const labels = ['Harga', 'CPU', 'CPU', 'RAM', 'RAM', 'RAM', 'RAM'];
  return <>
    {edges.map(([a, b]) => <path key={`${a}${b}`} d={`M${n[a][0]} ${n[a][1]} L${n[b][0]} ${n[b][1]}`} className="s-line" />)}
    <path d={`M${n[0][0]} ${n[0][1]} L${n[1][0]} ${n[1][1]} L${n[4][0]} ${n[4][1]}`} className="pv-trace" pathLength={100} />
    {n.map(([x, y], i) => <g key={i} className={[0, 1, 4].includes(i) ? 'pv-node pv-hit' : 'pv-node'} style={v([0, 1, 4].indexOf(i))}>
      <circle cx={x} cy={y} r="17" /><text x={x} y={y + 3.5} textAnchor="middle">{labels[i]}</text>
    </g>)}
    <g className="pv-pop"><rect x="112" y="174" width="40" height="18" rx="5" className="f-glass" /><text x="132" y="186.5" textAnchor="middle" className="t-tiny">cocok</text></g>
  </>;
}

function Gesture() {
  return <>
    {[0, 1, 2, 3].map(i => <g key={i} className={i >= 2 ? 'pv-finger fold' : 'pv-finger'} style={v(i)}>
      <rect x={52 + i * 14} y="50" width="11" height="48" rx="5.5" className="f-glass" />
      <circle cx={57.5 + i * 14} cy="57" r="2.6" className="f-iris" />
    </g>)}
    <rect x="34" y="96" width="14" height="36" rx="7" transform="rotate(-28 41 114)" className="f-glass" />
    <rect x="46" y="88" width="66" height="60" rx="22" className="f-glass" />
    <text x="79" y="170" textAnchor="middle" className="t-label">Gestur</text>
    <path d="M122 112 H168" className="s-flow" />
    <rect x="176" y="44" width="128" height="104" rx="12" className="f-glass" />
    <circle cx="188" cy="56" r="2.5" className="f-muted" /><circle cx="196" cy="56" r="2.5" className="f-muted" /><circle cx="204" cy="56" r="2.5" className="f-muted" />
    <rect x="214" y="52" width="80" height="8" rx="4" className="f-muted" />
    <g className="pv-page">
      <rect x="188" y="72" width="64" height="10" rx="5" className="f-lilac" />
      <rect x="188" y="90" width="104" height="6" rx="3" className="f-muted" />
      <rect x="188" y="102" width="86" height="6" rx="3" className="f-muted" />
      <rect x="188" y="118" width="48" height="18" rx="9" className="f-iris" />
    </g>
    <text x="240" y="170" textAnchor="middle" className="t-label">Buka situs</text>
  </>;
}

function MathGame() {
  const questions = [['7 × 8', '56'], ['12 + 9', '21'], ['45 ÷ 5', '9']];
  return <>
    {questions.map(([q, a], i) => <g key={q} className="pv-q" style={v(i)}>
      <text x="160" y="96" textAnchor="middle" className="t-equation">{q} = <tspan className="t-answer">{a}</tspan></text>
    </g>)}
    <text x="262" y="56" className="t-score pv-score">+10</text>
    <rect x="60" y="116" width="200" height="8" rx="4" className="f-muted" />
    <rect x="60" y="116" width="200" height="8" rx="4" className="f-iris pv-timer" />
    {['Mudah', 'Sedang', 'Sulit'].map((label, i) => <g key={label} className="pv-level" style={v(i)}>
      <rect x={70 + i * 62} y="144" width="56" height="22" rx="11" />
      <text x={98 + i * 62} y="159" textAnchor="middle">{label}</text>
    </g>)}
  </>;
}

const scenes: Record<string, { label: string; render: () => ReactNode }> = {
  innerself: { label: 'Alur InnerSelf: 32 jawaban dianalisis TF-IDF dan Logistic Regression menjadi delapan fungsi kognitif.', render: InnerSelf },
  'smart-trash': { label: 'Alur Smart Trash: kamera, klasifikasi MobileNetV2, ESP32, lalu servo memilah ke tempat organik atau nonorganik.', render: SmartTrash },
  'face-recognition': { label: 'Absensi wajah: pemindaian wajah, cek kedipan, lalu server mengirim data ke alat absensi, guru, dan siswa.', render: FaceRecognition },
  payroll: { label: 'Modul karyawan, absensi, cuti, dan payroll mengalir menjadi slip gaji.', render: Payroll },
  laptop: { label: 'Pencarian laptop menelusuri binary tree dari harga, prosesor, hingga RAM.', render: Laptop },
  gesture: { label: 'Gestur tangan dikenali lalu membuka sebuah situs.', render: Gesture },
  math: { label: 'Soal matematika acak dengan timer, skor, dan tiga level kesulitan.', render: MathGame },
};

/** Animated diagram of a project's flow. Loops only while on screen. */
export default function ProjectVisual({ id, className = '' }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => el.classList.toggle('is-live', entry.isIntersecting), { rootMargin: '60px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const scene = scenes[id];
  if (!scene) return null;
  const Scene = scene.render;
  return <div ref={ref} className={`pv pv-${id} ${className}`}>
    <svg viewBox="0 0 320 200" role="img" aria-label={scene.label}><Scene /></svg>
  </div>;
}
