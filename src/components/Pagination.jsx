// Komponen navigasi halaman (pagination) untuk daftar tugas
export default function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg text-xs font-bold bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-600 dark:text-slate-300 hover:bg-[#F1F5F2] dark:hover:bg-[#101A14]/30 hover:text-[#2C4536] transition disabled:opacity-40 disabled:hover:bg-transparent"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-8 h-8 rounded-md text-xs font-extrabold transition ${
              currentPage === page
                ? 'bg-[#2C4536] text-white shadow-md shadow-[#3D5F49]/30'
                : 'bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-600 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg text-xs font-bold bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-600 dark:text-slate-300 hover:bg-[#F1F5F2] dark:hover:bg-[#101A14]/30 hover:text-[#2C4536] transition disabled:opacity-40 disabled:hover:bg-transparent"
      >
        Next →
      </button>
    </div>
  )
}