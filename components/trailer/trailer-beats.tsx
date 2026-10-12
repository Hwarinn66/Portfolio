import { assetPath } from '@/lib/asset-path';
import type { SceneId } from './trailer-data';

/** [x vw, y vh, rotation°] on landscape, then on portrait. */
type Pos = [number, number, number];
export type Sticker = { at: number; logo?: string; icon?: 'mic' | 'phones' | 'flac' | 'leaf' | 'bottle'; l: Pos; p: Pos };

/**
 * Beat accents: on each beat a technology the project really uses is
 * slapped on screen as a sticker (Devicon logos, MIT). Beats are beat
 * numbers on the song grid (b(n)); half beats use .5.
 */
export const stickers: Partial<Record<SceneId, Sticker[]>> = {
  counter: [
    { at: 17.5, logo: 'python', l: [44, 62, -8], p: [14, 38, -8] },
    { at: 18, logo: 'opencv', l: [55, 15, 7], p: [38, 41, 7] },
    { at: 19, logo: 'fastapi', l: [91, 58, -6], p: [62, 38, -6] },
    { at: 20, logo: 'numpy', l: [43, 84, 9], p: [86, 41, 9] },
  ],
  innerself: [
    { at: 21.5, logo: 'python', l: [45, 20, -8], p: [14, 36, -8] },
    { at: 22, logo: 'fastapi', l: [91, 78, 8], p: [38, 34, 6] },
    { at: 22.5, logo: 'scikitlearn', l: [47, 84, -5], p: [62, 36, -6] },
    { at: 23, logo: 'javascript', l: [92, 22, 7], p: [86, 33, 7] },
  ],
  voice: [
    { at: 24.5, icon: 'mic', l: [48, 22, -8], p: [80, 32, -8] },
    { at: 25, icon: 'phones', l: [61, 36, 8], p: [80, 44, 8] },
    { at: 25.5, icon: 'flac', l: [45, 46, -5], p: [64, 38, -5] },
  ],
  trash: [
    { at: 26.5, logo: 'python', l: [44, 16, -7], p: [14, 37, -7] },
    { at: 27, logo: 'opencv', l: [56, 25, 6], p: [36, 40, 6] },
    { at: 27.5, logo: 'tensorflow', l: [68, 12, -5], p: [58, 37, -5] },
    { at: 28, logo: 'arduino', l: [89, 16, 8], p: [80, 48, 8] },
  ],
  face: [
    { at: 29.5, logo: 'python', l: [42, 18, -6], p: [12, 46, -6] },
    { at: 30, logo: 'opencv', l: [89, 22, 7], p: [88, 50, 7] },
    { at: 30.5, logo: 'tensorflow', l: [30, 52, -8], p: [12, 62, -8] },
    { at: 31, logo: 'flask', l: [89, 70, 6], p: [88, 66, 6] },
    { at: 31.5, logo: 'socketio', l: [46, 84, -5], p: [50, 38, -5] },
  ],
  hand: [
    { at: 32.5, logo: 'python', l: [45, 20, -8], p: [16, 38, -8] },
    { at: 33, logo: 'opencv', l: [90, 22, 8], p: [84, 40, 8] },
  ],
  stock: [
    { at: 35.25, logo: 'laravel', l: [44, 46, -8], p: [14, 43, -8] },
    { at: 35.5, logo: 'php', l: [54, 40, 6], p: [32, 45, 6] },
    { at: 35.75, logo: 'mysql', l: [64, 48, -5], p: [14, 53, -5] },
    { at: 36.25, logo: 'nextjs', l: [46, 60, 7], p: [32, 55, 7] },
    { at: 36.5, logo: 'typescript', l: [56, 57, -6], p: [14, 63, -6] },
    { at: 36.75, logo: 'tailwindcss', l: [66, 62, 5], p: [32, 65, 5] },
  ],
  payroll: [
    { at: 37.5, logo: 'codeigniter', l: [62, 40, -7], p: [14, 40, -7] },
    { at: 37.75, logo: 'php', l: [74, 58, 6], p: [32, 44, 6] },
    { at: 38.25, logo: 'mysql', l: [88, 64, -6], p: [14, 52, -6] },
    { at: 38.5, logo: 'bootstrap', l: [80, 80, 5], p: [32, 56, 5] },
  ],
  laptop: [
    { at: 39.25, logo: 'python', l: [12, 48, -6], p: [14, 27, -6] },
    { at: 39.5, logo: 'flask', l: [27, 46, 6], p: [36, 28, 6] },
    { at: 39.75, logo: 'html5', l: [12, 63, 5], p: [58, 27, 5] },
    { at: 40.25, logo: 'javascript', l: [27, 61, -7], p: [80, 28, -7] },
  ],
  math: [
    { at: 41.25, logo: 'python', l: [12, 40, -8], p: [20, 38, -8] },
    { at: 41.75, logo: 'flask', l: [88, 40, 8], p: [80, 38, 8] },
    { at: 42.25, logo: 'javascript', l: [12, 62, 6], p: [20, 71, 6] },
    { at: 42.5, logo: 'html5', l: [88, 62, -6], p: [80, 71, -6] },
  ],
};

/** Shock rings on the beat, centred on each shot's subject. */
export const rings: Partial<Record<SceneId, { beats: number[]; color: string; l: [number, number]; p: [number, number] }>> = {
  open: { beats: [13, 14, 15, 16], color: '#8fb0ff', l: [50, 50], p: [50, 50] },
  counter: { beats: [18, 19, 20], color: '#fca50a', l: [65, 50], p: [50, 60] },
  innerself: { beats: [22, 23], color: '#7b5cff', l: [67, 50], p: [50, 56] },
  voice: { beats: [24.5, 25, 25.5], color: '#ff6a4d', l: [50, 73], p: [50, 70] },
  trash: { beats: [27, 28], color: '#c6f432', l: [61, 50], p: [50, 60] },
  face: { beats: [30, 31], color: '#5ff3ff', l: [67, 50], p: [50, 58] },
  hand: { beats: [33, 33.5, 34, 34.5], color: '#ffffff', l: [65, 50], p: [50, 58] },
  stock: { beats: [36], color: '#ffd60a', l: [78, 74], p: [72, 70] },
  laptop: { beats: [40], color: '#ffd60a', l: [69, 45], p: [50, 50] },
  math: { beats: [41.6, 42], color: '#7dff6b', l: [50, 52], p: [50, 50] },
  recap: { beats: [44], color: '#ffb27a', l: [50, 58], p: [50, 58] },
  outro: { beats: [46, 47], color: '#a77bff', l: [50, 50], p: [50, 50] },
};

function Icon({ name }: { name: NonNullable<Sticker['icon']> }) {
  switch (name) {
    case 'mic': return <svg viewBox="0 0 64 64"><rect x="22" y="6" width="20" height="34" rx="10" fill="#ff6a4d" /><path d="M14 30a18 18 0 0036 0M32 48v10M22 58h20" fill="none" stroke="#2a0d0e" strokeWidth="4" strokeLinecap="round" /></svg>;
    case 'phones': return <svg viewBox="0 0 64 64"><path d="M10 40V32a22 22 0 0144 0v8" fill="none" stroke="#2a0d0e" strokeWidth="5" strokeLinecap="round" /><rect x="6" y="36" width="14" height="20" rx="5" fill="#ff6a4d" /><rect x="44" y="36" width="14" height="20" rx="5" fill="#ff6a4d" /></svg>;
    case 'flac': return <svg viewBox="0 0 64 64"><path d="M14 6h26l12 12v40H14z" fill="#fff4ee" stroke="#2a0d0e" strokeWidth="3" strokeLinejoin="round" /><path d="M40 6v12h12" fill="none" stroke="#2a0d0e" strokeWidth="3" /><path d="M20 42h4v-8h4v14h4V30h4v20h4v-12h4v6" fill="none" stroke="#ff6a4d" strokeWidth="3" strokeLinejoin="round" /></svg>;
    case 'leaf': return <svg viewBox="0 0 64 64"><path d="M10 54C10 26 28 10 56 8c0 30-16 46-46 46z" fill="#7bd84a" stroke="#1d4d12" strokeWidth="3" /><path d="M12 52L44 20" stroke="#1d4d12" strokeWidth="3" strokeLinecap="round" /></svg>;
    case 'bottle': return <svg viewBox="0 0 64 64"><path d="M26 4h12v10l6 8v34a4 4 0 01-4 4H24a4 4 0 01-4-4V22l6-8z" fill="#8fd3ff" stroke="#0c3550" strokeWidth="3" strokeLinejoin="round" /><rect x="20" y="30" width="24" height="12" fill="#ffffff" stroke="#0c3550" strokeWidth="2" /></svg>;
  }
}

const Spark = () => <svg viewBox="-50 -50 100 100"><path d="M0 -46 C4 -14 14 -4 46 0 C14 4 4 14 0 46 C-4 14 -14 4 -46 0 C-14 -4 -4 -14 0 -46Z" /></svg>;
const Coin = () => <svg viewBox="0 0 64 40"><ellipse cx="32" cy="24" rx="28" ry="12" fill="#b07d12" /><ellipse cx="32" cy="18" rx="28" ry="12" fill="#f2c94c" stroke="#b07d12" strokeWidth="2" /><text x="32" y="23" textAnchor="middle" fontSize="13" fontWeight="800" fill="#8a5a00" fontFamily="sans-serif">Rp</text></svg>;
const PixelCoin = () => <svg viewBox="0 0 8 8" shapeRendering="crispEdges"><path d="M2 0h4v1h1v1h1v4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1z" fill="#ffd60a" /><path d="M3 2h2v4h-2z" fill="#b58900" /></svg>;
const Laptop = () => <svg viewBox="0 0 64 44"><rect x="10" y="4" width="44" height="28" rx="3" fill="#0d3b8c" stroke="#ffd60a" strokeWidth="3" /><path d="M4 36h56l-4 6H8z" fill="#ffd60a" /></svg>;
const Lens = () => <svg viewBox="0 0 64 64"><circle cx="26" cy="26" r="18" fill="rgba(255,214,10,.15)" stroke="#ffd60a" strokeWidth="6" /><path d="M40 40l16 16" stroke="#ffd60a" strokeWidth="8" strokeLinecap="round" /></svg>;

/** The beat layer: sits above every scene, below transitions and the HUD. */
export default function TrailerBeats() {
  const pos = (s: Sticker) => ({ '--lx': `${s.l[0]}vw`, '--ly': `${s.l[1]}vh`, '--lr': `${s.l[2]}deg`, '--px': `${s.p[0]}vw`, '--py': `${s.p[1]}vh`, '--pr': `${s.p[2]}deg` }) as React.CSSProperties;
  return <div className="bts" aria-hidden="true">
    {Object.entries(stickers).map(([id, list]) => <div key={id} className={`bt bt-${id}`}>
      {list!.map((s, i) => <i key={i} className={`stk ${s.icon ? 'stk-icon' : ''}`} data-at={s.at} style={pos(s)}>
        {s.logo ? <img src={assetPath(`/assets/logos/${s.logo}.svg`)} alt="" width={64} height={64} draggable={false} /> : <Icon name={s.icon!} />}
      </i>)}
    </div>)}
    {Object.entries(rings).map(([id, r]) => <i key={id} className={`ring ring-${id}`} style={{ '--lx': `${r!.l[0]}vw`, '--ly': `${r!.l[1]}vh`, '--px': `${r!.p[0]}vw`, '--py': `${r!.p[1]}vh`, '--rc': r!.color } as React.CSSProperties} />)}

    {/* Smart Trash: a leaf and a bottle fall into the sorter and get flicked to their side */}
    <i className="drop drop-leaf"><Icon name="leaf" /></i>
    <i className="drop drop-bottle"><Icon name="bottle" /></i>
    {/* Payroll: coins land in a stack */}
    <div className="coins">{[0, 1, 2, 3, 4].map(i => <i key={i} className="coin"><Coin /></i>)}</div>
    {/* Laptop BST: a lens hops down the search path, laptops pop under the results */}
    <i className="lens"><Lens /></i>
    <div className="laptops">{[0, 1, 2].map(i => <i key={i} className="lap"><Laptop /></i>)}</div>
    {/* Math Game: pixel coins burst from the right answer */}
    <div className="pcoins">{Array.from({ length: 8 }, (_, i) => <i key={i} className="pcoin"><PixelCoin /></i>)}</div>
    {/* Outro: sparkles scatter on the closing hits */}
    <div className="sparks">{Array.from({ length: 10 }, (_, i) => <i key={i} className="spk"><Spark /></i>)}</div>
  </div>;
}
