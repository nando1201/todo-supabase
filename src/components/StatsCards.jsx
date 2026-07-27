export default function StatsCards({ progressPercent, todayTasksCount, completedTodos, activeTodos, overdueTodos, categoriesCount }) {
  const stats = [
    { title: 'Progress %', value: `${progressPercent}%`, accent: '#3D5F49', trend: 'Total Selesai' },
    { title: "Today's Tasks", value: todayTasksCount, accent: '#3D5F49', trend: 'Jatuh tempo hari ini' },
    { title: 'Completed', value: completedTodos, accent: '#3F7350', trend: 'Tugas selesai' },
    { title: 'Pending', value: activeTodos, accent: '#C99A2E', trend: 'Masih berjalan' },
    { title: 'Overdue', value: overdueTodos, accent: '#A83B32', trend: 'Terlambat' },
    { title: 'Categories', value: categoriesCount, accent: '#3D5F49', trend: 'Kategori aktif' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] border-l-2 p-5 rounded-md shadow-sm hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
          style={{ borderLeftColor: stat.accent }}
        >
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{stat.title}</span>
          <div className="mt-4 space-y-1">
            <p className="text-2xl font-serif text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] font-semibold text-slate-400">{stat.trend}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
