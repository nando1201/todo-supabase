import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

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

  // 1. FETCH TODOS & DINAMIS CATEGORIES DARI DATABASE
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

  useEffect(() => {
    queueMicrotask(() => {
      fetchTodos()
    })
  }, [fetchTodos])

  // Reset Form Tugas
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

  const handleOpenCreateModal = () => {
    resetForm()
    setShowModal(true)
  }

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

  // Handle Tambah Kategori Baru + Catat Aktivitas
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

  // Upload File ke Supabase Storage (Menggunakan bucket 'todo-files')
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

  // 2. SIMPAN / EDIT TUGAS + CATAT AKTIVITAS
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

  // 3. UPDATE STATUS (Aktif <-> Selesai) + CATAT AKTIVITAS
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

  // 4. DELETE TODO + CATAT AKTIVITAS
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