'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/big-shoulders-display';
import '@fontsource/saira-stencil-one/400.css';
import '@fontsource/chakra-petch/600.css';
import '@fontsource/chakra-petch/700.css';
import '@fontsource-variable/unbounded';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/barlow-condensed/800.css';
import '@fontsource-variable/bodoni-moda/standard-italic';
import './trailer.css';
import { getTrailerAudio } from '@/lib/trailer-audio';
import TrailerStage from './trailer-stage';
import { buildTrailerTimeline } from './trailer-timeline';
import { chapters, DURATION, renderHeatmap } from './trailer-data';
import { createWorld, type World } from './three/world';

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

/** Every face the trailer uses, loaded before the first frame so no title swaps fonts mid-shot. */
const FONTS = [
  '900 40px "Archivo Variable"', 'italic 400 40px "Fraunces Variable"', '400 40px "Instrument Serif"', 'italic 400 40px "Instrument Serif"',
  '900 40px "Big Shoulders Display Variable"', '400 40px "Saira Stencil One"', '700 40px "Chakra Petch"', '600 40px "Chakra Petch"',
  '900 40px "Unbounded Variable"', '400 40px "Press Start 2P"', '800 40px "Barlow Condensed"', '500 40px "Instrument Sans Variable"',
  '600 40px "JetBrains Mono Variable"', 'italic 600 40px "Bodoni Moda Variable"',
];

function makeGrain(size = 160) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return '';
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

const isMobile = () => window.matchMedia('(max-width: 720px)').matches || window.innerHeight > window.innerWidth;

type Props = { onClose: () => void; onSeeProjects: () => void };

/**
 * Full-screen trailer player. The soundtrack is the master clock: every frame
 * the GSAP timeline and the 3D world are set to audio.currentTime, so cuts land
 * on the beat. If the browser will not play sound, a silent clock takes over.
 */
export default function Trailer({ onClose, onSeeProjects }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const worldRef = useRef<World | null>(null);
  const clock = useRef({ mode: 'audio' as 'audio' | 'clock', base: 0, startedAt: 0, running: false, ended: false, heard: false, userPaused: false });
  const hideTimer = useRef<number | undefined>(undefined);
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  const [grain, setGrain] = useState('');
  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [silent, setSilent] = useState(false);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ui, setUi] = useState(true);
  const [layoutKey, setLayoutKey] = useState(0);

  const now = () => performance.now() / 1000;
  const currentTime = useCallback(() => {
    const c = clock.current, audio = getTrailerAudio();
    if (c.mode === 'audio') return audio.currentTime;
    return c.running ? c.base + (now() - c.startedAt) : c.base;
  }, []);

  const goSilent = useCallback((startAt: number) => {
    const c = clock.current;
    c.mode = 'clock'; c.base = startAt; c.startedAt = now(); c.running = true;
    // Cancel a play() that may still be pending, so a late start cannot drift from the picture.
    getTrailerAudio().pause();
    setSilent(true); setPlaying(true); setStarted(true);
  }, []);

  // Page behind is made inert and stops animating; fonts load; then the sound starts.
  useEffect(() => {
    setGrain(makeGrain());
    const html = document.documentElement;
    html.classList.add('trailer-open');
    const shell = Array.from(document.querySelectorAll<HTMLElement>('.site-header, main, .mobile-dock, .site-footer'));
    shell.forEach(el => el.setAttribute('inert', ''));
    // The click already started the audio (that is what unlocks sound); hold it at 0 until the picture is ready.
    const audio = getTrailerAudio();
    audio.pause();
    try { audio.currentTime = 0; } catch { /* not seekable yet */ }
    let cancelled = false;
    let world: World | null = null;
    const fonts = Promise.all(FONTS.map(f => document.fonts.load(f).catch(() => null)));
    const timeout = new Promise(resolve => window.setTimeout(resolve, 4000));
    // 3D world after the fonts (its labels are drawn with them); shaders compile here, before the sound starts.
    Promise.race([fonts, timeout]).then(() => {
      if (cancelled) return;
      const canvas = root.current?.querySelector<HTMLCanvasElement>('.tv-3d');
      if (canvas) {
        try { world = createWorld(canvas, { mobile: isMobile(), heat: renderHeatmap(256) }); } catch { world = null; }
        worldRef.current = world;
      }
      setReady(true);
    });
    const onResize = () => world?.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true; window.removeEventListener('resize', onResize);
      world?.dispose(); worldRef.current = null;
      html.classList.remove('trailer-open'); shell.forEach(el => el.removeAttribute('inert'));
    };
  }, []);

  // Timeline: built when ready, rebuilt on resize/rotation, keeping the playhead.
  useEffect(() => {
    if (!ready || !root.current) return;
    const tl = buildTrailerTimeline(root.current, { mobile: isMobile(), gentle: window.matchMedia('(prefers-reduced-motion: reduce)').matches });
    tlRef.current = tl;
    tl.time(Math.min(currentTime(), DURATION));
    let timer = 0;
    const onResize = () => { window.clearTimeout(timer); timer = window.setTimeout(() => setLayoutKey(key => key + 1), 250); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.clearTimeout(timer); tl.revert(); tl.kill(); tlRef.current = null; };
  }, [ready, layoutKey, currentTime]);

  const finish = useCallback(() => {
    const c = clock.current;
    if (c.ended) return;
    c.ended = true; c.running = false; c.base = DURATION;
    setEnded(true); setPlaying(false); setUi(true);
  }, []);

  // Start the sound when ready; master loop + audio events.
  useEffect(() => {
    if (!ready) return;
    const audio = getTrailerAudio();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = Math.min(currentTime(), DURATION);
      tlRef.current?.time(t);
      worldRef.current?.render(t);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${t / DURATION})`;
      if (timeRef.current) timeRef.current.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
      if (t >= DURATION - 0.03) finish();
    };
    raf = requestAnimationFrame(loop);
    const onPlaying = () => {
      const c = clock.current;
      if (c.mode !== 'audio') { audio.pause(); return; }
      c.heard = true; setPlaying(true); setStarted(true);
    };
    const onPause = () => { if (clock.current.mode === 'audio') setPlaying(false); };
    const onEnded = () => finish();
    const onError = () => { if (clock.current.mode === 'audio') goSilent(audio.currentTime || 0); };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    try { audio.currentTime = 0; } catch { /* ignore */ }
    audio.play().catch(() => { if (clock.current.mode === 'audio' && !clock.current.heard) goSilent(0); });
    // Sound never started (blocked or still loading) and nobody paused on purpose: run on a silent clock.
    const fallback = window.setTimeout(() => { const c = clock.current; if (!c.heard && !c.userPaused && c.mode === 'audio' && !c.ended) goSilent(0); }, 6000);
    return () => {
      cancelAnimationFrame(raf); window.clearTimeout(fallback);
      audio.removeEventListener('playing', onPlaying); audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [ready, currentTime, finish, goSilent]);

  const poke = useCallback(() => {
    setUi(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => { if (!clock.current.ended) setUi(false); }, 2400);
  }, []);

  const seek = useCallback((t: number) => {
    const c = clock.current, audio = getTrailerAudio();
    const target = Math.max(0, Math.min(DURATION - 0.05, t));
    c.ended = false; setEnded(false);
    if (c.mode === 'audio') { audio.currentTime = target; }
    else { c.base = target; c.startedAt = now(); }
    tlRef.current?.time(target);
    worldRef.current?.render(target);
  }, []);

  const togglePlay = useCallback(() => {
    const c = clock.current, audio = getTrailerAudio();
    if (c.ended) { seek(0); if (c.mode === 'audio') audio.play().catch(() => goSilent(0)); else { c.running = true; setPlaying(true); } return; }
    if (c.mode === 'audio') { if (audio.paused) { c.userPaused = false; audio.play().catch(() => goSilent(audio.currentTime)); } else { c.userPaused = true; audio.pause(); } }
    else if (c.running) { c.base = currentTime(); c.running = false; setPlaying(false); }
    else { c.startedAt = now(); c.running = true; setPlaying(true); }
    poke();
  }, [currentTime, poke, seek, goSilent]);

  // Silent fallback → a tap is a user gesture, so sound can usually start now.
  const enableSound = useCallback(() => {
    const c = clock.current, audio = getTrailerAudio();
    const t = currentTime();
    c.mode = 'audio';
    audio.currentTime = t;
    audio.play().then(() => { c.heard = true; setSilent(false); setPlaying(true); })
      .catch(() => { c.mode = 'clock'; c.base = t; c.startedAt = now(); c.running = true; });
  }, [currentTime]);

  const jumpChapter = useCallback((dir: 1 | -1) => {
    const t = currentTime();
    const idx = chapters.findIndex((ch, i) => t >= ch.t && (i === chapters.length - 1 || t < chapters[i + 1].t));
    const next = dir > 0 ? chapters[Math.min(chapters.length - 1, idx + 1)] : chapters[Math.max(0, (t - chapters[idx].t < 1 ? idx - 1 : idx))];
    seek(next.t + 0.02);
    poke();
  }, [currentTime, poke, seek]);

  const toggleMute = useCallback(() => {
    const audio = getTrailerAudio();
    audio.muted = !audio.muted; setMuted(audio.muted); poke();
  }, [poke]);

  const close = useCallback(() => { getTrailerAudio().pause(); onClose(); }, [onClose]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === ' ' || event.key.toLowerCase() === 'k') { event.preventDefault(); togglePlay(); }
      else if (event.key.toLowerCase() === 'm') toggleMute();
      else if (event.key === 'ArrowRight') { seek(currentTime() + 3); poke(); }
      else if (event.key === 'ArrowLeft') { seek(currentTime() - 3); poke(); }
    };
    window.addEventListener('keydown', onKey);
    root.current?.querySelector<HTMLButtonElement>('.tr-btn.is-primary')?.focus({ preventScroll: true });
    poke();
    return () => window.removeEventListener('keydown', onKey);
  }, [close, currentTime, poke, seek, toggleMute, togglePlay]);

  const scrub = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const at = (x: number) => ((x - rect.left) / rect.width) * DURATION;
    seek(at(event.clientX));
    const move = (e: PointerEvent) => seek(at(e.clientX));
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    poke();
  };

  return <div ref={root} className="trailer" role="dialog" aria-modal="true" aria-label="Trailer proyek Efriza" onMouseMove={poke}>
    <p className="sr-only">Trailer 40 detik dengan efek suara, berisi proyek-proyek di GitHub Efriza: Dense Object Counter, InnerSelf Cognitive, Voice Dataset, Smart Trash, Face Recognition, Hand Gesture, Stock Recording, Payroll System, Laptop Recommendation, dan Math Game.</p>
    <TrailerStage grain={grain} />

    <div className="tr-hit" onPointerDown={e => { swipe.current = { x: e.clientX, y: e.clientY, t: performance.now() }; }}
      onPointerUp={e => {
        const s = swipe.current; swipe.current = null;
        if (!s) return;
        const dx = e.clientX - s.x, dy = e.clientY - s.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) jumpChapter(dx < 0 ? 1 : -1);
        else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) { if (e.pointerType === 'mouse') togglePlay(); else if (ui) togglePlay(); else poke(); }
      }} />

    <div className={`tr-ui ${ui || !playing ? '' : 'is-hidden'}`}>
      <button className="tr-close" onClick={close} aria-label="Tutup trailer"><X size={20} /></button>
      {silent && <button className="tr-silent" onClick={enableSound}><VolumeX size={15} />Tanpa suara. Ketuk untuk menyalakan suara</button>}
      {(!ready || !started) && !silent && <p className="tr-status"><span className="tr-spin" />{ready ? 'Memuat suara…' : 'Menyiapkan trailer…'}</p>}
      <div className="tr-controls">
        <button className="tr-btn" onClick={() => jumpChapter(-1)} aria-label="Bagian sebelumnya"><ChevronLeft size={18} /></button>
        <button className="tr-btn is-primary" onClick={togglePlay} aria-label={playing ? 'Jeda' : 'Putar'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
        <button className="tr-btn" onClick={() => jumpChapter(1)} aria-label="Bagian berikutnya"><ChevronRight size={18} /></button>
        <div className="tr-track" onPointerDown={scrub} role="slider" aria-label="Posisi trailer" aria-valuemin={0} aria-valuemax={Math.round(DURATION)} tabIndex={0}>
          <div className="tr-track-bar"><div ref={fillRef} className="tr-track-fill" />{chapters.slice(1).map(ch => <i key={ch.label} className="tr-chap" style={{ left: `${(ch.t / DURATION) * 100}%` }} title={ch.label} />)}</div>
        </div>
        <span ref={timeRef} className="tr-time">0:00 / {fmt(DURATION)}</span>
        {!silent && <button className="tr-btn" onClick={toggleMute} aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>}
      </div>
    </div>

    {ended && <div className="tr-end">
      <div className="tr-end-inner">
        <p className="tr-end-k">Terima kasih sudah menonton</p>
        <div className="tr-end-actions">
          <button className="tr-end-btn is-primary" onClick={togglePlay}><RotateCcw size={17} />Putar lagi</button>
          <button className="tr-end-btn" onClick={onSeeProjects}><LayoutGrid size={17} />Lihat proyek</button>
          <button className="tr-end-btn" onClick={close}><X size={17} />Tutup</button>
        </div>
      </div>
    </div>}
  </div>;
}
