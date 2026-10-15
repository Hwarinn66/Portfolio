'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

const v = (i: number) => ({ '--i': i }) as CSSProperties;

function InnerSelf() {
  return <>
    <text x="20" y="38" className="t-label">32 jawaban + alasan</text>
    {[70, 52, 78, 60].map((w, i) => <g key={i}>
      <rect x="20" y={50 + i * 26} width="92" height="14" rx="3" className="f-glass" />
      <rect x="25" y={54 + i * 26} width={w} height="6" rx="1" className="pv-type f-lilac" style={v(i)} />
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
        <rect x={234 + col * 42} y={46 + row * 28} width="36" height="20" rx="3" />
        <text x={252 + col * 42} y={60 + row * 28} textAnchor="middle">{f}</text>
      </g>;
    })}
    <text x="276" y="172" textAnchor="middle" className="t-tiny">8 fungsi kognitif</text>
  </>;
}

function SmartTrash() {
  return <>
    <rect x="30" y="64" width="18" height="10" rx="2" className="f-glass" />
    <rect x="18" y="72" width="56" height="40" rx="5" className="f-glass" />
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
    <rect x="158" y="72" width="46" height="40" rx="3" className="f-ink" />
    <text x="181" y="96" textAnchor="middle" className="t-inverse">ESP32</text>
    <path d="M206 92 C 230 92, 240 96, 254 96" className="s-flow" />
    <path d="M222 140 H258 L253 182 H227 Z" className="f-mint s-bin" />
    <path d="M266 140 H302 L297 182 H271 Z" className="f-peach s-bin" />
    <text x="240" y="196" textAnchor="middle" className="t-tiny">Organik</text>
    <text x="284" y="196" textAnchor="middle" className="t-tiny">Nonorganik</text>
    <circle cx="262" cy="52" r="6" className="pv-item pv-item-a" />
    <circle cx="262" cy="52" r="6" className="pv-item pv-item-b" />
    <rect x="260" y="96" width="4" height="36" rx="1" className="f-iris pv-flap" />
    <circle cx="262" cy="96" r="6" className="f-ink" />
    <text x="262" y="80" textAnchor="middle" className="t-tiny">servo</text>
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
    <rect x="186" y="28" width="118" height="24" rx="3" className="f-glass" />
    <circle cx="200" cy="40" r="4" className="f-lagoon pv-blinker" />
    <text x="210" y="44" className="t-label">Cek kedipan 2×</text>
    <circle cx="212" cy="116" r="18" className="f-ink" />
    <text x="212" y="119" textAnchor="middle" className="t-inverse">API</text>
    {[['Alat', 78], ['Guru', 116], ['Siswa', 154]].map(([label, y], i) => <g key={label}>
      <path d={`M230 116 C 246 116, 248 ${y}, 262 ${y}`} className="s-flow" style={v(i)} />
      <rect x="262" y={(y as number) - 12} width="48" height="24" rx="3" className="f-glass" />
      <text x="286" y={(y as number) + 4} textAnchor="middle" className="t-label">{label}</text>
    </g>)}
  </>;
}

function Payroll() {
  const modules: [string, string][] = [['Karyawan', 'f-iris'], ['Absensi', 'f-muted-strong'], ['Cuti', 'f-muted-strong'], ['Payroll', 'f-iris']];
  return <>
    {modules.map(([label, color], i) => <g key={label}>
      <path d={`M120 ${43 + i * 36} C 152 ${43 + i * 36}, 156 100, 186 100`} className="s-flow" style={v(i)} />
      <rect x="16" y={30 + i * 36} width="104" height="26" rx="3" className="f-glass" />
      <circle cx="32" cy={43 + i * 36} r="4.5" className={color} />
      <text x="44" y={47 + i * 36} className="t-label">{label}</text>
    </g>)}
    <rect x="186" y="24" width="118" height="152" rx="4" className="f-paper" />
    <text x="198" y="46" className="t-strong">Slip gaji</text>
    {[0, 1, 2, 3, 4].map(i => <g key={i} className="pv-row" style={v(i)}>
      <rect x="198" y={62 + i * 17} width={[44, 36, 50, 30, 40][i]} height="6" rx="1" className="f-muted" />
      <rect x={292 - [26, 20, 30, 18, 24][i]} y={62 + i * 17} width={[26, 20, 30, 18, 24][i]} height="6" rx="1" className={i > 1 ? 'f-coral-soft' : 'f-lilac'} />
    </g>)}
    <text x="198" y="146" className="t-tiny">BPJS, PPh 21</text>
    <path d="M198 150 H292" className="s-line" />
    <rect x="198" y="158" width="34" height="7" rx="1" className="f-ink" />
    <rect x="252" y="158" width="40" height="7" rx="1" className="f-iris pv-row" style={v(5)} />
    <g className="pv-check"><circle cx="290" cy="42" r="9" className="f-lagoon" /><path d="M285.5 42 L289 45.5 L295 38.5" className="s-check" /></g>
  </>;
}

/** Price-ordered BST: the search goes left when price ≥ minimum and right when price ≤ maximum. */
const laptopNodes: { x: number; y: number; price: number; state: 'hit' | 'seen' | 'pruned' }[] = [
  { x: 160, y: 46, price: 13, state: 'hit' },
  { x: 96, y: 100, price: 11, state: 'seen' },
  { x: 224, y: 100, price: 21, state: 'seen' },
  { x: 58, y: 152, price: 9, state: 'pruned' },
  { x: 134, y: 152, price: 12, state: 'hit' },
  { x: 186, y: 152, price: 16, state: 'hit' },
  { x: 262, y: 152, price: 25, state: 'pruned' },
];
const laptopEdges: [number, number, boolean][] = [[0, 1, false], [0, 2, false], [1, 3, true], [1, 4, false], [2, 5, false], [2, 6, true]];

function Laptop() {
  const n = laptopNodes;
  return <>
    <rect x="12" y="12" width="92" height="18" rx="3" className="f-glass" />
    <text x="58" y="24.5" textAnchor="middle" className="t-tiny">rentang 12–20 jt</text>
    {laptopEdges.map(([a, b, pruned]) => <path key={`${a}${b}`} d={`M${n[a].x} ${n[a].y} L${n[b].x} ${n[b].y}`} className={pruned ? 's-pruned' : 's-line'} />)}
    <path d={`M${n[0].x} ${n[0].y} L${n[1].x} ${n[1].y} L${n[4].x} ${n[4].y}`} className="pv-trace" pathLength={100} />
    <path d={`M${n[0].x} ${n[0].y} L${n[2].x} ${n[2].y} L${n[5].x} ${n[5].y}`} className="pv-trace pv-trace-b" pathLength={100} />
    {n.map((node, i) => <g key={i} className={`pv-node is-${node.state}`} style={v(i)}>
      <circle cx={node.x} cy={node.y} r="17" /><text x={node.x} y={node.y + 3} textAnchor="middle">{node.price} jt</text>
    </g>)}
    <g className="pv-pop"><rect x="114" y="176" width="92" height="18" rx="3" className="f-glass" /><text x="160" y="188.5" textAnchor="middle" className="t-tiny">3 laptop cocok</text></g>
    <text x="300" y="24.5" textAnchor="end" className="t-tiny">cabang putus-putus dipangkas</text>
  </>;
}

const beads: [number, number][] = [[38, 99], [43, 45], [50, 79], [53, 157], [59, 123], [66, 64], [66, 108], [73, 154], [79, 130], [85, 143], [92, 156], [99, 72], [107, 54], [108, 110], [108, 142], [113, 89], [118, 44], [127, 98], [127, 118], [128, 71], [130, 140], [137, 45], [141, 106], [143, 88], [152, 77], [154, 52], [155, 94], [156, 147], [161, 130], [165, 70], [171, 101], [171, 156], [173, 140], [178, 63]];
// The scan line crosses the ROI (x 30 → 192) between 0.48 s and 2.88 s of the 6 s loop; each box pops as it passes.
const passAt = (x: number) => 0.48 + ((x - 30) / 162) * 2.4;

function DenseCounter() {
  return <>
    <rect x="16" y="22" width="190" height="156" rx="4" className="f-glass" />
    {[[22, 60], [23, 142], [199, 104]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="4.4" ry="3.6" className="f-muted" />)}
    <path d="M104 34 V166 M118 34 V166 M30 94 H192 M30 106 H192" className="s-tile" />
    <rect x="104" y="34" width="14" height="132" className="f-overlap" />
    <rect x="30" y="94" width="162" height="12" className="f-overlap" />
    <rect x="30" y="34" width="162" height="132" rx="2" className="s-roi" />
    {beads.map(([x, y]) => <ellipse key={`b${x}${y}`} cx={x} cy={y} rx="4.6" ry="3.8" className="f-bead" />)}
    {beads.map(([x, y]) => <rect key={`x${x}${y}`} x={x - 6.5} y={y - 5.8} width="13" height="11.6" rx="1" className="pv-box" style={{ animationDelay: `${passAt(x).toFixed(2)}s` }} />)}
    <rect x="29" y="34" width="2.4" height="132" rx="1" className="f-iris pv-sweep" />
    <rect x="16" y="22" width="190" height="156" rx="4" className="pv-flash" />
    <rect x="24" y="13" width="62" height="17" rx="3" className="f-ink" />
    <circle cx="33" cy="21.5" r="3" className="f-paper pv-rec" />
    <text x="40" y="25" className="t-inverse">snapshot</text>
    <rect x="218" y="22" width="88" height="62" rx="4" className="f-glass" />
    <text x="230" y="40" className="t-tiny">Objek terhitung</text>
    <text x="229" y="70" className="t-count pv-count">{beads.length}</text>
    <rect x="230" y="75" width="64" height="3" rx="1" className="f-muted" />
    <rect x="230" y="75" width="64" height="3" rx="1" className="f-iris pv-progress" />
    {['ROI', 'Tile 1024 px, 15%', 'YOLO per tile', 'NMS global'].map((label, i) => <g key={label} className="pv-step" style={{ animationDelay: `${[0.2, 0.45, 1.2, 2.9][i]}s` }}>
      <rect x="218" y={94 + i * 22} width="88" height="18" rx="3" />
      <text x="262" y={106 + i * 22} textAnchor="middle">{label}</text>
    </g>)}
  </>;
}

const qr = [[1, 0, 1, 1, 1, 0, 1, 0, 1], [0, 1, 1, 0, 0, 1, 1, 1, 0], [1, 1, 0, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 0, 0, 1, 0, 1], [0, 0, 0, 1, 1, 1, 1, 0, 0], [0, 1, 1, 0, 0, 1, 0, 1, 0], [1, 0, 1, 1, 1, 0, 1, 0, 0], [0, 1, 0, 0, 1, 1, 1, 1, 1], [1, 0, 0, 1, 0, 0, 1, 0, 1]];

function StockRecording() {
  const cell = 3.6, ox = 31.2, oy = 64;
  const finder = (cx: number, cy: number) => <g key={`f${cx}${cy}`}>
    <rect x={ox + cx * cell} y={oy + cy * cell} width={cell * 3} height={cell * 3} className="f-paper" />
    <rect x={ox + cx * cell + 0.9} y={oy + cy * cell + 0.9} width={cell * 3 - 1.8} height={cell * 3 - 1.8} rx="1" className="s-finder" />
    <rect x={ox + (cx + 1) * cell} y={oy + (cy + 1) * cell} width={cell} height={cell} className="f-ink" />
  </g>;
  return <>
    <rect x="20" y="26" width="62" height="138" rx="8" className="f-ink" />
    <rect x="25" y="36" width="52" height="118" rx="3" className="f-paper" />
    <rect x="31" y="43" width="40" height="13" rx="2" className="f-lagoon" />
    <text x="51" y="52.5" textAnchor="middle" className="t-inverse">SCAN IN</text>
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => {
      if ((r < 3 && c < 3) || (r < 3 && c > 7) || (r > 7 && c < 3)) return null;
      return qr[r % 9][(c * 2 + r) % 9] ? <rect key={`${r}-${c}`} x={ox + c * cell} y={oy + r * cell} width={cell} height={cell} className="f-ink" /> : null;
    }))}
    {finder(0, 0)}{finder(8, 0)}{finder(0, 8)}
    <path d="M29 68 V61 H36 M66 61 H73 V68 M73 100 V107 H66 M36 107 H29 V100" className="s-scanframe pv-qr-hit" />
    <rect x="29" y="62" width="44" height="2" rx="1" className="f-iris pv-qr-line" />
    <text x="51" y="124" textAnchor="middle" className="t-strong">a0001</text>
    <text x="51" y="137" textAnchor="middle" className="t-tiny">A.01.02</text>
    <path d="M86 95 H104" className="s-flow" />
    <g className="pv-tx">
      <rect x="106" y="38" width="106" height="116" rx="4" className="f-paper" />
      <text x="118" y="58" className="t-strong">a0001</text>
      <text x="118" y="71" className="t-tiny">Ember 1 kg</text>
      <rect x="118" y="78" width="54" height="15" rx="2" className="f-muted" />
      <text x="145" y="88.6" textAnchor="middle" className="t-tiny">A.01.02</text>
      <text x="118" y="111" className="t-tiny">Qty</text>
      <g className="pv-qty"><rect x="140" y="103" width="60" height="11" rx="2" className="f-ink" /><text x="170" y="111.4" textAnchor="middle" className="t-inverse">+12</text></g>
      <g className="pv-pending"><rect x="118" y="124" width="82" height="19" rx="2" className="f-gold" /><text x="159" y="136.6" textAnchor="middle" className="t-inverse">PENDING</text></g>
      <g className="pv-approved"><rect x="118" y="124" width="82" height="19" rx="2" className="f-lagoon" /><path d="M128 133.5 L131.5 137 L137.5 130" className="s-check" /><text x="166" y="136.6" textAnchor="middle" className="t-inverse">APPROVED</text></g>
    </g>
    <path d="M216 95 H232" className="s-flow" style={v(1)} />
    <rect x="244" y="20" width="58" height="19" rx="3" className="f-glass" />
    <text x="255" y="33" className="t-tiny">Stok</text>
    <text x="294" y="33.5" textAnchor="end" className="t-strong pv-stock-old">48</text>
    <text x="294" y="33.5" textAnchor="end" className="t-strong pv-stock-new">60</text>
    <path d="M238 46 V164 M304 46 V164 M238 80 H304 M238 118 H304 M238 156 H304" className="s-rack" />
    <rect x="243" y="64" width="16" height="14" rx="1" className="f-peach" />
    <rect x="262" y="66" width="14" height="12" rx="1" className="f-mint" />
    <rect x="281" y="62" width="17" height="16" rx="1" className="f-peach" />
    <rect x="243" y="102" width="15" height="14" rx="1" className="f-mint" />
    <rect x="261" y="99" width="20" height="17" rx="1" className="s-slot" />
    <rect x="263" y="102" width="16" height="14" rx="1" className="f-lilac pv-shelf-box" />
    <rect x="284" y="103" width="15" height="13" rx="1" className="f-peach" />
    <rect x="243" y="140" width="17" height="14" rx="1" className="f-mint" />
    <rect x="264" y="142" width="14" height="12" rx="1" className="f-peach" />
    <text x="271" y="178" textAnchor="middle" className="t-tiny">Rak A.01</text>
  </>;
}

const scenes: Record<string, { label: string; render: () => ReactNode }> = {
  innerself: { label: 'Alur InnerSelf: 32 jawaban dan alasannya dianalisis TF-IDF dan Logistic Regression menjadi delapan fungsi kognitif.', render: InnerSelf },
  'smart-trash': { label: 'Alur Smart Trash: kamera, klasifikasi MobileNetV2, perintah HTTP ke ESP32, lalu servo memilah ke tempat organik atau nonorganik.', render: SmartTrash },
  'face-recognition': { label: 'Absensi wajah: pemindaian wajah, cek kedipan, lalu server mengirim data ke alat absensi, guru, dan siswa.', render: FaceRecognition },
  payroll: { label: 'Modul karyawan, absensi, cuti, dan payroll mengalir menjadi slip gaji dengan potongan BPJS dan PPh 21.', render: Payroll },
  laptop: { label: 'Binary search tree terurut harga: pencarian rentang 12 sampai 20 juta memangkas cabang 9 dan 25 juta, lalu menemukan tiga laptop yang cocok.', render: Laptop },
  'dense-counter': { label: 'Snapshot kamera dibatasi ROI, dipecah menjadi tile yang saling tumpang tindih, lalu setiap objek dikotakkan dan dihitung.', render: DenseCounter },
  stock: { label: 'HP memindai QR barang, transaksi masuk sebagai pending, lalu setelah di-approve stok di rak bertambah.', render: StockRecording },
};

/**
 * Diagram of a project's flow, drawn from its repository README. Static by default;
 * with `playing` it animates the flow, and only while it is on screen.
 */
export default function ProjectVisual({ id, playing = false, className = '' }: { id: string; playing?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !playing) return;
    const observer = new IntersectionObserver(([entry]) => el.classList.toggle('is-live', entry.isIntersecting), { rootMargin: '60px' });
    observer.observe(el);
    return () => { observer.disconnect(); el.classList.remove('is-live'); };
  }, [playing]);
  const scene = scenes[id];
  if (!scene) return null;
  const Scene = scene.render;
  return <div ref={ref} className={`pv pv-${id} ${playing ? 'is-playing' : ''} ${className}`}>
    <svg viewBox="0 0 320 200" role="img" aria-label={scene.label}><Scene /></svg>
  </div>;
}
