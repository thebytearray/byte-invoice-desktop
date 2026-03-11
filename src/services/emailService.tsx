import { createElement } from 'react'
import { InvoicePDFDocument } from '@/components/invoices/InvoicePDF'
import { TEAL_500 } from '@/emails/email-theme'
import {
  renderInvoiceEmail,
  renderOverdueEmail,
  renderReminderEmail,
} from '@/lib/email-renderer'
import { tauriApi } from '@/lib/tauri-api'
import { toaster } from '@/components/ui/toaster'
import type { Client, Company, EmailTemplate, Invoice } from '@/types'
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
    invoiceDate: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A',
    issueDate: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A',
    pdfNote: invoice.notes || '',
    clientEmail: client.email || '',
    companyEmail: company.email || '',
    companyPhone: company.phone || '',
    companyAddress: company.address || '',
    companyWebsite: company.website || '',
    invoiceStatus:
      invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Draft',
  }

  let statusMessage = ''
  let statusColor = TEAL_500

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
      statusColor = TEAL_500
      break
    default:
      statusMessage =
        'Please review the attached invoice and process payment by the due date.'
      statusColor = TEAL_500
  }

  variables.statusMessage = statusMessage
  variables.statusColor = statusColor

  const dueDate = new Date(invoice.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)
  const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  variables.daysOverdue = String(Math.max(0, daysOverdue))

  const issueDate = invoice.issueDate ? new Date(invoice.issueDate) : null
  if (issueDate) issueDate.setHours(0, 0, 0, 0)
  const daysSinceSent = issueDate
    ? Math.floor((today.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0
  variables.daysSinceSent = String(Math.max(0, daysSinceSent))

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
  template?: EmailTemplate
): Promise<boolean> {
  if (!client.email?.includes('@')) {
    throw new Error('Invalid client email address')
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

  const companyLogoUrl =
    company.logo && (company.logo.startsWith('data:') || company.logo.startsWith('http'))
      ? company.logo
      : undefined

  const html = await renderInvoiceEmail({
    invoiceNumber: variables.invoiceNumber,
    invoiceDate: variables.invoiceDate,
    clientName: variables.clientName,
    companyName: variables.companyName,
    companyLogoUrl,
    total: variables.total,
    dueDate: variables.dueDate,
    pdfNote: variables.pdfNote || undefined,
    statusMessage: variables.statusMessage,
    statusColor: variables.statusColor,
  })

  let pdfBase64: string | undefined
  let pdfFilename: string | undefined

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- React-PDF pdf() expects DocumentProps, createElement returns generic ReactElement
    const pdfDoc = pdf(createElement(InvoicePDFDocument, { invoice, company, client }) as any)
    const blob = await pdfDoc.toBlob()
    pdfBase64 = await blobToBase64(blob)
    pdfFilename = `invoice-${invoice.invoiceNumber}.pdf`
  } catch (err) {
    toaster.create({
      title: 'Failed to generate PDF',
      description: err instanceof Error ? err.message : 'PDF generation failed',
      type: 'error',
    })
    throw err
  }

  try {
    await tauriApi.sendEmail({
      to: client.email,
      subject,
      htmlBody: html,
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
  template?: EmailTemplate
): Promise<boolean> {
  if (!client.email?.includes('@')) {
    throw new Error('Invalid client email address')
  }

  const variables = buildVariables(invoice, client, company)

  const companyLogoUrl =
    company.logo && (company.logo.startsWith('data:') || company.logo.startsWith('http'))
      ? company.logo
      : undefined

  const defaultSubject = `Payment Reminder - Invoice ${variables.invoiceNumber}`
  const subject = template?.subject
    ? replacePlaceholders(template.subject, variables)
    : defaultSubject

  const html = await renderReminderEmail({
    invoiceNumber: variables.invoiceNumber,
    clientName: variables.clientName,
    companyName: variables.companyName,
    companyLogoUrl,
    total: variables.total,
    dueDate: variables.dueDate,
    daysSinceSent: parseInt(variables.daysSinceSent, 10) || 0,
  })

  try {
    await tauriApi.sendEmail({
      to: client.email,
      subject,
      htmlBody: html,
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
  template?: EmailTemplate
): Promise<boolean> {
  if (!client.email?.includes('@')) {
    throw new Error('Invalid client email address')
  }

  const variables = buildVariables(invoice, client, company)
  const daysOverdue = parseInt(variables.daysOverdue, 10) || 0

  const companyLogoUrl =
    company.logo && (company.logo.startsWith('data:') || company.logo.startsWith('http'))
      ? company.logo
      : undefined

  const defaultSubject = `OVERDUE: Invoice ${variables.invoiceNumber}`
  const subject = template?.subject
    ? replacePlaceholders(template.subject, variables)
    : defaultSubject

  const html = await renderOverdueEmail({
    invoiceNumber: variables.invoiceNumber,
    clientName: variables.clientName,
    companyName: variables.companyName,
    companyLogoUrl,
    total: variables.total,
    dueDate: variables.dueDate,
    daysOverdue,
  })

  try {
    await tauriApi.sendEmail({
      to: client.email,
      subject,
      htmlBody: html,
    })
    return true
  } catch (err) {
    console.error('Send overdue notice failed:', err)
    throw err
  }
}
