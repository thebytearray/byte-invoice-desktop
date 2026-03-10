import { Badge } from '@chakra-ui/react'
import type { InvoiceStatus } from '@/types'
import { INVOICE_STATUS_COLORS } from '@/constants'

const statusLabels: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
}

export function StatusChip({ status }: { status: InvoiceStatus }) {
  const colorPalette = INVOICE_STATUS_COLORS[status] ?? 'gray'
  return (
    <Badge colorPalette={colorPalette} size="sm" variant="subtle" textTransform="capitalize">
      {statusLabels[status]}
    </Badge>
  )
}
