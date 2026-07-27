import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function RecentActivity({ session }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🔍 Cek apakah session masuk ke komponen
    console.log("RecentActivity Session:", session)

    if (!session?.user?.id) {
      console.log("Session user belum siap/undefined")
      return
    }

    const fetchActivities = async () => {
      try {
        setLoading(true)
        console.log("Memulai Fetch Activities untuk User ID:", session.user.id)

        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) {
          console.error('Error Supabase:', error.message)
        } else {
          console.log('Data Aktivitas Ditemukan:', data)
          setActivities(data || [])
        }
      } catch (err) {
        console.error('Error Catch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Realtime Listener
    const channel = supabase
      .channel('public:activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new, ...prev.slice(0, 4)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user?.id]) // 👈 Gunakan session.user.id sebagai dependency!

  // Helper Waktu Relatif
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

  return (
    <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md shadow-sm space-y-4">
      <h3 className="text-sm font-serif text-slate-900 dark:text-white">Aktivitas Terbaru</h3>

      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-slate-400">Memuat aktivitas...</p>
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada aktivitas terbaru.</p>
        ) : (
          activities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-md bg-[#F5F3ED] dark:bg-[#211F1C]/60 border border-[#E9E4D8] dark:border-[#3A3733] flex items-start gap-3 text-xs"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${act.color || 'bg-indigo-500'} mt-1.5 shrink-0`}></span>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                <p className="text-[10px] text-slate-400 font-mono">{formatTimeAgo(act.created_at)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}