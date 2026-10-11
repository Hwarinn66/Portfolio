'use client';

import type { CSSProperties } from 'react';
import { introLines, objects, ROI, stack, stepNotes, steps, tiles } from './trailer-data';

const v = (i: number) => ({ '--i': i }) as CSSProperties;
const pad = (n: number) => String(n).padStart(2, '0');

/** The 1000×1000 "camera frame" with the 50 objects, ROI, tiles, boxes and annotation layers. */
function Field() {
  const seamObjects = objects.filter(o => o.seam);
  return <svg className="tr-field" viewBox="0 0 1000 1000" aria-hidden="true">
    <defs>
      <radialGradient id="tr-obj" cx="38%" cy="32%" r="70%">
        <stop offset="0" stopColor="#fff6b8" /><stop offset=".45" stopColor="#ffd23f" /><stop offset="1" stopColor="#e08a00" />
      </radialGradient>
    </defs>
    <rect className="tr-frame" x="0" y="0" width="1000" height="1000" rx="18" />
    <path className="tr-roi-mask" fillRule="evenodd" d={`M0 0H1000V1000H0Z M${ROI.x} ${ROI.y}V${ROI.y + ROI.size}H${ROI.x + ROI.size}V${ROI.y}Z`} />
    <g className="tr-tiles">{tiles.map((t, i) => <rect key={i} className="tr-tile" x={t.x} y={t.y} width={t.size} height={t.size} />)}</g>
    <g className="tr-tile-his">{tiles.map((t, i) => <rect key={i} className="tr-tile-hi" x={t.x} y={t.y} width={t.size} height={t.size} />)}</g>
    <g className="tr-objs">{objects.map((o, i) => <ellipse key={i} className="tr-obj" cx={o.x} cy={o.y} rx={o.r} ry={o.r * 0.82} transform={`rotate(${o.rot.toFixed(1)} ${o.x.toFixed(1)} ${o.y.toFixed(1)})`} />)}</g>
    <g className="tr-boxes">{objects.map((o, i) => <rect key={i} className="tr-box" x={o.x - o.r - 5} y={o.y - o.r - 5} width={o.r * 2 + 10} height={o.r * 2 + 10} rx="3" />)}</g>
    <g className="tr-dups">{seamObjects.map((o, i) => <g key={i} className="tr-dup">
      <rect x={o.x - o.r - 13} y={o.y - o.r - 9} width={o.r * 2 + 12} height={o.r * 2 + 14} rx="3" />
      <rect x={o.x - o.r + 1} y={o.y - o.r - 1} width={o.r * 2 + 12} height={o.r * 2 + 8} rx="3" />
    </g>)}</g>
    <rect className="tr-roi" x={ROI.x} y={ROI.y} width={ROI.size} height={ROI.size} pathLength={100} />
    <rect className="tr-scan" x="0" y="0" width="1000" height="6" />
    <g className="tr-annots">
      {[objects[3], objects[17], objects[29]].map((o, i) => <rect key={i} className="tr-annot" x={o.x - o.r - 8} y={o.y - o.r - 8} width={o.r * 2 + 16} height={o.r * 2 + 16} pathLength={100} />)}
      <path className="tr-cursor" d="M0 0 L0 46 L12 34 L21 54 L30 50 L21 30 L38 30 Z" />
    </g>
    <rect className="tr-snap" x="0" y="0" width="1000" height="1000" rx="18" />
  </svg>;
}

function InnerSelf() {
  const words = ['karena', 'saya', 'lebih suka', 'merencanakan', 'sendiri', 'detail'];
  const fns = ['Ni', 'Ne', 'Si', 'Se', 'Ti', 'Te', 'Fi', 'Fe'];
  return <svg viewBox="0 0 1000 1000" className="tr-vsvg" aria-hidden="true">
    {words.map((w, i) => <g key={w} className="tr-in-word" style={v(i)}><rect x={60 + (i % 2) * 40} y={250 + i * 82} width={w.length * 19 + 40} height="52" rx="26" /><text x={80 + (i % 2) * 40} y={284 + i * 82}>{w}</text></g>)}
    <circle className="tr-in-orb" cx="560" cy="500" r="92" />
    <text className="tr-in-orb-t" x="560" y="492">TF-IDF</text>
    <text className="tr-in-orb-s" x="560" y="530">LogReg</text>
    {fns.map((f, i) => {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const x = 560 + Math.cos(a) * 250, y = 500 + Math.sin(a) * 250;
      return <g key={f} className="tr-in-fn" style={v(i)}><line x1={560 + Math.cos(a) * 100} y1={500 + Math.sin(a) * 100} x2={x - Math.cos(a) * 46} y2={y - Math.sin(a) * 46} /><circle cx={x} cy={y} r="44" /><text x={x} y={y + 12}>{f}</text></g>;
    })}
  </svg>;
}

function SmartTrash() {
  return <svg viewBox="0 0 1000 1000" className="tr-vsvg" aria-hidden="true">
    <path className="tr-st-bracket" d="M250 200H200V250 M750 200H800V250 M800 650V700H750 M250 700H200V650" />
    <path className="tr-st-leaf" d="M500 300 C 610 330, 640 470, 520 590 C 420 540, 380 400, 500 300 Z M500 320 L515 575" />
    <rect className="tr-st-scan" x="210" y="210" width="580" height="5" />
    <g className="tr-st-tag"><rect x="560" y="250" width="200" height="54" rx="8" /><text x="660" y="287">ORGANIK</text></g>
    <g className="tr-st-servo"><rect x="494" y="745" width="12" height="120" rx="6" /></g>
    <circle cx="500" cy="745" r="16" className="tr-st-pivot" />
    <path className="tr-st-bin" d="M300 820H450L435 960H315Z" /><path className="tr-st-bin" d="M550 820H700L685 960H565Z" />
    <text className="tr-st-binl" x="375" y="990">organik</text><text className="tr-st-binl" x="625" y="990">nonorganik</text>
  </svg>;
}

function Face() {
  const ring = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    return [500 + Math.cos(a) * 190, 470 + Math.sin(a) * 250];
  });
  const inner = [[430, 420], [570, 420], [500, 520], [450, 610], [550, 610], [500, 650], [390, 520], [610, 520]];
  return <svg viewBox="0 0 1000 1000" className="tr-vsvg" aria-hidden="true">
    <path className="tr-fc-mesh" d={`M${ring.map(p => p.join(' ')).join(' L')} Z M430 420 L500 520 L570 420 M500 520 L450 610 L500 650 L550 610 L500 520 M390 520 L430 420 M610 520 L570 420 M390 520 L450 610 M610 520 L550 610`} pathLength={100} />
    {[...ring, ...inner].map(([x, y], i) => <circle key={i} className="tr-fc-dot" cx={x} cy={y} r="7" style={v(i)} />)}
    <ellipse className="tr-fc-eye" cx="430" cy="420" rx="36" ry="20" /><ellipse className="tr-fc-eye" cx="570" cy="420" rx="36" ry="20" />
    <path className="tr-fc-lock" d="M270 180H220V230 M730 180H780V230 M780 710V760H730 M270 760H220V710" />
    <g className="tr-fc-tag"><rect x="330" y="800" width="340" height="60" rx="30" /><text x="500" y="840">kedip 2× → dikenali</text></g>
  </svg>;
}

function Hand() {
  // 21 landmarks: wrist + 4 per finger.
  const wrist: [number, number] = [470, 860];
  const fingers: [number, number][][] = [
    [[380, 780], [320, 700], [280, 630], [250, 570]],
    [[410, 640], [400, 520], [395, 440], [392, 370]],
    [[470, 620], [470, 490], [470, 400], [470, 320]],
    [[530, 635], [545, 515], [552, 430], [558, 360]],
    [[580, 670], [610, 580], [628, 520], [642, 460]],
  ];
  const pts = [wrist, ...fingers.flat()];
  return <svg viewBox="0 0 1000 1000" className="tr-vsvg" aria-hidden="true">
    <path className="tr-hd-bones" d={fingers.map(f => `M${wrist.join(' ')} L${f.map(p => p.join(' ')).join(' L')}`).join(' ') + ` M${fingers[0][0].join(' ')} L${fingers[1][0].join(' ')} L${fingers[2][0].join(' ')} L${fingers[3][0].join(' ')} L${fingers[4][0].join(' ')}`} pathLength={100} />
    {pts.map(([x, y], i) => <circle key={i} className="tr-hd-pt" cx={x} cy={y} r={i % 4 === 0 ? 13 : 10} style={v(i)} />)}
    <g className="tr-hd-win"><rect x="700" y="330" width="250" height="190" rx="14" /><path d="M700 370H950" /><circle cx="724" cy="350" r="6" /><circle cx="744" cy="350" r="6" /><rect x="724" y="395" width="140" height="16" rx="8" /><rect x="724" y="425" width="200" height="12" rx="6" /><rect x="724" y="450" width="170" height="12" rx="6" /></g>
    <path className="tr-hd-arrow" d="M660 450 L700 430" />
  </svg>;
}

const vignettes = [
  { key: 'inner', title: 'INNERSELF', sub: 'NLP / TF-IDF + Logistic Regression', art: <InnerSelf /> },
  { key: 'trash', title: 'SMART TRASH', sub: 'MobileNetV2 → ESP32 + servo', art: <SmartTrash /> },
  { key: 'face', title: 'FACE RECOGNITION', sub: 'MediaPipe Face Mesh + MobileNetV2', art: <Face /> },
  { key: 'hand', title: 'HAND GESTURE', sub: 'OpenCV + MediaPipe', art: <Hand /> },
];

function Workflow() {
  return <>
    <section className="tr-layer tr-wf tr-wf-split" aria-hidden="true">
      <div className="tr-wf-box">
        <p className="tr-wf-label">SPLIT DATASET</p>
        <div className="tr-split"><span>train</span><span>val</span><span>test</span></div>
      </div>
    </section>
    <section className="tr-layer tr-wf tr-wf-train" aria-hidden="true">
      <div className="tr-wf-box">
        <p className="tr-wf-label">TRAINING YOLO</p>
        <svg viewBox="0 0 600 260" className="tr-curve"><path className="tr-curve-grid" d="M0 250H600 M0 0V250" /><path className="tr-curve-line" d="M0 20 C 60 60, 90 150, 160 180 S 300 222, 400 230 S 540 238, 600 240" pathLength={100} /></svg>
      </div>
    </section>
    <section className="tr-layer tr-wf tr-wf-eval" aria-hidden="true">
      <div className="tr-wf-box">
        <p className="tr-wf-label">EVALUASI PER KEPADATAN</p>
        <div className="tr-eval">{['10', '50', '100', '200', '300+'].map((n, i) => <span key={n} style={v(i)}>{n}</span>)}</div>
      </div>
    </section>
  </>;
}

/** All layers of the trailer. Every element starts hidden; the timeline reveals it. */
export default function TrailerStage({ heat, grain }: { heat: string; grain: string }) {
  return <div className="tr-stage">
    <div className="tr-bg"><div className="tr-glow" /></div>
    <div className="tr-cam"><div className="tr-punch">
      <div className="tr-layer tr-field-layer">
        <div className="tr-field-wrap">
          <div className="tr-heat" style={heat ? { backgroundImage: `url(${heat})` } : undefined} />
          <Field />
        </div>
        <p className="tr-annot-label">ANOTASI <span>LABEL YOLO</span></p>
      </div>

      <div className="tr-layer"><div className="tr-core" /></div>

      <div className="tr-layer tr-kin" aria-hidden="true">
        <div className="tr-kin-lines">{introLines.map((line, li) => <p key={li} className={`tr-kin-line tr-kl-${li}`}>
          {line.map(word => <span key={word} className="tr-word">{word.split('').map((ch, ci) => <span key={ci} className="tr-ch">{ch}</span>)}</span>)}
        </p>)}</div>
      </div>

      <p className="tr-q">berapa objek di sini?</p>

      <div className="tr-layer tr-title-layer"><h2 className="tr-title"><span>DENSE</span><span>OBJECT</span><span>COUNTER</span></h2></div>

      <div className="tr-layer tr-count-layer"><div className="tr-count"><span className="tr-count-n">0</span><span className="tr-count-l">objek terhitung</span></div>
        <pre className="tr-json">{'{\n  "class": "object",\n  "count": 50,\n  "roi": [100, 100, 900, 900],\n  "boxes": [ … ]\n}'}</pre></div>

      {vignettes.map(item => <section key={item.key} className={`tr-layer tr-v tr-v-${item.key}`} aria-hidden="true">
        <div className="tr-v-art">{item.art}</div>
        <div className="tr-v-cap"><h3>{item.title}</h3><p>{item.sub}</p></div>
      </section>)}

      <Workflow />

      <div className="tr-layer tr-stack" aria-hidden="true">{stack.map(word => <span key={word}>{word}</span>)}</div>

      <div className="tr-layer tr-outro">
        <div className="tr-outro-inner">
          <h2 className="tr-name"><span>EFRIZA</span><span>TAUFIQURROHMAN</span></h2>
          <p className="tr-role">machine learning / computer vision</p>
          <p className="tr-link">github.com/Hwarinn66</p>
        </div>
      </div>
    </div></div>

    <div className="tr-steps-names" aria-hidden="true">
      {steps.map((s, i) => <div key={s} className="tr-sn"><span className="tr-sn-i">{pad(i + 1)}</span><span className="tr-sn-t">{s.toUpperCase()}</span><span className="tr-sn-n">{stepNotes[i]}</span></div>)}
    </div>
    <ol className="tr-steps" aria-hidden="true">{steps.map((s, i) => <li key={s}><b>{pad(i + 1)}</b>{s}</li>)}</ol>

    <div className="tr-hud" aria-hidden="true">
      <i className="tr-c tr-c1" /><i className="tr-c tr-c2" /><i className="tr-c tr-c3" /><i className="tr-c tr-c4" />
      <span className="tr-hud-tl">efriza taufiqurrohman<br />machine learning reel</span>
      <span className="tr-hud-tr"><b className="tr-tc">00:00:00</b><span className="tr-hud-count">COUNT <b>00</b></span></span>
      <span className="tr-hud-bl">
        {['intro', 'dense object counter', 'proyek machine learning', 'dari data ke model', 'penutup'].map(label => <span key={label} className="tr-sec">{label}</span>)}
      </span>
      <span className="tr-hud-br"><i className="tr-rec" />REC</span>
    </div>
    <div className="tr-dip" />
    <div className="tr-layer tr-breath-layer"><p className="tr-breath">dan bukan cuma itu.</p></div>
    <div className="tr-bars" aria-hidden="true"><i /><i /></div>
    <div className="tr-flash" />
    <div className="tr-grain" style={grain ? { backgroundImage: `url(${grain})` } : undefined} />
    <div className="tr-vignette" />
  </div>;
}
