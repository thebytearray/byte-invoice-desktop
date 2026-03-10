import { createElement } from 'react'
import { InvoiceEmail, OverdueEmail, ReminderEmail } from '@/emails'
import { InvoicePDFDocument } from '@/components/invoices/InvoicePDF'
import { tauriApi } from '@/lib/tauri-api'
import type {
  Client,
  Company,
  EmailTemplate,
  Invoice,
  SMTPSettings,
} from '@/types'
import { render } from '@react-email/render'
import { pdf } from '@react-pdf/renderer'

function replacePlaceholders(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}

function buildVariables(
  invoice: Invoice,
  client: Client,
  company: Company
): Record<string, string> {
  const total = (invoice.total - (client.advancePayment || 0)).toFixed(2)
  const variables: Record<string, string> = {
    invoiceNumber: invoice.invoiceNumber || invoice.id || 'N/A',
    clientName: client.name || 'Valued Customer',
    companyName: company.name || 'Your Company',
    total,
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A',
    issueDate: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A',
    clientEmail: client.email || '',
    companyEmail: company.email || '',
    companyPhone: company.phone || '',
    companyAddress: company.address || '',
    companyWebsite: company.website || '',
    invoiceStatus:
      invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Draft',
  }

  let statusMessage = ''
  let statusColor = '#2563eb'

  switch (invoice.status) {
    case 'paid':
      statusMessage =
        'Thank you for your payment! This invoice has been marked as paid.'
      statusColor = '#16a34a'
      break
    case 'overdue':
      statusMessage =
        'This invoice is now overdue. Please arrange payment as soon as possible to avoid any service interruptions.'
      statusColor = '#dc2626'
      break
    case 'sent':
      statusMessage =
        'This invoice is awaiting payment. Please review the details and process payment by the due date.'
      statusColor = '#ea580c'
      break
    default:
      statusMessage =
        'Please review the attached invoice and process payment by the due date.'
      statusColor = '#2563eb'
  }

  variables.statusMessage = statusMessage
  variables.statusColor = statusColor

  const dueDate = new Date(invoice.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  variables.daysOverdue = String(Math.max(0, daysOverdue))

  return variables
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64 || '')
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function sendInvoice(
  invoice: Invoice,
  client: Client,
  company: Company,
  smtpSettings: SMTPSettings,
  template?: EmailTemplate
): Promise<boolean> {
  if (!client.email?.includes('@')) {
    throw new Error('Invalid client email address')
  }
  if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password) {
    throw new Error('Incomplete SMTP settings. Configure email in Settings.')
  }

  const variables = buildVariables(invoice, client, company)

  const defaultSubject =
    invoice.status === 'paid'
      ? `Payment Confirmation - Invoice ${variables.invoiceNumber} from ${variables.companyName}`
      : invoice.status === 'overdue'
        ? `OVERDUE: Invoice ${variables.invoiceNumber} - Immediate Action Required`
        : `Invoice ${variables.invoiceNumber} from ${variables.companyName} - Due ${variables.dueDate}`

  const subject = template?.subject
    ? replacePlaceholders(template.subject, variables)
    : defaultSubject

  const html = await render(
    createElement(InvoiceEmail, {
      invoiceNumber: variables.invoiceNumber,
      clientName: variables.clientName,
      companyName: variables.companyName,
      total: variables.total,
      dueDate: variables.dueDate,
      statusMessage: variables.statusMessage,
      statusColor: variables.statusColor,
    })
  )

  let pdfBase64: string | undefined
  let pdfFilename: string | undefined

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfDoc = pdf(createElement(InvoicePDFDocument, { invoice, company, client }) as any)
    const blob = await pdfDoc.toBlob()
    pdfBase64 = await blobToBase64(blob)
    pdfFilename = `invoice-${invoice.invoiceNumber}.pdf`
  } catch (err) {
    console.error('PDF generation failed:', err)
  }

  try {
    await tauriApi.sendEmail({
      smtp: {
        host: smtpSettings.host,
        port: smtpSettings.port ?? 587,
        secure: smtpSettings.secure ?? false,
        username: smtpSettings.username,
        password: smtpSettings.password,
        fromName: smtpSettings.fromName || company.name,
        fromEmail: smtpSettings.fromEmail || company.email,
      },
      to: client.email,
      subject,
      html,
      pdfBase64,
      pdfFilename,
    })
    return true
  } catch (err) {
    console.error('Send email failed:', err)
    throw err
  }
}

export async function sendReminder(
  invoice: Invoice,
  client: Client,
  company: Company,
  smtpSettings: SMTPSettings,
  template?: EmailTemplate
): Promise<boolean> {
  if (!client.email?.includes('@')) {
    throw new Error('Invalid client email address')
  }
  if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password) {
    throw new Error('Incomplete SMTP settings. Configure email in Settings.')
  }

  const variables = buildVariables(invoice, client, company)

  const defaultSubject = `Payment Reminder - Invoice ${variables.invoiceNumber}`
  const subject = template?.subject
    ? replacePlaceholders(template.subject, variables)
    : defaultSubject

  const html = await render(
    createElement(ReminderEmail, {
      invoiceNumber: variables.invoiceNumber,
      clientName: variables.clientName,
      companyName: variables.companyName,
      total: variables.total,
      dueDate: variables.dueDate,
    })
  )

  try {
    await tauriApi.sendEmail({
      smtp: {
        host: smtpSettings.host,
        port: smtpSettings.port ?? 587,
        secure: smtpSettings.secure ?? false,
        username: smtpSettings.username,
        password: smtpSettings.password,
        fromName: smtpSettings.fromName || company.name,
        fromEmail: smtpSettings.fromEmail || company.email,
      },
      to: client.email,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Send reminder failed:', err)
    throw err
  }
}

export async function sendOverdueNotice(
  invoice: Invoice,
  client: Client,
  company: Company,
  smtpSettings: SMTPSettings,
  template?: EmailTemplate
): Promise<boolean> {
  if (!client.email?.includes('@')) {
    throw new Error('Invalid client email address')
  }
  if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password) {
    throw new Error('Incomplete SMTP settings. Configure email in Settings.')
  }

  const variables = buildVariables(invoice, client, company)
  const daysOverdue = parseInt(variables.daysOverdue, 10) || 0

  const defaultSubject = `OVERDUE: Invoice ${variables.invoiceNumber}`
  const subject = template?.subject
    ? replacePlaceholders(template.subject, variables)
    : defaultSubject

  const html = await render(
    createElement(OverdueEmail, {
      invoiceNumber: variables.invoiceNumber,
      clientName: variables.clientName,
      companyName: variables.companyName,
      total: variables.total,
      dueDate: variables.dueDate,
      daysOverdue,
    })
  )

  try {
    await tauriApi.sendEmail({
      smtp: {
        host: smtpSettings.host,
        port: smtpSettings.port ?? 587,
        secure: smtpSettings.secure ?? false,
        username: smtpSettings.username,
        password: smtpSettings.password,
        fromName: smtpSettings.fromName || company.name,
        fromEmail: smtpSettings.fromEmail || company.email,
      },
      to: client.email,
      subject,
      html,
    })
    return true
  } catch (err) {
    console.error('Send overdue notice failed:', err)
    throw err
  }
}
