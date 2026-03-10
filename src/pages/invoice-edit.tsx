import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button, Flex, Icon } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { toaster } from '@/components/ui/toaster'
import { useStore } from '@/lib/store'
import { PageHeader } from '@/components/saas/page-header'
import { InvoiceEditor, type InvoiceEditorSubmitPayload } from '@/components/invoices/invoice-editor'

export function InvoiceEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, updateInvoice, clients, products } = useStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const invoice = invoices.find((i) => i.id === id)

  if (!invoice) {
    return (
      <Flex direction="column" gap="4" align="center" py="12">
        <Flex direction="column" gap="2" align="center" textAlign="center">
          <Flex as="h1" fontSize="2xl" fontWeight="bold">
            Invoice not found
          </Flex>
          <Flex as="p" fontSize="sm" color="fg.muted">
            The invoice you&apos;re trying to edit doesn&apos;t exist.
          </Flex>
        </Flex>
        <Button asChild colorPalette="teal">
          <Link to="/invoices">
            <Icon as={FiArrowLeft} mr="2" />
            Back to invoices
          </Link>
        </Button>
      </Flex>
    )
  }

  const handleSave = async ({
    values,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  }: InvoiceEditorSubmitPayload) => {
    const selectedClient = clients.find((c) => c.id === values.clientId)
    if (!selectedClient) {
      toaster.create({ title: 'Please select a client', type: 'error' })
      return
    }

    try {
      setIsSubmitting(true)
      await updateInvoice(invoice.id, {
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
      })
      toaster.create({ title: 'Invoice updated successfully!', type: 'success' })
      navigate(`/invoices/${invoice.id}`)
    } catch {
      toaster.create({ title: 'Failed to update invoice', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Edit invoice"
        title={`Invoice ${invoice.invoiceNumber}`}
        description="Use the same editor as invoice creation so updates follow one consistent workflow."
        actions={
          <Button asChild variant="outline">
            <Link to={`/invoices/${invoice.id}`}>
              <Icon as={FiArrowLeft} mr="2" />
              Back to invoice
            </Link>
          </Button>
        }
      />
      <InvoiceEditor
        mode="edit"
        initialInvoice={invoice}
        clients={clients}
        products={products}
        isSubmitting={isSubmitting}
        onSubmit={handleSave}
      />
    </Flex>
  )
}
