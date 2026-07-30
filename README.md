# TugasKu

TugasKu adalah aplikasi manajemen tugas berbasis React dan Supabase. Aplikasi ini dirancang untuk membantu pengguna mencatat pekerjaan, mengatur deadline, memantau prioritas, dan melihat progres tugas secara lebih mudah.

## Tentang aplikasi

TugasKu memungkinkan pengguna untuk:

- Mendaftar, masuk, dan keluar dengan autentikasi Supabase.
- Menambahkan tugas baru dengan judul, deskripsi, kategori, prioritas, tanggal deadline, dan lampiran file.
- Mengedit dan menghapus tugas yang sudah dibuat.
- Menandai tugas sebagai selesai atau kembali aktif.
- Melihat tugas yang deadline-nya mendekat melalui widget "Upcoming Deadlines".
- Melihat statistik tugas seperti total tugas, selesai, aktif, dan tugas melebihi deadline.
- Melacak aktivitas pengguna dan melihat riwayat perubahan tugas.
- Mengelola akun pengguna dari halaman profil.
- Mengakses Panel Admin untuk melihat data pengguna dan tugas (jika memiliki peran admin).

## Teknologi yang digunakan

- React 19
- Vite
- Tailwind CSS
- Supabase (`@supabase/supabase-js`)
- React Router DOM
- Recharts
- Lucide React
- clsx
- tailwind-merge
- tw-animate-css
- ESLint

## Fitur utama

- Autentikasi pengguna (signup, signin, signout)
- CRUD tugas (buat, baca, ubah, hapus)
- Kategori tugas
- Prioritas tugas
- Pengaturan deadline tugas
- Lampiran file tugas
- Filter tugas dan pencarian
- Widget "Upcoming Deadlines"
- Statistik tugas dan ringkasan aktivitas
- Halaman profil pengguna
- Halaman admin untuk memantau pengguna dan tugas
- Notifikasi / indikator status tugas selesai atau aktif
- Integrasi Supabase Realtime untuk data admin

## Struktur proyek

- `src/main.jsx` - entry point aplikasi React.
- `src/App.jsx` - komponen utama yang mengatur routing dan state global.
- `src/supabaseClient.js` - inisialisasi Supabase client dengan URL dan anon key.
- `src/hooks/useTodos.js` - hooks khusus untuk mengambil data, membuat, memperbarui, dan menghapus tugas.
- `src/components/` - kumpulan komponen UI aplikasi, seperti:
  - `Navbar.jsx`
  - `Dashboard.jsx`
  - `TodoList.jsx`
  - `TodoCard.jsx`
  - `TodoDetailModal.jsx`
  - `ProfilePage.jsx`
  - `AdminPanel.jsx`
  - `CategoriesPage.jsx`
  - `CalendarPage.jsx`
  - `StatsCards.jsx`
  - `UpcomingDeadlines.jsx`
  - `RecentActivity.jsx`
- `src/components/modals/` - modal untuk form tugas dan kategori.
- `src/hooks/` - custom hooks untuk logika aplikasi.
- `src/utils/` - helper untuk tanggal, kalender, dan statistik.
- `supabase/functions/send-deadline-emails/index.ts` - fungsi Supabase untuk mengirim email pengingat deadline.

## Cara memasang dan menjalankan

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
VITE_PROTECTED_EMAIL=<admin-email-yang-dikunci>
```

4. Jalankan development server:

```bash
npm run dev
```

5. Buka browser:

```bash
http://localhost:5173
```

## Skrip npm

- `npm run dev` - jalankan server development.
- `npm run build` - build produksi.
- `npm run preview` - preview hasil build.
- `npm run lint` - jalankan ESLint.

## Supabase Function (opsional)

TugasKu menyediakan fungsi Supabase untuk mengirim email pengingat tugas yang deadline-nya hari ini.

### Lokasi fungsi

- `supabase/functions/send-deadline-emails/index.ts`

### Environment variables untuk fungsi

- `GMAIL_USER` - alamat Gmail pengirim.
- `GMAIL_APP_PASS` - app password Gmail.
- `SUPABASE_URL` - URL Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` - service role key Supabase.

### Menjalankan fungsi lokal

```bash
supabase functions serve send-deadline-emails
```

### Deploy fungsi

```bash
supabase functions deploy send-deadline-emails
```

### Menjadwalkan pengiriman email

Gunakan scheduler Supabase atau cron job eksternal untuk memanggil endpoint fungsi sekali sehari.

## Catatan penting

- Jangan commit file `.env` ke Git.
- Pastikan tabel Supabase `todos`, `profiles`, dan `activities` sudah dibuat.
- `VITE_PROTECTED_EMAIL` berguna untuk mengunci perubahan peran admin tertentu.

## Ringkasannya

TugasKu adalah aplikasi Todo lengkap dengan autentikasi, manajemen tugas, statistik, dan admin panel. Aplikasi ini cocok untuk belajar React + Supabase dan sebagai basis untuk dikembangkan menjadi sistem task management yang lebih lengkap.
