import { assetPath } from '@/lib/asset-path';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/bricolage-grotesque/standard.css';
import '@fontsource-variable/instrument-sans';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/archivo/standard.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Efriza Taufiqurrohman — Software, AI & IoT',
  description: 'Portofolio Efriza Taufiqurrohman: tujuh proyek software, machine learning, computer vision, dan IoT. Terbuka untuk magang IT.',
  icons: { icon: assetPath('/favicon.svg') },
  openGraph: { type: 'website', locale: 'id_ID', title: 'Efriza Taufiqurrohman — Software, AI & IoT', description: 'Dari ide menjadi sistem. Jelajahi proyek software, machine learning, dan IoT.' },
};

export const viewport: Viewport = { themeColor: '#f2f3fa', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

// Decides before first paint whether the opening plays: once per tab session, never with reduced
// motion, a paused-motion preference or a deep link. A timeout unlocks the page if the app fails to start.
const introScript = `try{var d=document.documentElement,s=sessionStorage;if(!s.getItem('efriza-intro-seen')&&s.getItem('efriza-motion-paused')!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&!location.hash){d.classList.add('intro-pending');if('scrollRestoration' in history)history.scrollRestoration='manual';window.__introFailsafe=setTimeout(function(){d.classList.remove('intro-pending')},9000)}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: introScript }} /></head>
    <body>{children}</body>
  </html>;
}
