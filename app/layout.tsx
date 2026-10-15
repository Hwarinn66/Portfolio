import { assetPath } from '@/lib/asset-path';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/instrument-sans/standard.css';
import '@fontsource-variable/jetbrains-mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Efriza Taufiqurrohman — Software, AI & IoT',
  description: 'Portofolio Efriza Taufiqurrohman: tujuh proyek software, machine learning, computer vision, dan IoT. Terbuka untuk magang IT.',
  icons: { icon: assetPath('/favicon.svg') },
  openGraph: { type: 'website', locale: 'id_ID', title: 'Efriza Taufiqurrohman — Software, AI & IoT', description: 'Dari ide menjadi sistem. Proyek software, machine learning, computer vision, dan IoT.' },
};

export const viewport: Viewport = { themeColor: '#eef1f3', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id">
    <body>{children}</body>
  </html>;
}
