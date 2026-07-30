// Komponen modal untuk menampilkan detail lengkap sebuah tugas
export default function TodoDetailModal({ 
  isOpen, 
  onClose, 
  todo, 
  formatDateTime, 
  onToggleChecklist,
  onEdit 
}) {
  if (!isOpen || !todo) return null

  // Ekstraksi nilai properti dengan fallback lengkap
  const title = todo.title || todo.judul || 'Tanpa Judul'
  const description = todo.description || todo.deskripsi
  const fileUrl = todo.file_url || todo.lampiran || todo.file || todo.attachment
  
  // Ekstraksi Link Referensi
  const rawLink = todo.reference_link || todo.reference_url || todo.url || todo.link || todo.url_link || todo.link_url || todo.link_reference
  const reference_link = (typeof rawLink === 'string' && rawLink.trim() !== '') ? rawLink.trim() : null
  
  // Ambil Tanggal dan Jam secara spesifik
  const dueDate = todo.due_date || todo.duedate
  const dueTime = todo.due_time || todo.duetime || todo.time

  // Checklist
  const checklistItems = todo.checklist || todo.subtasks || []
  const totalChecklist = checklistItems.length
  const completedChecklist = checklistItems.filter(
    item => item.is_completed || item.completed || item.status === 'Selesai'
  ).length

  // Handler klik tombol Edit -> Langsung Tutup Modal Detail & Buka Form Edit
  const handleEditClick = () => {
    onClose() // 1. Tutup modal detail ini
    if (onEdit) {
      onEdit(todo) // 2. Panggil handler edit parent untuk membuka TodoFormModal
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#211F1C] border border-[#E9E4D8] dark:border-[#3A3733] rounded-md p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-[#E9E4D8] dark:border-[#3A3733] pb-3">
          <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
            Detail Tugas
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="space-y-4">
          {/* JUDUL */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Judul Tugas</label>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
          </div>

          {/* DUE DATE & DUE TIME */}
          <div className="p-2.5 bg-slate-50 dark:bg-[#2A2823] rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">Tenggat Waktu:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              ⏰ {formatDateTime ? formatDateTime(dueDate, dueTime) : `${dueDate || '—'} ${dueTime || ''}`}
            </span>
          </div>

          {/* CHECKLIST INTERAKTIF */}
          {totalChecklist > 0 && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Checklist Tugas ({completedChecklist}/{totalChecklist})
              </label>
              <div className="space-y-1.5 p-3 bg-[#F5F3ED] dark:bg-[#2A2823] rounded-md border border-[#E4DFD3] dark:border-[#3A3733]">
                {checklistItems.map((item, idx) => {
                  const itemId = item.id !== undefined ? item.id : idx
                  const itemDone = Boolean(item.is_completed || item.completed || item.status === 'Selesai')
                  
                  return (
                    <label 
                      key={itemId} 
                      className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={itemDone}
                        onChange={() => onToggleChecklist && onToggleChecklist(todo.id, itemId)}
                        className="rounded text-[#3D5F49] focus:ring-[#3D5F49] cursor-pointer"
                      />
                      <span className={itemDone ? 'line-through text-slate-400' : ''}>
                        {item.title || item.text || item.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* URL LINK TERKAIT */}
          {reference_link && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Link URL Terkait</label>
              <a
                href={reference_link.startsWith('http') ? reference_link : `https://${reference_link}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 p-2.5 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-bold transition w-full border border-blue-200 dark:border-blue-800 break-all"
              >
                🌐 {reference_link}
              </a>
            </div>
          )}

          {/* DESKRIPSI LENGKAP */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Deskripsi Lengkap</label>
            <div className="p-3 bg-[#F5F3ED] dark:bg-[#2A2823] rounded-md border border-[#E4DFD3] dark:border-[#3A3733] text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {description || 'Tidak ada deskripsi tambahan.'}
            </div>
          </div>

          {/* LAMPIRAN FILE */}
          {fileUrl && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Lampiran File</label>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#3D5F49]/10 hover:bg-[#3D5F49]/20 text-[#6B8874] text-xs font-bold transition w-full justify-center border border-[#3D5F49]/20"
              >
                📎 Buka / Download Lampiran
              </a>
            </div>
          )}
        </div>

        {/* FOOTER MODAL */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E9E4D8] dark:border-[#3A3733]">
          {/* TOMBOL EDIT TUGAS */}
          <button
            type="button"
            onClick={handleEditClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold bg-[#3D5F49] hover:bg-[#2C4536] text-white transition cursor-pointer shadow-sm"
          >
            <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" />
            </svg>
            Edit Tugas
          </button>

          {/* TOMBOL TUTUP */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-bold bg-slate-100 dark:bg-[#2A2823] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}