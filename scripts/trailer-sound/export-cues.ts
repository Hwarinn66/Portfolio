// Exports the trailer timings the sound design needs (see make_sfx.py):
//   npx esbuild scripts/trailer-sound/export-cues.ts --bundle --platform=node --log-level=warning | node > scripts/trailer-sound/cues.json
import { objects, SCAN, scanX, SHUTTER, b, B, DURATION, BREAKS } from '../../components/trailer/trailer-data';
const X = (x: number) => (x - 500) / 500;
const pass = objects.map(o => { let lo = SCAN[0], hi = SCAN[1]; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (scanX(m) < X(o.x)) lo = m; else hi = m; } return hi; });
const dist = objects.map(o => Math.hypot(o.x - 500, o.y - 500));
const order = objects.map((_, i) => i).sort((a, c) => dist[a] - dist[c]);
const rank: number[] = []; order.forEach((i, k) => { rank[i] = k; });
console.log(JSON.stringify({ B, DURATION, BREAKS, SHUTTER, SCAN, scanPass: pass, beadRank: rank, beadX: objects.map(o => X(o.x)), b17: b(17) }));
