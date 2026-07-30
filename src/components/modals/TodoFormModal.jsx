//todosformmodal.jsx
import { X, ExternalLink, Plus, Trash2 } from 'lucide-react'

/**
 * Komponen modal form untuk membuat tugas baru ATAU mengedit tugas yang sudah ada.
 * Mode form (buat baru / edit) ditentukan oleh ada tidaknya `editingTodoId`.
 * Menampilkan field: judul, deskripsi, kategori, prioritas, tanggal & jam
 * tenggat, link referensi, checklist sub-tugas, dan upload lampiran file.
 * Seluruh state form (title, description, dst) dikontrol dari luar (controlled
 * component), biasanya berasal dari hook `useTodos`.
 */
export default function TodoFormModal({
  show,
  onClose,
  editingTodoId,
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  categoriesList = [],
  priority,
  setPriority,
  due_date,
  setdue_date,
  due_time,
  setDueTime,
  reference_link,
  setReferenceLink,
  checklist = [],
  setChecklist,
  file,
  setFile,
  existingFileUrl,
  uploading,
  onSubmit,
}) {
  // Guard: jangan render apa pun jika modal sedang tidak ditampilkan
  if (!show) return null

  /**
   * Menambahkan satu item checklist/sub-tugas kosong baru ke akhir daftar.
   * ID item dibuat dari timestamp saat ini (Date.now()) agar unik.
   */
  const handleAddChecklistItem = () => {
    setChecklist([...checklist, { id: Date.now(), text: '', completed: false }])
  }

  /**
   * Mengubah teks pada satu item checklist berdasarkan id-nya,
   * tanpa mengubah item checklist lain.
   * @param {number} id - ID item checklist yang diubah
   * @param {string} text - Teks baru untuk item tersebut
   */
  const handleChecklistChange = (id, text) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, text } : item))
    )
  }

  /**
   * Menghapus satu item checklist dari daftar berdasarkan id-nya.
   * @param {number} id - ID item checklist yang akan dihapus
   */
  const handleRemoveChecklistItem = (id) => {
    setChecklist(checklist.filter((item) => item.id !== id))
  }

  // Fallback: jika `categoriesList` kosong/tidak valid, pakai daftar kategori default
  const safeCategories =
    Array.isArray(categoriesList) && categoriesList.length > 0
      ? categoriesList
      : ['General', 'Kuliah', 'Pekerjaan', 'Pribadi']

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#211F1C] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-[#E9E4D8] dark:border-[#3A3733] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#3A3733] pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingTodoId ? 'Edit Tugas' : 'Buat Tugas Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* onSubmit di sini langsung menjalankan handleSaveTodo di useTodos */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Judul Tugas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Judul Tugas
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Selesaikan laporan proyek..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi
            </label>
            <textarea
              rows="2"
              placeholder="Detail tambahan tugas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            ></textarea>
          </div>

          {/* Kategori / Matkul & Prioritas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] font-medium"
              >
                {safeCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] font-medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Tenggat Tanggal & Jam Deadline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Tenggat
              </label>
              <input
                type="date"
                value={due_date}
                onChange={(e) => setdue_date(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jam Deadline
              </label>
              <input
                type="time"
                value={due_time || ''}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
              />
            </div>
          </div>

          {/* Link Referensi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <ExternalLink size={12} /> Link Referensi
            </label>
            <input
              type="url"
              placeholder="https://example.com/materi..."
              value={reference_link || ''}
              onChange={(e) => setReferenceLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            />
          </div>

          {/* Check List / Subtask */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Check List Sub-Tugas
              </label>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="text-[11px] flex items-center gap-1 text-[#3D5F49] dark:text-amber-500 font-bold hover:underline"
              >
                <Plus size={13} /> Tambah Poin
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {checklist.length === 0 && (
                <p className="text-[11px] text-slate-400 italic">
                  Belum ada poin checklist.
                </p>
              )}
              {checklist.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Poin ${index + 1}...`}
                    value={item.text}
                    onChange={(e) =>
                      handleChecklistChange(item.id, e.target.value)
                    }
                    className="flex-1 px-3 py-1.5 rounded-md text-xs bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                    title="Hapus poin"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload File */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Lampiran (PDF / Gambar)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#3D5F49]/10 file:text-[#6B8874] hover:file:bg-[#3D5F49]/20"
            />
            {existingFileUrl && !file && (
              <p className="text-[10px] text-[#3F7350] dark:text-amber-400 mt-1 font-mono">
                ✓ Lampiran tersimpan
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#3A3733]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-[#2A2823] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#20302A] dark:bg-amber-600 dark:hover:bg-amber-700 text-white hover:bg-[#16241C] transition disabled:opacity-50"
            >
              {uploading
                ? 'Mengunggah...'
                : editingTodoId
                ? 'Update Tugas'
                : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}