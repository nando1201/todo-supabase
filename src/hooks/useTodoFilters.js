import { useState } from 'react'

export function useTodoFilters(todos) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredTodos = todos.filter(t => {
    const matchesSearch = (t.title || t.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ((t.description || t.deskripsi) && (t.description || t.deskripsi).toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter

    const matchesCategory = categoryFilter === 'ALL' ||
                            (t.category || t.kategori || 'General').trim().toLowerCase() === categoryFilter.trim().toLowerCase()

    const matchesPriority = priorityFilter === 'ALL' || (t.priority || t.prioritas) === priorityFilter
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTodos = filteredTodos.slice(indexOfFirstItem, indexOfLastItem)

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('ALL')
    setCategoryFilter('ALL')
    setPriorityFilter('ALL')
  }

  return {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    priorityFilter, setPriorityFilter,
    currentPage, setCurrentPage,
    filteredTodos, totalPages, indexOfFirstItem, indexOfLastItem, currentTodos,
    resetFilters,
  }
}
