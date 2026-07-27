export default function TodoFormModal({
  show, onClose, editingTodoId,
  title, setTitle, description, setDescription,
  category, setCategory, categoriesList,
  priority, setPriority,
  due_date, setdue_date,
  file, setFile, existingFileUrl, uploading,
  onSubmit,
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60  z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#211F1C] rounded-md p-6 max-w-md w-full shadow-2xl space-y-4 border border-[#E9E4D8] dark:border-[#3A3733] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif text-slate-900 dark:text-white">
            {editingTodoId ? 'Edit Tugas' : 'Buat Tugas Baru'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold">×</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Tugas</label>
            <input
              type="text"
              required
              placeholder="Contoh: Selesaikan laporan proyek..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
            <textarea
              rows="2"
              placeholder="Detail tambahan tugas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] font-medium"
              >
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49] font-medium"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tenggat Waktu (due_date)</label>
            <input
              type="date"
              value={due_date}
              onChange={(e) => setdue_date(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            />
          </div>

          {/* UPLOAD FILE/IMAGE/PDF */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lampiran (PDF / Gambar)</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#3D5F49]/10 file:text-[#6B8874] hover:file:bg-[#3D5F49]/20"
            />
            {existingFileUrl && !file && (
              <p className="text-[10px] text-[#3F7350] mt-1 font-mono">Sudah ada lampiran tersimpan</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#20302A] text-white hover:bg-[#16241C] transition disabled:opacity-50"
            >
              {uploading ? 'Mengunggah...' : editingTodoId ? 'Update Tugas' : 'Simpan Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
