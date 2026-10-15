export type Category = 'ml' | 'cv' | 'iot' | 'web';
export type TechId = 'python' | 'tensorflow' | 'opencv' | 'scikitlearn' | 'fastapi' | 'flask' | 'flutter' | 'php' | 'javascript' | 'arduino' | 'git';

/** A technical decision and, when the repository states it, the reason behind it. */
export type Decision = { choice: string; reason?: string };

export type Project = {
  id: string;
  name: string;
  /** One-line summary shown under the name. */
  subtitle: string;
  kind: string;
  /** What the project is, in two sentences. */
  description: string;
  /** Context of the case study: what it is for and where it came from. */
  context: string;
  /** Technical approach, as reviewed against the repository. */
  highlights: string[];
  /** The system flow, step by step. Matches the diagram. */
  flow: string[];
  /** Decisions with their reason, only where the repository documents them. */
  decisions: Decision[];
  /** Known limitations, as stated in the repository or the CV. */
  limits: string[];
  /** What Efriza did on this project. Left empty until he supplies it; never inferred. */
  role?: string;
  tags: Category[];
  /** Technologies with an entry in `technologies`. */
  stack: TechId[];
  /** Additional technologies. */
  extras: string[];
  repository: string;
  /** Button label for the repository when there are two versions. */
  repositoryLabel?: string;
  /** A second implementation of the same project, if there is one. */
  repositoryAlt?: { label: string; url: string };
  /** Featured projects get a full case-study spread on the page; the rest are listed in the index. */
  featured: boolean;
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
    context: 'Kuesioner berisi 32 pernyataan fungsi kognitif. Selain memilih jawaban, pengguna boleh menulis alasannya; sistem membaca alasan itu dan menyusun ulasan yang merujuk kembali ke jawaban mereka.',
    highlights: ['TF-IDF word/character n-gram dan Logistic Regression dilatih pada dataset teks sintetis.', 'FastAPI menangani kuesioner, hasil, dan feedback, dengan integrasi MySQL opsional.', 'Ulasan merujuk alasan pengguna. Qwen3 4B melalui llama-cpp-python tersedia sebagai narator lokal opsional.'],
    flow: [
      'Pengguna menjawab 32 pernyataan dan boleh menuliskan alasan di setiap soal.',
      'Pilihan dinilai per fungsi kognitif; jawaban netral disimpan sebagai kategori sendiri.',
      'Alasan tertulis diklasifikasi TF-IDF + Logistic Regression ke delapan fungsi.',
      'Profil delapan fungsi dicocokkan dengan 16 susunan fungsi untuk menentukan kandidat tipe.',
      'Ulasan disusun dari bukti: pilihan, kutipan alasan, dan nomor soal.',
    ],
    decisions: [
      { choice: 'Jawaban netral disimpan terpisah (−1 dan +1), bukan diubah menjadi nol.', reason: 'Netral tidak disamakan dengan angka nol saat skor dihitung.' },
      { choice: 'Kandidat tipe diambil dari kecocokan pola delapan fungsi, bukan dari skor E/I, S/N, T/F, J/P.' },
      { choice: 'Narasi Qwen3 4B hanya opsional dan berjalan di proses Python lokal.', reason: 'Jika kutipan atau nomor soal yang dihasilkan keliru, pembahasan kembali ke versi berbasis bukti; jawaban tidak dikirim ke layanan luar.' },
    ],
    limits: ['Prototipe penelitian berbasis data sintetis; belum divalidasi pada responden nyata.', 'Bukan tes MBTI resmi atau diagnosis psikologis.', 'Belum ada autentikasi atau pembatasan laju untuk penggunaan publik.'],
    tags: ['ml', 'web'], stack: ['python', 'fastapi', 'scikitlearn'], extras: ['llama-cpp-python'],
    repository: 'https://github.com/Hwarinn66/MBTI-test',
  },
  {
    id: 'smart-trash', name: 'Smart Trash', subtitle: 'Computer vision yang menggerakkan dunia fisik.', kind: 'Proyek IoT', featured: true,
    description: 'Prototipe pemilah sampah organik dan nonorganik. Video kamera diproses dengan OpenCV dan MobileNetV2, lalu hasilnya dikirim melalui HTTP ke ESP32 untuk menggerakkan servo.',
    context: 'Prototipe pemilah sampah organik dan nonorganik. Kamera membaca objek, model mengklasifikasikannya, lalu ESP32 menggerakkan servo ke sisi yang sesuai dan mengirim hitungan ke Blynk.',
    highlights: ['Transfer learning MobileNetV2 dengan augmentasi data, class weighting, dan fine-tuning.', 'Motion gate, smoothing lima frame, threshold confidence 70%, dan cooldown sebelum aktuasi berikutnya.', 'Blynk IoT untuk penghitung pemilahan dan pause/resume; stream kamera memiliki mekanisme reconnect.'],
    flow: [
      'OpenCV membaca stream kamera (IP Webcam atau webcam).',
      'Motion score dihitung dari selisih frame; inferensi hanya berjalan saat ada gerakan yang konsisten.',
      'Frame diubah ke 224 × 224 dan diklasifikasi MobileNetV2.',
      'Prediksi dihaluskan beberapa frame dan diperiksa terhadap threshold confidence.',
      'Python mengirim perintah /cmd?set=L atau R ke web server ESP32.',
      'ESP32 menggerakkan servo, memperbarui counter Blynk, lalu kembali ke posisi tengah.',
    ],
    decisions: [
      { choice: 'Motion gate sebelum inferensi.', reason: 'Model tidak terus berjalan ketika tidak ada objek yang relevan di depan kamera.' },
      { choice: 'Smoothing prediksi beberapa frame dan threshold confidence.', reason: 'Mengurangi perubahan prediksi yang terlalu cepat; prediksi lemah diperlakukan sebagai “tidak ada objek”.' },
      { choice: 'Training dua tahap (classifier head, lalu fine-tuning) dengan class weighting.', reason: 'Class weighting membantu dataset yang tidak seimbang.' },
      { choice: 'Perintah ke ESP32 hanya dikirim saat sistem tidak sedang cooldown atau dijeda dari Blynk.' },
    ],
    limits: ['Prototipe akademik; akurasi sangat bergantung pada kualitas, variasi, dan keseimbangan dataset serta kondisi kamera.', 'Threshold confidence adalah konfigurasi inferensi, bukan klaim akurasi.'],
    tags: ['ml', 'cv', 'iot'], stack: ['python', 'tensorflow', 'opencv', 'arduino'], extras: ['ESP32', 'Blynk'],
    repository: 'https://github.com/Hwarinn66/Smart-Trash',
  },
  {
    id: 'face-recognition', name: 'Face Recognition Attendance', subtitle: 'Satu sistem, dari registrasi hingga kehadiran.', kind: 'Penelitian jurnal, computer vision', featured: true,
    description: 'Sistem absensi dengan server pusat dan tiga client: alat absensi, dashboard guru, serta portal siswa. Registrasi wajah melalui persetujuan guru, dengan verifikasi kedipan sebelum pengenalan.',
    context: 'Proyek penelitian jurnal akademik: absensi berbasis wajah dengan satu server pusat dan tiga client terpisah, yaitu alat absensi, dashboard guru, dan portal siswa.',
    highlights: ['MediaPipe Face Mesh memeriksa dua kedipan; registrasi menangkap hingga 20 gambar wajah.', 'OpenCV mendeteksi wajah dan MobileNetV2 mengenali identitas melalui transfer learning.', 'Flask + Socket.IO mengirim pembaruan real-time. Sistem memeriksa duplikat absensi pada hari yang sama.'],
    flow: [
      'Siswa mendaftar di portal, berkedip dua kali, lalu sistem mengambil hingga 20 foto wajah.',
      'Guru menyetujui atau menolak registrasi; foto yang disetujui masuk dataset dan model dilatih ulang.',
      'Saat absensi, client mengirim frame kamera ke server melalui Socket.IO.',
      'Server memeriksa kedipan (Eye Aspect Ratio), mendeteksi wajah, lalu MobileNetV2 mengenali identitas.',
      'Jika confidence melewati threshold dan siswa belum absen hari itu, kehadiran dicatat dan dashboard guru diperbarui.',
    ],
    decisions: [
      { choice: 'Verifikasi kedipan sebelum pengenalan wajah.', reason: 'Membantu membedakan wajah langsung dari foto statis sederhana.' },
      { choice: 'Registrasi wajah harus disetujui guru.', reason: 'Foto baru masuk dataset training hanya setelah diperiksa.' },
      { choice: 'Socket.IO untuk komunikasi client–server.', reason: 'Dashboard guru menerima kehadiran baru tanpa memuat ulang halaman.' },
      { choice: 'Pemeriksaan duplikat sebelum mencatat kehadiran.', reason: 'Satu siswa tercatat sekali per hari.' },
    ],
    limits: ['Prototipe penelitian dengan penyimpanan JSON/CSV dan konfigurasi development.', 'Liveness kedipan belum setara anti-spoofing produksi.', 'Siswa baru memerlukan pelatihan ulang model.'],
    tags: ['ml', 'cv'], stack: ['python', 'flask', 'tensorflow', 'opencv'], extras: ['MediaPipe', 'Socket.IO'],
    repository: 'https://github.com/Hwarinn66/face-recognition',
  },
  {
    id: 'payroll', name: 'HR & Payroll System', subtitle: 'Menghubungkan proses administrasi karyawan.', kind: 'Aplikasi web, CodeIgniter 4', featured: false,
    description: 'Aplikasi web pengelolaan karyawan dan penggajian. Modul departemen, jabatan, absensi, cuti, periode payroll, dan slip gaji terhubung dalam satu alur administrasi.',
    context: 'Aplikasi web pengelolaan karyawan dan penggajian. Modul departemen, jabatan, absensi, cuti, periode payroll, dan slip gaji terhubung dalam satu alur administrasi.',
    highlights: ['CRUD karyawan, departemen, dan jabatan, dengan pengelolaan akun pengguna.', 'Absensi manual dan impor, pengajuan cuti, serta proses approve/reject.', 'Pemrosesan payroll mencakup komponen potongan BPJS dan PPh 21, persetujuan, serta slip gaji.'],
    flow: [
      'Data master: karyawan, departemen, jabatan, dan akun pengguna.',
      'Absensi dicatat manual atau diimpor; pengajuan cuti disetujui atau ditolak.',
      'Periode payroll diproses dengan potongan BPJS dan PPh 21.',
      'Payroll disetujui, lalu slip gaji diterbitkan.',
    ],
    decisions: [],
    limits: [],
    tags: ['web'], stack: ['php', 'javascript'], extras: ['CodeIgniter 4'],
    repository: 'https://github.com/Hwarinn66/aplikasi',
  },
  {
    id: 'laptop', name: 'Laptop Recommendation', subtitle: 'Mencari laptop lewat pohon biner.', kind: 'Struktur data', featured: false,
    description: 'Katalog dan rekomendasi laptop dengan struktur Binary Tree. Pencarian berdasarkan harga, prosesor, RAM, storage, dan VGA.',
    context: 'Katalog dan rekomendasi laptop yang mencari melalui struktur Binary Tree, berdasarkan harga, prosesor, RAM, storage, dan VGA.',
    highlights: ['Flask menyajikan katalog, halaman detail, dan formulir pencarian.', 'ProductBinaryTree menyimpan laptop berurutan menurut harga.', 'Setiap node yang dikunjungi diperiksa terhadap merek, prosesor, RAM, storage, VGA, dan rentang harga.'],
    flow: [
      'Data laptop dimasukkan ke ProductBinaryTree yang terurut menurut harga.',
      'Pencarian menelusuri pohon dan melewati cabang di luar rentang harga.',
      'Setiap node yang dikunjungi diperiksa terhadap spesifikasi yang diminta.',
    ],
    decisions: [
      { choice: 'Pohon diurutkan berdasarkan harga.', reason: 'Cabang di luar rentang harga bisa dipangkas tanpa ditelusuri.' },
    ],
    limits: [],
    tags: ['web'], stack: ['python', 'flask'], extras: ['Binary Tree'],
    repository: 'https://github.com/Hwarinn66/laptop-recomendation-with-binary-tree',
  },
  {
    id: 'dense-counter', name: 'Dense Object Counter', subtitle: 'Menghitung objek yang berdempetan.', kind: 'Computer vision', featured: false,
    description: 'Aplikasi penghitung objek padat dari snapshot kamera atau gambar. Area dibatasi ROI, gambar besar dipecah menjadi tile, setiap tile dideteksi, lalu hasilnya digabungkan menjadi satu hitungan.',
    context: 'Menghitung objek kecil yang berdempetan dari snapshot kamera atau gambar, ketika satu kali deteksi pada gambar penuh membuat objek terlalu kecil untuk dikenali.',
    highlights: ['Tiled inference 1024 px dengan overlap 15%, lalu NMS global agar objek di perbatasan tile tidak terhitung dua kali.', 'ROI membatasi area hitung dan dapat mengabaikan objek yang terpotong di tepi ROI.', 'Detector YOLO (Ultralytics) atau OpenCV, antarmuka web FastAPI, serta utilitas dataset, training, dan evaluasi hitungan.'],
    flow: [
      'Ambil snapshot dari kamera atau unggah gambar.',
      'Batasi area hitung dengan ROI.',
      'Pecah gambar menjadi tile 1024 px dengan overlap 15%.',
      'Deteksi setiap tile dengan YOLO (Ultralytics) atau detector OpenCV.',
      'Gabungkan hasil dengan NMS global, lalu hitung objek.',
    ],
    decisions: [
      { choice: 'Tiled inference, bukan satu deteksi pada gambar penuh.', reason: 'Objek kecil tetap cukup besar untuk dikenali di setiap tile.' },
      { choice: 'NMS global setelah hasil tile digabung.', reason: 'Objek di perbatasan tile tidak terhitung dua kali.' },
      { choice: 'Detector dapat diganti antara YOLO dan OpenCV.', reason: 'Skenario sederhana tidak memerlukan model deep learning.' },
    ],
    limits: ['Bobot model terlatih dan dataset tidak disertakan di repositori; tidak ada klaim akurasi.'],
    tags: ['ml', 'cv'], stack: ['python', 'fastapi', 'opencv'], extras: ['YOLO (Ultralytics)'],
    repository: 'https://github.com/Hwarinn66/Dense-Object-Counter',
  },
  {
    id: 'stock', name: 'Stock Recording', subtitle: 'Scan QR, stok berubah setelah disetujui.', kind: 'Aplikasi web, Laravel dan Next.js', featured: false,
    description: 'Sistem pencatatan stok gudang berbasis QR untuk komputer operator dan HP scanner. Scan hanya membuat transaksi pending; stok baru berubah setelah quantity diisi dan transaksi di-approve di komputer.',
    context: 'Pencatatan stok gudang berbasis QR untuk komputer operator dan HP scanner. Stok hanya berubah setelah transaksi hasil scan disetujui di komputer.',
    highlights: ['Lokasi bertingkat Ruangan → Blok → Rak → Posisi, dengan satu posisi untuk satu barang aktif.', 'QR UUID per barang dan label cetak, scanner kamera HP dengan mode IN/OUT, histori, adjustment stock opname, serta ekspor CSV.', 'Dua versi: Laravel 12 dengan Blade, dan Next.js + TypeScript dengan mysql2 tanpa ORM, validasi Zod, dan pembaruan pending melalui SSE.'],
    flow: [
      'Barang baru mendapat UUID QR dan label cetak.',
      'Operator membuka scanner di HP, memilih IN atau OUT, lalu memindai QR.',
      'Scan membuat transaksi PENDING; stok belum berubah.',
      'Komputer menerima transaksi pending, operator mengisi quantity, lalu approve atau cancel.',
      'Approve menjalankan SQL transaction yang memperbarui stok dan histori.',
    ],
    decisions: [
      { choice: 'Scan hanya membuat transaksi pending.', reason: 'Stok baru berubah setelah quantity diisi dan disetujui; cancel tidak mengubah stok tetapi histori tetap tersimpan.' },
      { choice: 'Stok dan histori diperbarui dalam satu SQL transaction.' },
      { choice: 'UNIQUE constraint di database sebagai pengaman terakhir.', reason: 'Dua request bersamaan tidak bisa memakai posisi rak yang sama.' },
    ],
    limits: ['Dirancang untuk gudang lokal dengan satu operator: komputer dan HP memakai backend yang sama di jaringan lokal, dan kamera HP memerlukan HTTPS dengan sertifikat tepercaya.'],
    tags: ['web'], stack: ['php', 'javascript'], extras: ['Laravel 12', 'Next.js', 'TypeScript', 'MySQL'],
    repository: 'https://github.com/Hwarinn66/Stock-Recording-Laravel', repositoryLabel: 'Versi Laravel',
    repositoryAlt: { label: 'Versi Next.js', url: 'https://github.com/Hwarinn66/Stock-Recording-TypeScript' },
  },
];

export type Technology = { id: TechId; name: string };

export const technologies: Technology[] = [
  { id: 'python', name: 'Python' },
  { id: 'tensorflow', name: 'TensorFlow' },
  { id: 'opencv', name: 'OpenCV' },
  { id: 'scikitlearn', name: 'scikit-learn' },
  { id: 'fastapi', name: 'FastAPI' },
  { id: 'flask', name: 'Flask' },
  { id: 'php', name: 'PHP' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'arduino', name: 'Arduino IDE' },
  { id: 'flutter', name: 'Flutter' },
  { id: 'git', name: 'Git' },
];

/**
 * Technologies grouped by field. `projects` lists where each group is demonstrated;
 * `evidence` is used instead when the proof is not a project (a certificate, for example).
 */
export type SkillGroup = { id: string; label: string; items: string[]; projects: string[]; evidence?: string };

export const skillGroups: SkillGroup[] = [
  { id: 'ml', label: 'Machine learning', items: ['Python', 'TensorFlow / Keras', 'scikit-learn', 'Ultralytics YOLO'], projects: ['innerself', 'smart-trash', 'face-recognition', 'dense-counter'] },
  { id: 'cv', label: 'Computer vision', items: ['OpenCV', 'MediaPipe Face Mesh'], projects: ['smart-trash', 'face-recognition', 'dense-counter'] },
  { id: 'api', label: 'Backend dan API', items: ['FastAPI', 'Flask', 'Flask-SocketIO'], projects: ['innerself', 'face-recognition', 'dense-counter', 'laptop'] },
  { id: 'web', label: 'Aplikasi web', items: ['PHP (CodeIgniter 4, Laravel 12)', 'JavaScript', 'TypeScript dan Next.js', 'MySQL'], projects: ['payroll', 'stock'] },
  { id: 'iot', label: 'IoT', items: ['ESP32 dengan Arduino IDE', 'HTTP dan mDNS', 'Blynk'], projects: ['smart-trash'] },
  { id: 'net', label: 'Jaringan', items: ['MikroTik RouterOS'], projects: [], evidence: 'Sertifikasi MTCNA' },
  { id: 'tools', label: 'Alat kerja', items: ['Git'], projects: [], evidence: 'Dipakai di semua repositori' },
];

/** Explored, not yet demonstrated in a published project. */
export const learning: string[] = ['Flutter'];

export const techName = (id: TechId) => technologies.find(t => t.id === id)?.name ?? id;
export const projectById = (id: string) => projects.find(p => p.id === id);
/** "Hwarinn66/Smart-Trash" from a GitHub URL. */
export const repoPath = (url: string) => url.replace(/^https:\/\/github\.com\//, '');
