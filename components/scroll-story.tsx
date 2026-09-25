import { assetPath } from '@/lib/asset-path';
import { ArrowDown, ArrowUpRight } from 'lucide-react';

/** Decorative, scroll-driven opening. All portfolio content follows in normal flow. */
export default function ScrollStory() {
  return <section id="home" className="scroll-story" aria-label="Pembuka portofolio Efriza">
    <div className="story-viewport">
      <div className="story-world" aria-hidden="true">
        <img className="story-landscape" src={assetPath('/assets/scroll-scene/circuit-landscape.webp')} alt="" width={1536} height={1024} fetchPriority="high" />
        <div className="story-warmth" />
        <div className="story-night" />
        <div className="story-halo" />
        <div className="story-core-position"><img className="story-core" src={assetPath('/assets/scroll-scene/processor.webp')} alt="" width={1254} height={1254} fetchPriority="high" /></div>
        <div className="story-foreground story-foreground-left"><img src={assetPath('/assets/scroll-scene/foreground.webp')} alt="" width={1536} height={1024} /></div>
        <div className="story-foreground story-foreground-right"><img src={assetPath('/assets/scroll-scene/foreground.webp')} alt="" width={1536} height={1024} /></div>
        <div className="story-dusk" />
        <div className="story-vignette" />
      </div>

      <div className="story-topline container-main"><span>EFRIZA TAUFIQURROHMAN</span><a href="#intro">Lewati pembuka <ArrowUpRight size={15} /></a></div>
      <div className="story-intro story-copy">
        <p>SOFTWARE · MACHINE LEARNING · IOT</p>
        <h1>Ide menjadi<br /><span>nyata.</span></h1>
      </div>
      <div className="story-middle story-copy" aria-hidden="true"><p>LOGIKA BERTEMU TEKNOLOGI</p><span className="story-title">Kode yang<br /><em>menggerakkan.</em></span></div>
      <div className="story-outro story-copy" aria-hidden="true"><p>BUILD. LEARN. REPEAT.</p><span className="story-title">Dari eksperimen,<br /><em>menjadi karya.</em></span><div className="story-tools"><img src={assetPath('/assets/logos/python.svg')} alt="" width={32} height={32} /><span>×</span><img src={assetPath('/assets/logos/tensorflow.svg')} alt="" width={32} height={32} /><span>×</span><img src={assetPath('/assets/logos/arduino.svg')} alt="" width={32} height={32} /></div></div>

      <div className="story-bottomline container-main">
        <div className="story-phases" aria-hidden="true"><span className="story-phase-one">01 / IDE</span><span className="story-phase-two">02 / PROSES</span><span className="story-phase-three">03 / KARYA</span></div>
        <div className="story-scroll-label"><span>SCROLL UNTUK MENJELAJAH</span><ArrowDown size={16} /></div>
        <a href="#projects">Lihat proyek <ArrowUpRight size={16} /></a>
      </div>
      <div className="story-progress" aria-hidden="true"><span /></div>
    </div>
  </section>;
}
