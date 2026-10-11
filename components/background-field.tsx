'use client';

import { useEffect, useRef } from 'react';
import { ambient, BURST_EVENT } from '@/lib/ambient';

type Particle = { x: number; y: number; z: number; r: number; vx: number; vy: number; c: number; ox: number; oy: number; sx: number; sy: number; phase: number };
type Ripple = { x: number; y: number; age: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; c: number };

// Deeper versions of the pastel palette so points stay visible on a light field.
const colors = ['108 88 232', '38 160 132', '232 122 92', '72 136 228', '206 150 40'];

/**
 * Fixed background: drifting pastel aurora plus a canvas "sensor net".
 * Points sit at three depths (scroll + tilt parallax). Around the pointer,
 * finger, or a slowly wandering virtual sensor, nearby points are pushed
 * aside and linked, so moving across the page reveals the network.
 */
export default function BackgroundField({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ctx = context;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const still = paused || reduced;

    let width = 0, height = 0, raf = 0;
    let particles: Particle[] = [];
    const ripples: Ripple[] = [];
    const sparks: Spark[] = [];
    const pointer = { x: -999, y: -999, last: -1e9 };
    const sensor = { x: 0, y: 0 };

    const seed = (count: number) => {
      particles = Array.from({ length: count }, (_, i) => {
        const z = [0.35, 0.65, 1][i % 3];
        return { x: Math.random() * width, y: Math.random() * height, z, r: (0.9 + Math.random() * 1.6) * (0.7 + z),
          vx: (Math.random() - 0.5) * 0.16 * z, vy: (Math.random() - 0.5) * 0.12 * z,
          c: i % colors.length, ox: 0, oy: 0, sx: 0, sy: 0, phase: Math.random() * Math.PI * 2 };
      });
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(34, Math.min(coarse ? 56 : 104, Math.round((width * height) / 14500)));
      if (Math.abs(count - particles.length) > 6) seed(count);
      sensor.x = width * 0.62; sensor.y = height * 0.4;
    };

    const radius = () => (coarse ? 120 : 150);

    // Solid colours + globalAlpha: no per-frame string building, fewer style changes.
    const solid = colors.map(c => `rgb(${c})`);
    const ink = 'rgb(84 64 217)';
    const TAU = Math.PI * 2;

    const draw = (time: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const scroll = window.scrollY;
      const active = time - pointer.last < 2200;
      const tx = active ? pointer.x : width * (0.55 + 0.32 * Math.sin(time / 5200));
      const ty = active ? pointer.y : height * (0.42 + 0.26 * Math.sin(time / 3900 + 1.3));
      sensor.x += (tx - sensor.x) * (active ? 0.25 : 0.03);
      sensor.y += (ty - sensor.y) * (active ? 0.25 : 0.03);
      const R = radius(), R2 = R * R;
      const reach = R * 1.15, reach2 = reach * reach;
      const near: Particle[] = [];
      const wrapH = height + 60;
      const mx = ambient.mx, my = ambient.my;
      const push = active ? 1.6 : 0.6;

      for (const p of particles) {
        if (animate) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = width + 20; else if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y += wrapH; else if (p.y > height + 40) p.y -= wrapH;
        }
        const rx = p.x + mx * 22 * p.z;
        let ry = (p.y - scroll * 0.14 * p.z) % wrapH;
        if (ry < -30) ry += wrapH;
        ry += my * 16 * p.z;
        if (animate) {
          const dx = rx + p.ox - sensor.x, dy = ry + p.oy - sensor.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = (1 - d / R) * push * p.z;
            p.ox += (dx / d) * force; p.oy += (dy / d) * force;
          }
          p.ox *= 0.93; p.oy *= 0.93;
        }
        p.sx = rx + p.ox; p.sy = ry + p.oy;
        if (!still) {
          const ex = p.sx - sensor.x, ey = p.sy - sensor.y;
          if (ex * ex + ey * ey < reach2) near.push(p);
        }
      }

      // Links: sensor to points, then points to each other inside the range.
      if (near.length) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = ink;
        for (const p of near) {
          const d = Math.sqrt((p.sx - sensor.x) ** 2 + (p.sy - sensor.y) ** 2);
          ctx.globalAlpha = (1 - d / reach) * 0.32;
          ctx.beginPath(); ctx.moveTo(sensor.x, sensor.y); ctx.lineTo(p.sx, p.sy); ctx.stroke();
        }
        for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
          const a = near[i], b = near[j];
          const dx = a.sx - b.sx, dy = a.sy - b.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 > 9216) continue; // 96px
          ctx.globalAlpha = (1 - Math.sqrt(d2) / 96) * 0.2;
          ctx.beginPath(); ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy); ctx.stroke();
        }
      }

      const t = time / 900;
      for (let c = 0; c < solid.length; c++) {
        ctx.fillStyle = solid[c];
        for (const p of particles) {
          if (p.c !== c) continue;
          ctx.globalAlpha = (0.22 + p.z * 0.4) * (0.75 + Math.sin(t + p.phase) * 0.25);
          ctx.beginPath(); ctx.arc(p.sx, p.sy, p.r, 0, TAU); ctx.fill();
        }
      }

      ctx.strokeStyle = ink;
      if (!still) {
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.arc(sensor.x, sensor.y, active ? 5 : 3, 0, TAU); ctx.stroke();
      }

      if (ripples.length) ctx.lineWidth = 1.5;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        ripple.age += 1;
        const progress = ripple.age / 55;
        if (progress >= 1) { ripples.splice(i, 1); continue; }
        ctx.globalAlpha = (1 - progress) * 0.4;
        ctx.beginPath(); ctx.arc(ripple.x, ripple.y, 12 + progress * 140, 0, TAU); ctx.stroke();
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx; spark.y += spark.vy; spark.vy += 0.06; spark.vx *= 0.985; spark.life -= 0.012;
        if (spark.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = solid[spark.c];
        ctx.globalAlpha = spark.life;
        ctx.beginPath(); ctx.arc(spark.x, spark.y, 2.2 + spark.life * 2, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const impulse = (x: number, y: number, strength: number) => {
      ripples.push({ x, y, age: 0 });
      for (const p of particles) {
        const dx = p.sx - x, dy = p.sy - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 260 && d > 0.1) { const f = (1 - d / 260) * strength; p.ox += (dx / d) * f; p.oy += (dy / d) * f; }
      }
    };

    const onPointerMove = (event: PointerEvent) => { pointer.x = event.clientX; pointer.y = event.clientY; pointer.last = performance.now(); };
    const onPointerDown = (event: PointerEvent) => { onPointerMove(event); impulse(event.clientX, event.clientY, 26); };
    const onTouch = (event: TouchEvent) => { const t = event.touches[0]; if (t) { pointer.x = t.clientX; pointer.y = t.clientY; pointer.last = performance.now(); } };
    const onLeave = () => { pointer.last = -1e9; };
    const onBurst = (event: Event) => {
      const detail = (event as CustomEvent<{ x?: number; y?: number }>).detail ?? {};
      const x = detail.x ?? width / 2, y = detail.y ?? height / 2;
      impulse(x, y, 60);
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2, speed = 2 + Math.random() * 6;
        sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2.5, life: 1, c: i % colors.length });
      }
      if (still) { let n = 0; const run = (t: number) => { draw(t, false); if (++n < 90) requestAnimationFrame(run); }; requestAnimationFrame(run); }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener(BURST_EVENT, onBurst);

    if (still) {
      draw(performance.now(), false);
      const redraw = () => draw(performance.now(), false);
      window.addEventListener('scroll', redraw, { passive: true });
      return () => { window.removeEventListener('resize', resize); window.removeEventListener(BURST_EVENT, onBurst); window.removeEventListener('scroll', redraw); };
    }

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (!document.hidden && !document.documentElement.classList.contains('trailer-open')) draw(time, true);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener(BURST_EVENT, onBurst);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchmove', onTouch);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, [paused]);

  // Colours change per section via data-mood on .field (a short CSS transition), never on every scroll frame.
  return <div className="field" aria-hidden="true">
    <div className="aurora" data-shift={-25}><div className="aurora-spin">
      {[1, 2, 3, 4, 5].map(i => <span key={i} className={`blob blob-${i}`} />)}
    </div></div>
    <canvas ref={canvasRef} />
  </div>;
}
