import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { getDateStats } from '../utils/dateHelpers'
import UpcomingDeadlines from './UpcomingDeadlines'
import logo from '../assets/logo.svg'

export default function Navbar({ session, currentTab, setCurrentTab, isDarkMode, setIsDarkMode }) {
  const [profile, setProfile] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Notifikasi Tenggat Waktu (Bell)
  const [notifTodos, setNotifTodos] = useState([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    if (session?.user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => setProfile(data))
    }
  }, [session, currentTab])

  // Ambil data tugas untuk notifikasi tenggat waktu
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchDeadlineTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('due_date', { ascending: true })

      if (!error && data) {
        setNotifTodos(data)
      }
    }

    fetchDeadlineTodos()
  }, [session, currentTab])

  const { todayStr, tomorrowStr, upcomingList } = getDateStats(notifTodos)

  const handleNotifTodoClick = (todo) => {
    setCurrentTab('dashboard')
    setIsNotifOpen(false)
    // Kasih waktu Dashboard buat mount/render dulu sebelum modal dibuka
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('todoapp:open-todo', { detail: { id: todo.id } }))
    }, 50)
  }

  // Lacak status online pengguna ke Supabase Presence
  useEffect(() => {
    if (!session?.user?.id) return

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: session.user.id,
        },
      },
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
          user_id: session.user.id,
        })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  // Menutup dropdown profile saat klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const nameInitial = profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#1A1917]/95 border-b border-[#E4DFD3] dark:border-[#3A3733] px-4 sm:px-6 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          {/* Logo & Brand Name */}
          <div 
            onClick={() => {
              setCurrentTab('dashboard')
              setIsMobileMenuOpen(false)
            }} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img 
              src={logo} 
              alt="TugasKu Logo" 
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="font-serif font-bold text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">
              TugasKu
            </span>
          </div>

          {/* TAB NAVIGASI DESKTOP */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-md border border-[#E4DFD3] dark:border-[#3A3733]">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>

            {/* BUTTON CATEGORIES DESKTOP */}
            <button
              onClick={() => setCurrentTab('categories')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'categories'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Categories
            </button>

            {/* BUTTON CALENDAR DESKTOP */}
            <button
              onClick={() => setCurrentTab('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Calendar
            </button>

            {profile?.role === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-[#2C4536] text-white shadow-sm shadow-[#3D5F49]/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Panel Admin
              </button>
            )}
          </div>
        </div>

        {/* Dark Mode & Profile Control */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-[#E4DFD3] dark:border-slate-700/50"
          >
            {isDarkMode ? 'Dark' : 'Light'}
          </button>

          <div className="hidden sm:block h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

          {/* Bell Notifikasi Tenggat Waktu */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-[#E4DFD3] dark:hover:border-slate-700"
              aria-label="Notifikasi Tenggat Waktu"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {upcomingList.length > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-[3px] flex items-center justify-center rounded-full bg-[#A83B32] text-white text-[9px] font-bold font-mono">
                  {upcomingList.length > 9 ? '9+' : upcomingList.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[320px] sm:w-[380px] max-h-[70vh] overflow-y-auto z-50 shadow-2xl rounded-md">
                <UpcomingDeadlines upcomingList={upcomingList} todayStr={todayStr} tomorrowStr={tomorrowStr} onTodoClick={handleNotifTodoClick} />
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-[#E4DFD3] dark:hover:border-slate-700"
            >
              <div className="relative">
                <div className="w-7 h-7 bg-[#20302A] text-[#C99A2E] font-serif rounded-md flex items-center justify-center text-sm">
                  {nameInitial}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#1A1917] rounded-full"></span>
              </div>

              <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200">
                {profile?.full_name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {/* Profile Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] rounded-lg shadow-2xl z-50 p-2 space-y-1 ">
                <div className="p-3 border-b border-[#E9E4D8] dark:border-[#3A3733]">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    MASUK SEBAGAI
                    <span className="text-[9px] text-emerald-500 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online
                    </span>
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                    {profile?.full_name || 'Administrator'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {session?.user?.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentTab('profile')
                    setIsOpen(false)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                >
                  Profil Saya
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU EXTENSION */}
      {isMobileMenuOpen && (
        <div className="md:hidden pt-3 pb-2 space-y-2 border-t border-[#E4DFD3]/60 dark:border-[#3A3733] mt-3">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => {
                setCurrentTab('dashboard')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-[#2C4536] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Dashboard
            </button>

            {/* BUTTON CATEGORIES MOBILE */}
            <button
              onClick={() => {
                setCurrentTab('categories')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'categories'
                  ? 'bg-[#2C4536] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Categories
            </button>

            {/* BUTTON CALENDAR MOBILE */}
            <button
              onClick={() => {
                setCurrentTab('calendar')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'calendar'
                  ? 'bg-[#2C4536] text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Calendar
            </button>

            {profile?.role === 'admin' && (
              <button
                onClick={() => {
                  setCurrentTab('admin')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'admin'
                    ? 'bg-[#2C4536] text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Panel Admin
              </button>
            )}

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <span>Mode Tampilan</span>
              <span>{isDarkMode ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}