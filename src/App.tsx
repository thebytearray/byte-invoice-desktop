import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'
import { platform } from '@tauri-apps/plugin-os'
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

const MIN_WINDOW_WIDTH = 320
const MIN_WINDOW_HEIGHT = 400

export default function App() {
  useEffect(() => {
    const applyMinSize = async () => {
      try {
        const p = platform()
        if (p === 'android' || p === 'ios') return
        const win = getCurrentWindow()
        await win.setMinSize(new LogicalSize(MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT))
      } catch {
        /* Not in Tauri or mobile, ignore */
      }
    }
    applyMinSize()
  }, [])

  return (
    <BrowserRouter>
      <StoreInitializer />
      <AppLayout />
    </BrowserRouter>
  )
}
