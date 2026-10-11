'use client';

import { useCallback, useEffect, useState } from 'react';
import { ambient } from '@/lib/ambient';

type PermissionCtor = { requestPermission?: () => Promise<'granted' | 'denied'> };
export type GyroState = 'off' | 'needs-permission' | 'listening' | 'denied';

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

/**
 * Drives the --mx / --my CSS variables on every [data-ambient] element and the
 * shared `ambient` object read by the particle canvas.
 * - Mouse: follows the pointer.
 * - Touch screens: follows the gyroscope when it reports, otherwise the finger,
 *   and drifts gently when nothing is touching so the depth stays visible.
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
    let targets: HTMLElement[] = [];
    const collect = () => { targets = Array.from(document.querySelectorAll<HTMLElement>('[data-ambient]')); };
    const write = (x: number, y: number) => {
      const mx = x.toFixed(3), my = y.toFixed(3);
      for (const el of targets) { el.style.setProperty('--mx', mx); el.style.setProperty('--my', my); }
    };
    collect();
    if (paused) { ambient.mx = 0; ambient.my = 0; write(0, 0); return; }

    const coarse = window.matchMedia('(pointer: coarse)').matches;
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
      if (++frame % 90 === 0) collect();
      // Phones repaint glass less often: write CSS variables every other frame.
      if (coarse && frame % 2) return;
      if (Math.abs(ambient.mx - lastX) > 0.003 || Math.abs(ambient.my - lastY) > 0.003) {
        lastX = ambient.mx; lastY = ambient.my;
        write(ambient.mx, ambient.my);
      }
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    if (gyro === 'listening') window.addEventListener('deviceorientation', onOrientation);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [paused, gyro]);

  return { gyro, requestGyro };
}
