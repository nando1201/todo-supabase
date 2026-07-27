import { useState, useEffect, useCallback } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday 
} from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import TodoFormModal from './modals/TodoFormModal';
import TodoDetailModal from './TodoDetailModal';

export const CalendarPage = ({ session }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Daftar Mata Kuliah / Kategori Default
  const [categoriesList, setCategoriesList] = useState([
    'Algoritma & Struktur Data',
    'Basis Data',
    'Jaringan Komputer',
    'Kecerdasan Buatan',
    'Pemrograman Web 2'
  ]);

  // State Modal Detail
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form States
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [due_date, setdue_date] = useState('');
  const [due_time, setDueTime] = useState('');
  const [reference_link, setReferenceLink] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [file, setFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase.from('todos').select('*');

      if (session?.user?.id) {
        query = query.eq('user_id', session.user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTodos(data || []);

      // Fetch kategori kustom jika ada di DB
      let catQuery = supabase.from('categories').select('*');
      if (session?.user?.id) {
        catQuery = catQuery.eq('user_id', session.user.id);
      }
      const { data: catData } = await catQuery;
      if (catData && catData.length > 0) {
        setCategoriesList(catData.map((c) => c.name));
      }
    } catch (err) {
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    let isMounted = true;
    
    // Dipanggil di dalam pembaruan async murni untuk menghindari pola cascading render
    const loadData = async () => {
      if (isMounted) {
        await fetchTodos();
      }
    };

    loadData();

    return () => { 
      isMounted = false; 
    };
  }, [fetchTodos]);

  // 1. Ketika Tugas di Kalender Diklik -> Buka Modal Detail Dulu
  const handleTodoClick = (todo) => {
    if (!todo) return;
    setSelectedTodo(todo);
    setShowDetailModal(true);
  };

  // 2. Ketika Tombol Edit di Detail Modal Diklik -> Buka Form Modal Edit
  const handleOpenEditFromDetail = (todoToEdit) => {
    const todo = todoToEdit || selectedTodo;
    if (!todo) return;

    // Tutup Modal Detail
    setShowDetailModal(false);

    // Isi State Form dengan data Todo
    setEditingTodoId(todo.id);
    setTitle(todo.title || todo.judul || '');
    setDescription(todo.description || todo.deskripsi || '');
    setCategory(todo.category || todo.kategori || categoriesList[0] || 'General');
    setPriority(todo.priority || todo.prioritas || 'Medium');

    // Tanggal & Jam
    const rawDate = todo.due_date || todo.duedate || '';
    setdue_date(rawDate ? rawDate.split('T')[0] : '');
    setDueTime(todo.due_time || todo.duetime || todo.time || '');

    // Link Referensi
    setReferenceLink(todo.reference_link || todo.link_referensi || todo.url || todo.link || '');

    // Safety parsing Checklist (Array / JSON String / Null)
    let initialChecklist = [];
    if (todo.checklist || todo.subtasks) {
      const rawChecklist = todo.checklist || todo.subtasks;
      if (typeof rawChecklist === 'string') {
        try {
          initialChecklist = JSON.parse(rawChecklist);
        } catch {
          initialChecklist = [];
        }
      } else if (Array.isArray(rawChecklist)) {
        initialChecklist = rawChecklist;
      }
    }
    setChecklist(initialChecklist);

    setExistingFileUrl(todo.file_url || todo.lampiran || todo.file || todo.attachment || '');
    setFile(null);

    // Buka Form Modal
    setShowFormModal(true);
  };

  // Toggle Checklist langsung dari Detail Modal
  const handleToggleChecklist = async (todoId, itemId) => {
    try {
      const targetTodo = todos.find((t) => t.id === todoId);
      if (!targetTodo) return;

      let currentChecklist = [];
      if (typeof targetTodo.checklist === 'string') {
        try { currentChecklist = JSON.parse(targetTodo.checklist); } catch { currentChecklist = []; }
      } else if (Array.isArray(targetTodo.checklist)) {
        currentChecklist = [...targetTodo.checklist];
      }

      const updatedChecklist = currentChecklist.map((item, idx) => {
        const idToCheck = item.id !== undefined ? item.id : idx;
        if (idToCheck === itemId) {
          return { ...item, is_completed: !item.is_completed };
        }
        return item;
      });

      // Update di Supabase
      const { error } = await supabase
        .from('todos')
        .update({ checklist: updatedChecklist })
        .eq('id', todoId);

      if (error) throw error;

      // Update State Lokal
      const updatedTodos = todos.map((t) =>
        t.id === todoId ? { ...t, checklist: updatedChecklist } : t
      );
      setTodos(updatedTodos);

      if (selectedTodo && selectedTodo.id === todoId) {
        setSelectedTodo({ ...selectedTodo, checklist: updatedChecklist });
      }
    } catch (err) {
      console.error('Gagal memperbarui checklist:', err);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingTodoId(null);
    setTitle('');
    setDescription('');
    setDueTime('');
    setReferenceLink('');
    setChecklist([]);
    setFile(null);
    setExistingFileUrl('');
  };

  const handleSubmitForm = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      setUploading(true);
      let uploadedFileUrl = existingFileUrl;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session?.user?.id || 'public'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);

        uploadedFileUrl = publicUrlData.publicUrl;
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
        file_url: uploadedFileUrl
      };

      const { error } = await supabase
        .from('todos')
        .update(payload)
        .eq('id', editingTodoId);

      if (error) throw error;

      await fetchTodos();
      handleCloseFormModal();
    } catch (err) {
      console.error('Gagal memperbarui tugas:', err);
      alert('Gagal menyimpan! Pastikan kolom SQL di Supabase sudah ditambahkan.');
    } finally {
      setUploading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getBadgeStyle = (priorityVal) => {
    switch (priorityVal?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-200';
    }
  };

  // Helper Format Waktu untuk Detail Modal
  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return '—';
    try {
      const formattedDate = format(new Date(dateStr), 'dd MMMM yyyy', { locale: id });
      return timeStr ? `${formattedDate} pukul ${timeStr}` : formattedDate;
    } catch {
      return `${dateStr} ${timeStr || ''}`;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header Kalender */}
      <div className="bg-white dark:bg-[#1A1917] rounded-t-2xl p-4 border border-gray-100 dark:border-[#3A3733] flex items-center justify-between shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize flex items-center gap-2">
          {format(currentMonth, 'MMMM yyyy', { locale: id })}
          {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        </h2>

        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            Hari ini
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Nama Hari */}
      <div className="grid grid-cols-7 bg-gray-50/50 dark:bg-[#211F1C] border-x border-b border-gray-100 dark:border-[#3A3733] text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-3">
        <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
      </div>

      {/* Grid Tanggal Kalender */}
      <div className="grid grid-cols-7 bg-white dark:bg-[#1A1917] border-x border-b border-gray-100 dark:border-[#3A3733] rounded-b-2xl shadow-sm min-h-[600px] auto-rows-fr">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const formattedDateStr = format(day, 'yyyy-MM-dd');

          const dayTodos = todos.filter(
            (t) => t.due_date && t.due_date.split('T')[0] === formattedDateStr
          );

          return (
            <div
              key={idx}
              className={`border-r border-b border-gray-100 dark:border-[#3A3733] p-1.5 sm:p-2 min-h-[110px] flex flex-col justify-start ${
                !isCurrentMonth ? 'bg-gray-50/40 dark:bg-[#141312] text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'
              }`}
            >
              <div className="flex justify-start mb-1">
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[80px]">
                {dayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => handleTodoClick(todo)}
                    title={`Klik untuk lihat detail: ${todo.title}`}
                    className={`text-[11px] px-2 py-1 rounded-md border truncate font-medium cursor-pointer transition transform active:scale-95 ${getBadgeStyle(todo.priority)} ${todo.is_completed ? 'line-through opacity-60' : ''}`}
                  >
                    {todo.due_time && <span className="font-bold mr-1">[{todo.due_time}]</span>}
                    {todo.title || 'Tanpa Judul'}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETAIL TUGAS */}
      {showDetailModal && (
        <TodoDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTodo(null);
          }}
          todo={selectedTodo}
          formatDateTime={formatDateTime}
          onToggleChecklist={handleToggleChecklist}
          onEdit={handleOpenEditFromDetail}
        />
      )}

      {/* MODAL EDIT TUGAS */}
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
    </div>
  );
};