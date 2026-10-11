import { assetPath } from '@/lib/asset-path';

/** One shared <audio> for the trailer, so it can be started inside the click that opens it (required by mobile browsers). */
let audio: HTMLAudioElement | null = null;

export function getTrailerAudio() {
  if (!audio) {
    audio = new Audio(assetPath('/audio/trailer.mp3'));
    audio.preload = 'auto';
  }
  return audio;
}

/** Call from the click handler that opens the trailer. Resolves false when the browser refuses to play sound. */
export async function startTrailerAudio() {
  const a = getTrailerAudio();
  try { a.currentTime = 0; } catch { /* Not seekable yet; it starts at 0 anyway. */ }
  try { await a.play(); return true; } catch { return false; }
}
