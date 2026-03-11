import { create } from 'zustand'
import type { Company, Client, Product, Invoice, AppData, AppSettings } from '@/types'
import { tauriApi } from './tauri-api'
import { toaster } from '@/components/ui/toaster'

const initialCompany: Company = {
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  phone: '',
  email: '',
  website: '',
  taxId: '',
  logo: '',
}

const initialSettings: AppSettings = {
  smtp: {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
  },
  emailTemplates: [
    {
      id: 'default-invoice',
      name: 'Default Invoice Email',
      subject: 'Invoice {{invoiceNumber}} from {{companyName}}',
      body: '<h2>Invoice {{invoiceNumber}}</h2>\n<p>Dear {{clientName}},</p>\n<p>Please find attached your invoice for the amount of ${{total}}.</p>\n<p>Due date: {{dueDate}}</p>\n<p>Thank you for your business!</p>\n<br>\n<p>Best regards,<br>{{companyName}}</p>',
      type: 'invoice',
    },
    {
      id: 'default-reminder',
      name: 'Default Payment Reminder',
      subject: 'Payment Reminder - Invoice {{invoiceNumber}}',
      body: '<h2>Payment Reminder</h2>\n<p>Dear {{clientName}},</p>\n<p>This is a friendly reminder that invoice {{invoiceNumber}} for ${{total}} is still pending payment.</p>\n<p>Due date: {{dueDate}}</p>\n<p>Please process the payment at your earliest convenience.</p>\n<br>\n<p>Best regards,<br>{{companyName}}</p>',
      type: 'reminder',
    },
    {
      id: 'default-overdue',
      name: 'Default Overdue Notice',
      subject: 'OVERDUE: Invoice {{invoiceNumber}}',
      body: '<h2>Overdue Payment Notice</h2>\n<p>Dear {{clientName}},</p>\n<p><strong>URGENT:</strong> Invoice {{invoiceNumber}} for ${{total}} is now overdue.</p>\n<p>Original due date: {{dueDate}}</p>\n<p>Please contact us immediately to resolve this matter.</p>\n<br>\n<p>Best regards,<br>{{companyName}}</p>',
      type: 'overdue',
    },
  ],
}

function showError(message: string) {
  toaster.create({ title: 'Error', description: message, type: 'error' })
}

interface AppState {
  company: Company
  setCompany: (company: Company) => Promise<void>
  clients: Client[]
  addClient: (client: Client) => Promise<void>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  products: Product[]
  addProduct: (product: Product) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => Promise<void>
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  settings: AppSettings
  setSettings: (settings: AppSettings) => Promise<void>
  exportData: () => Promise<AppData | null>
  importData: (data: AppData) => Promise<void>
  clearAllData: () => Promise<void>
  initializeData: () => Promise<void>
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set, get) => ({
  company: initialCompany,
  setCompany: async (company) => {
    try {
      await tauriApi.setCompany(company)
      set({ company })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to save company')
    }
  },
  clients: [],
  addClient: async (client) => {
    try {
      await tauriApi.addClient(client)
      set((state) => ({ clients: [...state.clients, client] }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to add client')
    }
  },
  updateClient: async (id, updatedClient) => {
    try {
      await tauriApi.updateClient(id, updatedClient)
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...updatedClient } : c)),
      }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update client')
    }
  },
  deleteClient: async (id) => {
    try {
      await tauriApi.deleteClient(id)
      set((state) => ({ clients: state.clients.filter((c) => c.id !== id) }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to delete client')
    }
  },
  products: [],
  addProduct: async (product) => {
    try {
      await tauriApi.addProduct(product)
      set((state) => ({ products: [...state.products, product] }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to add product')
    }
  },
  updateProduct: async (id, updatedProduct) => {
    try {
      await tauriApi.updateProduct(id, updatedProduct)
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)),
      }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update product')
    }
  },
  deleteProduct: async (id) => {
    try {
      await tauriApi.deleteProduct(id)
      set((state) => ({ products: state.products.filter((p) => p.id !== id) }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to delete product')
    }
  },
  invoices: [],
  addInvoice: async (invoice) => {
    try {
      await tauriApi.addInvoice(invoice)
      set((state) => ({ invoices: [...state.invoices, invoice] }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to add invoice')
    }
  },
  updateInvoice: async (id, updatedInvoice) => {
    try {
      await tauriApi.updateInvoice(id, updatedInvoice)
      set((state) => ({
        invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...updatedInvoice } : i)),
      }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to update invoice')
    }
  },
  deleteInvoice: async (id) => {
    try {
      await tauriApi.deleteInvoice(id)
      set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) }))
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to delete invoice')
    }
  },
  settings: initialSettings,
  setSettings: async (settings) => {
    try {
      await tauriApi.setSettings(settings)
      set({ settings })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to save settings')
    }
  },
  exportData: async () => {
    try {
      return await tauriApi.exportData()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to export data')
      return null
    }
  },
  importData: async (data) => {
    try {
      await tauriApi.importData(data)
      await get().initializeData()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to import data')
    }
  },
  clearAllData: async () => {
    try {
      await tauriApi.clearAllData()
      await get().initializeData()
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to clear data')
    }
  },
  initializeData: async () => {
    set({ isLoading: true })
    try {
      const result = await tauriApi.initializeData()
      set({
        company: result.company,
        clients: result.clients,
        products: result.products,
        invoices: result.invoices,
        settings: result.settings,
      })
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to load data')
      set({
        company: initialCompany,
        clients: [],
        products: [],
        invoices: [],
        settings: initialSettings,
      })
    } finally {
      set({ isLoading: false })
    }
  },
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))
