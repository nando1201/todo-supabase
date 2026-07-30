/**
 * Komponen modal untuk menambahkan kategori tugas baru.
 * - Tidak me-render apa pun (return null) jika `show` bernilai false.
 * - Form-nya cukup sederhana: satu input nama kategori.
 * - Saat form di-submit, memanggil `onSubmit` (biasanya `handleAddCategory`
 *   dari hook `useTodos`) yang menangani logika penyimpanan kategori.
 *
 * Props:
 * @param {boolean} show - Menentukan modal ditampilkan atau tidak
 * @param {Function} onClose - Dipanggil saat modal ditutup (tombol × atau Batal)
 * @param {string} newCategoryInput - Nilai input nama kategori baru
 * @param {Function} setNewCategoryInput - Setter untuk mengubah nilai input
 * @param {Function} onSubmit - Handler yang dijalankan saat form disubmit
 */
export default function CategoryModal({ show, onClose, newCategoryInput, setNewCategoryInput, onSubmit }) {
  // Guard: jangan render apa pun jika modal sedang tidak ditampilkan
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60  z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#211F1C] rounded-md p-6 max-w-sm w-full shadow-2xl space-y-4 border border-[#E9E4D8] dark:border-[#3A3733]">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif text-slate-900 dark:text-white">Kategori Baru</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold">×</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Kategori</label>
            <input
              type="text"
              required
              placeholder="Contoh: Belanja, Projek B, dll..."
              value={newCategoryInput}
              onChange={(e) => setNewCategoryInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-xs bg-[#F5F3ED] dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3D5F49]"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-[#2A2823] text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#20302A] text-white hover:bg-[#16241C] transition"
            >
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}