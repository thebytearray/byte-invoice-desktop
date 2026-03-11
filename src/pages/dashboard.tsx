import { Link } from 'react-router-dom'
import { Box, Button, Flex, Grid, Icon, Skeleton, Table, Text } from '@chakra-ui/react'
import { FiAlertTriangle, FiArrowRight, FiClock, FiDollarSign, FiFileText, FiPlus, FiTrendingUp, FiUsers } from 'react-icons/fi'
import { format } from 'date-fns'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatCurrency } from '@/utils/calculations'
import { DATE_FORMAT } from '@/constants'
import { ResponsiveList } from '@/components/layout/responsive-list'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { EmptyState } from '@/components/saas/empty-state'
import { MetricCard } from '@/components/saas/metric-card'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { StatusChip } from '@/components/saas/status-chip'

export function DashboardPage() {
  const { invoices, clients, products, isLoading } = useStore(
    useShallow((s) => ({
      invoices: s.invoices,
      clients: s.clients,
      products: s.products,
      isLoading: s.isLoading,
    }))
  )
  const stats = useDashboardStats(invoices, clients, products)

  const recentInvoices = [...invoices]
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
        <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, minmax(0, 1fr))' }} gap={{ base: '3', md: '4' }}>
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
            <Button asChild variant="outline" whiteSpace="nowrap">
              <Link to="/clients">Manage clients</Link>
            </Button>
            <Button asChild colorPalette="teal" whiteSpace="nowrap">
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

      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, minmax(0, 1fr))' }} gap={{ base: '3', md: '4' }}>
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
            <Button asChild variant="ghost" size="sm" whiteSpace="nowrap">
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
            <ResponsiveList
              cards={
                <Flex direction="column" gap="3">
                  {recentInvoices.map((invoice) => (
                    <Link key={invoice.id} to={`/invoices/${invoice.id}`}>
                      <Box
                        rounded="2xl"
                        borderWidth="1px"
                        borderColor="border"
                        p="4"
                        bg="bg.subtle"
                        _hover={{ bg: 'bg.muted' }}
                      >
                        <Flex direction="column" gap="2">
                          <Text fontWeight="medium" color="blue.500" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                            {invoice.invoiceNumber}
                          </Text>
                          <Text fontSize="sm" color="fg.muted">
                            {invoice.clientName}
                          </Text>
                          <Flex justify="space-between" align="center" flexWrap="wrap" gap="2">
                            <Text fontSize="sm" fontWeight="semibold">
                              {formatCurrency(invoice.total)}
                            </Text>
                            <StatusChip status={invoice.status} />
                          </Flex>
                        </Flex>
                      </Box>
                    </Link>
                  ))}
                </Flex>
              }
              table={
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
                        <Table.Cell minW="0">
                          <Link to={`/invoices/${invoice.id}`}>
                            <Text fontWeight="medium" color="blue.500" _hover={{ color: 'blue.400' }} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                              {invoice.invoiceNumber}
                            </Text>
                          </Link>
                        </Table.Cell>
                        <Table.Cell minW="0">{invoice.clientName}</Table.Cell>
                        <Table.Cell whiteSpace="nowrap">{format(new Date(invoice.issueDate), DATE_FORMAT)}</Table.Cell>
                        <Table.Cell whiteSpace="nowrap">{formatCurrency(invoice.total)}</Table.Cell>
                        <Table.Cell>
                          <StatusChip status={invoice.status} />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                  </Table.Root>
                </ScrollableTable>
              }
            />
          )}
        </SectionCard>
    </Flex>
  )
}
