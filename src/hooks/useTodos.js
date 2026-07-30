import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Custom hook utama untuk mengelola seluruh data & aksi terkait "todos" (tugas).
 * Mencakup:
 * - Pengambilan data todos & kategori dari Supabase
 * - State form tambah/edit tugas (judul, deskripsi, kategori, dst)
 * - State modal (tambah kategori, tambah/edit tugas)
 * - State & proses upload lampiran file
 * - Aksi CRUD: simpan/edit, update status, hapus — masing-masing sekaligus
 *   mencatat log aktivitas ke tabel `activities`
 *
 * @param {object} session - Objek session user yang sedang login (dari Supabase Auth)
 */
export function useTodos(session) {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)

  // Categories List State
  const [categoriesList, setCategoriesList] = useState(['General', 'Kuliah', 'Pekerjaan', 'Pribadi'])
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState('')

  // Todo Modal State (Create & Edit)
  const [showModal, setShowModal] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('General')
  const [priority, setPriority] = useState('Medium')
  const [due_date, setdue_date] = useState('')
  const [due_time, setDueTime] = useState('')
  const [reference_link, setReferenceLink] = useState('')
  const [checklist, setChecklist] = useState([])

  // File Upload State
  const [file, setFile] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState(null)
  const [uploading, setUploading] = useState(false)

  /**
   * 1. FETCH TODOS & DINAMIS CATEGORIES DARI DATABASE
   * Mengambil seluruh todos milik user yang sedang login dari tabel `todos`
   * (diurutkan dari yang terbaru dibuat), lalu:
   * - Menyimpannya ke state `todos`
   * - Mengekstrak semua nilai kategori unik yang ada di data, digabung dengan
   *   4 kategori default (General, Kuliah, Pekerjaan, Pribadi), sehingga
   *   `categoriesList` selalu mencakup kategori yang benar-benar dipakai.
   * Dibungkus `useCallback` supaya referensinya stabil dan aman dipakai
   * sebagai dependency di useEffect lain (misalnya di Dashboard.jsx).
   */
  const fetchTodos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTodos(data)

      const dbCategories = data
        .map(t => t.category)
        .filter(c => c && c.trim() !== '')

      const defaultCats = ['General', 'Kuliah', 'Pekerjaan', 'Pribadi']
      const mergedCats = Array.from(new Set([...defaultCats, ...dbCategories]))
      setCategoriesList(mergedCats)
    }
    setLoading(false)
  }, [session.user.id])

  /**
   * Effect: memanggil fetchTodos() sekali saat hook pertama kali dipakai
   * (atau saat fetchTodos berubah, misalnya karena user_id berubah).
   * `queueMicrotask` dipakai untuk menunda pemanggilan sedikit,
   * memastikan fetch dijalankan setelah render awal selesai.
   */
  useEffect(() => {
    queueMicrotask(() => {
      fetchTodos()
    })
  }, [fetchTodos])

  /**
   * Mengembalikan seluruh field form tambah/edit tugas ke nilai kosong/default.
   * Dipanggil saat membuka form untuk tugas baru, atau setelah berhasil simpan.
   */
  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('General')
    setPriority('Medium')
    setdue_date('')
    setDueTime('')
    setReferenceLink('')
    setChecklist([])
    setFile(null)
    setExistingFileUrl(null)
    setEditingTodoId(null)
  }

  /**
   * Membuka modal form dalam mode "Buat Tugas Baru".
   * Mengosongkan form terlebih dahulu (resetForm) sebelum modal ditampilkan.
   */
  const handleOpenCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

  /**
   * Membuka modal form dalam mode "Edit Tugas", dengan mengisi seluruh
   * field form menggunakan data dari `todo` yang diberikan.
   * - Mendukung dua skema penamaan field (mis. `title`/`judul`,
   *   `description`/`deskripsi`) untuk kompatibilitas data lama & baru.
   * - Mem-parsing `checklist` jika disimpan sebagai string JSON di database,
   *   atau memakainya langsung jika sudah berupa array.
   * @param {object} todo - Data tugas yang akan diedit
   */
  const handleOpenEditModal = (todo) => {
    setEditingTodoId(todo.id)
    setTitle(todo.title || todo.judul || '')
    setDescription(todo.description || todo.deskripsi || '')
    setCategory(todo.category || todo.kategori || 'General')
    setPriority(todo.priority || todo.prioritas || 'Medium')
    setdue_date(todo.due_date || todo.duedate || '')
    setDueTime(todo.due_time || '')
    setReferenceLink(todo.reference_link || todo.link_referensi || '')

    let initialChecklist = []
    if (todo.checklist) {
      if (typeof todo.checklist === 'string') {
        try {
          initialChecklist = JSON.parse(todo.checklist)
        } catch {
          initialChecklist = []
        }
      } else if (Array.isArray(todo.checklist)) {
        initialChecklist = todo.checklist
      }
    }
    setChecklist(initialChecklist)

    setExistingFileUrl(todo.file_url || todo.lampiran || null)
    setFile(null)
    setShowModal(true)
  }

  /**
   * Handler submit form "Tambah Kategori Baru".
   * - Mencegah reload halaman (preventDefault)
   * - Memvalidasi input tidak kosong dan belum ada di daftar kategori
   *   (perbandingan case-insensitive)
   * - Menambahkan kategori baru ke `categoriesList`, otomatis memilihnya
   *   sebagai kategori aktif pada form tugas
   * - Mencatat aktivitas "menambahkan kategori" ke tabel `activities`
   * - Menutup modal & mengosongkan input setelah selesai
   */
  const handleAddCategory = async (e) => {
    e.preventDefault()
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return

    if (!categoriesList.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategoriesList([...categoriesList, trimmed])
      setCategory(trimmed)

      // Catat ke tabel activities
      await supabase.from('activities').insert([
        {
          user_id: session.user.id,
          title: `Menambahkan kategori "${trimmed}"`,
          color: 'bg-amber-500',
        },
      ])
    }
    setNewCategoryInput('')
    setShowCategoryModal(false)
  }

  /**
   * Mengunggah file lampiran (jika ada) ke Supabase Storage bucket 'todo-files'.
   * - Jika tidak ada file baru yang dipilih, langsung mengembalikan
   *   `existingFileUrl` (URL lampiran lama, jika ada) tanpa proses upload.
   * - Nama file dibuat unik dengan menggabungkan user id + timestamp,
   *   diletakkan di dalam folder per-user (`{user_id}/{timestamp}.{ext}`).
   * - Jika upload gagal, menampilkan alert error dan tetap mengembalikan
   *   `existingFileUrl` sebagai fallback.
   * - Jika berhasil, mengembalikan public URL dari file yang baru diunggah.
   * @returns {Promise<string|null>} URL file (baru/lama) atau null
   */
  const uploadAttachment = async () => {
    if (!file) return existingFileUrl

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('todo-files')
      .upload(fileName, file)

    if (uploadError) {
      alert('Gagal mengunggah file: ' + uploadError.message)
      setUploading(false)
      return existingFileUrl
    }

    const { data: publicUrlData } = supabase.storage
      .from('todo-files')
      .getPublicUrl(fileName)

    setUploading(false)
    return publicUrlData.publicUrl
  }

  /**
   * 2. SIMPAN / EDIT TUGAS + CATAT AKTIVITAS
   * Handler submit form tambah/edit tugas.
   * - Mencegah reload halaman & memvalidasi judul tidak boleh kosong
   * - Mengunggah lampiran (jika ada) melalui uploadAttachment()
   * - Jika `editingTodoId` terisi -> mode EDIT: update baris todo yang sudah ada
   * - Jika tidak -> mode BUAT BARU: insert baris todo baru dengan status default "Aktif"
   * - Setelah berhasil simpan/update, mencatat aktivitas terkait ke tabel
   *   `activities` (teks & warna berbeda untuk mode buat baru vs edit)
   * - Mengosongkan form, menutup modal, dan me-refresh daftar todos
   * - Jika terjadi error, menampilkan alert
   */
  const handleSaveTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const uploadedUrl = await uploadAttachment()

    // eslint-disable-next-line no-useless-assignment
    let error = null

    if (editingTodoId) {
      // MODE EDIT
      const { error: updateError } = await supabase
        .from('todos')
        .update({
          title,
          description,
          category,
          priority,
          due_date: due_date || null,
          due_time: due_time || null,
          reference_link: reference_link || null,
          checklist: checklist || [],
          file_url: uploadedUrl,
        })
        .eq('id', editingTodoId)
      error = updateError
    } else {
      // MODE BUAT BARU
      const todoData = {
        user_id: session.user.id,
        title,
        description,
        category,
        priority,
        status: 'Aktif',
        is_completed: false,
        due_date: due_date || null,
        due_time: due_time || null,
        reference_link: reference_link || null,
        checklist: checklist || [],
        file_url: uploadedUrl,
      }
      const { error: insertError } = await supabase
        .from('todos')
        .insert([todoData])
      error = insertError
    }

    if (!error) {
      const activityTitle = editingTodoId 
        ? `Mengubah tugas "${title}"`
        : `Membuat tugas baru "${title}"`

      const activityColor = editingTodoId ? 'bg-amber-500' : 'bg-emerald-500'

      // Simpan ke tabel activities
      await supabase.from('activities').insert([
        {
          user_id: session.user.id,
          title: activityTitle,
          color: activityColor,
        },
      ])

      resetForm()
      setShowModal(false)
      fetchTodos()
    } else {
      alert('Gagal menyimpan tugas: ' + error.message)
    }
  }

  /**
   * 3. UPDATE STATUS (Aktif <-> Selesai) + CATAT AKTIVITAS
   * Membalik status sebuah tugas: dari "Aktif" menjadi "Selesai" atau sebaliknya,
   * sekaligus menyesuaikan flag `is_completed`.
   * - Setelah update berhasil, mencatat aktivitas ke tabel `activities`
   *   dengan teks & warna berbeda tergantung status baru
   *   (menyelesaikan tugas vs mengembalikan ke aktif)
   * - Nama tugas untuk log aktivitas diambil dari parameter `todoTitle`,
   *   atau dicari dari state `todos` jika tidak diberikan
   * - Me-refresh daftar todos setelah berhasil
   * @param {string|number} id - ID tugas yang statusnya akan diubah
   * @param {string} currentStatus - Status tugas saat ini ('Aktif' atau 'Selesai')
   * @param {string} [todoTitle] - Judul tugas (opsional, untuk log aktivitas)
   */
  const updateStatus = async (id, currentStatus, todoTitle = '') => {
    const newStatus = currentStatus === 'Aktif' ? 'Selesai' : 'Aktif'
    const isCompleted = newStatus === 'Selesai'

    const { error } = await supabase
      .from('todos')
      .update({ status: newStatus, is_completed: isCompleted })
      .eq('id', id)

    if (!error) {
      // Cari nama tugas jika tidak dioper di argumen
      const targetTodo = todos.find(t => t.id === id)
      const name = todoTitle || targetTodo?.title || targetTodo?.judul || 'tugas'

      const activityTitle = newStatus === 'Selesai'
        ? `Menyelesaikan tugas "${name}"`
        : `Mengembalikan tugas "${name}" ke Aktif`

      const activityColor = newStatus === 'Selesai' ? 'bg-emerald-600' : 'bg-blue-500'

      // Catat ke tabel activities
      await supabase.from('activities').insert([
        {
          user_id: session.user.id,
          title: activityTitle,
          color: activityColor,
        },
      ])

      fetchTodos()
    }
  }

  /**
   * 4. DELETE TODO + CATAT AKTIVITAS
   * Menghapus sebuah tugas setelah user mengonfirmasi lewat `confirm()` bawaan browser.
   * - Mencari nama tugas terlebih dahulu (sebelum dihapus) untuk keperluan log aktivitas
   * - Menghapus baris todo dari tabel `todos` berdasarkan id
   * - Jika berhasil, mencatat aktivitas "menghapus tugas" ke tabel `activities`
   *   dan me-refresh daftar todos
   * @param {string|number} id - ID tugas yang akan dihapus
   * @param {string} [todoTitle] - Judul tugas (opsional, untuk log aktivitas)
   */
  const deleteTodo = async (id, todoTitle = '') => {
    if (!confirm('Hapus tugas ini?')) return

    // Cari nama tugas sebelum dihapus
    const targetTodo = todos.find(t => t.id === id)
    const name = todoTitle || targetTodo?.title || targetTodo?.judul || 'tugas'

    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (!error) {
      // Catat ke tabel activities
      await supabase.from('activities').insert([
        {
          user_id: session.user.id,
          title: `Menghapus tugas "${name}"`,
          color: 'bg-rose-500',
        },
      ])

      fetchTodos()
    }
  }

  return {
    // data
    todos, loading, categoriesList,
    // category modal
    showCategoryModal, setShowCategoryModal, newCategoryInput, setNewCategoryInput, handleAddCategory,
    // todo modal & form
    showModal, setShowModal, editingTodoId,
    title, setTitle, description, setDescription, category, setCategory,
    priority, setPriority, due_date, setdue_date,
    due_time, setDueTime, reference_link, setReferenceLink, checklist, setChecklist,
    file, setFile, existingFileUrl, uploading,
    handleOpenCreateModal, handleOpenEditModal, handleSaveTodo,
    // actions
    updateStatus, deleteTodo, fetchTodos,
  }
}