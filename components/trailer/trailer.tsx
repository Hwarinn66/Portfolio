'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { getTrailerAudio } from '@/lib/trailer-audio';
import TrailerStage from './trailer-stage';
import { buildTrailerTimeline } from './trailer-timeline';
import { chapters, DURATION, renderHeatmap } from './trailer-data';

const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

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

type Props = { onClose: () => void; onSeeProjects: () => void };

/**
 * Full-screen trailer player. The soundtrack is the master clock: every frame
 * the GSAP timeline is set to audio.currentTime, so cuts land on the beat. If
 * the browser will not play sound, a silent clock takes over.
 */
export default function Trailer({ onClose, onSeeProjects }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const clock = useRef({ mode: 'audio' as 'audio' | 'clock', base: 0, startedAt: 0, running: false, ended: false, heard: false, userPaused: false });
  const hideTimer = useRef<number | undefined>(undefined);
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  const [assets, setAssets] = useState({ heat: '', grain: '' });
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Assets drawn once on the client; page behind is made inert and stops animating.
  useEffect(() => {
    setAssets({ heat: renderHeatmap(), grain: makeGrain() });
    const html = document.documentElement;
    html.classList.add('trailer-open');
    const shell = Array.from(document.querySelectorAll<HTMLElement>('.site-header, main, .mobile-dock, .site-footer'));
    shell.forEach(el => el.setAttribute('inert', ''));
    return () => { html.classList.remove('trailer-open'); shell.forEach(el => el.removeAttribute('inert')); };
  }, []);

  // Build (and rebuild on resize/rotation) the timeline, keeping the playhead.
  useEffect(() => {
    if (!assets.heat || !root.current) return;
    const mobile = window.matchMedia('(max-width: 720px)').matches || window.innerHeight > window.innerWidth;
    const gentle = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tl = buildTrailerTimeline(root.current, { mobile, gentle });
    tlRef.current = tl;
    tl.time(Math.min(currentTime(), DURATION));
    let timer = 0;
    const onResize = () => { window.clearTimeout(timer); timer = window.setTimeout(() => setLayoutKey(key => key + 1), 250); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); window.clearTimeout(timer); tl.revert(); tl.kill(); tlRef.current = null; };
  }, [assets.heat, layoutKey, currentTime]);

  const finish = useCallback(() => {
    const c = clock.current;
    if (c.ended) return;
    c.ended = true; c.running = false; c.base = DURATION;
    setEnded(true); setPlaying(false); setUi(true);
  }, []);

  const goSilent = useCallback((startAt: number) => {
    const c = clock.current;
    c.mode = 'clock'; c.base = startAt; c.startedAt = now(); c.running = true;
    setSilent(true); setLoading(false); setPlaying(true);
  }, []);

  // Master loop + audio events.
  useEffect(() => {
    const audio = getTrailerAudio();
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = Math.min(currentTime(), DURATION);
      tlRef.current?.time(t);
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${t / DURATION})`;
      if (timeRef.current) timeRef.current.textContent = `${fmt(t)} / ${fmt(DURATION)}`;
      if (t >= DURATION - 0.03) finish();
    };
    raf = requestAnimationFrame(loop);
    const onPlaying = () => { clock.current.heard = true; if (clock.current.mode === 'audio') { setLoading(false); setPlaying(true); } };
    const onPause = () => { if (clock.current.mode === 'audio') setPlaying(false); };
    const onEnded = () => finish();
    const onError = () => { if (clock.current.mode === 'audio') goSilent(audio.currentTime || 0); };
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    if (!audio.paused) onPlaying();
    // The browser refused sound (or it never loaded): run silently on a clock.
    // Only when sound never started and the viewer has not paused on purpose.
    const fallback = window.setTimeout(() => { const c = clock.current; if (!c.heard && !c.userPaused && audio.paused && c.mode === 'audio' && !c.ended) goSilent(0); }, 2600);
    return () => {
      cancelAnimationFrame(raf); window.clearTimeout(fallback);
      audio.removeEventListener('playing', onPlaying); audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [currentTime, finish, goSilent]);

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
    audio.currentTime = t;
    audio.play().then(() => { c.mode = 'audio'; setSilent(false); setPlaying(true); }).catch(() => { /* stay silent */ });
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

  return <div ref={root} className="trailer" role="dialog" aria-modal="true" aria-label="Trailer proyek machine learning Efriza" onMouseMove={poke}>
    <p className="sr-only">Trailer 35 detik bermusik: aplikasi Dense Object Counter (kamera, ROI, tile, YOLO, NMS, hitung), lalu InnerSelf, Smart Trash, Face Recognition, dan Hand Gesture, alur data ke model, dan penutup.</p>
    <TrailerStage key={layoutKey} heat={assets.heat} grain={assets.grain} />

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
      {silent && <button className="tr-silent" onClick={enableSound}><VolumeX size={15} />Tanpa suara. Ketuk untuk menyalakan musik</button>}
      {loading && !silent && <p className="tr-status"><span className="tr-spin" />Memuat musik…</p>}
      <div className="tr-controls">
        <button className="tr-btn" onClick={() => jumpChapter(-1)} aria-label="Bab sebelumnya"><ChevronLeft size={18} /></button>
        <button className="tr-btn is-primary" onClick={togglePlay} aria-label={playing ? 'Jeda' : 'Putar'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
        <button className="tr-btn" onClick={() => jumpChapter(1)} aria-label="Bab berikutnya"><ChevronRight size={18} /></button>
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
