import { assetPath } from '@/lib/asset-path';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/space-grotesk';
import './globals.css';
export const metadata: Metadata = {
  title: 'Efriza Taufiqurrohman — Software, AI & IoT',
  description: 'Portofolio Efriza Taufiqurrohman: tujuh proyek software, machine learning, computer vision, dan IoT. Terbuka untuk magang IT.',
  icons: { icon: assetPath('/favicon.svg') },
  openGraph: { type: 'website', locale: 'id_ID', title: 'Efriza Taufiqurrohman — Software, AI & IoT', description: 'Dari ide menjadi sistem. Jelajahi proyek software, machine learning, dan IoT.' },
};
export const viewport: Viewport = { themeColor: '#101923' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
