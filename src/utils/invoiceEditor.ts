import { format } from 'date-fns'
import { CalendarDate } from '@internationalized/date'
import type { Client, InvoiceItem } from '@/types'

export function toInvoiceItems(items: InvoiceItem[] | undefined) {
  if (!items?.length) {
    return [{ productId: '', productName: '', description: '', quantity: 1, unitPrice: 0, total: 0 }]
  }
  return items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }))
}

export function toDateString(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function toCalendarDate(dateStr: string): CalendarDate {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new CalendarDate(y, m, d)
}

export function fromCalendarDate(cd: CalendarDate): string {
  const y = cd.year
  const m = String(cd.month).padStart(2, '0')
  const d = String(cd.day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function clientDisplay(client: Client) {
  return `${client.name} - ${client.email}`
}
