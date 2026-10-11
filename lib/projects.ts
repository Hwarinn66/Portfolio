export type Category = 'ml' | 'cv' | 'iot' | 'web';
export type TechId = 'python' | 'tensorflow' | 'opencv' | 'scikitlearn' | 'fastapi' | 'flask' | 'flutter' | 'php' | 'javascript' | 'arduino' | 'git';

export type Project = {
  id: string;
  name: string;
  subtitle: string;
  kind: string;
  description: string;
  highlights: string[];
  tags: Category[];
  /** Technologies with an original logo, used for filtering from the toolkit. */
  stack: TechId[];
  /** Additional technologies without a logo. */
  extras: string[];
  repository: string;
  featured: boolean;
  note?: string;
};

export const categories: { id: Category | 'all'; label: string; short: string }[] = [
  { id: 'all', label: 'Semua', short: 'semua' },
  { id: 'ml', label: 'Machine learning', short: 'ml' },
  { id: 'cv', label: 'Computer vision', short: 'cv' },
  { id: 'iot', label: 'IoT', short: 'iot' },
  { id: 'web', label: 'Web', short: 'web' },
];

export const projects: Project[] = [
  {
    id: 'innerself', name: 'InnerSelf Cognitive', subtitle: 'Membaca alasan di balik jawaban.', kind: 'Proyek pribadi, ML dan NLP', featured: true,
    description: 'Web refleksi dengan 32 pertanyaan yang memadukan skor pilihan dan alasan tertulis. Klasifikasi teks lokal membentuk profil delapan fungsi kognitif, kemudian mencocokkannya dengan 16 susunan fungsi.',
    highlights: ['TF-IDF word/character n-gram dan Logistic Regression dilatih pada dataset teks sintetis.', 'FastAPI menangani kuesioner, hasil, dan feedback, dengan integrasi MySQL opsional.', 'Ulasan merujuk alasan pengguna. Qwen3 4B melalui llama-cpp-python tersedia sebagai narator lokal opsional.'],
    tags: ['ml', 'web'], stack: ['python', 'fastapi', 'scikitlearn'], extras: ['Local LLM'],
    repository: 'https://github.com/Hwarinn66/MBTI-test',
    note: 'Prototipe berbasis data sintetis; bukan tes MBTI resmi atau diagnosis psikologis.',
  },
  {
    id: 'smart-trash', name: 'Smart Trash', subtitle: 'Computer vision yang menggerakkan dunia fisik.', kind: 'Seminar dan lomba IoT', featured: true,
    description: 'Prototipe pemilah sampah organik dan nonorganik. Video kamera diproses dengan OpenCV dan MobileNetV2, lalu hasilnya dikirim melalui HTTP ke ESP32 untuk menggerakkan servo.',
    highlights: ['Transfer learning MobileNetV2 dengan augmentasi data, class weighting, dan fine-tuning.', 'Motion gate, smoothing lima frame, threshold confidence 70%, dan cooldown sebelum aktuasi berikutnya.', 'Blynk IoT untuk penghitung pemilahan dan pause/resume; stream kamera memiliki mekanisme reconnect.'],
    tags: ['ml', 'cv', 'iot'], stack: ['python', 'tensorflow', 'opencv', 'arduino'], extras: ['ESP32'],
    repository: 'https://github.com/Hwarinn66/Smart-Trash',
    note: 'Prototipe akademik; threshold confidence adalah konfigurasi inferensi, bukan klaim akurasi.',
  },
  {
    id: 'face-recognition', name: 'Face Recognition Attendance', subtitle: 'Satu sistem, dari registrasi hingga kehadiran.', kind: 'Penelitian jurnal, computer vision', featured: true,
    description: 'Sistem absensi dengan server pusat dan tiga client: alat absensi, dashboard guru, serta portal siswa. Registrasi wajah melalui persetujuan guru, dengan verifikasi kedipan sebelum pengenalan.',
    highlights: ['MediaPipe Face Mesh memeriksa dua kedipan; registrasi menangkap hingga 20 gambar wajah.', 'OpenCV mendeteksi wajah dan MobileNetV2 mengenali identitas melalui transfer learning.', 'Flask + Socket.IO mengirim pembaruan real-time. Sistem memeriksa duplikat absensi pada hari yang sama.'],
    tags: ['ml', 'cv'], stack: ['python', 'flask', 'tensorflow', 'opencv'], extras: ['MediaPipe', 'Socket.IO'],
    repository: 'https://github.com/Hwarinn66/face-recognition',
    note: 'Prototipe penelitian dengan penyimpanan JSON/CSV; liveness kedipan belum setara anti-spoofing produksi.',
  },
  {
    id: 'payroll', name: 'HR & Payroll System', subtitle: 'Menghubungkan proses administrasi karyawan.', kind: 'Aplikasi web, CodeIgniter 4', featured: true,
    description: 'Aplikasi web pengelolaan karyawan dan penggajian. Modul departemen, jabatan, absensi, cuti, periode payroll, dan slip gaji terhubung dalam satu alur administrasi.',
    highlights: ['CRUD karyawan, departemen, dan jabatan, dengan pengelolaan akun pengguna.', 'Absensi manual dan impor, pengajuan cuti, serta proses approve/reject.', 'Pemrosesan payroll mencakup komponen potongan BPJS dan PPh 21, persetujuan, serta slip gaji.'],
    tags: ['web'], stack: ['php', 'javascript'], extras: ['CodeIgniter 4'],
    repository: 'https://github.com/Hwarinn66/aplikasi',
  },
  {
    id: 'laptop', name: 'Laptop Recommendation', subtitle: 'Mencari laptop lewat pohon biner.', kind: 'Struktur data', featured: false,
    description: 'Katalog dan rekomendasi laptop dengan struktur Binary Tree. Pencarian berdasarkan harga, prosesor, RAM, storage, dan VGA.',
    highlights: [], tags: ['web'], stack: ['python', 'flask'], extras: ['Binary Tree'],
    repository: 'https://github.com/Hwarinn66/laptop-recomendation-with-binary-tree',
  },
  {
    id: 'gesture', name: 'Hand Gesture Navigator', subtitle: 'Gestur tangan sebagai pintasan.', kind: 'Computer vision', featured: false,
    description: 'Webcam membaca gestur tangan melalui OpenCV dan MediaPipe, lalu memetakannya menjadi aksi untuk membuka website.',
    highlights: [], tags: ['cv'], stack: ['python', 'opencv'], extras: ['MediaPipe'],
    repository: 'https://github.com/Hwarinn66/gesture_hand',
  },
  {
    id: 'math', name: 'Math Game', subtitle: 'Hitung cepat, skor naik.', kind: 'Web interaktif', featured: false,
    description: 'Game matematika berbasis Flask dengan soal acak, tiga level kesulitan, serta skor yang memperhitungkan jawaban benar dan kecepatan.',
    highlights: [], tags: ['web'], stack: ['python', 'flask', 'javascript'], extras: [],
    repository: 'https://github.com/Hwarinn66/math-game',
  },
];

export type Technology = { id: TechId; name: string; group: string; filterable: boolean; caption?: string };

export const technologies: Technology[] = [
  { id: 'python', name: 'Python', group: 'Bahasa utama', filterable: true },
  { id: 'tensorflow', name: 'TensorFlow', group: 'Machine learning', filterable: true },
  { id: 'opencv', name: 'OpenCV', group: 'Computer vision', filterable: true },
  { id: 'scikitlearn', name: 'scikit-learn', group: 'Machine learning', filterable: true },
  { id: 'fastapi', name: 'FastAPI', group: 'Backend', filterable: true },
  { id: 'flask', name: 'Flask', group: 'Backend', filterable: true },
  { id: 'php', name: 'PHP', group: 'Web', filterable: true },
  { id: 'javascript', name: 'JavaScript', group: 'Web', filterable: true },
  { id: 'arduino', name: 'Arduino IDE', group: 'ESP32 dan IoT', filterable: true },
  { id: 'flutter', name: 'Flutter', group: 'Mobile', filterable: false, caption: 'Pengalaman belajar' },
  { id: 'git', name: 'Git', group: 'Version control', filterable: false, caption: 'Semua repositori' },
];

export const techName = (id: TechId) => technologies.find(t => t.id === id)?.name ?? id;
export const projectsUsing = (id: TechId) => projects.filter(p => p.stack.includes(id));
