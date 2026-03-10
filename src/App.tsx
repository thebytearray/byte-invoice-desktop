import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { StoreInitializer } from '@/components/StoreInitializer'
import {
  DashboardPage,
  InvoicesPage,
  InvoiceNewPage,
  InvoiceDetailPage,
  InvoiceEditPage,
  ClientsPage,
  ProductsPage,
  SettingsPage,
} from '@/pages'

function AppLayout() {
  return (
    <DashboardShell>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<InvoiceNewPage />} />
        <Route path="invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="invoices/edit/:id" element={<InvoiceEditPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardShell>
  )
}

const MIN_WINDOW_WIDTH = 1024
const MIN_WINDOW_HEIGHT = 700

export default function App() {
  useEffect(() => {
    getCurrentWindow()
      .setMinSize(new LogicalSize(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT))
      .catch(() => { /* Not in Tauri, ignore */ })
  }, [])

  return (
    <BrowserRouter>
      <StoreInitializer />
      <AppLayout />
    </BrowserRouter>
  )
}
