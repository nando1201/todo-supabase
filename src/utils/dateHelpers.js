/**
 * Mengubah objek Date menjadi string tanggal lokal format "YYYY-MM-DD".
 * Sengaja tidak memakai `toISOString()` karena itu mengonversi ke UTC
 * (bisa menggeser tanggal jika timezone user bukan UTC). Fungsi ini
 * murni memakai getFullYear/getMonth/getDate (waktu lokal perangkat),
 * jadi tanggal yang dihasilkan aman sesuai timezone user.
 */
export function getLocalDateString(dateObj) {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Menghitung berbagai statistik terkait tanggal dari daftar todos:
 * - overdueTodos: jumlah tugas yang tenggatnya sudah lewat & belum selesai
 * - todayTasksCount: jumlah tugas yang jatuh tempo hari ini
 * - upcomingList: daftar tugas yang jatuh tempo hari ini, besok, atau
 *   sudah terlambat (dan belum selesai) — biasanya dipakai untuk widget
 *   "tugas mendekati deadline"
 * Mengembalikan object berisi todayStr, tomorrowStr, dan hasil hitungan di atas.
 */
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