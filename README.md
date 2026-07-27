# Todo Supabase

Aplikasi Todo ini dibuat dengan React dan Supabase. Aplikasi ini membantu pengguna mencatat pekerjaan, mengatur deadline, memantau prioritas, dan melihat aktivitas tugas.

## Tentang aplikasi

Todo Supabase adalah aplikasi manajemen tugas yang memungkinkan:

- Menambahkan, mengedit, dan menghapus tugas.
- Menetapkan kategori, prioritas, dan deadline untuk setiap tugas.
- Menandai tugas sebagai selesai atau aktif.
- Melihat daftar tugas dengan deadline mendekat.
- Mengelola akun melalui autentikasi Supabase.
- Melihat statistik tugas dan aktivitas terbaru.
- Mengunggah lampiran file untuk tugas.

## Teknologi yang digunakan

- React 19: library frontend untuk UI interaktif.
- Vite: development server dan build tool cepat.
- Tailwind CSS: utility-first styling.
- Supabase: backend sebagai layanan untuk:
  - Authentication (login/register)
  - Database (penyimpanan data todos, profiles, activities)
  - Storage (upload file tugas)
- React Router DOM: navigasi antar halaman.
- Recharts: grafik statistik.
- Lucide React: ikon.
- clsx + tailwind-merge: manajemen kelas CSS.
- tw-animate-css: animasi tampilan ringan.
- ESLint: pengecekan kualitas kode.

## Fitur utama

- Autentikasi pengguna (signup, signin, signout)
- Dashboard tugas lengkap
- Filter tugas berdasarkan kategori
- Tambah/edit/delete tugas
- Deadline tugas ditampilkan dalam widget "Upcoming Deadlines"
- Statistik tugas: total, selesai, aktif, overdue
- Upload file lampiran tugas
- Tracking aktivitas pengguna
- Dark mode
- Halaman admin untuk melihat data pengguna dan tugas
- Halaman profil untuk mengelola akun
- Supabase Function opsional untuk email pengingat deadline

## Struktur proyek

- `src/main.jsx` - entry React dan render aplikasi.
- `src/App.jsx` - komponen utama aplikasi.
- `src/supabaseClient.js` - inisialisasi Supabase client.
- `src/hooks/useTodos.js` - logika fetch, CRUD, upload file, dan aktivitas.
- `src/components/` - komponen UI seperti Navbar, Dashboard, Profile, AdminPanel, dll.
- `src/utils/` - helper fungsi tanggal, kalender, dan statistik.
- `supabase/functions/send-deadline-emails/index.ts` - edge function Supabase untuk email pengingat deadline.

## Cara menjalankan aplikasi

1. Clone repository:

```bash
git clone <repo-url>
cd todo-supabase
```

2. Install dependensi:

```bash
npm install
```

3. Buat file `.env` di root proyek dengan konten:

```env
VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_PROTECTED_EMAIL=<your-admin-email>
VITE_RESEND_API_KEY=<your-resend-api-key>
```

4. Jalankan development server:

```bash
npm run dev
```

5. Buka browser ke:

```bash
http://localhost:5173
```

## Build produksi

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Supabase Function untuk email deadline

Aplikasi ini juga menyediakan fungsi Supabase untuk mengirim email pengingat otomatis jika tugas memiliki deadline hari ini.

### File fungsi

- `supabase/functions/send-deadline-emails/index.ts`

### Environment variables untuk fungsi

- `RESEND_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### Menjalankan fungsi lokal

```bash
supabase functions serve send-deadline-emails
```

### Menjadwalkan email otomatis

1. Deploy fungsi ke Supabase:

```bash
supabase functions deploy send-deadline-emails
```

2. Buat scheduler Supabase atau cron job eksternal untuk memanggil endpoint fungsi sekali sehari.

## Tips penggunaan

- Gunakan form tugas untuk memasukkan judul, deskripsi, kategori, prioritas, dan tanggal deadline.
- Periksa widget `Upcoming Deadlines` untuk melihat tugas yang harus segera diselesaikan.
- Gunakan fitur admin untuk memantau data pengguna dan tugas.
- Gunakan halaman profil untuk memperbarui data akun.

## Catatan penting

- Jangan commit file `.env` ke GitHub.
- Pastikan tabel Supabase (`todos`, `profiles`, `activities`) sudah dikonfigurasi sesuai kebutuhan aplikasi.
- Variabel `VITE_PROTECTED_EMAIL` dan `VITE_RESEND_API_KEY` hanya dibutuhkan jika menggunakan fitur email atau admin.

## Pengembangan lanjutan

Beberapa fitur yang bisa ditambahkan:

- reminder email yang terjadwal otomatis setiap hari
- push notification browser
- tampilan mobile responsive lebih baik
- laporan mingguan tugas
- sistem prioritas dan pengelompokan tugas lebih lengkap
