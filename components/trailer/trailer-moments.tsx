
function Icon({ name }: { name: 'leaf' | 'bottle' }) {
  switch (name) {
    case 'leaf': return <svg viewBox="0 0 64 64"><path d="M10 54C10 26 28 10 56 8c0 30-16 46-46 46z" fill="#7bd84a" stroke="#1d4d12" strokeWidth="3" /><path d="M12 52L44 20" stroke="#1d4d12" strokeWidth="3" strokeLinecap="round" /></svg>;
    case 'bottle': return <svg viewBox="0 0 64 64"><path d="M26 4h12v10l6 8v34a4 4 0 01-4 4H24a4 4 0 01-4-4V22l6-8z" fill="#8fd3ff" stroke="#0c3550" strokeWidth="3" strokeLinejoin="round" /><rect x="20" y="30" width="24" height="12" fill="#ffffff" stroke="#0c3550" strokeWidth="2" /></svg>;
  }
}

const Spark = () => <svg viewBox="-50 -50 100 100"><path d="M0 -46 C4 -14 14 -4 46 0 C14 4 4 14 0 46 C-4 14 -14 4 -46 0 C-14 -4 -4 -14 0 -46Z" /></svg>;
const Coin = () => <svg viewBox="0 0 64 40"><ellipse cx="32" cy="24" rx="28" ry="12" fill="#b07d12" /><ellipse cx="32" cy="18" rx="28" ry="12" fill="#f2c94c" stroke="#b07d12" strokeWidth="2" /><text x="32" y="23" textAnchor="middle" fontSize="13" fontWeight="800" fill="#8a5a00" fontFamily="sans-serif">Rp</text></svg>;
const PixelCoin = () => <svg viewBox="0 0 8 8" shapeRendering="crispEdges"><path d="M2 0h4v1h1v1h1v4h-1v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1z" fill="#ffd60a" /><path d="M3 2h2v4h-2z" fill="#b58900" /></svg>;
const Laptop = () => <svg viewBox="0 0 64 44"><rect x="10" y="4" width="44" height="28" rx="3" fill="#0d3b8c" stroke="#ffd60a" strokeWidth="3" /><path d="M4 36h56l-4 6H8z" fill="#ffd60a" /></svg>;
const Lens = () => <svg viewBox="0 0 64 64"><circle cx="26" cy="26" r="18" fill="rgba(255,214,10,.15)" stroke="#ffd60a" strokeWidth="6" /><path d="M40 40l16 16" stroke="#ffd60a" strokeWidth="8" strokeLinecap="round" /></svg>;

/** Small moving pictures for a few shots: sits above every scene, below transitions and the HUD. */
export default function TrailerMoments() {
  return <div className="bts" aria-hidden="true">
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
