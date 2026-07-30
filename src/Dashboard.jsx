import { useEffect, useRef, useState } from 'react'
import { useTodos } from './hooks/useTodos'
import { useTodoFilters } from './hooks/useTodoFilters'
import { getDateStats } from './utils/dateHelpers'
import { getTodoStats } from './utils/statsHelpers'

import WelcomeHeader from './components/WelcomeHeader'
import StatsCards from './components/StatsCards'
import CategoryChips from './components/CategoryChips'
import SearchFilterPanel from './components/SearchFilterPanel'
import TodoList from './components/TodoList'
import ProductivityWidget from './components/ProductivityWidget'
import RecentActivity from './components/RecentActivity'
import TodoFormModal from './components/modals/TodoFormModal'
import CategoryModal from './components/modals/CategoryModal'

import CalendarWidget from './components/CalendarWidget'
import { supabase } from './supabaseClient'

/**
 * Komponen halaman Dashboard.
 * Menampilkan ringkasan tugas (todos) milik user yang sedang login, meliputi:
 * - Header sambutan + statistik singkat
 * - Daftar kategori tugas
 * - Panel pencarian & filter
 * - Daftar tugas (dengan pagination)
 * - Widget produktivitas, kalender, dan aktivitas terbaru
 * - Modal tambah/edit tugas dan tambah kategori
 */
export default function Dashboard({ session }) {
  // Nama user yang ditampilkan di header (diambil dari profil atau metadata akun)
  const [userName, setUserName] = useState('')

  // Custom hook: mengelola seluruh data & aksi CRUD terhadap todos (ambil, tambah, edit, hapus, dsb)
  const {
    todos, loading, categoriesList,
    showCategoryModal, setShowCategoryModal, newCategoryInput, setNewCategoryInput, handleAddCategory,
    showModal, setShowModal, editingTodoId,
    title, setTitle, description, setDescription, category, setCategory,
    priority, setPriority, due_date, setdue_date,
    due_time, setDueTime, reference_link, setReferenceLink, checklist, setChecklist,
    file, setFile, existingFileUrl, uploading,
    handleOpenCreateModal, handleOpenEditModal, handleSaveTodo,
    updateStatus, deleteTodo,
  } = useTodos(session)

  // Custom hook: mengelola state pencarian, filter (status/kategori/prioritas), dan pagination
  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    priorityFilter, setPriorityFilter,
    currentPage, setCurrentPage,
    filteredTodos, totalPages, indexOfFirstItem, indexOfLastItem, currentTodos,
    resetFilters,
  } = useTodoFilters(todos)

  // Menghitung statistik ringkas dari daftar todos (total, selesai, aktif, progress, per kategori)
  const { totalTodos, completedTodos, activeTodos, progressPercent, categoryCounts } = getTodoStats(todos, categoriesList)
  // Menghitung statistik berbasis tanggal (tugas terlambat & tugas hari ini)
  const { overdueTodos, todayTasksCount } = getDateStats(todos)

  // Ref untuk menyimpan ID todo yang "menunggu" untuk dibuka modalnya
  // (dipakai saat notifikasi/link eksternal ingin langsung membuka todo tertentu,
  // tapi data todos belum selesai dimuat)
  const pendingTodoIdRef = useRef(null)

  /**
   * Effect: Menangani permintaan "buka todo tertentu" dari luar komponen
   * (via custom event 'todoapp:open-todo', misalnya dari notifikasi).
   * - checkAndOpenPendingTodo: mengecek apakah todo dengan ID yang diminta
   *   sudah tersedia di state `todos`, jika ya maka modal edit langsung dibuka.
   * - handleOpenTodoEvent: listener yang menangkap event dan menyimpan ID
   *   yang diminta ke pendingTodoIdRef, lalu mencoba membukanya.
   * - Effect ini juga otomatis mencoba membuka pending todo setiap kali
   *   `todos` berubah (misalnya setelah data selesai di-fetch).
   */
  useEffect(() => {
    const checkAndOpenPendingTodo = (idToOpen) => {
      const targetId = idToOpen || pendingTodoIdRef.current
      if (!targetId || !todos.length) return

      const targetTodo = todos.find((t) => t.id === targetId)
      if (targetTodo) {
        handleOpenEditModal(targetTodo)
        pendingTodoIdRef.current = null
      }
    }

    const handleOpenTodoEvent = (e) => {
      const id = e.detail?.id
      if (id) {
        pendingTodoIdRef.current = id
        checkAndOpenPendingTodo(id)
      }
    }

    checkAndOpenPendingTodo()

    window.addEventListener('todoapp:open-todo', handleOpenTodoEvent)
    return () => window.removeEventListener('todoapp:open-todo', handleOpenTodoEvent)
  }, [todos, handleOpenEditModal])

  /**
   * Effect: Mengambil nama tampilan (display name) user yang sedang login.
   * - loadName: pertama coba ambil `full_name` dari tabel `profiles` di Supabase.
   *   Jika gagal/kosong, fallback ke `user_metadata.full_name` atau `user_metadata.name`
   *   yang tersimpan di akun auth Supabase.
   * - `mounted` dipakai untuk mencegah pemanggilan setState setelah komponen unmount.
   */
  useEffect(() => {
    let mounted = true
    const loadName = async () => {
      if (!session?.user) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single()

        if (!error && data?.full_name) {
          if (mounted) setUserName(data.full_name)
          return
        }
      } catch {
       // do nothing
      }

      const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name
      if (metaName && mounted) setUserName(metaName)
    }

    loadName()
    return () => { mounted = false }
  }, [session])

  return (
    <div className="min-h-screen bg-[#F5F3ED] dark:bg-[#1A1917] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

        <WelcomeHeader
          userName={userName}
          activeTodos={activeTodos}
          progressPercent={progressPercent}
          completedTodos={completedTodos}
          totalTodos={totalTodos}
          onAddTodo={handleOpenCreateModal}
        />

        <StatsCards
          progressPercent={progressPercent}
          todayTasksCount={todayTasksCount}
          completedTodos={completedTodos}
          activeTodos={activeTodos}
          overdueTodos={overdueTodos}
          categoriesCount={categoriesList.length}
        />

        <CategoryChips
          categoriesList={categoriesList}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categoryCounts={categoryCounts}
          totalTodos={totalTodos}
          onOpenCategoryModal={() => setShowCategoryModal(true)}
        />

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            <SearchFilterPanel
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              priorityFilter={priorityFilter}
              setPriorityFilter={setPriorityFilter}
              onResetFilters={resetFilters}
            />

            <TodoList
              loading={loading}
              currentTodos={currentTodos}
              filteredCount={filteredTodos.length}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              onToggleStatus={updateStatus}
              onEdit={handleOpenEditModal}
              onDelete={deleteTodo}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <ProductivityWidget progressPercent={progressPercent} completedTodos={completedTodos} />
            <CalendarWidget todos={todos} onTodoClick={handleOpenEditModal} />
            <RecentActivity session={session} />
          </div>

        </div>

      </div>

      {/* MODAL TAMBAH / EDIT TUGAS */}
      <TodoFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        editingTodoId={editingTodoId}
        title={title} setTitle={setTitle}
        description={description} setDescription={setDescription}
        category={category} setCategory={setCategory}
        categoriesList={categoriesList}
        priority={priority} setPriority={setPriority}
        due_date={due_date} setdue_date={setdue_date}
        due_time={due_time} setDueTime={setDueTime}
        reference_link={reference_link} setReferenceLink={setReferenceLink}
        checklist={checklist} setChecklist={setChecklist}
        file={file} setFile={setFile}
        existingFileUrl={existingFileUrl}
        uploading={uploading}
        onSubmit={handleSaveTodo}
      />

      {/* MODAL TAMBAH KATEGORI BARU */}
      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        newCategoryInput={newCategoryInput}
        setNewCategoryInput={setNewCategoryInput}
        onSubmit={handleAddCategory}
      />
    </div>
  )
}