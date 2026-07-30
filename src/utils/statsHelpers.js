/**
 * Menghitung statistik ringkas dari daftar todos, meliputi:
 * - totalTodos: jumlah seluruh tugas
 * - completedTodos: jumlah tugas berstatus "Selesai" (atau is_completed true)
 * - activeTodos: jumlah tugas yang belum selesai (totalTodos - completedTodos)
 * - progressPercent: persentase penyelesaian tugas (dibulatkan), 0 jika tidak ada tugas
 * - categoryCounts: object berisi jumlah tugas per kategori, contoh:
 *   { General: 3, Kuliah: 5, Pekerjaan: 2 }
 *   (perbandingan kategori dilakukan case-insensitive, default kategori "General")
 */
export function getTodoStats(todos, categoriesList) {
  const totalTodos = todos.length
  const completedTodos = todos.filter(t => t.status === 'Selesai' || t.is_completed).length
  const activeTodos = totalTodos - completedTodos
  const progressPercent = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  const categoryCounts = categoriesList.reduce((acc, cat) => {
    acc[cat] = todos.filter(t => (t.category || 'General').trim().toLowerCase() === cat.trim().toLowerCase()).length
    return acc
  }, {})

  return { totalTodos, completedTodos, activeTodos, progressPercent, categoryCounts }
}