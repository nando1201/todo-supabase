// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Tambahkan log ini untuk mengecek nilainya di Inspect Element > Console
console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau Anon Key belum terisi di file .env!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)