import { useState } from 'react'
import TodoDetailModal from './TodoDetailModal'

export default function TodoCard({ 
  todo, 
  onToggleStatus, 
  onEdit, 
  onDelete,
  onDuplicate,
  onToggleChecklist,
  onViewDetail
}) {
  const [showViewModal, setShowViewModal] = useState(false)

  // 1. Ambil data checklist terbaru dari props
  const incomingChecklist = todo.checklist || todo.subtasks || []

  // 2. State untuk menyimpan checklist lokal dan melacak checklist sebelumnya dari props
  const [prevChecklist, setPrevChecklist] = useState(incomingChecklist)
  const [localChecklist, setLocalChecklist] = useState(incomingChecklist)

  // 3. Jika props checklist dari parent berubah, perbarui state secara synchronous SAAT RENDER (Tanpa useEffect)
  if (prevChecklist !== incomingChecklist) {
    setPrevChecklist(incomingChecklist)
    setLocalChecklist(incomingChecklist)
  }

  const isDone = todo.status === 'Selesai' || todo.is_completed

  const handleOpenDetail = () => {
    if (onViewDetail) {
      onViewDetail(todo)
    } else {
      setShowViewModal(true)
    }
  }

  // Handler toggle checklist
  const handleToggleChecklist = (todoId, itemId) => {
    setLocalChecklist(prevItems => 
      prevItems.map((item, idx) => {
        const currentId = item.id !== undefined ? item.id : idx
        if (currentId === itemId) {
          const currentDone = Boolean(item.is_completed || item.completed || item.status === 'Selesai')
          return {
            ...item,
            is_completed: !currentDone,
            completed: !currentDone,
            status: !currentDone ? 'Selesai' : 'Belum Selesai'
          }
        }
        return item
      })
    )

    if (onToggleChecklist) {
      onToggleChecklist(todoId, itemId)
    }
  }

  // Ekstraksi Properti Utamanya
  const title = todo.title || todo.judul || 'Tanpa Judul'
  const priority = todo.priority || todo.prioritas || 'Medium'
  const category = todo.category || todo.kategori || 'General'
  const description = todo.description || todo.deskripsi
  const fileUrl = todo.file_url || todo.lampiran || todo.file || todo.attachment

  // Menambahkan todo.reference_link & variasi properti link lainnya
  const rawLink = todo.reference_link || todo.reference_url || todo.url || todo.link || todo.url_link || todo.link_url || todo.link_reference
  const urlLink = (typeof rawLink === 'string' && rawLink.trim() !== '') ? rawLink.trim() : null
  
  // Ekstraksi Tenggat Waktu & Jam
  const dueDate = todo.due_date || todo.duedate
  const dueTime = todo.due_time || todo.duetime || todo.time

  // Format Tanggal + Jam yang Andal
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return '—'

    let rawDateString = dateStr
    
    if (timeStr && typeof dateStr === 'string' && !dateStr.includes('T')) {
      const cleanDate = dateStr.split(' ')[0] 
      rawDateString = `${cleanDate}T${timeStr}`
    }

    const date = new Date(rawDateString)
    if (isNaN(date.getTime())) {
      return timeStr ? `${dateStr} ${timeStr}` : dateStr
    }
    
    const formattedDate = date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    let formattedTime = ''
    if (timeStr) {
      formattedTime = timeStr.slice(0, 5)
    } else if (typeof rawDateString === 'string' && rawDateString.includes('T')) {
      formattedTime = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace('.', ':')
    }

    return formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate
  }

  // Perhitungan Checklist & Progress Bar
  const totalChecklist = localChecklist.length
  const completedChecklist = localChecklist.filter(item => item.is_completed || item.completed || item.status === 'Selesai').length
  const checklistPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0

  const currentTodo = {
    ...todo,
    reference_link: urlLink,
    url: urlLink,
    checklist: localChecklist,
    subtasks: localChecklist
  }

  return (
    <>
      {/* CARD COMPONENT */}
      <div
        className={`group bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-5 rounded-md shadow-sm hover:shadow-xl hover:border-[#3D5F49]/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDone ? 'opacity-60 bg-[#F5F3ED]/50 dark:bg-[#211F1C]/30' : ''
        }`}
      >
        <div className="flex items-start gap-4 w-full">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggleStatus && onToggleStatus(todo.id, todo.status)}
            className="w-5 h-5 rounded-md text-[#2C4536] focus:ring-[#3D5F49] border-slate-300 mt-1 cursor-pointer flex-shrink-0"
          />
          <div className="space-y-1.5 w-full">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                {title}
              </h4>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono ${
                priority === 'High' ? 'bg-[#A83B32]/10 text-[#A83B32] border border-[#A83B32]/20' :
                priority === 'Medium' ? 'bg-[#C99A2E]/10 text-[#A9791F] border border-[#C99A2E]/20' : 'bg-[#3F7350]/10 text-[#3F7350] border border-[#3F7350]/20'
              }`}>
                {priority}
              </span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#3D5F49]/10 text-[#6B8874] border border-[#3D5F49]/20 font-mono">
                {category}
              </span>
            </div>

            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                {description}
              </p>
            )}

            {/* RINGKASAN CHECKLIST & PROGRESS BAR */}
            {totalChecklist > 0 && (
              <div className="pt-1 max-w-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
                  <span>Checklist: {completedChecklist}/{totalChecklist}</span>
                  <span className="font-bold">{checklistPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#3A3733] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#3D5F49] transition-all duration-300"
                    style={{ width: `${checklistPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* URL LINK & LAMPIRAN */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {urlLink && (
                <a
                  href={urlLink.startsWith('http') ? urlLink : `https://${urlLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 transition truncate max-w-[200px]"
                >
                  🌐 {urlLink.replace(/^https?:\/\//, '')}
                </a>
              )}

              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#F5F3ED] dark:bg-[#2A2823] hover:bg-[#3D5F49]/10 text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-[#E4DFD3] dark:border-[#3A3733] transition"
                >
                  📎 File Lampiran
                </a>
              )}
            </div>

            {/* DUE DATE & DUE TIME */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                ⏰ Tenggat: <strong className="text-slate-800 dark:text-slate-100">{formatDateTime(dueDate, dueTime)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* AKSI TOMBOL */}
        <div className="flex items-center justify-between md:justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#E9E4D8] dark:border-[#3A3733] flex-shrink-0">
          <button
            type="button"
            onClick={() => onToggleStatus && onToggleStatus(todo.id, todo.status)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              isDone ? 'bg-[#3F7350]/10 text-[#3F7350]' : 'bg-[#C99A2E]/10 text-[#A9791F]'
            }`}
          >
            {todo.status || (isDone ? 'Selesai' : 'Aktif')}
          </button>

          <button
            type="button"
            onClick={handleOpenDetail}
            className="p-2 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition cursor-pointer"
            title="Lihat Detail Tugas"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => onEdit && onEdit(todo)}
            className="p-2 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition cursor-pointer"
            title="Edit Tugas"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" />
            </svg>
          </button>

          {onDuplicate && (
            <button
              type="button"
              onClick={() => onDuplicate(todo)}
              className="p-2 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition cursor-pointer"
              title="Duplikat Tugas"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H4a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-4M8 3v4a1 1 0 001 1h4M8 3l5 5" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete && onDelete(todo.id)}
            className="p-2 rounded-md text-slate-400 hover:text-[#A83B32] hover:bg-[#A83B32]/10 transition cursor-pointer"
            title="Hapus Tugas"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h12M8 6V4h4v2m-6 0v10a1 1 0 001 1h6a1 1 0 001-1V6" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* MODAL DETAIL TUGAS DI TODOCARD */}  
      <TodoDetailModal
        key={todo.id}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        todo={currentTodo}
        formatDateTime={formatDateTime}
        onToggleChecklist={handleToggleChecklist}
        onEdit={onEdit} 
      />
    </>
  )
}