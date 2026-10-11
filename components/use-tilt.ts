'use client';

import { useEffect, useRef } from 'react';
import { ambient } from '@/lib/ambient';

/**
 * 3D tilt with a light that follows the pointer or finger. Writes --rx, --ry,
 * --gx and --gy on the element; CSS does the rest. Without a pointer on a touch
 * screen, CSS falls back to the gyroscope-driven --mx / --my values.
 */
export function useTilt<T extends HTMLElement>(strength = 9) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = (event: PointerEvent) => {
      if (ambient.paused) return;
      const rect = el.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${((0.5 - py) * strength).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${((px - 0.5) * strength * 1.25).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
        el.dataset.active = '';
      });
    };
    const reset = () => {
      cancelAnimationFrame(raf);
      for (const name of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(name);
      delete el.dataset.active;
    };
    const release = (event: PointerEvent) => { if (event.pointerType !== 'mouse') window.setTimeout(reset, 380); };
    el.addEventListener('pointermove', update);
    el.addEventListener('pointerdown', update);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('pointercancel', reset);
    el.addEventListener('pointerup', release);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', update);
      el.removeEventListener('pointerdown', update);
      el.removeEventListener('pointerleave', reset);
      el.removeEventListener('pointercancel', reset);
      el.removeEventListener('pointerup', release);
    };
  }, [strength]);

  return ref;
}
