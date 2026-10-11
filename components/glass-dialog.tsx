'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  size?: 'wide' | 'narrow';
};

/**
 * Native <dialog> (focus trap, Escape, top layer). On phones it becomes a
 * bottom sheet that can be dragged down to close.
 */
export default function GlassDialog({ open, onClose, labelledBy, children, size = 'wide' }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  const requestClose = useCallback(() => {
    const el = dialog.current;
    if (!el || closing.current) return;
    closing.current = true;
    el.classList.add('is-closing');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => { closing.current = false; el.classList.remove('is-closing'); onClose(); }, reduced ? 0 : 230);
  }, [onClose]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.documentElement.classList.add('dialog-open');
      sheet.current?.querySelector('.sheet-body')?.scrollTo({ top: 0 });
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onCancel = (event: Event) => { event.preventDefault(); requestClose(); };
    const onClosed = () => document.documentElement.classList.remove('dialog-open');
    el.addEventListener('cancel', onCancel);
    el.addEventListener('close', onClosed);
    return () => { el.removeEventListener('cancel', onCancel); el.removeEventListener('close', onClosed); };
  }, [requestClose]);

  // Drag the handle down to dismiss the sheet on touch screens.
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const panel = sheet.current;
    if (!panel) return;
    const startY = event.clientY;
    let dy = 0;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    panel.style.transition = 'none';
    const move = (e: PointerEvent) => { dy = Math.max(0, e.clientY - startY); panel.style.translate = `0 ${dy}px`; };
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      panel.style.transition = '';
      if (dy > 110) { panel.style.translate = ''; requestClose(); }
      else panel.style.translate = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  };

  return <dialog ref={dialog} className={`gdialog gdialog-${size}`} aria-labelledby={labelledBy}
    onClick={event => { if (event.target === event.currentTarget) requestClose(); }}>
    <div ref={sheet} className="sheet">
      <div className="sheet-handle" onPointerDown={startDrag} aria-hidden="true"><span /></div>
      <button className="sheet-close" onClick={requestClose} aria-label="Tutup"><X size={20} /></button>
      <div className="sheet-body">{children}</div>
    </div>
  </dialog>;
}
