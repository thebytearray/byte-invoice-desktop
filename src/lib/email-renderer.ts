/**
 * Plain utility module for rendering React Email templates to HTML.
 * Uses renderToStaticMarkup from react-dom/server.browser (browser build only)
 * to avoid Node.js APIs (async_hooks, etc.) that fail in Tauri webview.
 */
import type { ReactElement } from 'react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server.browser'
import {
  InvoiceEmail,
  OverdueEmail,
  ReminderEmail,
} from '@/emails'
import type { InvoiceEmailProps } from '@/emails/InvoiceEmail'
import type { ReminderEmailProps } from '@/emails/ReminderEmail'
import type { OverdueEmailProps } from '@/emails/OverdueEmail'

export type { InvoiceEmailProps, ReminderEmailProps, OverdueEmailProps }

const EMAIL_DOCTYPE =
  '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'

function renderToEmailHtml(element: ReactElement): string {
  const html = renderToStaticMarkup(element)
  return EMAIL_DOCTYPE + html.replace(/<!DOCTYPE[^>]*>/i, '')
}

export async function renderInvoiceEmail(props: InvoiceEmailProps): Promise<string> {
  return renderToEmailHtml(createElement(InvoiceEmail, props))
}

export async function renderReminderEmail(props: ReminderEmailProps): Promise<string> {
  return renderToEmailHtml(createElement(ReminderEmail, props))
}

export async function renderOverdueEmail(props: OverdueEmailProps): Promise<string> {
  return renderToEmailHtml(createElement(OverdueEmail, props))
}

export interface RenderAllTemplatesProps {
  companyName: string
  companyLogoUrl?: string
  clientName: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  total: string
  pdfNote?: string
  statusMessage: string
  statusColor: string
  daysSinceSent: number
  daysOverdue: number
}

export async function renderAllEmailTemplates(
  props: RenderAllTemplatesProps
): Promise<{ invoiceHtml: string; reminderHtml: string; overdueHtml: string }> {
  const [invoiceHtml, reminderHtml, overdueHtml] = await Promise.all([
    renderInvoiceEmail({
      invoiceNumber: props.invoiceNumber,
      invoiceDate: props.invoiceDate,
      clientName: props.clientName,
      companyName: props.companyName,
      companyLogoUrl: props.companyLogoUrl,
      total: props.total,
      dueDate: props.dueDate,
      pdfNote: props.pdfNote,
      statusMessage: props.statusMessage,
      statusColor: props.statusColor,
    }),
    renderReminderEmail({
      invoiceNumber: props.invoiceNumber,
      clientName: props.clientName,
      companyName: props.companyName,
      companyLogoUrl: props.companyLogoUrl,
      total: props.total,
      dueDate: props.dueDate,
      daysSinceSent: props.daysSinceSent,
    }),
    renderOverdueEmail({
      invoiceNumber: props.invoiceNumber,
      clientName: props.clientName,
      companyName: props.companyName,
      companyLogoUrl: props.companyLogoUrl,
      total: props.total,
      dueDate: props.dueDate,
      daysOverdue: props.daysOverdue,
    }),
  ])
  return { invoiceHtml, reminderHtml, overdueHtml }
}
