import { Link } from 'react-router-dom'
import { Button, Flex, Grid, Icon, Skeleton, Table, Text } from '@chakra-ui/react'
import { FiAlertTriangle, FiArrowRight, FiClock, FiDollarSign, FiFileText, FiPlus, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/utils/calculations'
import { DATE_FORMAT } from '@/constants'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { EmptyState } from '@/components/saas/empty-state'
import { MetricCard } from '@/components/saas/metric-card'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { StatusChip } from '@/components/saas/status-chip'

export function DashboardPage() {
  const { invoices, clients, products, isLoading } = useStore()
  const stats = useDashboardStats(invoices, clients, products)

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5)

  const overdueAmount = invoices
    .filter((i) => i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total || 0), 0)

  if (isLoading) {
    return (
      <Flex direction="column" gap={{ base: '4', md: '5' }}>
        <Flex direction="column" gap="3">
          <Skeleton h="4" w="32" rounded="full" />
          <Skeleton h="12" w="72" rounded="2xl" />
          <Skeleton h="5" w="full" maxW="xl" rounded="2xl" />
        </Flex>
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, minmax(0, 1fr))' }} gap="4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} h="32" rounded="2xl" />
          ))}
        </Grid>
        <Skeleton h="420px" rounded="3xl" />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Overview"
        title="Your billing command center"
        description="Track revenue, unpaid balances, client momentum, and recent invoice activity from one polished dashboard."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/clients">Manage clients</Link>
            </Button>
            <Button asChild colorPalette="teal">
              <Link to="/invoices/new">
                <Icon as={FiPlus} mr="2" />
                Create invoice
              </Link>
            </Button>
          </>
        }
      />

      {invoices.length === 0 && clients.length === 0 && (
        <EmptyState
          icon={<Icon as={FiTrendingUp} boxSize="10" />}
          title="Start building your billing workspace"
          description="Add your first client, configure your company details, and create your first invoice to unlock the dashboard."
        />
      )}

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, minmax(0, 1fr))' }} gap="4">
        <MetricCard
          label="Total revenue"
          value={formatCurrency(stats.totalRevenue)}
          detail={`From ${stats.paidInvoices} paid invoice${stats.paidInvoices !== 1 ? 's' : ''}`}
          icon={<Icon as={FiDollarSign} boxSize="4" />}
        />
        <MetricCard
          label="Pending pipeline"
          value={formatCurrency(stats.pendingAmount)}
          detail={`From ${stats.sentInvoices} sent invoice${stats.sentInvoices !== 1 ? 's' : ''}`}
          icon={<Icon as={FiClock} boxSize="4" />}
        />
        <MetricCard
          label="Overdue balance"
          value={formatCurrency(overdueAmount)}
          detail={`${invoices.filter((i) => i.status === 'overdue').length} overdue invoice${invoices.filter((i) => i.status === 'overdue').length !== 1 ? 's' : ''}`}
          icon={<Icon as={FiAlertTriangle} boxSize="4" />}
        />
        <MetricCard
          label="Total clients"
          value={String(stats.totalClients)}
          detail={`Across ${stats.totalInvoices} invoice${stats.totalInvoices !== 1 ? 's' : ''}`}
          icon={<Icon as={FiUsers} boxSize="4" />}
        />
      </Grid>

      <SectionCard
          title="Recent invoices"
          description="See the latest billing activity and jump directly into the invoices that need attention."
          endContent={
            <Button asChild variant="ghost" size="sm">
              <Link to="/invoices">
                View all
                <Icon as={FiArrowRight} ml="2" />
              </Link>
            </Button>
          }
        >
          {recentInvoices.length === 0 ? (
            <EmptyState
              icon={<Icon as={FiFileText} boxSize="10" />}
              title="No invoices yet"
              description="Create your first invoice to start tracking revenue and customer billing status."
            />
          ) : (
            <ScrollableTable>
              <Table.Root size="sm">
                <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Invoice</Table.ColumnHeader>
                  <Table.ColumnHeader>Client</Table.ColumnHeader>
                  <Table.ColumnHeader>Date</Table.ColumnHeader>
                  <Table.ColumnHeader>Amount</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {recentInvoices.map((invoice) => (
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
                    <Table.Cell>{formatCurrency(invoice.total)}</Table.Cell>
                    <Table.Cell>
                      <StatusChip status={invoice.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
              </Table.Root>
            </ScrollableTable>
          )}
        </SectionCard>
    </Flex>
  )
}
