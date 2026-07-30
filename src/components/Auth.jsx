// src/components/Auth.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// Komponen halaman Login & Registrasi (email/password serta login Google)
export default function Auth({ session }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    if (session) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [session])

  // 1. Handler Auth Email & Password
  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert('Registrasi berhasil! Silakan cek email kamu jika verifikasi aktif.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        alert(error.message)
      } else {
        window.history.replaceState(null, '', window.location.pathname)
      }
    }

    setLoading(false)
  }

  // 2. Handler Login via Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) alert(error.message)
  }

  if (session) return null

  return (
    <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl min-h-[550px] bg-[#FDFCF9] rounded-md shadow-xl overflow-hidden flex flex-col md:flex-row border border-[#E4DFD3]">

        {/* PANEL KIRI: Form Login / Register */}
        <div className="w-full md:w-1/2 bg-[#20302A] p-8 md:p-10 flex flex-col justify-center items-center text-[#EDE9DE] relative">

          <div className="w-full max-w-sm mb-6">
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#9CB4A5]">
              {isSignUp ? 'Buat akun baru' : 'Masuk ke akun'}
            </span>
            <h2 className="font-serif text-3xl mt-1 text-white">
              {isSignUp ? 'Register' : 'Selamat datang'}
            </h2>
          </div>

          <form onSubmit={handleAuth} className="w-full max-w-sm space-y-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9CB4A5] mb-1">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-md text-[#1A1917] placeholder-slate-400 bg-[#FDFCF9] focus:outline-none focus:ring-2 focus:ring-[#C99A2E] transition text-sm border border-transparent"
              />
            </div>

            {/* Input Password + Toggle Show Password */}
            <div className="relative">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9CB4A5] mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 pr-14 rounded-md text-[#1A1917] placeholder-slate-400 bg-[#FDFCF9] focus:outline-none focus:ring-2 focus:ring-[#C99A2E] transition text-sm border border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[34px] text-[#9CB4A5] hover:text-white text-[10px] font-mono tracking-wide focus:outline-none"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Remember & Forgot Password */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#9CB4A5]">
                  <input type="checkbox" className="rounded text-[#C99A2E] focus:ring-0 bg-transparent border-[#4a6b57]" />
                  Ingat saya
                </label>
                <a href="#" className="text-[#9CB4A5] hover:text-white hover:underline">Lupa password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C99A2E] hover:bg-[#B3861F] active:scale-[0.98] text-[#20302A] font-bold tracking-wide rounded-md uppercase transition duration-200 mt-2 text-xs"
            >
              {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
            </button>
          </form>

          {/* Pembatas OR */}
          <div className="w-full max-w-sm flex items-center my-5">
            <div className="flex-1 border-t border-[#3B4E44]"></div>
            <span className="px-3 text-[10px] font-mono text-[#6B8874] tracking-widest">ATAU</span>
            <div className="flex-1 border-t border-[#3B4E44]"></div>
          </div>

          {/* Tombol Login via Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full max-w-sm py-2.5 bg-[#FDFCF9] hover:bg-white active:scale-[0.98] text-[#1A1917] font-semibold rounded-md transition duration-200 flex items-center justify-center gap-3 text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Masuk dengan Google
          </button>

          {/* Toggle Login / Register */}
          <p className="mt-6 text-xs text-[#9CB4A5]">
            {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-[#C99A2E] hover:text-[#D9AE55] ml-1"
            >
              {isSignUp ? 'Login di sini' : 'Daftar di sini'}
            </button>
          </p>
        </div>

        {/* PANEL KANAN: Ilustrasi */}
        <div className="hidden md:flex w-1/2 bg-[#FDFCF9] p-12 flex-col justify-center relative">
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#9CB4A5]">Todolist — Planner</span>

          <div className="mt-6 space-y-3">
            {[
              { done: true, label: 'Rancang wireframe onboarding' },
              { done: true, label: 'Review permintaan akses tim' },
              { done: false, label: 'Susun laporan mingguan' },
              { done: false, label: 'Rapat retrospektif proyek' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-[#E9E4D8]">
                <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 ${item.done ? 'bg-[#20302A] border-[#20302A] text-white' : 'border-slate-300'}`}>
                  {item.done && (
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none">
                      <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={`text-sm font-medium ${item.done ? 'line-through text-[#9CB4A5]' : 'text-[#1A1917]'}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <h3 className="mt-10 font-serif text-2xl text-[#1A1917]">
            Kelola tugas harianmu
          </h3>
          <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">
            Satu ruang kerja sederhana untuk merapikan pekerjaan, kuliah, dan urusan pribadi.
          </p>
        </div>

      </div>
    </div>
  )
}