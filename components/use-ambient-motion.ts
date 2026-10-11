'use client';

import { useCallback, useEffect, useState } from 'react';
import { ambient } from '@/lib/ambient';

type PermissionCtor = { requestPermission?: () => Promise<'granted' | 'denied'> };
export type GyroState = 'off' | 'needs-permission' | 'listening' | 'denied';

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

/**
 * Pointer / touch / gyroscope depth.
 *
 * One requestAnimationFrame loop smooths the input into `ambient.mx/my`
 * (-1..1, also read by the particle canvas) and writes the result straight
 * onto the elements that use it, and only those currently near the viewport:
 * - [data-shift="N"]  → translate by N px per unit of motion
 * - .ambient-tilt     → tilt + moving light (hero card)
 * - .tilt on touch screens, while not being touched → gyroscope tilt + light
 * Writing to a handful of visible elements instead of to whole sections keeps
 * style recalculation tiny, so scrolling stays smooth.
 */
export function useAmbientMotion(paused: boolean) {
  const [gyro, setGyro] = useState<GyroState>('off');

  useEffect(() => {
    const ctor = window.DeviceOrientationEvent as unknown as PermissionCtor | undefined;
    if (!ctor || !window.matchMedia('(pointer: coarse)').matches) return;
    setGyro(typeof ctor.requestPermission === 'function' ? 'needs-permission' : 'listening');
  }, []);

  const requestGyro = useCallback(async () => {
    const ctor = window.DeviceOrientationEvent as unknown as PermissionCtor | undefined;
    try {
      const result = await ctor?.requestPermission?.();
      setGyro(result === 'granted' ? 'listening' : 'denied');
    } catch { setGyro('denied'); }
  }, []);

  useEffect(() => {
    ambient.paused = paused;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const selector = coarse ? '[data-shift], .ambient-tilt, .tilt' : '[data-shift], .ambient-tilt';

    const setTilt = (el: HTMLElement, mx: number, my: number, ax: number, ay: number, gy0: number) => {
      el.style.setProperty('--rx', `${(my * -ax).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${(mx * ay).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(50 + mx * 55).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(gy0 + my * 48).toFixed(1)}%`);
    };
    const apply = (el: HTMLElement, mx: number, my: number) => {
      const shift = el.dataset.shift;
      if (shift) { const d = Number(shift); el.style.translate = `${(mx * d).toFixed(1)}px ${(my * d).toFixed(1)}px`; }
      if ('active' in el.dataset) return; // the finger or mouse is driving this one (useTilt)
      if (el.classList.contains('ambient-tilt')) setTilt(el, mx, my, 7, 9, 30);
      else if (coarse && el.classList.contains('tilt')) setTilt(el, mx, my, 5, 6, 32);
    };
    const clear = (el: HTMLElement) => {
      el.style.translate = '';
      if (!('active' in el.dataset)) for (const name of ['--rx', '--ry', '--gx', '--gy']) el.style.removeProperty(name);
    };

    if (paused) {
      ambient.mx = 0; ambient.my = 0;
      document.querySelectorAll<HTMLElement>(selector).forEach(clear);
      return;
    }

    // Track which consumers are on (or near) the screen.
    const visible = new Set<HTMLElement>();
    const observed = new WeakSet<Element>();
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) { visible.add(el); apply(el, ambient.mx, ambient.my); }
        else visible.delete(el);
      }
    }, { rootMargin: '160px 0px' });
    const collect = () => document.querySelectorAll<HTMLElement>(selector).forEach(el => {
      if (!observed.has(el)) { observed.add(el); io.observe(el); }
    });
    collect();

    let tx = 0, ty = 0, lastInput = -1e9, lastGyro = -1e9, baseBeta: number | null = null;
    let raf = 0, frame = 0, lastX = 9, lastY = 9;

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      tx = clamp((event.clientX / window.innerWidth) * 2 - 1);
      ty = clamp((event.clientY / window.innerHeight) * 2 - 1);
      lastInput = performance.now();
    };
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || performance.now() - lastGyro < 1200) return;
      tx = clamp((touch.clientX / window.innerWidth) * 2 - 1);
      ty = clamp((touch.clientY / window.innerHeight) * 2 - 1);
      lastInput = performance.now();
    };
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      if (baseBeta == null) baseBeta = event.beta;
      // Slowly re-centre so the neutral point follows how the phone is held.
      baseBeta += (event.beta - baseBeta) * 0.01;
      tx = clamp(event.gamma / 22);
      ty = clamp((event.beta - baseBeta) / 16);
      lastInput = lastGyro = performance.now();
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (coarse && time - lastInput > 2400) {
        tx = Math.sin(time / 2700) * 0.55;
        ty = Math.cos(time / 3500) * 0.4;
      }
      ambient.mx += (tx - ambient.mx) * 0.07;
      ambient.my += (ty - ambient.my) * 0.07;
      if (++frame % 60 === 0) collect();
      if (Math.abs(ambient.mx - lastX) < 0.002 && Math.abs(ambient.my - lastY) < 0.002) return;
      lastX = ambient.mx; lastY = ambient.my;
      for (const el of visible) {
        if (!el.isConnected) { visible.delete(el); continue; }
        apply(el, ambient.mx, ambient.my);
      }
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    if (gyro === 'listening') window.addEventListener('deviceorientation', onOrientation);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [paused, gyro]);

  return { gyro, requestGyro };
}
