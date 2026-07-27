export default function CategoryChips({ categoriesList, categoryFilter, setCategoryFilter, categoryCounts, totalTodos, onOpenCategoryModal }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 shrink-0">Kategori:</span>

      <button
        onClick={() => setCategoryFilter('ALL')}
        className={`px-4 py-2 rounded-md text-xs font-bold transition-all shrink-0 ${
          categoryFilter === 'ALL'
            ? 'bg-[#20302A] text-white'
            : 'bg-white dark:bg-[#2A2823] text-slate-600 dark:text-slate-300 border border-[#E4DFD3] dark:border-[#3A3733] hover:bg-[#F5F3ED]'
        }`}
      >
        Semua Kategori ({totalTodos})
      </button>

      {categoriesList.map(cat => (
        <button
          key={cat}
          onClick={() => setCategoryFilter(cat)}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
            categoryFilter.trim().toLowerCase() === cat.trim().toLowerCase()
              ? 'bg-[#20302A] text-white'
              : 'bg-white dark:bg-[#2A2823] text-slate-600 dark:text-slate-300 border border-[#E4DFD3] dark:border-[#3A3733] hover:bg-[#F5F3ED]'
          }`}
        >
          {cat} <span className="px-1.5 py-0.5 rounded-sm bg-black/10 dark:bg-white/10 text-[10px] font-mono">{categoryCounts[cat] || 0}</span>
        </button>
      ))}

      <button
        onClick={onOpenCategoryModal}
        className="px-4 py-2 rounded-md text-xs font-bold bg-[#3D5F49]/10 text-[#3D5F49] dark:text-[#9CB4A5] border border-[#3D5F49]/20 hover:bg-[#3D5F49]/20 transition shrink-0"
      >
        + Kategori Baru
      </button>
    </div>
  )
}
