// src/App.jsx
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import Dasboard from './Dashboard'
import AdminPanel from './components/AdminPanel'
import ProfilePage from './components/ProfilePage'
import Navbar from './components/Navbar'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme ? savedTheme === 'dark' : true
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
      if (!session) setCurrentTab('dashboard')
    })

    return () => subscription.unsubscribe()
  }, [])

  // 💡 PERBAIKAN UTAMA: PENGUNCI HISTORY BROWSER
  useEffect(() => {
    if (!session) return;

    window.history.pushState({ guard: true }, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState({ guard: true }, "", window.location.href);
      setShowLogoutModal(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [session]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false)
    await supabase.auth.signOut()
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
    // Dorong kembali state agar tumpukan terjaga kuat
    window.history.pushState({ guard: true }, '', window.location.href)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] dark:bg-[#0B0F17] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C99A2E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!session) {
    return <Auth session={session} />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 relative">
      <Navbar 
        session={session} 
        currentTab={currentTab}          
        setCurrentTab={setCurrentTab}    
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
      />

      <main className="transition-all duration-300">
        {currentTab === 'admin' && <AdminPanel session={session} />}
        {currentTab === 'dashboard' && <Dasboard session={session} />}
        {currentTab === 'profile' && <ProfilePage session={session} />}
      </main>

      {/* MODAL KONFIRMASI LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF9] dark:bg-[#151D2A] border border-[#E4DFD3] dark:border-slate-800 rounded-lg max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              Konfirmasi Keluar
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Kamu menekan tombol kembali. Apakah kamu ingin keluar dari akun?
            </p>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-xs font-mono tracking-wider uppercase rounded-md bg-red-600 hover:bg-red-700 text-white transition font-bold"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}