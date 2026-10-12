import { bst, bstRange, projects, qrGrid, repoLangs, repoNames } from './trailer-data';

const letters = (text: string, cls = 'ch') => Array.from(text).map((c, i) => <span key={i} className={cls}>{c === ' ' ? ' ' : c}</span>);

function Sparkle({ className = '', id }: { className?: string; id: string }) {
  return <svg className={className} viewBox="-50 -50 100 100" aria-hidden="true">
    <defs>
      <linearGradient id={id} x1="-40" y1="-40" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#5b8cff" /><stop offset=".55" stopColor="#a77bff" /><stop offset="1" stopColor="#ffb27a" />
      </linearGradient>
    </defs>
    <path d="M0 -46 C4 -14 14 -4 46 0 C14 4 4 14 0 46 C-4 14 -14 4 -46 0 C-14 -4 -4 -14 0 -46Z" fill={`url(#${id})`} />
  </svg>;
}

const reasons = [
  'aku suka menyusun rencana sebelum mulai',
  'lebih percaya data daripada firasat',
  'sering membayangkan kemungkinan ke depan',
  'nyaman memimpin kerja kelompok',
  'keputusan harus sesuai nilai pribadiku',
];

const qrCells = qrGrid.flatMap((row, r) => row.map((on, c) => (on ? <rect key={`${r}-${c}`} x={c} y={r} width="1.02" height="1.02" /> : null)));

/** The trailer's DOM layers. Motion lives in trailer-timeline.ts; 3D lives in three/. */
export default function TrailerStage({ grain }: { grain: string }) {
  const inRange = (v: number) => v >= bstRange[0] && v <= bstRange[1];
  return <div className="tv" aria-hidden="true">
    <div className="tv-screen">
      {/* ── Backgrounds ───────────────────────────────── */}
      <div className="bgs">
        <div className="bg bg-open"><i className="op-light" /><i className="op-halo" /><i className="op-dark" /></div>
        <div className="bg bg-counter"><i className="bg-grid" /></div>
        <div className="bg bg-innerself"><i className="in-blob in-blob-1" /><i className="in-blob in-blob-2" /><i className="in-blob in-blob-3" /></div>
        <div className="bg bg-voice"><i className="vo-glow" /></div>
        <div className="bg bg-trash"><i className="bg-grid" /><i className="tr2-glow" /></div>
        <div className="bg bg-face"><i className="bg-grid" /><i className="fc-glow" /></div>
        <div className="bg bg-hand"><div className="hd-back">{Array.from({ length: 5 }, (_, i) => <p key={i}>GESTURE GESTURE GESTURE GESTURE</p>)}</div></div>
        <div className="bg bg-stock"><i className="st-stripes" /><p className="st-ghost">A.01.01</p></div>
        <div className="bg bg-payroll"><i className="pr-lines" /></div>
        <div className="bg bg-laptop"><i className="lp-grid" /></div>
        <div className="bg bg-math"><i className="mt-grid" /></div>
        <div className="bg bg-recap" />
        <div className="bg bg-outro"><i className="ou-glow" /></div>
      </div>

      <canvas className="tv-3d" />

      {/* ── Foregrounds ───────────────────────────────── */}
      <div className="fgs">
        {/* Opening */}
        <section className="fg fg-open">
          <i className="op-streak" />
          <div className="op-mark"><Sparkle className="op-spark" id="sp-a" /><p className="op-word">{letters('Efriza')}</p></div>
          <p className="op-sub">machine learning · computer vision · web</p>
          <div className="op-numlabel"><b>proyek</b><span>11 repositori · github.com/Hwarinn66</span></div>
          <div className="op-ui">
            <p className="op-hi"><Sparkle className="op-hi-spark" id="sp-b" /><span>Hai, aku Efriza</span></p>
            <h2 className="op-q">{['Mau', 'lihat', 'apa', 'dulu?'].map(w => <span key={w} className="w"><span>{w}</span></span>)}</h2>
            <div className="op-card">
              <p className="op-input"><span className="op-typed">{letters('tampilkan semua proyekku', 'tc')}</span><i className="op-caret" /></p>
              <div className="op-tools"><span className="op-plus">+</span><span className="op-tool">Alat</span><span className="op-send"><svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg></span></div>
            </div>
            <div className="op-chips">{['Machine learning', 'Computer vision', 'IoT', 'Web'].map(c => <span key={c}>{c}</span>)}</div>
          </div>
          <svg className="op-cursor" viewBox="0 0 24 24"><path d="M4 2l15 9-7 1.6L8.6 20z" /></svg>
          <div className="op-pill"><i className="op-spin" /><span>Menganalisis 11 repositori…</span></div>
          <div className="op-repos">{repoNames.map((r, i) => <span key={r} className="op-repo" style={{ '--i': i } as React.CSSProperties}><i className={`lang lang-${repoLangs[i].toLowerCase()}`} />{r}</span>)}</div>
          <div className="op-doc">
            <div className="op-doc-in">
              <p className="op-doc-h"><Sparkle className="op-doc-spark" id="sp-c" />10 proyek ditemukan</p>
              <ol>{projects.map(p => <li key={p.id}><b>{p.n}</b><span>{p.name}</span><em>{p.kind}</em></li>)}</ol>
            </div>
          </div>
          <i className="op-core" />
        </section>

        {/* 01 Dense Object Counter */}
        <section className="fg fg-counter">
          <div className="cn-head">
            <p className="kick"><b>01</b> proyek terbaru · computer vision</p>
            <h2 className="cn-title"><span>DENSE</span><span>OBJECT</span><span>COUNTER</span></h2>
          </div>
          <ul className="cn-steps">
            <li>ROI</li><li>Tile 1024 px · overlap 15%</li><li>YOLO · 1 kelas</li><li>NMS global + cek seam</li>
          </ul>
          <div className="cn-count"><b className="cn-n">0</b><span>objek terhitung</span></div>
          <p className="cn-cam">snapshot dari kamera HP · IP Webcam</p>
          <pre className="cn-json">{'{ "count": 50,\n  "roi": [100, 100, 900, 900],\n  "boxes": [ … ] }'}</pre>
        </section>

        {/* 02 InnerSelf Cognitive */}
        <section className="fg fg-innerself">
          <div className="in-head">
            <p className="kick"><b>02</b> NLP · machine learning</p>
            <h2 className="in-title">{letters('InnerSelf', 'ic')}</h2>
            <p className="in-sub">cognitive</p>
          </div>
          <div className="in-reasons">{reasons.map((r, i) => <span key={r} className="in-r" style={{ '--i': i } as React.CSSProperties}>“{r}”</span>)}</div>
          <p className="in-model">TF-IDF + Logistic Regression · 125.000 alasan sintetis</p>
          <div className="in-result">
            <p className="in-stack"><span>Te</span><i>–</i><span>Ni</span><i>–</i><span>Se</span><i>–</i><span>Fi</span><em>→ ENTJ</em></p>
            <p className="in-facts">32 pertanyaan · 8 fungsi kognitif · 16 susunan</p>
          </div>
        </section>

        {/* 03 Voice Dataset */}
        <section className="fg fg-voice">
          <div className="vo-wave">{Array.from({ length: 72 }, (_, i) => <i key={i} />)}</div>
          <div className="vo-head">
            <p className="kick"><b>03</b> audio · voice conversion</p>
            <h2 className="vo-title"><span className="vo-t1">VOICE</span><span className="vo-t2">DATASET</span></h2>
          </div>
          <p className="vo-rec"><i />REC <b className="vo-time">00:00:00</b></p>
          <p className="vo-specs"><span>±23 menit</span><span>FLAC mono</span><span>48 kHz</span><span>F0 · RMVPE</span><span>RVC</span></p>
          <ol className="vo-pipe">{['Bersihkan', 'Mono 48 kHz', 'F0 RMVPE', 'Latih RVC', 'Index', '.pth + .index'].map((s, i) => <li key={s} className={i < 2 ? 'done' : ''}>{s}</li>)}</ol>
        </section>

        {/* 04 Smart Trash */}
        <section className="fg fg-trash">
          <div className="t4-head">
            <p className="kick"><b>04</b> machine learning + IoT</p>
            <h2 className="t4-title"><span>SMART</span><span>TRASH</span></h2>
            <i className="t4-tape" />
          </div>
          <ol className="t4-flow">{['Kamera', 'MobileNetV2', 'HTTP /cmd', 'ESP32', 'Servo'].map(s => <li key={s}>{s}</li>)}</ol>
          <p className="t4-tag t4-l">← ORGANIK</p>
          <p className="t4-tag t4-r">NON-ORGANIK →</p>
          <div className="t4-blynk"><span>Blynk</span><p>organik <b className="t4-c1">0</b></p><p>non-organik <b className="t4-c2">0</b></p></div>
        </section>

        {/* 05 Face Recognition */}
        <section className="fg fg-face">
          <i className="fc-scan" />
          <div className="fc-frame"><i /><i /><i /><i /><span className="fc-track">TRACKING</span></div>
          <div className="fc-head">
            <p className="kick"><b>05</b> computer vision · absensi</p>
            <h2 className="fc-title"><span className="scr" data-text="FACE">FACE</span><span className="scr" data-text="RECOGNITION">RECOGNITION</span></h2>
          </div>
          <p className="fc-live"><i />LIVENESS · KEDIP TERDETEKSI</p>
          <div className="fc-ok"><b>HADIR</b><span>07:58 · tersimpan ke CSV</span></div>
          <p className="fc-stack">MediaPipe Face Mesh · MobileNetV2 · Flask + Socket.IO · 3 klien</p>
        </section>

        {/* 06 Hand Gesture */}
        <section className="fg fg-hand">
          <div className="hd-head">
            <p className="kick"><b>06</b> computer vision</p>
            <h2 className="hd-title"><span className="hd-l1">{letters('HAND', 'hc')}</span><span className="hd-l2">{letters('GESTURE', 'hc')}</span></h2>
          </div>
          <div className="hd-chips">
            {[['PEACE', 'YouTube'], ['ROCK', 'Spotify'], ['JEMPOL', 'Google'], ['TELAPAK', 'Facebook']].map(([g, s]) => <p key={g} className="hd-chip"><b>{g}</b><span>buka {s}</span></p>)}
          </div>
          <p className="hd-facts">OpenCV + MediaPipe · 21 titik tangan · 8 gestur · tahan 1 detik</p>
        </section>

        {/* 07 Stock Recording */}
        <section className="fg fg-stock">
          <div className="st-head">
            <p className="kick"><b>07</b> web · gudang berbasis QR</p>
            <h2 className="st-title"><span>STOCK</span><span>RECORDING</span></h2>
          </div>
          <div className="st-label">
            <svg className="st-qr" viewBox="-1 -1 27 27">{qrCells}</svg>
            <i className="st-laser" />
            <div className="st-meta"><b>A.01.01</b><span>Ruangan 1 · Blok A · Rak 01</span><span>kode a0001 · Ember 1 kg</span></div>
          </div>
          <p className="st-flow"><span className="st-s1">SCAN</span><i>→</i><span className="st-s2">PENDING</span><i>→</i><span className="st-s3">APPROVE</span></p>
          <p className="st-stamp">APPROVED</p>
          <div className="st-tech"><span>Laravel 12</span><span>Next.js + TypeScript</span></div>
        </section>

        {/* 08 Payroll System */}
        <section className="fg fg-payroll">
          <div className="pr-head">
            <p className="kick"><b>08</b> web · CodeIgniter 4</p>
            <h2 className="pr-title"><span className="pr-a">Absensi masuk,</span> <em className="pr-b">slip gaji keluar.</em></h2>
          </div>
          <div className="pr-formula">
            {[['Gaji pokok', '+'], ['Tunjangan', '−'], ['BPJS', '−'], ['PPh 21', '=']].map(([n, op]) => <span key={n} className="pr-card"><b>{n}</b><i>{op}</i></span>)}
            <span className="pr-card pr-total"><b>Gaji bersih</b><em className="pr-amt">Rp 0</em></span>
          </div>
          <div className="pr-slip">
            <p className="pr-slip-h"><b>SLIP GAJI</b><span>contoh</span></p>
            <dl>{[['Gaji pokok', '5.000.000'], ['Tunjangan', '750.000'], ['BPJS', '− 200.000'], ['PPh 21', '− 62.500']].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
          <p className="pr-tags">absensi · cuti · tunjangan · BPJS · PPh 21 & PTKP · pinjaman · slip gaji</p>
        </section>

        {/* 09 Laptop Recommendation */}
        <section className="fg fg-laptop">
          <div className="lp-head">
            <p className="kick"><b>09</b> web · struktur data</p>
            <h2 className="lp-title"><span>LAPTOP</span><span>RECOMMENDATION</span></h2>
            <p className="lp-sub">binary search tree · urut harga · Flask</p>
          </div>
          <svg className="lp-tree" viewBox="-0.35 -0.45 6.7 4.1" preserveAspectRatio="xMidYMid meet">
            {bst.map((node, i) => node.parent >= 0 && <line key={`e${i}`} className={`lp-edge ${inRange(node.v) ? 'in' : ''}`} x1={bst[node.parent].x * 6} y1={bst[node.parent].y * 1.1} x2={node.x * 6} y2={node.y * 1.1} pathLength={1} />)}
            {bst.map((node, i) => <g key={`n${i}`} className={`lp-node d${node.depth} ${inRange(node.v) ? 'in' : 'out'}`} transform={`translate(${node.x * 6} ${node.y * 1.1})`}>
              <circle r="0.26" /><text y="0.075">{node.v}</text>
            </g>)}
          </svg>
          <p className="lp-range"><span>Rp 8 jt</span><i /><span>Rp 15 jt</span></p>
          <p className="lp-filters"><span>Intel · AMD · Apple</span><span>RAM min</span><span>SSD min</span><span>gaming / VGA</span></p>
        </section>

        {/* 10 Math Game */}
        <section className="fg fg-math">
          <h2 className="mt-title" data-text="MATH GAME">MATH GAME</h2>
          <p className="kick mt-kick"><b>10</b> web · game · Flask</p>
          <p className="mt-eq"><span className="mt-q">7 × 8 = </span><b className="mt-a">?</b></p>
          <p className="mt-ok">BENAR! +10</p>
          <div className="mt-hud"><p>SKOR <b className="mt-score">0000</b></p><p className="mt-timer"><i /></p></div>
          <p className="mt-levels"><span>LV1 1–9</span><span>LV2 10–99</span><span>LV3 100–999</span></p>
          <p className="mt-ops"><span>+</span><span>−</span><span>×</span><span>÷</span></p>
        </section>

        {/* Recap */}
        <section className="fg fg-recap">
          <h2 className="rc-title">10 proyek. <em>Satu GitHub.</em></h2>
          <div className="rc-grid">{projects.map(p => <div key={p.id} className={`rc-tile rc-${p.id}`}><b>{p.n}</b><span>{p.name}</span></div>)}</div>
          <Sparkle className="rc-spark" id="sp-d" />
        </section>

        {/* Outro */}
        <section className="fg fg-outro">
          <Sparkle className="ou-spark" id="sp-e" />
          <h2 className="ou-name"><span className="ou-1">{letters('Efriza', 'oc')}</span> <span className="ou-2">{letters('Taufiqurrohman', 'oc')}</span></h2>
          <p className="ou-role"><em>machine learning</em> &amp; <em>computer vision</em></p>
          <p className="ou-link">github.com/Hwarinn66</p>
        </section>
      </div>
    </div>

    {/* ── Transitions ─────────────────────────────────── */}
    <div className="xl">
      <i className="x-iris" />
      <div className="x-bars">{Array.from({ length: 14 }, (_, i) => <i key={i} />)}</div>
      <i className="x-dot" />
      <i className="x-swipe" />
      <div className="x-pix">{Array.from({ length: 96 }, (_, i) => <i key={i} />)}</div>
      <i className="x-sheet" />
      <div className="x-mosaic">{Array.from({ length: 96 }, (_, i) => <i key={i} />)}</div>
    </div>

    {/* ── HUD ──────────────────────────────────────────── */}
    <div className="hud">
      <i className="hcr hcr1" /><i className="hcr hcr2" /><i className="hcr hcr3" /><i className="hcr hcr4" />
      <p className="hud-tl"><b>EFRIZA TAUFIQURROHMAN</b><span>PROJECT REEL · 2026</span></p>
      <p className="hud-tr"><span><i className="hud-rec" />TC <b className="hud-tc">00:00:00:00</b></span><span className="hud-sc">PEMBUKA</span></p>
      <p className="hud-bl"><b className="hud-idx">00 / 10</b><span className="hud-repo">github.com/Hwarinn66</span></p>
      <p className="hud-br">85 BPM · 34 DETIK</p>
      <i className="hud-bar"><i /></i>
    </div>
    <i className="x-flash" />
    <i className="tv-grain" style={grain ? { backgroundImage: `url(${grain})` } : undefined} />
    <i className="tv-vignette" />
  </div>;
}
