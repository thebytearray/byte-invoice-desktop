import { invoke } from '@tauri-apps/api/core'
import type {
  Company,
  Client,
  Product,
  Invoice,
  AppData,
  AppSettings,
  InitializeDataResult,
} from '@/types'

// Backend uses snake_case in Rust but serde renames to camelCase for JSON
// Frontend types already use camelCase - they should match

export const tauriApi = {
  async initializeData(): Promise<InitializeDataResult> {
    return invoke<InitializeDataResult>('initialize_data')
  },

  async getCompany(): Promise<Company | null> {
    return invoke<Company | null>('get_company')
  },

  async setCompany(company: Company): Promise<void> {
    return invoke('set_company', { company })
  },

  async getClients(): Promise<Client[]> {
    return invoke<Client[]>('get_clients')
  },

  async addClient(client: Client): Promise<void> {
    return invoke('add_client', { client })
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.email !== undefined) payload.email = updates.email
    if (updates.phone !== undefined) payload.phone = updates.phone
    if (updates.address !== undefined) payload.address = updates.address
    if (updates.city !== undefined) payload.city = updates.city
    if (updates.state !== undefined) payload.state = updates.state
    if (updates.zipCode !== undefined) payload.zipCode = updates.zipCode
    if (updates.country !== undefined) payload.country = updates.country
    if (updates.advancePayment !== undefined) payload.advancePayment = updates.advancePayment
    return invoke('update_client', { id, updates: payload })
  },

  async deleteClient(id: string): Promise<void> {
    return invoke('delete_client', { id })
  },

  async getProducts(): Promise<Product[]> {
    return invoke<Product[]>('get_products')
  },

  async addProduct(product: Product): Promise<void> {
    return invoke('add_product', { product })
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.description !== undefined) payload.description = updates.description
    if (updates.price !== undefined) payload.price = updates.price
    if (updates.sku !== undefined) payload.sku = updates.sku
    if (updates.category !== undefined) payload.category = updates.category
    return invoke('update_product', { id, updates: payload })
  },

  async deleteProduct(id: string): Promise<void> {
    return invoke('delete_product', { id })
  },

  async getInvoices(): Promise<Invoice[]> {
    return invoke<Invoice[]>('get_invoices')
  },

  async addInvoice(invoice: Invoice): Promise<void> {
    return invoke('add_invoice', { invoice })
  },

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
    const payload: Record<string, unknown> = {}
    if (updates.invoiceNumber !== undefined) payload.invoiceNumber = updates.invoiceNumber
    if (updates.clientId !== undefined) payload.clientId = updates.clientId
    if (updates.clientName !== undefined) payload.clientName = updates.clientName
    if (updates.issueDate !== undefined) payload.issueDate = updates.issueDate
    if (updates.dueDate !== undefined) payload.dueDate = updates.dueDate
    if (updates.items !== undefined) payload.items = updates.items
    if (updates.subtotal !== undefined) payload.subtotal = updates.subtotal
    if (updates.taxRate !== undefined) payload.taxRate = updates.taxRate
    if (updates.taxAmount !== undefined) payload.taxAmount = updates.taxAmount
    if (updates.discountRate !== undefined) payload.discountRate = updates.discountRate
    if (updates.discountAmount !== undefined) payload.discountAmount = updates.discountAmount
    if (updates.total !== undefined) payload.total = updates.total
    if (updates.status !== undefined) payload.status = updates.status
    if (updates.notes !== undefined) payload.notes = updates.notes
    if (updates.emailSent !== undefined) payload.emailSent = updates.emailSent
    if (updates.lastReminderSent !== undefined) payload.lastReminderSent = updates.lastReminderSent
    return invoke('update_invoice', { id, updates: payload })
  },

  async deleteInvoice(id: string): Promise<void> {
    return invoke('delete_invoice', { id })
  },

  async getInvoiceCount(): Promise<number> {
    return invoke<number>('get_invoice_count')
  },

  async getSettings(): Promise<AppSettings> {
    return invoke<AppSettings>('get_settings')
  },

  async setSettings(settings: AppSettings): Promise<void> {
    return invoke('set_settings', { settings })
  },

  async exportData(): Promise<AppData> {
    return invoke<AppData>('export_data')
  },

  async importData(data: AppData): Promise<void> {
    return invoke('import_data', { data })
  },

  async clearAllData(): Promise<void> {
    return invoke('clear_all_data')
  },

  async sendEmail(payload: SendEmailPayload): Promise<void> {
    return invoke('send_email', { payload })
  },
}

export interface SendEmailPayload {
  to: string
  subject: string
  htmlBody: string
  pdfBase64?: string
  pdfFilename?: string
}
