import { X, Upload, Loader2, Plus, Trash2 } from 'lucide-react';

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
  onSubmit
}) {
  if (!show) return null;

  // Handler untuk Checklist
  const handleAddChecklistItem = () => {
    setChecklist([...checklist, { id: Date.now(), text: '', is_completed: false }]);
  };

  const handleChecklistChange = (index, value) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], text: value };
    setChecklist(updated);
  };

  const handleRemoveChecklistItem = (index) => {
    const updated = checklist.filter((_, i) => i !== index);
    setChecklist(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1A1917] w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 dark:border-[#3A3733] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-[#3A3733] flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {editingTodoId ? 'Edit Tugas' : 'Tambah Tugas Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="p-4 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Judul */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Judul Tugas *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Kerjakan Tugas Pendahuluan 3"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Deskripsi</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan detail atau instruksi tugas..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Kategori & Prioritas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Kategori / Matkul</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500"
              >
                <option value="">Pilih Kategori</option>
                {categoriesList.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Prioritas</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Jam Tenggat */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Tenggat</label>
              <input
                type="date"
                value={due_date}
                onChange={(e) => setdue_date(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Jam Tenggat</label>
              <input
                type="time"
                value={due_time}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Link Referensi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Link Referensi / Tugas</label>
            <input
              type="url"
              value={reference_link}
              onChange={(e) => setReferenceLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-800 dark:focus:ring-amber-500"
            />
          </div>

          {/* Checklist / Subtask */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Subtask / Checklist</label>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Plus size={14} /> Tambah Item
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {checklist.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.text || item.title || ''}
                    onChange={(e) => handleChecklistChange(index, e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#3A3733] bg-white dark:bg-[#211F1C] text-gray-800 dark:text-white focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(index)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* File Lampiran */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Lampiran File</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 border border-dashed border-gray-300 dark:border-[#3A3733] rounded-lg p-2 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#211F1C] transition flex items-center justify-center gap-2 text-xs text-gray-500">
                <Upload size={16} />
                <span>{file ? file.name : existingFileUrl ? 'Ganti file lampiran' : 'Upload file'}</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer / Tombol */}
          <div className="pt-3 border-t border-gray-100 dark:border-[#3A3733] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading && <Loader2 size={14} className="animate-spin" />}
              {editingTodoId ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}