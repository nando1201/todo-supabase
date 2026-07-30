// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Mengambil URL project Supabase dari environment variable (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// Mengambil Anon/Public API Key Supabase dari environment variable (.env)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Menampilkan nilai URL & Key di console untuk membantu debugging saat development
console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseAnonKey)

// Validasi: jika salah satu env variable belum diisi, hentikan aplikasi
// dengan pesan error yang jelas agar mudah diperbaiki.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau Anon Key belum terisi di file .env!')
}

/**
 * Instance client Supabase yang sudah terkonfigurasi.
 * Diekspor agar bisa dipakai di seluruh aplikasi (mis. untuk auth, query
 * database, upload file, dsb) tanpa perlu membuat client baru berulang kali.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)