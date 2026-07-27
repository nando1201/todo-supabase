export default function UpcomingDeadlines({ upcomingList, todayStr, tomorrowStr, onTodoClick }) {
  const handleClick = (todo) => {
    if (onTodoClick) {
      onTodoClick(todo)
    } else {
      // Fallback: broadcast event supaya komponen lain (mis. Dashboard) bisa membuka todo ini
      window.dispatchEvent(new CustomEvent('todoapp:open-todo', { detail: { id: todo.id } }))
    }
  }

  return (
    <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-serif text-slate-900 dark:text-white">
          Tenggat Waktu Mendekati
        </h3>
        <span className="text-xs font-bold text-[#6B8874] bg-[#3D5F49]/10 px-2 py-0.5 rounded-md">
          Segera
        </span>
      </div>

      <div className="space-y-3">
        {upcomingList.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            Tidak ada deadline dekat.
          </p>
        ) : (
          upcomingList.map(t => {
            const rawDueDate = String(t.due_date || t.duedate || '').split('T')[0]

            let dateBadge = rawDueDate
            let badgeColor = 'bg-[#3D5F49]/10 text-[#6B8874] border-[#3D5F49]/20'

            if (rawDueDate === todayStr) {
              dateBadge = 'Hari Ini'
              badgeColor = 'bg-[#C99A2E]/10 text-[#A9791F] border-[#C99A2E]/20'
            } else if (rawDueDate === tomorrowStr) {
              dateBadge = 'Besok'
              badgeColor = 'bg-[#3D5F49]/10 text-[#6B8874] border-[#3D5F49]/20'
            } else if (rawDueDate < todayStr) {
              dateBadge = 'Terlambat'
              badgeColor = 'bg-[#A83B32]/10 text-[#A83B32] border-[#A83B32]/20'
            }

            return (
              <div
                key={t.id}
                onClick={() => handleClick(t)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') handleClick(t) }}
                className="p-3.5 rounded-md bg-[#F5F3ED] dark:bg-[#211F1C]/60 border border-[#E4DFD3]/60 dark:border-[#3A3733] flex items-center justify-between text-xs cursor-pointer hover:border-[#3D5F49]/40 hover:bg-[#3D5F49]/5 dark:hover:bg-[#3D5F49]/10 transition"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {t.title || t.judul}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold font-mono border ${badgeColor}`}>
                      {dateBadge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rawDueDate}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  (t.priority || t.prioritas) === 'High' ? 'text-[#A83B32] bg-[#A83B32]/10' : 'text-slate-400 bg-slate-500/10'
                }`}>
                  {t.priority || t.prioritas || 'Medium'}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}