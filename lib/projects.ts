export type Project = {
  id: string; number: string; name: string; subtitle: string; category: string; description: string;
  highlights: string[]; technologies: { name: string; logo?: string }[]; repository: string; note?: string;
};
export const featuredProjects: Project[] = [
  { id: 'innerself', number: '01', name: 'InnerSelf Cognitive', subtitle: 'Membaca alasan di balik jawaban.', category: 'PERSONAL PROJECT / ML & NLP',
    description: 'Web refleksi dengan 32 pertanyaan yang memadukan skor pilihan dan alasan tertulis. Klasifikasi teks lokal membentuk profil delapan fungsi kognitif, kemudian mencocokkannya dengan 16 susunan fungsi.',
    highlights: ['TF-IDF word/character n-gram dan Logistic Regression dilatih pada dataset teks sintetis.', 'FastAPI menangani kuesioner, hasil, dan feedback, dengan integrasi MySQL opsional.', 'Ulasan merujuk alasan pengguna. Qwen3 4B melalui llama-cpp-python tersedia sebagai narator lokal opsional.'],
    technologies: [{ name: 'Python', logo: 'python' }, { name: 'FastAPI', logo: 'fastapi' }, { name: 'scikit-learn', logo: 'scikitlearn' }, { name: 'Local LLM' }], repository: 'https://github.com/Hwarinn66/MBTI-test',
    note: 'Prototipe berbasis data sintetis; bukan tes MBTI resmi atau diagnosis psikologis.' },
  { id: 'smart-trash', number: '02', name: 'Smart Trash', subtitle: 'Computer vision yang menggerakkan dunia fisik.', category: 'SEMINAR / LOMBA IOT',
    description: 'Prototipe pemilah sampah organik dan nonorganik. Video kamera diproses dengan OpenCV dan MobileNetV2, lalu hasilnya dikirim melalui HTTP ke ESP32 untuk menggerakkan servo.',
    highlights: ['Transfer learning MobileNetV2 dengan augmentasi data, class weighting, dan fine-tuning.', 'Motion gate, smoothing lima frame, threshold confidence 70%, dan cooldown sebelum aktuasi berikutnya.', 'Blynk IoT untuk penghitung pemilahan dan pause/resume; stream kamera memiliki mekanisme reconnect.'],
    technologies: [{ name: 'TensorFlow', logo: 'tensorflow' }, { name: 'OpenCV', logo: 'opencv' }, { name: 'ESP32' }, { name: 'Arduino IDE', logo: 'arduino' }], repository: 'https://github.com/Hwarinn66/Smart-Trash',
    note: 'Prototipe akademik; threshold confidence adalah konfigurasi inferensi, bukan klaim akurasi.' },
  { id: 'face-recognition', number: '03', name: 'Face Recognition Attendance', subtitle: 'Satu sistem, dari registrasi hingga kehadiran.', category: 'PENELITIAN JURNAL / COMPUTER VISION',
    description: 'Sistem absensi dengan server pusat dan tiga client: alat absensi, dashboard guru, serta portal siswa. Registrasi wajah melalui persetujuan guru, dengan verifikasi kedipan sebelum pengenalan.',
    highlights: ['MediaPipe Face Mesh memeriksa dua kedipan; registrasi menangkap hingga 20 gambar wajah.', 'OpenCV mendeteksi wajah dan MobileNetV2 mengenali identitas melalui transfer learning.', 'Flask + Socket.IO mengirim pembaruan real-time. Sistem memeriksa duplikat absensi pada hari yang sama.'],
    technologies: [{ name: 'Python', logo: 'python' }, { name: 'Flask', logo: 'flask' }, { name: 'TensorFlow', logo: 'tensorflow' }, { name: 'MediaPipe' }], repository: 'https://github.com/Hwarinn66/face-recognition',
    note: 'Prototipe penelitian dengan penyimpanan JSON/CSV; liveness kedipan belum setara anti-spoofing produksi.' },
  { id: 'payroll', number: '04', name: 'HR & Payroll System', subtitle: 'Menghubungkan proses administrasi karyawan.', category: 'WEB APPLICATION / CODEIGNITER 4',
    description: 'Aplikasi web pengelolaan karyawan dan penggajian. Modul departemen, jabatan, absensi, cuti, periode payroll, dan slip gaji terhubung dalam satu alur administrasi.',
    highlights: ['CRUD karyawan, departemen, dan jabatan, dengan pengelolaan akun pengguna.', 'Absensi manual dan impor, pengajuan cuti, serta proses approve/reject.', 'Pemrosesan payroll mencakup komponen potongan BPJS dan PPh 21, persetujuan, serta slip gaji.'],
    technologies: [{ name: 'PHP', logo: 'php' }, { name: 'CodeIgniter 4' }, { name: 'JavaScript', logo: 'javascript' }], repository: 'https://github.com/Hwarinn66/aplikasi' },
];
export const otherProjects = [
  { id: 'laptop', number: '05', name: 'Laptop Recommendation', kind: 'DATA STRUCTURE', description: 'Katalog dan rekomendasi laptop dengan struktur Binary Tree. Pencarian berdasarkan harga, prosesor, RAM, storage, dan VGA.', tech: 'Python · Flask · Binary Tree', repository: 'https://github.com/Hwarinn66/laptop-recomendation-with-binary-tree' },
  { id: 'gesture', number: '06', name: 'Hand Gesture Navigator', kind: 'COMPUTER VISION', description: 'Webcam membaca gestur tangan melalui OpenCV dan MediaPipe, lalu memetakannya menjadi aksi untuk membuka website.', tech: 'Python · OpenCV · MediaPipe', repository: 'https://github.com/Hwarinn66/gesture_hand' },
  { id: 'math', number: '07', name: 'Math Game', kind: 'INTERACTIVE WEB', description: 'Game matematika berbasis Flask dengan soal acak, tiga level kesulitan, serta skor yang memperhitungkan jawaban benar dan kecepatan.', tech: 'Python · Flask · JavaScript', repository: 'https://github.com/Hwarinn66/math-game' },
];
export const technologies = [
  { name: 'Python', logo: 'python', group: 'Programming' }, { name: 'TensorFlow', logo: 'tensorflow', group: 'Machine learning' }, { name: 'OpenCV', logo: 'opencv', group: 'Computer vision' }, { name: 'scikit-learn', logo: 'scikitlearn', group: 'Machine learning' }, { name: 'FastAPI', logo: 'fastapi', group: 'Backend' }, { name: 'Flask', logo: 'flask', group: 'Backend' }, { name: 'Flutter', logo: 'flutter', group: 'Mobile' }, { name: 'PHP', logo: 'php', group: 'Web development' }, { name: 'JavaScript', logo: 'javascript', group: 'Web development' }, { name: 'Arduino IDE', logo: 'arduino', group: 'ESP32 & IoT' }, { name: 'Git', logo: 'git', group: 'Version control' },
];
