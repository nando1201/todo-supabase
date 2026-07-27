import { useEffect } from 'react'
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


export default function Dashboard({ session }) {
  const {
    todos, loading, categoriesList,
    showCategoryModal, setShowCategoryModal, newCategoryInput, setNewCategoryInput, handleAddCategory,
    showModal, setShowModal, editingTodoId,
    title, setTitle, description, setDescription, category, setCategory,
    priority, setPriority, due_date, setdue_date,
    file, setFile, existingFileUrl, uploading,
    handleOpenCreateModal, handleOpenEditModal, handleSaveTodo,
    updateStatus, deleteTodo,
  } = useTodos(session)

  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    priorityFilter, setPriorityFilter,
    currentPage, setCurrentPage,
    filteredTodos, totalPages, indexOfFirstItem, indexOfLastItem, currentTodos,
    resetFilters,
  } = useTodoFilters(todos)

  const { totalTodos, completedTodos, activeTodos, progressPercent, categoryCounts } = getTodoStats(todos, categoriesList)
  const { overdueTodos, todayTasksCount } = getDateStats(todos)

  // Dengarkan event global "todoapp:open-todo" (dipicu dari klik item di
  // CalendarWidget/UpcomingDeadlines, termasuk dropdown notifikasi di Navbar)
  // lalu langsung buka modal edit untuk tugas yang bersangkutan.
  useEffect(() => {
    const handleOpenTodoEvent = (e) => {
      const id = e.detail?.id
      const targetTodo = todos.find(t => t.id === id)
      if (targetTodo) {
        handleOpenEditModal(targetTodo)
      }
    }
    window.addEventListener('todoapp:open-todo', handleOpenTodoEvent)
    return () => window.removeEventListener('todoapp:open-todo', handleOpenTodoEvent)
  }, [todos, handleOpenEditModal])

  return (
    <div className="min-h-screen bg-[#F5F3ED] dark:bg-[#1A1917] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

        <WelcomeHeader
          userName={session.user.user_metadata?.full_name}
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