// Fungsi helper untuk format tanggal lokal YYYY-MM-DD yang aman dari timezone
export function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Hitung statistik tanggal (hari ini, besok, overdue, upcoming) dari daftar todos
export function getDateStats(todos) {
  const today = new Date()
  const todayStr = getLocalDateString(today)

  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowStr = getLocalDateString(tomorrow)

  const overdueTodos = todos.filter(t => {
    const d = String(t.due_date || t.duedate || '').split('T')[0]
    return d && d < todayStr && t.status !== 'Selesai' && !t.is_completed
  }).length

  const todayTasksCount = todos.filter(t => {
    const d = String(t.due_date || t.duedate || '').split('T')[0]
    return d === todayStr
  }).length

  // Tugas mendekati (Hari Ini, Besok, ATAU Terlambat)
  const upcomingList = todos.filter(t => {
    if (!t.due_date && !t.duedate) return false
    if (t.status === 'Selesai' || t.is_completed) return false

    const rawDate = String(t.due_date || t.duedate).split('T')[0]

    return rawDate === todayStr || rawDate === tomorrowStr || rawDate < todayStr
  })

  return { todayStr, tomorrowStr, overdueTodos, todayTasksCount, upcomingList }
}
