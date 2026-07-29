//admin panel update pengguna paling aktif
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import {
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts'

const COLORS = ['#3D5F49', '#C99A2E', '#8C6A9C', '#A83B32']

export default function AdminPanel({ session }) {
  const [usersList, setUsersList] = useState([])
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])
  const [isFlushing, setIsFlushing] = useState(false)

  // Filter & Search Table State
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Presence State
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  // Fetch Data Callback
  const fetchAdminData = useCallback(async () => {
    setLoading(true)
    const { data: profiles } = await supabase.from('profiles').select('*')
    const { data: todosData } = await supabase.from('todos').select('*')

    const { data: activitiesData } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (activitiesData) {
      setRecentActivities(activitiesData)
    }

    if (profiles && todosData) {
      setTodos(todosData)
      const combinedUsers = profiles.map((user) => {
        const userTodos = todosData.filter((t) => t.user_id === user.id)
        const completedCount = userTodos.filter(
          (t) => t.is_completed || t.status === 'Selesai'
        ).length
        return {
          ...user,
          todo_count: userTodos.length,
          completed_count: completedCount,
          cat_count: new Set(userTodos.map((t) => t.category).filter(Boolean)).size,
        }
      })
      setUsersList(combinedUsers)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      fetchAdminData()
    })
  }, [fetchAdminData])

  // Data Calculations
  const totalUsers = usersList.length
  const totalTodos = todos.length
  const completedTodos = todos.filter(
    (t) => t.is_completed || t.status === 'Selesai'
  ).length
  const activeTodos = totalTodos - completedTodos
  const completionRate =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  const pieData = [
    { name: 'Aktif', value: activeTodos },
    { name: 'Selesai', value: completedTodos },
  ]

  const topUsersChart = [...usersList]
    .sort((a, b) => b.todo_count - a.todo_count)
    .slice(0, 5)

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const PROTECTED_EMAIL = import.meta.env.VITE_PROTECTED_EMAIL

  const toggleRole = async (userId, currentRole, targetEmail) => {
    if (targetEmail === PROTECTED_EMAIL) {
      alert('Peran pengguna ini dikunci dan tidak dapat diubah!')
      return
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        alert(`Gagal mengubah peran: ${error.message}`)
        return
      }

      setUsersList((prevUsers) =>
        prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value)
    setCurrentPage(1)
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return ''
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000)
    if (seconds < 60) return 'Baru saja'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} menit lalu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} jam lalu`
    return `${Math.floor(hours / 24)} hari lalu`
  }

  // Realtime Presence Listener
  useEffect(() => {
    if (!session?.user?.id) return

    const userId = session.user.id
    const channel = supabase.channel('online-users-admin', {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        try {
          const state = channel.presenceState()
          const onlineUserIds = new Set()

          Object.values(state).forEach((presences) => {
            if (Array.isArray(presences)) {
              presences.forEach((p) => {
                if (p?.user_id) onlineUserIds.add(p.user_id)
              })
            }
          })

          setOnlineUsers(onlineUserIds)
        } catch (err) {
          console.error('Error sync presence:', err)
        }
      })
      .on('presence', { event: 'join' }, () => {})
      .on('presence', { event: 'leave' }, () => {})

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
          user_id: userId,
        })
      }
    })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id])

  const handleExportLog = () => {
    if (!recentActivities || recentActivities.length === 0) {
      alert('Tidak ada log aktivitas untuk diexport.')
      return
    }

    const headers = ['ID', 'Judul Aktivitas', 'Waktu Dibuat']
    const csvRows = [
      headers.join(','),
      ...recentActivities.map((act) =>
        [
          `"${act.id || ''}"`,
          `"${(act.title || '').replace(/"/g, '""')}"`,
          `"${act.created_at || ''}"`,
        ].join(',')
      ),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)

    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `system_logs_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFlushCache = async () => {
    setIsFlushing(true)
    try {
      localStorage.clear()
      sessionStorage.clear()
      await fetchAdminData()
      alert('Cache berhasil dibersihkan dan data telah diperbarui!')
    } catch (err) {
      console.error('Gagal memproses flush cache:', err)
      alert('Terjadi kesalahan saat membersihkan cache.')
    } finally {
      setIsFlushing(false)
    }
  }

  const getWeeklyAnalytics = (todosList) => {
    const daysMap = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const today = new Date()

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(today.getDate() - (6 - i))
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: daysMap[d.getDay()],
        Tugas: 0,
        Selesai: 0,
      }
    })

    todosList.forEach((todo) => {
      if (!todo.created_at) return
      const todoDate = todo.created_at.split('T')[0]

      const dayObj = last7Days.find((d) => d.dateStr === todoDate)
      if (dayObj) {
        dayObj.Tugas += 1
        if (todo.is_completed || todo.status === 'Selesai') {
          dayObj.Selesai += 1
        }
      }
    })

    return last7Days.map(({ dayName, Tugas, Selesai }) => ({
      day: dayName,
      Tugas,
      Selesai,
    }))
  }

  const analyticsData = getWeeklyAnalytics(todos)

  return (
    <div className="min-h-screen bg-[#F5F3ED] dark:bg-[#1A1917] text-slate-800 dark:text-slate-200 pb-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* 1. WELCOME SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD3] dark:border-[#3A3733]">
          <div className="space-y-1">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#6B8874]">
              Panel administrasi
            </span>
            <h1 className="font-serif text-3xl text-slate-900 dark:text-white">
              Selamat datang, Admin
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
              Pantau performa sistem, aktivitas tugas pengguna, dan kesehatan infrastruktur secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-[#20302A] hover:bg-[#16241C] text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Menyinkronkan...' : 'Sinkronkan Data'}
            </button>
          </div>
        </div>

        {/* 2. SIX STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Total User', value: totalUsers, accent: '#3D5F49' },
            { title: 'User Online', value: onlineUsers.size, accent: '#10B981', isOnline: true },
            { title: 'Total Tugas', value: totalTodos, accent: '#3D5F49' },
            { title: 'Tugas Selesai', value: completedTodos, accent: '#3F7350' },
            { title: 'Tugas Aktif', value: activeTodos, accent: '#C99A2E' },
            { title: 'Completion Rate', value: `${completionRate}%`, accent: '#3D5F49' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] border-l-2 p-4 rounded-md shadow-sm space-y-2"
              style={{ borderLeftColor: stat.accent }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {stat.title}
                </span>
                {stat.isOnline && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <p className="text-2xl font-serif text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 3. CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Task Analytics */}
          <div className="lg:col-span-2 bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif text-slate-900 dark:text-white">
                  Analitik Tugas Harian
                </h3>
                <p className="text-xs text-slate-400">
                  Tren pembuatan vs penyelesaian tugas 7 hari terakhir
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3D5F49]"></span>
                  <span className="text-slate-500 dark:text-slate-400">Tugas Dibuat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C99A2E]"></span>
                  <span className="text-slate-500 dark:text-slate-400">Selesai</span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <defs>
                    <linearGradient id="colorTugas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D5F49" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3D5F49" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C99A2E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C99A2E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#211F1C', borderRadius: '6px', border: '1px solid #3A3733', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="Tugas" stroke="#3D5F49" fillOpacity={1} fill="url(#colorTugas)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Selesai" stroke="#C99A2E" fillOpacity={1} fill="url(#colorSelesai)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Status Pie Chart */}
          <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-serif text-slate-900 dark:text-white">
                Distribusi Status Tugas
              </h3>
              <p className="text-xs text-slate-400">Rasio status tugas aktif vs selesai</p>
            </div>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#211F1C', borderRadius: '6px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3D5F49]"></span> Aktif ({activeTodos})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C99A2E]"></span> Selesai ({completedTodos})
              </div>
            </div>
          </div>
        </div>

        {/* 4. SECONDARY SECTION (Leaderboard, Recent Activities, System Health) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Top Active Users Leaderboard */}
          <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-serif text-slate-900 dark:text-white">Pengguna Paling Aktif</h3>
                <span className="text-[10px] font-mono text-[#6B8874] dark:text-amber-500 font-bold bg-[#3D5F49]/10 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                  TOP 5
                </span>
              </div>
              <p className="text-xs text-slate-400">Peringkat pengguna dengan jumlah tugas terbanyak</p>
            </div>

            <div className="space-y-3 my-auto">
              {topUsersChart.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada data aktivitas pengguna.</p>
              ) : (
                topUsersChart.map((u, index) => {
                  const maxTodos = topUsersChart[0]?.todo_count || 1
                  const percent = Math.min(Math.round((u.todo_count / maxTodos) * 100), 100)
                  const name = u.full_name || u.email?.split('@')[0] || 'User'

                  return (
                    <div key={u.id || index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                              index === 0
                                ? 'bg-amber-500 text-white'
                                : index === 1
                                ? 'bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white'
                                : index === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-100 dark:bg-[#2A2823] text-slate-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={name}>
                            {name}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#3D5F49] dark:text-amber-500 shrink-0">
                          {u.todo_count} <span className="text-[10px] font-normal text-slate-400">tugas</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1A1917] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#C99A2E] dark:bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Card 2: Recent Activity Timeline */}
          <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md space-y-4 shadow-sm">
            <h3 className="text-sm font-serif text-slate-900 dark:text-white">Aktivitas Terbaru</h3>
            <div className="space-y-3 text-xs">
              {recentActivities.length === 0 ? (
                <p className="text-slate-400 italic">Belum ada aktivitas terbaru.</p>
              ) : (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 p-2.5 rounded-md bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E9E4D8] dark:border-[#3A3733]"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${act.color || 'bg-[#6B8874]'} mt-1.5 shrink-0`}></span>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{formatTimeAgo(act.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 3: Quick Actions & System Health */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md space-y-3 shadow-sm">
              <h3 className="text-sm font-serif text-slate-900 dark:text-white">Kesehatan Sistem</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Supabase DB</span>
                  <span className="text-[#3F7350]">Sehat</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-[#2A2823] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#3F7350] h-full w-[98%]"></div>
                </div>
                <div className="flex justify-between font-semibold pt-2">
                  <span>API Latency</span>
                  <span className="text-[#6B8874] font-mono">24ms</span>
                </div>
              </div>
            </div>

            <div className="bg-[#20302A] p-6 rounded-md text-white space-y-3 shadow-sm">
              <h3 className="text-sm font-serif">Aksi Cepat</h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  onClick={handleExportLog}
                  className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-md transition text-center"
                >
                  Export Log
                </button>
                <button
                  onClick={handleFlushCache}
                  disabled={isFlushing}
                  className="p-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-md transition text-center disabled:opacity-50"
                >
                  {isFlushing ? 'Clearing...' : 'Flush Cache'}
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* 5. USER MANAGEMENT TABLE */}
        <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] rounded-md shadow-xl overflow-hidden space-y-4">
          <div className="p-6 border-b border-[#E9E4D8] dark:border-[#3A3733] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-serif text-slate-900 dark:text-white">
                Manajemen Pengguna
              </h3>
              <p className="text-xs text-slate-400">
                Kelola akses, peran, dan aktivitas pengguna terdaftar
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Cari nama atau email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-3.5 py-2 rounded-md text-xs bg-slate-100 dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
              />
              <select
                value={roleFilter}
                onChange={handleRoleChange}
                className="px-3.5 py-2 rounded-md text-xs bg-slate-100 dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">Semua Peran</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F3ED] dark:bg-[#1A1917] border-b border-[#E9E4D8] dark:border-[#3A3733] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">USER</th>
                  <th className="py-4 px-6">EMAIL</th>
                  <th className="py-4 px-6">PERAN</th>
                  <th className="py-4 px-6 text-center">TOTAL TUGAS</th>
                  <th className="py-4 px-6 text-center">SELESAI</th>
                  <th className="py-4 px-6 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3A3733] text-xs font-medium">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isSelf = user.id === session?.user?.id
                    return (
                      <tr key={user.id} className="hover:bg-[#F5F3ED] dark:hover:bg-slate-800/40 transition">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-md bg-[#20302A] text-white font-bold flex items-center justify-center text-xs">
                              {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            {onlineUsers.has(user.id) && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#211F1C] rounded-full"></span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {user.full_name || 'User'} {isSelf && <span className="text-[10px] text-[#6B8874] ml-1">(Anda)</span>}
                            </span>
                            {onlineUsers.has(user.id) && (
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">● Online</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{user.email}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase ${
                              user.role === 'admin'
                                ? 'bg-[#3D5F49]/10 text-[#6B8874] border border-[#3D5F49]/20'
                                : 'bg-slate-500/10 text-slate-400'
                            }`}
                          >
                            {user.role || 'USER'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-slate-200">
                          {user.todo_count}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-[#3F7350]">
                          {user.completed_count}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!isSelf && user.email !== PROTECTED_EMAIL ? (
                            <button
                              onClick={() => toggleRole(user.id, user.role, user.email)}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-[#2A2823] hover:bg-[#2C4536] hover:text-white text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition"
                            >
                              Ubah Peran
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic font-mono">
                              {isSelf ? 'Akun Anda' : 'Terkunci'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-[#E9E4D8] dark:border-[#3A3733] flex items-center justify-between text-xs text-slate-400">
            <span>Halaman {currentPage} dari {totalPages || 1}</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#2A2823] disabled:opacity-50 transition"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentPage >= totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#2A2823] disabled:opacity-50 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}