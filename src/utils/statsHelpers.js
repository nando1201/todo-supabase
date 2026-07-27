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
