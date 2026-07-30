import TodoCard from './TodoCard'
import Pagination from './Pagination'

// Komponen daftar tugas beserta pagination
export default function TodoList({
  loading,
  currentTodos,
  filteredCount,
  indexOfFirstItem,
  indexOfLastItem,
  currentPage,
  totalPages,
  setCurrentPage,
  onToggleStatus,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-serif text-slate-900 dark:text-white">Daftar Tugas ({filteredCount})</h3>
        <span className="text-xs font-mono text-slate-400">
          {filteredCount > 0 ? indexOfFirstItem + 1 : 0}–{Math.min(indexOfLastItem, filteredCount)} dari {filteredCount}
        </span>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-12 rounded-md text-center text-slate-400 text-xs">
          Memuat tugas workspace...
        </div>
      ) : currentTodos.length === 0 ? (
        <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-12 rounded-md text-center space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada tugas ditemukan</p>
          <p className="text-xs text-slate-400">Coba ubah filter pencarian atau buat tugas baru.</p>
        </div>
      ) : (
        currentTodos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggleStatus={onToggleStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
    </div>
  )
}