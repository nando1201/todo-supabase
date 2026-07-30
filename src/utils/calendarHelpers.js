// Nama hari & bulan dalam Bahasa Indonesia
export const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
export const DAY_LABELS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

/**
 * Memformat tahun, bulan (index 0-11), dan tanggal menjadi string "YYYY-MM-DD".
 * Dipakai secara internal oleh buildMonthMatrix untuk membuat `dateStr` tiap cell.
 */
function formatDateStr(year, month, day) {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

/**
 * Membangun matriks (array minggu x hari) untuk tampilan kalender satu bulan.
 * - Menghitung hari pertama bulan berjalan jatuh di kolom (weekday) keberapa,
 *   dengan Senin sebagai awal minggu (bukan Minggu).
 * - Menambahkan cell "pengisi" dari akhir bulan sebelumnya di awal grid,
 *   dan cell dari awal bulan berikutnya di akhir grid, supaya total cell
 *   selalu kelipatan 7 (rapi per baris minggu).
 * - Cell di luar bulan berjalan ditandai `inMonth: false` (buat efek redup/hatch di UI).
 * - Mengembalikan array of weeks, tiap week berisi 7 cell.
 */
export function buildMonthMatrix(year, month) {
  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7 // ubah Minggu=0 jadi Senin=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []

  // Cell dari akhir bulan sebelumnya
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, inMonth: false })
  }

  // Cell bulan berjalan
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, inMonth: true, dateStr: formatDateStr(year, month, d) })
  }

  // Cell awal bulan berikutnya, sampai genap kelipatan 7
  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, inMonth: false })
    nextDay += 1
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

/**
 * Mengelompokkan daftar todos berdasarkan tanggal jatuh temponya (due_date).
 * Hasilnya berupa object dengan key tanggal format "YYYY-MM-DD" dan value
 * berupa array todo yang jatuh tempo di tanggal tersebut.
 * Contoh hasil: { '2026-07-15': [todo, todo], '2026-07-16': [todo], ... }
 */
export function groupTodosByDate(todos) {
  const map = {}
  todos.forEach(t => {
    const raw = String(t.due_date || t.duedate || '').split('T')[0]
    if (!raw) return
    if (!map[raw]) map[raw] = []
    map[raw].push(t)
  })
  return map
}