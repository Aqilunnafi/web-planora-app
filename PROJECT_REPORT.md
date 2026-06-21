# Laporan Proyek: Planora - Web Productivity App

Planora adalah aplikasi manajemen tugas dan produktivitas berbasis web yang dirancang dengan estetika premium, fitur analitik yang cerdas, dan sistem bukti sosial (testimoni) yang dinamis. Laporan ini disusun untuk merangkum seluruh fungsionalitas aplikasi dan memberikan panduan bagi pengembangan versi mobile di masa depan.

## 1. Spesifikasi Teknologi (Tech Stack)

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (Custom Dark Mode & Glassmorphism)
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Charts**: Custom CSS-based Bar Charts dengan tooltip dinamis

### Backend & Database
- **Server**: Node.js & Express.js
- **Database**: SQLite (Relational Database)
- **Middleware**: CORS, Body Parser
- **Integrasi**: API RESTful untuk Tugas, Profil, Statistik, dan Testimoni

---

## 2. Fitur Utama Aplikasi

### A. Manajemen Tugas (Dashboard)
- **CRUD Tugas**: Pengguna dapat menambah, mengedit, menghapus, dan menandai tugas sebagai selesai.
- **Kategori Tugas**: Pengelompokan tugas berdasarkan prioritas atau jenis kegiatan.
- **Visual Feedback**: Progress bar otomatis yang menghitung tingkat penyelesaian tugas harian.

### B. Penjadwalan Khusus (Special Schedule)
- Fitur untuk menjadwalkan agenda penting di luar tugas rutin harian.
- Layout responsif yang menyesuaikan tampilan ikon di perangkat mobile untuk menghemat ruang.

### C. Analitik Produktivitas (Profile Page)
- **Grafik Mingguan**: Menampilkan tren penyelesaian tugas selama 7 hari terakhir.
- **Statistik Akurasi**: Menghitung persentase penyelesaian tugas secara real-time.
- **Profil Kustom**: Pengguna dapat mengubah foto profil, bio, dan pengaturan preferensi lainnya.

### D. Sistem Testimoni Dinamis
- **Formulir Ulasan**: Terintegrasi dalam bentuk Modal premium di halaman profil.
- **Landing Page Integration**: Menampilkan ulasan pengguna secara otomatis (fetching dari database) untuk meningkatkan kepercayaan calon pengguna.

### E. Pengalaman Pengguna (UX) Premium
- **Dark & Light Mode**: Transisi halus antar mode tampilan.
- **Glassmorphism Design**: Menggunakan efek blur transparan untuk elemen UI agar terlihat modern.
- **Responsive Layout**: Optimal untuk Desktop, Tablet, hingga Smartphone.

---

## 3. Struktur Database (Schema)

Aplikasi menggunakan tiga tabel utama dalam SQLite:
1.  **`users`**: Menyimpan kredensial, data bio, dan path foto profil.
2.  **`tasks`**: Menyimpan data tugas (judul, status, tanggal, user_id).
3.  **`testimonials`**: Menyimpan ulasan pengguna (content, role, rating, user_id) dengan relasi ke tabel `users` untuk menampilkan nama dan foto pemberi ulasan.

---

## 4. Panduan Pengembangan Versi Mobile

Untuk membantu pengembang dalam membuat versi mobile (React Native atau Flutter), berikut adalah poin-poin penting yang harus diperhatikan:

### Arsitektur API
- API yang sudah ada (`server/index.cjs`) sudah siap digunakan untuk mobile. Pengembang hanya perlu mengganti `localhost` dengan alamat IP server publik atau lokal yang bisa diakses perangkat mobile.

### UI/UX Mobile
- **Bottom Navigation**: Di versi web kita menggunakan sidebar/header. Untuk mobile, sangat disarankan menggunakan *Bottom Navigation Bar* untuk akses cepat ke Dashboard dan Profil.
- **Swipe Actions**: Implementasikan fitur geser (*swipe*) ke kiri untuk menghapus tugas atau ke kanan untuk menyelesaikan tugas.
- **Native Components**: Gunakan komponen native seperti `DatePicker` untuk pemilihan tanggal tugas agar lebih intuitif di layar sentuh.
- **Push Notifications**: Tambahkan layanan seperti Firebase Cloud Messaging (FCM) untuk mengirimkan pengingat tugas langsung ke perangkat pengguna.

---

## 5. Kesimpulan
Planora saat ini telah mencapai versi yang stabil dengan fitur produktivitas yang lengkap dan tampilan yang sangat menarik. Penambahan sistem testimoni dinamis memberikan nilai tambah yang besar bagi sisi pemasaran aplikasi. Proyek ini siap untuk dilanjutkan ke tahap produksi atau dikembangkan lebih lanjut ke platform mobile.
