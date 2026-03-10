import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Button, Flex, Grid, Icon, IconButton, Input, Skeleton, Table, Text } from '@chakra-ui/react'
import { FiAlertTriangle, FiClock, FiDollarSign, FiEdit, FiEye, FiFileText, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { formatCurrency } from '@/utils/calculations'
import { DATE_FORMAT } from '@/constants'
import { toaster } from '@/components/ui/toaster'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { EmptyState } from '@/components/saas/empty-state'
import { MetricCard } from '@/components/saas/metric-card'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { StatusChip } from '@/components/saas/status-chip'
import { Dialog } from '@chakra-ui/react'

export function InvoicesPage() {
  const { invoices, deleteInvoice, isLoading } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDeleteClick = (id: string) => {
    setInvoiceToDelete(id)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    if (!invoiceToDelete) return
    setDeleting(true)
    try {
      await deleteInvoice(invoiceToDelete)
      toaster.create({ title: 'Invoice deleted', type: 'success' })
      setDeleteOpen(false)
      setInvoiceToDelete(null)
    } catch {
      toaster.create({ title: 'Failed to delete invoice', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all'

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
  const pendingAmount = invoices.filter((i) => i.status === 'sent').reduce((sum, i) => sum + (i.total || 0), 0)
  const overdueAmount = invoices.filter((i) => i.status === 'overdue').reduce((sum, i) => sum + (i.total || 0), 0)

  if (isLoading) {
    return (
      <Flex direction="column" gap={{ base: '4', md: '5' }}>
        <Skeleton h="12" w="72" rounded="2xl" />
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap="4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} h="32" rounded="2xl" />
          ))}
        </Grid>
        <Skeleton h="520px" rounded="3xl" />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Invoices"
        title="Invoice pipeline"
        description="Track billing status, revenue at risk, and every invoice that needs review, editing, or follow-up."
        actions={
          <Button asChild colorPalette="teal">
            <Link to="/invoices/new">
              <Icon as={FiPlus} mr="2" />
              Create invoice
            </Link>
          </Button>
        }
      />

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap="4">
        <MetricCard
          label="Paid revenue"
          value={formatCurrency(totalRevenue)}
          detail={`${invoices.filter((i) => i.status === 'paid').length} paid invoice${invoices.filter((i) => i.status === 'paid').length !== 1 ? 's' : ''}`}
          icon={<Icon as={FiDollarSign} boxSize="5" />}
        />
        <MetricCard
          label="Pending balance"
          value={formatCurrency(pendingAmount)}
          detail={`${invoices.filter((i) => i.status === 'sent').length} sent invoice${invoices.filter((i) => i.status === 'sent').length !== 1 ? 's' : ''}`}
          icon={<Icon as={FiClock} boxSize="5" />}
        />
        <MetricCard
          label="Overdue balance"
          value={formatCurrency(overdueAmount)}
          detail={`${invoices.filter((i) => i.status === 'overdue').length} overdue invoice${invoices.filter((i) => i.status === 'overdue').length !== 1 ? 's' : ''}`}
          icon={<Icon as={FiAlertTriangle} boxSize="5" />}
        />
      </Grid>

      <SectionCard
        title="All invoices"
        description={
          hasActiveFilters
            ? `Showing ${filteredInvoices.length} of ${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}.`
            : `${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} in your workspace.`
        }
        endContent={
          hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Icon as={FiX} mr="2" />
              Clear filters
            </Button>
          ) : undefined
        }
      >
        <Flex direction="column" gap="4" mb="6">
          <Box maxW="xl">
            <Input
              placeholder="Search by invoice number or client name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          <Flex gap="2" flexWrap="wrap">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'solid' : 'outline'}
                colorPalette={statusFilter === status ? 'teal' : 'gray'}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All statuses' : status}
              </Button>
            ))}
          </Flex>
        </Flex>

        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={<Icon as={FiFileText} boxSize="10" />}
            title={hasActiveFilters ? 'No invoices found' : 'No invoices yet'}
            description={
              hasActiveFilters
                ? 'Adjust your filters to find the invoice you need.'
                : 'Create your first invoice to start tracking revenue, due dates, and payment status.'
            }
            actionLabel={hasActiveFilters ? 'Clear filters' : 'Create your first invoice'}
            onAction={hasActiveFilters ? clearFilters : undefined}
            actionHref={!hasActiveFilters ? '/invoices/new' : undefined}
          />
        ) : (
          <ScrollableTable>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                <Table.ColumnHeader>Invoice</Table.ColumnHeader>
                <Table.ColumnHeader>Client</Table.ColumnHeader>
                <Table.ColumnHeader>Issue date</Table.ColumnHeader>
                <Table.ColumnHeader>Due date</Table.ColumnHeader>
                <Table.ColumnHeader>Amount</Table.ColumnHeader>
                <Table.ColumnHeader>Status</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredInvoices
                .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
                .map((invoice) => (
                  <Table.Row key={invoice.id}>
                    <Table.Cell>
                      <Link to={`/invoices/${invoice.id}`}>
                        <Text fontWeight="medium" color="blue.500" _hover={{ color: 'blue.400' }}>
                          {invoice.invoiceNumber}
                        </Text>
                      </Link>
                    </Table.Cell>
                    <Table.Cell>{invoice.clientName}</Table.Cell>
                    <Table.Cell>{format(new Date(invoice.issueDate), DATE_FORMAT)}</Table.Cell>
                    <Table.Cell>{format(new Date(invoice.dueDate), DATE_FORMAT)}</Table.Cell>
                    <Table.Cell>{formatCurrency(invoice.total)}</Table.Cell>
                    <Table.Cell>
                      <StatusChip status={invoice.status} />
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <IconButton asChild aria-label="View" size="sm" variant="ghost">
                          <Link to={`/invoices/${invoice.id}`}>
                            <Icon as={FiEye} />
                          </Link>
                        </IconButton>
                        <IconButton asChild aria-label="Edit" size="sm" variant="ghost">
                          <Link to={`/invoices/edit/${invoice.id}`}>
                            <Icon as={FiEdit} />
                          </Link>
                        </IconButton>
                        <IconButton
                          aria-label="Delete"
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => handleDeleteClick(invoice.id)}
                        >
                          <Icon as={FiTrash2} />
                        </IconButton>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
            </Table.Body>
            </Table.Root>
          </ScrollableTable>
        )}
      </SectionCard>

      <Dialog.Root open={deleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header flexDirection="column" alignItems="flex-start" gap="1">
              <Dialog.Title>Delete invoice</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete this invoice? This action cannot be undone.
              </Dialog.Description>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button colorPalette="red" onClick={handleDelete} loading={deleting}>
                Delete invoice
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  )
}
