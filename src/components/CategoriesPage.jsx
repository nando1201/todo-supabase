import { useState, useEffect, useCallback } from 'react'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { supabase } from '../supabaseClient'
import TodoFormModal from './modals/TodoFormModal'
import TodoCard from './TodoCard' // Import komponen TodoCard kamu

export const CategoriesPage = ({ session }) => {
  const [todos, setTodos] = useState([])
  const [categoriesList, setCategoriesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null)

  // State Modal Edit / Buat (Menggunakan TodoFormModal)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [due_date, setdue_date] = useState('')
  const [file, setFile] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // Fetch Todos & Categories dari Supabase
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)

      let todoQuery = supabase.from('todos').select('*').order('created_at', { ascending: false })
      if (session?.user?.id) {
        todoQuery = todoQuery.eq('user_id', session.user.id)
      }
      const { data: todoData, error: todoErr } = await todoQuery
      if (todoErr) throw todoErr

      let catQuery = supabase.from('categories').select('*')
      if (session?.user?.id) {
        catQuery = catQuery.eq('user_id', session.user.id)
      }
      const { data: catData } = await catQuery

      setTodos(todoData || [])

      if (catData && catData.length > 0) {
        setCategoriesList(catData.map((c) => c.name))
      } else {
        const uniqueCategories = Array.from(new Set(todoData?.map((t) => t.category).filter(Boolean)))
        setCategoriesList(
          uniqueCategories.length > 0
            ? uniqueCategories
            : ['Algoritma & Struktur Data', 'Basis Data', 'Jaringan Komputer', 'Kecerdasan Buatan', 'Pemrograman Web 2']
        )
      }
    } catch (err) {
      console.error('Error fetching categories page data:', err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    let isMounted = true

    const loadInitialData = async () => {
        try {
        let todoQuery = supabase.from('todos').select('*').order('created_at', { ascending: false })
        if (session?.user?.id) {
            todoQuery = todoQuery.eq('user_id', session.user.id)
        }
        const { data: todoData, error: todoErr } = await todoQuery
        if (todoErr) throw todoErr

        let catQuery = supabase.from('categories').select('*')
        if (session?.user?.id) {
            catQuery = catQuery.eq('user_id', session.user.id)
        }
        const { data: catData } = await catQuery

        if (isMounted) {
            setTodos(todoData || [])
            if (catData && catData.length > 0) {
            setCategoriesList(catData.map((c) => c.name))
            } else {
            const uniqueCategories = Array.from(new Set(todoData?.map((t) => t.category).filter(Boolean)))
            setCategoriesList(
                uniqueCategories.length > 0
                ? uniqueCategories
                : ['Algoritma & Struktur Data', 'Basis Data', 'Jaringan Komputer', 'Kecerdasan Buatan', 'Pemrograman Web 2']
            )
            }
        }
        } catch (err) {
        console.error('Error fetching categories page data:', err)
        } finally {
        if (isMounted) setLoading(false)
        }
    }

    loadInitialData()

    return () => {
        isMounted = false
    }
    }, [session])
  // Handler Toggle Status Selesai / Belum
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Selesai' ? 'Aktif' : 'Selesai'
      const isCompleted = nextStatus === 'Selesai'

      const { error } = await supabase
        .from('todos')
        .update({ status: nextStatus, is_completed: isCompleted })
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (err) {
      console.error('Gagal memperbarui status:', err)
    }
  }

  // Handler Hapus Tugas
  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)
      if (error) throw error
      fetchData()
    } catch (err) {
      console.error('Gagal menghapus tugas:', err)
    }
  }

  // Handler Buka Edit Form
  const handleOpenEditModal = (todo) => {
    setEditingTodoId(todo.id)
    setTitle(todo.title || todo.judul || '')
    setDescription(todo.description || todo.deskripsi || '')
    setCategory(todo.category || todo.kategori || selectedCategory || (categoriesList[0] || ''))
    setPriority(todo.priority || todo.prioritas || 'Medium')
    setdue_date(todo.due_date || todo.duedate ? (todo.due_date || todo.duedate).split('T')[0] : '')
    setExistingFileUrl(todo.file_url || todo.lampiran || '')
    setFile(null)
    
    setShowFormModal(true)
  }

  // Close Modal Edit
  const handleCloseFormModal = () => {
    setShowFormModal(false)
    setEditingTodoId(null)
    setTitle('')
    setDescription('')
    setFile(null)
    setExistingFileUrl('')
  }

  // Submit Form Edit ke Supabase
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    try {
      setUploading(true)
      let uploadedFileUrl = existingFileUrl

      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${session?.user?.id || 'public'}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath)

        uploadedFileUrl = publicUrlData.publicUrl
      }

      const payload = {
        title,
        description,
        category,
        priority,
        due_date: due_date || null,
        file_url: uploadedFileUrl
      }

      const { error } = await supabase
        .from('todos')
        .update(payload)
        .eq('id', editingTodoId)

      if (error) throw error

      await fetchData()
      handleCloseFormModal()
    } catch (err) {
      console.error('Gagal memperbarui tugas:', err)
      alert('Terjadi kesalahan saat menyimpan tugas.')
    } finally {
      setUploading(false)
    }
  }

  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
      { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400' },
      { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' },
      { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400' },
      { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* ---------------- DETAIL TAMPILAN KATEGORI ---------------- */}
      {selectedCategory ? (
        <>
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
          >
            <ArrowLeft size={18} /> Kembali ke Semua Kategori
          </button>

          <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                <BookOpen className="text-amber-600 dark:text-amber-500" size={28} />
                {selectedCategory}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Menampilkan {todos.filter((t) => (t.category || t.kategori) === selectedCategory).length} tugas dalam kategori ini
              </p>
            </div>
          </div>

          {todos.filter((t) => (t.category || t.kategori) === selectedCategory).length === 0 ? (
            <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-12 rounded-2xl text-center text-slate-400">
              <p>Belum ada tugas di kategori ini.</p>
            </div>
          ) : (
            /* DAFTAR TUGAS MENGGUNAKAN TODOCARD (1 KOLOM ATAU GRID 2) */
            <div className="space-y-3">
              {todos
                .filter((t) => (t.category || t.kategori) === selectedCategory)
                .map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggleStatus={handleToggleStatus}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTodo}
                  />
                ))}
            </div>
          )}
        </>
      ) : (
        /* ---------------- TAMPILAN UTAMA KATEGORI ---------------- */
        <>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Daftar Kategori</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pilih kategori untuk melihat tugas di dalamnya</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Memuat kategori...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriesList.map((catName, index) => {
                const count = todos.filter((t) => (t.category || t.kategori) === catName).length
                const colorStyle = getCategoryColor(index)

                return (
                  <div
                    key={catName}
                    onClick={() => setSelectedCategory(catName)}
                    className="bg-white dark:bg-[#211F1C] border border-gray-100 dark:border-[#3A3733] rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between h-44 group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${colorStyle.bg} ${colorStyle.text}`}>
                        <BookOpen size={22} />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                        {catName}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 font-medium pt-2">
                      <span>{count} tugas</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ---------------- FORM EDIT MODAL ---------------- */}
      <TodoFormModal
        show={showFormModal}
        onClose={handleCloseFormModal}
        editingTodoId={editingTodoId}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        categoriesList={categoriesList}
        priority={priority}
        setPriority={setPriority}
        due_date={due_date}
        setdue_date={setdue_date}
        file={file}
        setFile={setFile}
        existingFileUrl={existingFileUrl}
        uploading={uploading}
        onSubmit={handleSubmitForm}
      />
    </div>
  )
}