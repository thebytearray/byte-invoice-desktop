import { useState } from 'react'
import { sendInvoice } from '@/services/emailService'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Flex, Icon, Table, Text } from '@chakra-ui/react'
import { FiArrowLeft, FiDownload, FiEdit, FiMail, FiTrash2 } from 'react-icons/fi'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { DATE_FORMAT } from '@/constants'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { StatusChip } from '@/components/saas/status-chip'
import { InvoicePDFDownload } from '@/components/invoices/InvoicePDF'
import type { InvoiceStatus } from '@/types'
import { Dialog } from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, updateInvoice, deleteInvoice, company, clients, settings } = useStore()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sending, setSending] = useState(false)

  const invoiceId = id ?? ''
  const invoice = invoices.find((i) => i.id === invoiceId)
  const client = clients.find((c) => c.id === invoice?.clientId)

  if (!invoice) {
    return (
      <Flex direction="column" gap="4" align="center" py="12">
        <Flex direction="column" gap="2" align="center" textAlign="center">
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Invoice not found
          </Text>
          <Text fontSize="sm" color="fg.muted">
            The invoice you&apos;re looking for doesn&apos;t exist.
          </Text>
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

  const handleStatusChange = async (status: InvoiceStatus) => {
    await updateInvoice(invoice.id, { status })
  }

  const handleDelete = async () => {
    await deleteInvoice(invoice.id)
    setDeleteOpen(false)
    navigate('/invoices')
  }

  const handleSendInvoice = async () => {
    if (!client) return
    setSending(true)
    try {
      const template = settings.emailTemplates?.find((t) => t.type === 'invoice')
      await sendInvoice(invoice, client, company, settings.smtp, template)
      await updateInvoice(invoice.id, { emailSent: true })
      toaster.create({ title: 'Invoice sent successfully!', type: 'success' })
    } catch (e) {
      toaster.create({
        title: 'Failed to send invoice',
        description: e instanceof Error ? e.message : 'Check your SMTP settings.',
        type: 'error',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Invoice detail"
        title={invoice.invoiceNumber}
        description={`Created on ${format(new Date(invoice.issueDate), DATE_FORMAT)} and due ${format(new Date(invoice.dueDate), DATE_FORMAT)}.`}
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/invoices">
                <Icon as={FiArrowLeft} mr="2" />
                Back
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/invoices/edit/${invoice.id}`}>
                <Icon as={FiEdit} mr="2" />
                Edit
              </Link>
            </Button>
          </>
        }
      />

      <Flex gap="6" direction={{ base: 'column', xl: 'row' }}>
        <SectionCard
          title="Invoice controls"
          description="Update status, export a PDF, and manage delivery or deletion from one panel."
        >
          <Flex direction="column" gap="5">
            <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
              <Text fontSize="sm" fontWeight="medium">
                Current status
              </Text>
              <Box mt="3">
                <StatusChip status={invoice.status} />
              </Box>
            </Box>

            <Flex gap="2" flexWrap="wrap">
              {(['draft', 'sent', 'paid', 'overdue'] as InvoiceStatus[]).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={invoice.status === status ? 'solid' : 'outline'}
                  colorPalette={invoice.status === status ? 'teal' : 'gray'}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </Button>
              ))}
            </Flex>

            {client && (
              <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                <Text fontSize="sm" fontWeight="medium">
                  Client
                </Text>
                <Flex direction="column" gap="1" mt="3" fontSize="sm" color="fg.muted">
                  <Text fontWeight="medium" color="fg">
                    {client.name}
                  </Text>
                  <Text>{client.email}</Text>
                  <Text>{client.address}</Text>
                  <Text>
                    {client.city}, {client.state} {client.zipCode}
                  </Text>
                </Flex>
              </Box>
            )}

            {client && company.name && (
              <Flex gap="2" flexWrap="wrap">
                <InvoicePDFDownload invoice={invoice} company={company} client={client}>
                  {({ loading }) => (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      asChild
                    >
                      <Box
                        as="span"
                        display="inline-flex"
                        alignItems="center"
                        gap="2"
                      >
                        <Icon as={FiDownload} />
                        {loading ? 'Generating PDF...' : 'Download PDF'}
                      </Box>
                    </Button>
                  )}
                </InvoicePDFDownload>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  onClick={handleSendInvoice}
                  loading={sending}
                  disabled={
                    !client.email?.includes('@') ||
                    !settings.smtp?.host ||
                    !settings.smtp?.username ||
                    !settings.smtp?.password
                  }
                >
                  <Icon as={FiMail} mr="2" />
                  {sending ? 'Sending...' : 'Send invoice'}
                </Button>
              </Flex>
            )}

            <Flex gap="3" flexWrap="wrap">
              <Button
                colorPalette="red"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Icon as={FiTrash2} mr="2" />
                Delete invoice
              </Button>
            </Flex>
          </Flex>
        </SectionCard>

        <SectionCard
          title="Invoice summary"
          description="Review line items, billing details, and notes using the same hierarchy as the editor."
        >
          <Flex direction="column" gap="6">
            <Flex gap="4" flexWrap="wrap" direction={{ base: 'column', md: 'row' }} alignItems="flex-start">
              <Box flex={{ base: '0 0 auto', md: '1' }} rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                <Text fontSize="sm" fontWeight="medium">
                  From
                </Text>
                <Flex direction="column" gap="1" mt="3" fontSize="sm" color="fg.muted">
                  <Text fontWeight="medium" color="fg">
                    {company.name || 'Your company'}
                  </Text>
                  {company.address && <Text>{company.address}</Text>}
                  {company.email && <Text>{company.email}</Text>}
                  {company.phone && <Text>{company.phone}</Text>}
                </Flex>
              </Box>
              {client && (
                <Box flex={{ base: '0 0 auto', md: '1' }} rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                  <Text fontSize="sm" fontWeight="medium">
                    Bill to
                  </Text>
                  <Flex direction="column" gap="1" mt="3" fontSize="sm" color="fg.muted">
                    <Text fontWeight="medium" color="fg">
                      {client.name}
                    </Text>
                    <Text>{client.email}</Text>
                    <Text>{client.address}</Text>
                    <Text>
                      {client.city}, {client.state} {client.zipCode}
                    </Text>
                  </Flex>
                </Box>
              )}
            </Flex>

            <ScrollableTable>
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                  <Table.ColumnHeader>Description</Table.ColumnHeader>
                  <Table.ColumnHeader>Qty</Table.ColumnHeader>
                  <Table.ColumnHeader>Unit price</Table.ColumnHeader>
                  <Table.ColumnHeader>Total</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {invoice.items.map((item, index) => (
                  <Table.Row key={`${item.productId}-${index}`}>
                    <Table.Cell>
                      <Text fontWeight="medium">{item.productName}</Text>
                      <Text fontSize="xs" color="fg.muted">
                        {item.description}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>{item.quantity}</Table.Cell>
                    <Table.Cell>${item.unitPrice.toFixed(2)}</Table.Cell>
                    <Table.Cell>${item.total.toFixed(2)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              </Table.Root>
            </ScrollableTable>

            <Box ml="auto" maxW="md" rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
              <Flex direction="column" gap="3" fontSize="sm" color="fg.muted">
                <Flex justify="space-between">
                  <Text>Subtotal</Text>
                  <Text>${invoice.subtotal.toFixed(2)}</Text>
                </Flex>
                {invoice.discountRate > 0 && (
                  <Flex justify="space-between">
                    <Text>Discount ({invoice.discountRate}%)</Text>
                    <Text>- ${invoice.discountAmount.toFixed(2)}</Text>
                  </Flex>
                )}
                {invoice.taxRate > 0 && (
                  <Flex justify="space-between">
                    <Text>Tax ({invoice.taxRate}%)</Text>
                    <Text>${invoice.taxAmount.toFixed(2)}</Text>
                  </Flex>
                )}
                <Flex justify="space-between" borderTopWidth="1px" borderColor="border" pt="3" fontSize="base" fontWeight="semibold" color="fg">
                  <Text>Total</Text>
                  <Text>${invoice.total.toFixed(2)}</Text>
                </Flex>
              </Flex>
            </Box>

            {invoice.notes && (
              <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                <Text fontSize="sm" fontWeight="medium">
                  Notes
                </Text>
                <Text mt="3" whiteSpace="pre-wrap" fontSize="sm" lineHeight="7" color="fg.muted">
                  {invoice.notes}
                </Text>
              </Box>
            )}
          </Flex>
        </SectionCard>
      </Flex>

      <Dialog.Root open={deleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header flexDirection="column" alignItems="flex-start" gap="1">
              <Dialog.Title>Delete invoice</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete {invoice.invoiceNumber}? This action cannot be undone.
              </Dialog.Description>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorPalette="red" onClick={handleDelete}>
                Delete invoice
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  )
}
