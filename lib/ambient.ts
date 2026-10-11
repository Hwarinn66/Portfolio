/**
 * Shared, mutable ambient-motion state. One requestAnimationFrame loop writes
 * it (pointer, touch or gyroscope); the particle canvas and CSS variables read it.
 * Values are smoothed and range from -1 to 1.
 */
export const ambient = { mx: 0, my: 0, paused: false };

export const BURST_EVENT = 'field:burst';
export const burstField = (x?: number, y?: number) => {
  window.dispatchEvent(new CustomEvent(BURST_EVENT, { detail: { x, y } }));
};

export const haptic = (ms = 8) => {
  try { if ('vibrate' in navigator) navigator.vibrate(ms); } catch { /* Haptics are optional. */ }
};
