import { assetPath } from '@/lib/asset-path';

export const profile = {
  name: 'Efriza Taufiqurrohman',
  shortName: 'Efriza',
  email: 'efrizataufiq@gmail.com',
  github: 'https://github.com/Hwarinn66',
  linkedin: 'https://www.linkedin.com/in/efriza-taufiqurrohman-07b31221b',
  whatsapp: 'https://wa.me/6281456081822',
  whatsappLabel: '+62 814-5608-1822',
  location: 'Kab. Bekasi, Jawa Barat',
  campus: 'Universitas Bina Sarana Informatika',
  degree: 'S1 Informatika (Ilmu Komputer)',
  semester: 'Semester 7',
  status: 'Terbuka untuk magang IT',
  cv: assetPath('/documents/CV-Efriza-Taufiqurrohman.pdf'),
  portfolioPdf: assetPath('/documents/Portfolio-Efriza-Taufiqurrohman.pdf'),
  /** Source of this website. */
  source: 'https://github.com/Hwarinn66/Portfolio',
};

/** Dates use one format everywhere: three-letter Indonesian month and year, joined by an en dash. */
export const education = [
  { period: '2023 – sekarang', title: profile.degree, place: profile.campus, detail: `Mahasiswa ${profile.semester.toLowerCase()}.` },
];

export const experience = [
  { period: 'Jun 2023 – Okt 2023', role: 'Store Assistant', company: 'Pet Shop', description: 'Mendukung operasional harian toko selama lima bulan.' },
  { period: 'Nov 2022 – Mei 2023', role: 'Warehouse Loading Crew', company: 'PT Prakarsa Alam Segar, daily worker', description: 'Mendukung aktivitas pemuatan barang dan operasional gudang.' },
  { period: 'Sep 2021 – Sep 2022', role: 'Production Operator', company: 'PT Abdi Putra Pratama', description: 'Bekerja dalam alur produksi dan koordinasi operasional tim.' },
];

export type Certificate = { id: string; title: string; issuer: string; date?: string; image?: { src: string; width: number; height: number; alt: string }; pending?: string };

export const certificates: Certificate[] = [
  { id: 'mtcna', title: 'MikroTik Certified Network Associate', issuer: 'MTCNA, credential 2601NA3035', date: 'Jan 2026',
    image: { src: assetPath('/assets/mtcna-certificate.webp'), width: 491, height: 694, alt: 'Sertifikat MikroTik Certified Network Associate milik Efriza' } },
  { id: 'iot', title: 'Bootcamp IoT & Artificial Intelligence', issuer: 'Universitas Bina Sarana Informatika', date: 'Jul 2025',
    image: { src: assetPath('/assets/iot-certificate.webp'), width: 891, height: 630, alt: 'Sertifikat bootcamp IoT dan AI Universitas Bina Sarana Informatika' } },
  { id: 'bnsp', title: 'Analis Program', issuer: 'Sertifikasi profesi BNSP', pending: 'Menunggu penerbitan sertifikat' },
];
