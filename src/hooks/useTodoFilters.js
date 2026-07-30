import { useState } from 'react'

/**
 * Custom hook untuk mengelola pencarian, filter, dan pagination pada daftar todos.
 * Menerima `todos` (daftar tugas mentah) dan mengembalikan:
 * - State pencarian & filter (searchTerm, statusFilter, categoryFilter, priorityFilter)
 * - State & data pagination (currentPage, totalPages, currentTodos, dst)
 * - filteredTodos: hasil todos setelah difilter (sebelum dipotong per halaman)
 * - resetFilters: fungsi untuk mengembalikan semua filter ke kondisi awal
 */
export function useTodoFilters(todos) {
  // State untuk kata kunci pencarian (judul & deskripsi)
  const [searchTerm, setSearchTerm] = useState('')
  // State filter berdasarkan status tugas (ALL / Aktif / Selesai)
  const [statusFilter, setStatusFilter] = useState('ALL')
  // State filter berdasarkan kategori tugas
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  // State filter berdasarkan tingkat prioritas tugas
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Menyaring `todos` berdasarkan kombinasi searchTerm, statusFilter,
  // categoryFilter, dan priorityFilter yang sedang aktif.
  // Sebuah todo hanya lolos jika memenuhi SEMUA kondisi filter yang aktif.
  const filteredTodos = todos.filter(t => {
    const matchesSearch = (t.title || t.judul || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ((t.description || t.deskripsi) && (t.description || t.deskripsi).toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter

    const matchesCategory = categoryFilter === 'ALL' ||
                            (t.category || t.kategori || 'General').trim().toLowerCase() === categoryFilter.trim().toLowerCase()

    const matchesPriority = priorityFilter === 'ALL' || (t.priority || t.prioritas) === priorityFilter
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  // Menghitung total halaman & memotong filteredTodos sesuai halaman aktif
  // (currentPage) untuk keperluan pagination.
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTodos = filteredTodos.slice(indexOfFirstItem, indexOfLastItem)

  /**
   * Mengembalikan semua state pencarian & filter ke kondisi default
   * (kosong / "ALL"), biasanya dipanggil saat user menekan tombol "Reset Filter".
   */
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