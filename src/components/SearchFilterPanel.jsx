export default function SearchFilterPanel({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  categoryFilter, priorityFilter, setPriorityFilter,
  onResetFilters,
}) {
  const hasActiveFilter = searchTerm || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL'

  return (
    <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-5 rounded-md shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Pencarian & Filter
        </h3>
        {hasActiveFilter && (
          <button
            onClick={onResetFilters}
            className="text-xs font-bold text-[#3D5F49] hover:underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Cari tugas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] transition"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] transition font-medium"
        >
          <option value="ALL">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Selesai">Selesai</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] transition font-medium"
        >
          <option value="ALL">Semua Prioritas</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>
    </div>
  )
}
