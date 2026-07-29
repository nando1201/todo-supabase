//CalendarWidget.jsx
import { useState, useMemo } from 'react'
import { buildMonthMatrix, groupTodosByDate, MONTH_NAMES_ID, DAY_LABELS_ID } from '../utils/calendarHelpers'
import { getLocalDateString } from '../utils/dateHelpers'
import { supabase } from '../supabaseClient'
import TodoDetailModal from './TodoDetailModal'
import TodoFormModal from './modals/TodoFormModal'

export default function CalendarWidget({ todos, categoriesList = [], session, onRefresh }) {
  // 1. State Modal Detail
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 2. State Modal Form/Edit
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTodoId, setEditingTodoId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [due_date, setdue_date] = useState('')
  const [due_time, setDueTime] = useState('')
  const [reference_link, setReferenceLink] = useState('')
  const [checklist, setChecklist] = useState([])
  const [file, setFile] = useState(null)
  const [existingFileUrl, setExistingFileUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // Klik Item Tugas -> Buka Modal Detail
  const handleTodoClick = (todo) => {
    if (!todo) return
    setSelectedTodo(todo)
    setShowDetailModal(true)
  }

  // Buka Modal Edit dari dalam Modal Detail
  const handleOpenEditFromDetail = (todoToEdit) => {
    const todo = todoToEdit || selectedTodo
    if (!todo) return

    setShowDetailModal(false)

    setEditingTodoId(todo.id)
    setTitle(todo.title || todo.judul || '')
    setDescription(todo.description || todo.deskripsi || '')
    setCategory(todo.category || todo.kategori || categoriesList[0] || 'General')
    setPriority(todo.priority || todo.prioritas || 'Medium')

    const rawDate = todo.due_date || todo.duedate || ''
    setdue_date(rawDate ? rawDate.split('T')[0] : '')
    setDueTime(todo.due_time || todo.duetime || todo.time || '')

    setReferenceLink(todo.reference_link || todo.link_referensi || todo.url || todo.link || '')

    let initialChecklist = []
    if (todo.checklist || todo.subtasks) {
      const rawChecklist = todo.checklist || todo.subtasks
      if (typeof rawChecklist === 'string') {
        try {
          initialChecklist = JSON.parse(rawChecklist)
        } catch {
          initialChecklist = []
        }
      } else if (Array.isArray(rawChecklist)) {
        initialChecklist = rawChecklist
      }
    }
    setChecklist(initialChecklist)

    setExistingFileUrl(todo.file_url || todo.lampiran || todo.file || todo.attachment || '')
    setFile(null)

    setShowFormModal(true)
  }

  const handleCloseFormModal = () => {
    setShowFormModal(false)
    setEditingTodoId(null)
    setTitle('')
    setDescription('')
    setDueTime('')
    setReferenceLink('')
    setChecklist([])
    setFile(null)
    setExistingFileUrl('')
  }

  // Submit Edit Form (Memakai uploading, session, & onRefresh)
  const handleSubmitForm = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
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
        due_time: due_time || null,
        reference_link: reference_link || null,
        checklist: checklist || [],
        file_url: uploadedFileUrl,
      }

      const { error } = await supabase
        .from('todos')
        .update(payload)
        .eq('id', editingTodoId)

      if (error) throw error

      if (onRefresh) await onRefresh()
      handleCloseFormModal()
    } catch (err) {
      console.error('Gagal memperbarui tugas:', err)
      alert('Gagal menyimpan perubahan!')
    } finally {
      setUploading(false)
    }
  }

  // Waktu Navigasi Kalender
  const today = new Date()
  const todayStr = getLocalDateString(today)
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const tasksByDate = useMemo(() => groupTodosByDate(todos), [todos])
  const weeks = useMemo(
    () => buildMonthMatrix(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  )

  const goToPrevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goToNextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const selectedTasks = tasksByDate[selectedDate] || []

  return (
    <>
      <div className="bg-white dark:bg-[#211F1C] border border-[#E4DFD3] dark:border-[#3A3733] p-6 rounded-md shadow-sm space-y-4">
        <h3 className="text-sm font-serif text-slate-900 dark:text-white text-center">Kalender Tugas</h3>

        {/* Navigasi Bulan */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition"
          >
            ‹
          </button>
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {MONTH_NAMES_ID[viewDate.getMonth()]} {viewDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-md text-slate-400 hover:text-[#3D5F49] hover:bg-[#3D5F49]/10 transition"
          >
            ›
          </button>
        </div>

        {/* Grid Hari & Tanggal */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_LABELS_ID.map(d => (
            <span key={d} className="text-[10px] font-mono uppercase text-slate-400 pb-1">{d}</span>
          ))}

          {weeks.flat().map((cell, idx) => {
            if (!cell.inMonth) {
              return <div key={idx} className="aspect-square rounded-md opacity-20 bg-slate-200 dark:bg-slate-800" />
            }

            const dayTasks = tasksByDate[cell.dateStr] || []
            const hasTasks = dayTasks.length > 0
            const isToday = cell.dateStr === todayStr
            const isSelected = cell.dateStr === selectedDate

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(cell.dateStr)}
                className={`aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 text-xs transition-all ${
                  isToday
                    ? 'bg-[#A83B32] text-white font-bold'
                    : isSelected
                    ? 'bg-[#3D5F49]/15 text-[#20302A] dark:text-white font-bold ring-1 ring-[#3D5F49]/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-[#F5F3ED] dark:hover:bg-white/5'
                }`}
              >
                {cell.day}
                {hasTasks && !isToday && <span className="w-1 h-1 rounded-full bg-[#C99A2E]"></span>}
              </button>
            )
          })}
        </div>

        {/* List Tugas Tanggal Terpilih */}
        <div className="pt-3 border-t border-[#E9E4D8] dark:border-[#3A3733] space-y-2">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Tugas {selectedDate}
          </p>

          {selectedTasks.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Tidak ada tugas di tanggal ini.</p>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleTodoClick(t)}
                  className="p-2.5 rounded-md bg-[#F5F3ED] dark:bg-[#1A1917] border border-[#E9E4D8] dark:border-[#3A3733] flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-[#3D5F49]/50 transition"
                >
                  <span className={`font-medium text-slate-800 dark:text-slate-200 truncate ${t.is_completed ? 'line-through opacity-60' : ''}`}>
                    {t.title || t.judul}
                  </span>
                  <span className="shrink-0 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase font-mono bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                    {t.priority || t.prioritas || 'Medium'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Tugas */}
      {showDetailModal && (
        <TodoDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTodo(null)
          }}
          todo={selectedTodo}
          onEdit={handleOpenEditFromDetail}
        />
      )}

      {/* Modal Edit Tugas */}
      {showFormModal && (
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
          due_time={due_time}
          setDueTime={setDueTime}
          reference_link={reference_link}
          setReferenceLink={setReferenceLink}
          checklist={checklist}
          setChecklist={setChecklist}
          file={file}
          setFile={setFile}
          existingFileUrl={existingFileUrl}
          uploading={uploading}
          onSubmit={handleSubmitForm}
        />
      )}
    </>
  )
}