// src/main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

/**
 * Entry point aplikasi React.
 * - Mencari elemen DOM dengan id "root" (biasanya ada di index.html) sebagai
 *   tempat me-render seluruh aplikasi React.
 * - Membungkus komponen <App /> dengan:
 *   - <React.StrictMode>: mengaktifkan pengecekan tambahan dari React saat
 *     development untuk membantu menemukan potensi masalah/bug.
 *   - <BrowserRouter>: menyediakan kemampuan routing (navigasi antar halaman
 *     berbasis URL) menggunakan react-router-dom ke seluruh aplikasi.
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)