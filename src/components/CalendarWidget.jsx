import { useState, useMemo } from 'react'
import { buildMonthMatrix, groupTodosByDate, MONTH_NAMES_ID, DAY_LABELS_ID } from '../utils/calendarHelpers'
import { getLocalDateString } from '../utils/dateHelpers'

export default function CalendarWidget({ todos, onTodoClick }) {
  const handleClick = (todo) => {
    if (onTodoClick) {
      onTodoClick(todo)
    } else {
      // Fallback: broadcast event supaya komponen lain (mis. Dashboard) bisa membuka todo ini
      window.dispatchEvent(new CustomEvent('todoapp:open-todo', { detail: { id: todo.id } }))
    }
  }

  const today = new Date()
  const todayStr = getLocalDateString(today)

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const tasksByDate = useMemo(() => groupTodosByDate(todos), [todos])
  const weeks = useMemo(
    () => buildMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  )

  const goToPrevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goToNextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const selectedTasks = tasksByDate[selectedDate] || []

  return (
    <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md shadow-sm space-y-4">
      <h3 className="text-sm font-serif text-slate-900 dark:text-white text-center">Kalender Tugas</h3>

      {/* NAVIGASI BULAN */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-1.5 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition"
          aria-label="Bulan sebelumnya"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4l-6 6 6 6" />
          </svg>
        </button>
        <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {MONTH_NAMES_ID[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition"
          aria-label="Bulan berikutnya"
        >
          <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 4l6 6-6 6" />
          </svg>
        </button>
      </div>

      {/* GRID TANGGAL */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_LABELS_ID.map(d => (
          <span key={d} className="text-[10px] font-mono uppercase text-slate-400 pb-1">{d}</span>
        ))}

        {weeks.flat().map((cell, idx) => {
          if (!cell.inMonth) {
            return (
              <div
                key={idx}
                className="aspect-square rounded-md"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(148,163,184,0.15) 3px, rgba(148,163,184,0.15) 4px)',
                }}
              />
            )
          }

          const dayTasks = tasksByDate[cell.dateStr] || []
          const hasTasks = dayTasks.length > 0
          const isToday = cell.dateStr === todayStr
          const isSelected = cell.dateStr === selectedDate

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(cell.dateStr)}
              className={`aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 text-xs transition-all
                ${isToday
                  ? 'bg-[#A83B32] text-white font-bold'
                  : isSelected
                  ? 'bg-[#3D5F49]/15 text-[#20302A] dark:text-white font-bold ring-1 ring-[#3D5F49]/40'
                  : hasTasks
                  ? 'font-bold text-slate-800 dark:text-slate-200 hover:bg-[#F5F3ED] dark:hover:bg-white/5'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-[#F5F3ED] dark:hover:bg-white/5'
                }`}
            >
              {cell.day}
              {hasTasks && !isToday && (
                <span className="w-1 h-1 rounded-full bg-[#C99A2E]"></span>
              )}
            </button>
          )
        })}
      </div>

      {/* DAFTAR TUGAS UNTUK TANGGAL TERPILIH */}
      <div className="pt-3 border-t border-[#E9E4D8] dark:border-[#3A3733] space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Tugas {selectedDate === todayStr ? 'Hari Ini' : selectedDate}
        </p>

        {selectedTasks.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">Tidak ada tugas di tanggal ini.</p>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map(t => {
              const isDone = t.status === 'Selesai' || t.is_completed
              return (
                <div
                  key={t.id}
                  onClick={() => handleClick(t)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleClick(t) }}
                  className="p-2.5 rounded-md bg-[#F5F3ED] dark:bg-[#211F1C]/60 border border-[#E9E4D8] dark:border-[#3A3733] flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-[#3D5F49]/40 hover:bg-[#3D5F49]/5 dark:hover:bg-[#3D5F49]/10 transition"
                >
                  <span className={`font-bold text-slate-800 dark:text-slate-200 truncate ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {t.title || t.judul}
                  </span>
                  <span className={`shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono ${
                    (t.priority || t.prioritas) === 'High' ? 'bg-[#A83B32]/10 text-[#A83B32]' :
                    (t.priority || t.prioritas) === 'Medium' ? 'bg-[#C99A2E]/10 text-[#A9791F]' : 'bg-[#3F7350]/10 text-[#3F7350]'
                  }`}>
                    {t.priority || t.prioritas || 'Medium'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}