import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flex } from '@chakra-ui/react'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import type { Invoice } from '@/types'
import { toaster } from '@/components/ui/toaster'
import { PageHeader } from '@/components/saas/page-header'
import { InvoiceEditor, type InvoiceEditorSubmitPayload } from '@/components/invoices/InvoiceEditor'

export function InvoiceNewPage() {
  const navigate = useNavigate()
  const { clients, products, addInvoice, invoices } = useStore(
    useShallow((s) => ({
      clients: s.clients,
      products: s.products,
      addInvoice: s.addInvoice,
      invoices: s.invoices,
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = useCallback(async ({
    values,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  }: InvoiceEditorSubmitPayload) => {
    setIsSubmitting(true)
    try {
      const selectedClient = clients.find((c) => c.id === values.clientId)
      if (!selectedClient) {
        throw new Error('Client not found')
      }

      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')
      const count = invoices.length + 1
      const invoiceNumber = `INV-${year}${month}-${String(count).padStart(4, '0')}`

      const newInvoice: Invoice = {
        id: crypto.randomUUID(),
        invoiceNumber,
        clientId: values.clientId,
        clientName: selectedClient.name,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        items: values.items,
        subtotal,
        taxRate: values.taxRate,
        taxAmount,
        discountRate: values.discountRate,
        discountAmount,
        total,
        status: values.status,
        notes: values.notes,
      }

      await addInvoice(newInvoice)
      toaster.create({ title: 'Invoice created successfully!', type: 'success' })
      navigate(`/invoices/${newInvoice.id}`)
    } catch {
      toaster.create({ title: 'Failed to create invoice', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }, [clients, addInvoice, invoices, navigate])

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Create invoice"
        title="Build a new invoice"
        description="Use the shared invoice editor to create a cleaner draft with consistent totals, preview, and client context."
      />
      <InvoiceEditor
        mode="create"
        clients={clients}
        products={products}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </Flex>
  )
}
