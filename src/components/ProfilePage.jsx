import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function ProfilePage({ session }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  

  useEffect(() => {
  if (session?.user) {
    queueMicrotask(() => {
      setEmail(session.user.email || '')
    })

    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) setName(data.full_name || '')
      })
  }
}, [session])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('id', session.user.id)

    if (error) alert('Gagal memperbarui profil: ' + error.message)
    else alert('Profil berhasil diperbarui!')

    setLoading(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi kata sandi baru tidak cocok!')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) alert('Gagal ubah kata sandi: ' + error.message)
    else {
      alert('Kata sandi berhasil diubah!')
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
    }
    setLoading(false)
  }

  const handleDeleteAccount = async (e) => {
    if (e && e.preventDefault) e.preventDefault()

    // 1. Cek metode login pengguna (Password vs Google/OAuth/Magic Link)
    const provider = session?.user?.app_metadata?.provider || 'email'
    const isPasswordUser = provider === 'email' // True jika login pakai Email & Password biasa

    // 2. Validasi Konfirmasi
    if (isPasswordUser) {
      // Jika login biasa -> Minta Password
      if (!confirmPassword) {
        alert('Silakan masukkan kata sandi Anda untuk konfirmasi penghapusan akun.')
        return
      }

      // Verifikasi kata sandi
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: confirmPassword,
      })

      if (signInError) {
        alert('Kata sandi salah! Konfirmasi penghapusan akun gagal.')
        return
      }
    } else {
      // Jika login via Google / Magic Link -> Minta konfirmasi ketik "HAPUS"
      const confirmText = prompt(
        `Karena Anda masuk menggunakan ${provider.toUpperCase()}, ketik 'HAPUS' untuk mengonfirmasi penghapusan akun:`
      )

      if (confirmText !== 'HAPUS') {
        alert('Konfirmasi dibatalkan atau teks tidak sesuai.')
        return
      }
    }

    // 3. Eksekusi Hapus Akun via RPC Supabase
    try {
      const { error: deleteError } = await supabase.rpc('delete_user_account')

      if (deleteError) {
        alert(`Gagal menghapus akun: ${deleteError.message}`)
        return
      }

      await supabase.auth.signOut()
      alert('Akun Anda telah berhasil dihapus secara permanen.')
    } catch (err) {
      console.error('Error deleting account:', err.message || err)
    }
  }

  

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Profile
        </h1>

        {/* 1. Profile Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Profile Information
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Update your account's profile information and email address.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider transition"
            >
              SAVE
            </button>
          </form>
        </div>

        {/* 2. Update Password */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Update Password
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ensure your account is using a long, random password to stay secure.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider transition"
            >
              SAVE
            </button>
          </form>
        </div>

        {/* 3. Delete Account */}
        {session?.user?.app_metadata?.provider === 'email' ? (
          // Tampilan Input Password (untuk user dengan kata sandi)
          <div className="space-y-2">
            <label className="text-xs text-slate-500">Masukkan Kata Sandi Konfirmasi:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Kata sandi Anda"
              className="w-full px-3 py-2 text-xs border rounded-md"
            />
          </div>
        ) : (
          // Informasi untuk user Google / OAuth / Magic Link
          <p className="text-xs text-slate-500 italic">
            Anda terhubung menggunakan {session?.user?.app_metadata?.provider?.toUpperCase()}. Anda akan diminta mengonfirmasi teks saat menekan tombol di bawah.
          </p>
        )}

        <button
          onClick={handleDeleteAccount}
          className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-md"
        >
          Hapus Akun Permanen
        </button>
      </div>
    </div>
  )
}