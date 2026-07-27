import { useState } from 'react'

export default function TodoCard({ todo, onToggleStatus, onEdit, onDelete }) {
  const [showViewModal, setShowViewModal] = useState(false)
  const isDone = todo.status === 'Selesai' || todo.is_completed

  return (
    <>
      {/* CARD COMPONENT */}
      <div
        className={`group bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-5 rounded-md shadow-sm hover:shadow-xl hover:border-[#3D5F49]/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDone ? 'opacity-60 bg-[#F5F3ED]/50 dark:bg-[#211F1C]/30' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            checked={isDone}
            onChange={() => onToggleStatus(todo.id, todo.status)}
            className="w-5 h-5 rounded-md text-[#2C4536] focus:ring-[#3D5F49] border-slate-300 mt-1 cursor-pointer"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`text-sm font-bold text-slate-900 dark:text-white ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                {todo.title || todo.judul}
              </h4>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono ${
                (todo.priority || todo.prioritas) === 'High' ? 'bg-[#A83B32]/10 text-[#A83B32] border border-[#A83B32]/20' :
                (todo.priority || todo.prioritas) === 'Medium' ? 'bg-[#C99A2E]/10 text-[#A9791F] border border-[#C99A2E]/20' : 'bg-[#3F7350]/10 text-[#3F7350] border border-[#3F7350]/20'
              }`}>
                {todo.priority || todo.prioritas || 'Medium'}
              </span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#3D5F49]/10 text-[#6B8874] border border-[#3D5F49]/20">
                {todo.category || todo.kategori || 'General'}
              </span>
            </div>

            {(todo.description || todo.deskripsi) && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">
                {todo.description || todo.deskripsi}
              </p>
            )}

            {/* Lampiran File Ringkas */}
            {(todo.file_url || todo.lampiran) && (
              <div className="pt-1">
                <a
                  href={todo.file_url || todo.lampiran}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#F5F3ED] dark:bg-[#2A2823] hover:bg-[#3D5F49]/10 hover:text-[#6B8874] text-[11px] font-bold text-slate-600 dark:text-slate-300 transition"
                >
                  📎 Lihat Lampiran
                </a>
              </div>
            )}

            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
              <span>Tenggat: {todo.due_date || todo.duedate || '—'}</span>
              <span>Dibuat: {new Date(todo.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* AKSI TOMBOL */}
        <div className="flex items-center justify-between md:justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#E9E4D8] dark:border-[#3A3733]">
          <button
            onClick={() => onToggleStatus(todo.id, todo.status)}
            className={`px-3 py-1 rounded-md text-xs font-bold ${
              isDone ? 'bg-[#3F7350]/10 text-[#3F7350]' : 'bg-[#C99A2E]/10 text-[#A9791F]'
            }`}
          >
            {todo.status || 'Aktif'}
          </button>

          {/* Tombol Lihat Detail (View) */}
          <button
            onClick={() => setShowViewModal(true)}
            className="p-2 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition"
            title="Lihat Detail Tugas"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Tombol Edit */}
          <button
            onClick={() => onEdit(todo)}
            className="p-2 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition"
            title="Edit Tugas"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 3.5l3 3L6 17l-4 1 1-4L13.5 3.5z" />
            </svg>
          </button>

          {/* Tombol Hapus */}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 rounded-md text-slate-400 hover:text-[#A83B32] hover:bg-[#A83B32]/10 transition"
            title="Hapus Tugas"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h12M8 6V4h4v2m-6 0v10a1 1 0 001 1h6a1 1 0 001-1V6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ---------------- MODAL DETAIL TUGAS (VIEW ONLY) ---------------- */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#211F1C] border border-[#E9E4D8] dark:border-[#3A3733] rounded-md p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-[#E9E4D8] dark:border-[#3A3733] pb-3">
              <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                Detail Tugas
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Isi Detail Tugas */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Judul Tugas</label>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {todo.title || todo.judul}
                </h2>
              </div>

              <div className="flex gap-2">
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono ${
                  (todo.priority || todo.prioritas) === 'High' ? 'bg-[#A83B32]/10 text-[#A83B32] border border-[#A83B32]/20' :
                  (todo.priority || todo.prioritas) === 'Medium' ? 'bg-[#C99A2E]/10 text-[#A9791F] border border-[#C99A2E]/20' : 'bg-[#3F7350]/10 text-[#3F7350] border border-[#3F7350]/20'
                }`}>
                  Prioritas: {todo.priority || todo.prioritas || 'Medium'}
                </span>
                <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#3D5F49]/10 text-[#6B8874] border border-[#3D5F49]/20 font-mono">
                  Kategori: {todo.category || todo.kategori || 'General'}
                </span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Deskripsi Lengkap</label>
                <div className="p-3 bg-[#F5F3ED] dark:bg-[#2A2823] rounded-md border border-[#E4DFD3] dark:border-[#3A3733] text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {todo.description || todo.deskripsi || 'Tidak ada deskripsi tambahan.'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 bg-slate-50 dark:bg-[#2A2823] rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Tenggat Waktu</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {todo.due_date || todo.duedate || '—'}
                  </span>
                </div>
                <div className="p-2 bg-slate-50 dark:bg-[#2A2823] rounded border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Status Tugas</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {todo.status || (isDone ? 'Selesai' : 'Aktif')}
                  </span>
                </div>
              </div>

              {(todo.file_url || todo.lampiran) && (
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Lampiran File</label>
                  <a
                    href={todo.file_url || todo.lampiran}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#3D5F49]/10 hover:bg-[#3D5F49]/20 text-[#6B8874] text-xs font-bold transition w-full justify-center"
                  >
                    📎 Buka / Download Lampiran
                  </a>
                </div>
              )}
            </div>

            {/* Footer / Tombol Akses Cepat */}
            <div className="flex justify-end gap-2 pt-3 border-t border-[#E9E4D8] dark:border-[#3A3733]">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 rounded-md text-xs font-bold bg-slate-100 dark:bg-[#2A2823] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowViewModal(false)
                  onEdit(todo)
                }}
                className="px-4 py-2 rounded-md text-xs font-bold bg-[#20302A] text-white hover:bg-[#16241C] transition"
              >
                Edit Tugas Ini
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}