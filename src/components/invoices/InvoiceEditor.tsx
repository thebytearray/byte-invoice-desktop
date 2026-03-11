import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addDays, format } from 'date-fns'
import { CalendarDate } from '@internationalized/date'
import {
  Box,
  Button,
  Combobox,
  createListCollection,
  DatePicker,
  Flex,
  Grid,
  Icon,
  Input,
  Select,
  Table,
  Text,
  Textarea,
  Theme,
  useFilter,
  useListCollection,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import { FiCalendar, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { FormSection } from '@/components/saas/form-section'
import { SectionCard } from '@/components/saas/section-card'
import { StatusChip } from '@/components/saas/status-chip'
import type { Client, Invoice, InvoiceStatus, Product } from '@/types'
import { clientDisplay, fromCalendarDate, toCalendarDate, toInvoiceItems, toDateString } from '@/utils/invoiceEditor'

const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  total: z.number(),
})

const invoiceEditorSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  taxRate: z.number().min(0).max(100),
  discountRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
})

export type InvoiceEditorValues = z.infer<typeof invoiceEditorSchema>

export interface InvoiceEditorSubmitPayload {
  values: InvoiceEditorValues
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
}

interface InvoiceEditorProps {
  mode: 'create' | 'edit'
  initialInvoice?: Invoice
  clients: Client[]
  products: Product[]
  isSubmitting: boolean
  onSubmit: (payload: InvoiceEditorSubmitPayload) => Promise<void> | void
}

const selectPositioning = { strategy: 'fixed' as const, hideWhenDetached: true }

const comboboxPositioning = { strategy: 'fixed' as const, hideWhenDetached: true }

function ClientSelect({
  clients,
  value,
  onChange,
  invalid,
  placeholder = 'Search clients...',
}: {
  clients: Client[]
  value: string
  onChange: (clientId: string) => void
  invalid?: boolean
  placeholder?: string
}) {
  const clientItems = useMemo(
    () => clients.map((c) => ({ label: clientDisplay(c), value: c.id })),
    [clients]
  )
  const { contains } = useFilter({ sensitivity: 'base' })
  const { collection, reset, set } = useListCollection({
    initialItems: clientItems,
    filter: contains,
    limit: 50,
  })

  useEffect(() => {
    set(clientItems)
  }, [clientItems, set])

  useEffect(() => {
    reset()
  }, [value, reset])

  return (
    <Combobox.Root
      collection={collection}
      value={value ? [value] : []}
      onValueChange={(details) => onChange(details.value[0] ?? '')}
      invalid={invalid}
      placeholder={placeholder}
      name="clientId"
      positioning={comboboxPositioning}
      openOnClick
      closeOnSelect
    >
      <Combobox.Control>
        <Combobox.Input />
        <Combobox.IndicatorGroup>
          <Combobox.ClearTrigger />
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.Empty>No clients found</Combobox.Empty>
          <Combobox.List>
            {collection.items.map((item) => (
              <Combobox.Item key={item.value} item={item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  )
}

export function InvoiceEditor({
  mode,
  initialInvoice,
  clients,
  products,
  isSubmitting,
  onSubmit,
}: InvoiceEditorProps) {
  const form = useForm<InvoiceEditorValues>({
    resolver: zodResolver(invoiceEditorSchema),
    defaultValues: {
      clientId: initialInvoice?.clientId ?? '',
      issueDate: initialInvoice ? initialInvoice.issueDate.split('T')[0] : toDateString(new Date()),
      dueDate: initialInvoice ? initialInvoice.dueDate.split('T')[0] : toDateString(addDays(new Date(), 30)),
      items: toInvoiceItems(initialInvoice?.items),
      taxRate: initialInvoice?.taxRate ?? 0,
      discountRate: initialInvoice?.discountRate ?? 0,
      notes: initialInvoice?.notes ?? '',
      status: (initialInvoice?.status ?? 'draft') as InvoiceEditorValues['status'],
    },
  })

  useEffect(() => {
    if (!initialInvoice) return
    form.reset({
      clientId: initialInvoice.clientId,
      issueDate: initialInvoice.issueDate.split('T')[0],
      dueDate: initialInvoice.dueDate.split('T')[0],
      items: toInvoiceItems(initialInvoice.items),
      taxRate: initialInvoice.taxRate,
      discountRate: initialInvoice.discountRate,
      notes: initialInvoice.notes ?? '',
      status: initialInvoice.status as InvoiceEditorValues['status'],
    })
  }, [form, initialInvoice])

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const rawItems = useWatch({ control: form.control, name: 'items' })
  const watchedItems = useMemo(() => rawItems ?? [], [rawItems])
  const watchedClientId = useWatch({ control: form.control, name: 'clientId' })
  const selectedClient = clients.find((c) => c.id === watchedClientId)
  const watchedTaxRate = useWatch({ control: form.control, name: 'taxRate' }) ?? 0
  const watchedDiscountRate = useWatch({ control: form.control, name: 'discountRate' }) ?? 0
  const watchedStatus = useWatch({ control: form.control, name: 'status' })
  const watchedIssueDate = useWatch({ control: form.control, name: 'issueDate' })
  const watchedDueDate = useWatch({ control: form.control, name: 'dueDate' })

  useEffect(() => {
    watchedItems.forEach((item, index) => {
      const computedTotal = (item?.quantity || 0) * (item?.unitPrice || 0)
      if (computedTotal !== item?.total) {
        form.setValue(`items.${index}.total`, computedTotal)
      }
    })
  }, [form, watchedItems])

  const productItems = useMemo(
    () =>
      products.map((p) => ({
        label: `${p.name} - ${p.price != null ? `$${p.price.toFixed(2)}` : 'Variable'}`,
        value: p.id,
      })),
    [products]
  )

  const productCollection = useMemo(
    () => createListCollection({ items: productItems }),
    [productItems]
  )

  const handleProductSelect = (productId: string, index: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    const quantity = form.getValues(`items.${index}.quantity`) || 1
    form.setValue(`items.${index}.productId`, productId)
    form.setValue(`items.${index}.productName`, product.name)
    form.setValue(`items.${index}.description`, product.description)
    form.setValue(`items.${index}.unitPrice`, product.price || 0)
    form.setValue(`items.${index}.total`, (product.price || 0) * quantity)
  }

  const addItem = () => {
    append({ productId: '', productName: '', description: '', quantity: 1, unitPrice: 0, total: 0 })
  }

  const subtotal = watchedItems.reduce((sum, item) => sum + (item?.total || 0), 0)
  const discountAmount = subtotal * (watchedDiscountRate / 100)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (watchedTaxRate / 100)
  const total = taxableAmount + taxAmount

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      values: { ...values, issueDate: values.issueDate, dueDate: values.dueDate },
      subtotal,
      discountAmount,
      taxAmount,
      total,
    })
  })

  const { colorMode } = useColorMode()

  return (
    <form onSubmit={handleSubmit}>
      <Grid templateColumns={{ md: '1fr', xl: '1.3fr 0.7fr' }} gap={{ base: '4', md: '6', xl: '8' }}>
        <Flex direction="column" gap="6" minW="0">
          <FormSection title="Invoice details" description="Choose the client, set dates, and define the working status.">
            <Grid templateColumns={{ md: '1fr 1fr' }} gap="4">
              <Box gridColumn={{ md: '1 / -1' }}>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Client
                </Text>
                <Controller
                  name="clientId"
                  control={form.control}
                  render={({ field }) => (
                    <ClientSelect
                      clients={clients}
                      value={field.value}
                      onChange={field.onChange}
                      invalid={!!form.formState.errors.clientId}
                      placeholder="Search clients..."
                    />
                  )}
                />
                {form.formState.errors.clientId && (
                  <Text fontSize="sm" color="red.500" mt="1">
                    {form.formState.errors.clientId.message}
                  </Text>
                )}
              </Box>
              <Box minW="0">
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Issue date
                </Text>
                <Controller
                  name="issueDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker.Root
                      value={[toCalendarDate(field.value)]}
                      onValueChange={(e) => {
                        const v = e.value[0]
                        if (v) field.onChange(fromCalendarDate(v as CalendarDate))
                      }}
                      format={(date) => format(new Date(date.year, date.month - 1, date.day), 'MMM dd, yyyy')}
                      parse={(value) => {
                        const m = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
                        if (m) return new CalendarDate(Number(m[3]), Number(m[1]), Number(m[2]))
                        const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/)
                        if (iso) return new CalendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
                        return undefined
                      }}
                    >
                      <DatePicker.Control w="full" minW="0">
                        <DatePicker.Input placeholder="Select date" flex="1" minW="0" />
                        <DatePicker.IndicatorGroup>
                          <DatePicker.Trigger asChild>
                            <Button variant="ghost" px="2" minH={{ base: '11', md: '10' }} aria-label="Open calendar">
                              <Icon as={FiCalendar} />
                            </Button>
                          </DatePicker.Trigger>
                        </DatePicker.IndicatorGroup>
                      </DatePicker.Control>
                      <DatePicker.Positioner>
                        <Theme appearance={colorMode} hasBackground>
                          <DatePicker.Content
                            bg={colorMode === 'dark' ? 'gray.950' : 'white'}
                            color={colorMode === 'dark' ? 'gray.50' : 'gray.900'}
                          >
                            <DatePicker.View view="day">
                              <DatePicker.Header />
                              <DatePicker.DayTable />
                            </DatePicker.View>
                            <DatePicker.View view="month">
                              <DatePicker.Header />
                              <DatePicker.MonthTable />
                            </DatePicker.View>
                            <DatePicker.View view="year">
                              <DatePicker.Header />
                              <DatePicker.YearTable />
                            </DatePicker.View>
                          </DatePicker.Content>
                        </Theme>
                      </DatePicker.Positioner>
                    </DatePicker.Root>
                  )}
                />
              </Box>
              <Box minW="0">
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Due date
                </Text>
                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker.Root
                      value={[toCalendarDate(field.value)]}
                      onValueChange={(e) => {
                        const v = e.value[0]
                        if (v) field.onChange(fromCalendarDate(v as CalendarDate))
                      }}
                      format={(date) => format(new Date(date.year, date.month - 1, date.day), 'MMM dd, yyyy')}
                      parse={(value) => {
                        const m = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
                        if (m) return new CalendarDate(Number(m[3]), Number(m[1]), Number(m[2]))
                        const iso = value.match(/(\d{4})-(\d{2})-(\d{2})/)
                        if (iso) return new CalendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
                        return undefined
                      }}
                    >
                      <DatePicker.Control w="full" minW="0">
                        <DatePicker.Input placeholder="Select date" flex="1" minW="0" />
                        <DatePicker.IndicatorGroup>
                          <DatePicker.Trigger asChild>
                            <Button variant="ghost" px="2" minH={{ base: '11', md: '10' }} aria-label="Open calendar">
                              <Icon as={FiCalendar} />
                            </Button>
                          </DatePicker.Trigger>
                        </DatePicker.IndicatorGroup>
                      </DatePicker.Control>
                      <DatePicker.Positioner>
                        <Theme appearance={colorMode} hasBackground>
                          <DatePicker.Content
                            bg={colorMode === 'dark' ? 'gray.950' : 'white'}
                            color={colorMode === 'dark' ? 'gray.50' : 'gray.900'}
                          >
                            <DatePicker.View view="day">
                              <DatePicker.Header />
                              <DatePicker.DayTable />
                            </DatePicker.View>
                            <DatePicker.View view="month">
                              <DatePicker.Header />
                              <DatePicker.MonthTable />
                            </DatePicker.View>
                            <DatePicker.View view="year">
                              <DatePicker.Header />
                              <DatePicker.YearTable />
                            </DatePicker.View>
                          </DatePicker.Content>
                        </Theme>
                      </DatePicker.Positioner>
                    </DatePicker.Root>
                  )}
                />
              </Box>
              <Box gridColumn={{ md: '1 / -1' }}>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Status
                </Text>
                <Flex flexWrap="wrap" gap="2">
                  {(['draft', 'sent', 'paid', 'overdue'] as InvoiceStatus[]).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant={watchedStatus === status ? 'solid' : 'outline'}
                      colorPalette={watchedStatus === status ? 'teal' : 'gray'}
                      onClick={() => form.setValue('status', status)}
                      whiteSpace="nowrap"
                    >
                      {status}
                    </Button>
                  ))}
                </Flex>
              </Box>
            </Grid>
          </FormSection>

          <FormSection title="Items" description="Add products or services, then fine-tune pricing and quantities.">
            <Flex justify="flex-end" mb="4">
              <Button type="button" colorPalette="teal" onClick={addItem} whiteSpace="nowrap" minH={{ base: '11', md: '10' }}>
                <Icon as={FiPlus} mr="2" />
                Add item
              </Button>
            </Flex>
            <Flex direction="column" gap="4">
              {fields.map((field, index) => (
                <Box key={field.id} rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle" minW="0">
                  <Flex justify="space-between" align="center" mb="4">
                    <Text fontWeight="medium">Item {index + 1}</Text>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        colorPalette="red"
                        onClick={() => remove(index)}
                        aria-label="Remove item"
                        minW={{ base: '11', md: '10' }}
                        minH={{ base: '11', md: '10' }}
                      >
                        <FiTrash2 />
                      </Button>
                    )}
                  </Flex>
                  <Grid templateColumns={{ md: '1fr 1fr' }} gap="4">
                    <Box gridColumn={{ md: '1 / -1' }}>
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Product or service
                      </Text>
                      <Select.Root
                        collection={productCollection}
                        value={watchedItems[index]?.productId ? [watchedItems[index].productId!] : []}
                        onValueChange={(details) => {
                          const id = details.value[0]
                          if (id) handleProductSelect(id, index)
                        }}
                        positioning={selectPositioning}
                        name={`items.${index}.productId`}
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select a product..." />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content>
                            {productCollection.items.map((item) => (
                              <Select.Item key={item.value} item={item}>
                                <Select.ItemText>{item.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Box>
                    <Box gridColumn={{ md: '1 / -1' }}>
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Description
                      </Text>
                      <Textarea {...form.register(`items.${index}.description`)} rows={3} />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Quantity
                      </Text>
                      <Input
                        type="number"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="2">
                        Unit price
                      </Text>
                      <Input
                        type="number"
                        step="0.01"
                        {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                    </Box>
                  </Grid>
                  <Text mt="4" fontSize="sm" color="fg.muted" textAlign="right">
                    Item total: ${(watchedItems[index]?.total || 0).toFixed(2)}
                  </Text>
                </Box>
              ))}
            </Flex>
          </FormSection>

          <FormSection title="Adjustments and notes" description="Apply tax or discounts, then add any notes.">
            <Grid templateColumns={{ md: '1fr 1fr' }} gap="4">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Discount rate (%)
                </Text>
                <Input type="number" step="0.01" {...form.register('discountRate', { valueAsNumber: true })} />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Tax rate (%)
                </Text>
                <Input type="number" step="0.01" {...form.register('taxRate', { valueAsNumber: true })} />
              </Box>
              <Box gridColumn={{ md: '1 / -1' }}>
                <Text fontSize="sm" fontWeight="medium" mb="2">
                  Notes
                </Text>
                <Textarea {...form.register('notes')} rows={4} />
              </Box>
            </Grid>
          </FormSection>
        </Flex>

        <Box minW="0">
          <SectionCard
            title="Invoice summary"
            description="Preview the client context, line items, totals, and current status."
          >
            <Flex direction="column" gap="6">
              <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                <Text fontSize="sm" fontWeight="medium" mb="3">
                  Status
                </Text>
                <StatusChip status={watchedStatus as InvoiceStatus} />
              </Box>

              {selectedClient && (
                <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                  <Text fontSize="sm" fontWeight="medium" mb="3">
                    Bill to
                  </Text>
                  <Flex direction="column" gap="1" fontSize="sm" color="fg.muted">
                    <Text fontWeight="medium" color="fg">
                      {selectedClient.name}
                    </Text>
                    <Text>{selectedClient.email}</Text>
                    <Text>{selectedClient.address}</Text>
                    <Text>
                      {selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}
                    </Text>
                  </Flex>
                </Box>
              )}

              <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                <Flex direction="column" gap="3" fontSize="sm" color="fg.muted">
                  <Flex justify="space-between">
                    <span>Issue date</span>
                    <span>{watchedIssueDate ? format(new Date(watchedIssueDate), 'MMM dd, yyyy') : '-'}</span>
                  </Flex>
                  <Flex justify="space-between">
                    <span>Due date</span>
                    <span>{watchedDueDate ? format(new Date(watchedDueDate), 'MMM dd, yyyy') : '-'}</span>
                  </Flex>
                </Flex>
              </Box>

              <ScrollableTable>
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Item</Table.ColumnHeader>
                      <Table.ColumnHeader>Qty</Table.ColumnHeader>
                      <Table.ColumnHeader>Total</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {watchedItems.map((item, index) => (
                      <Table.Row key={`${item?.productId}-${index}`}>
                        <Table.Cell>
                          <Box>
                            <Text fontWeight="medium">{item?.productName || 'Untitled item'}</Text>
                            <Text fontSize="xs" color="fg.muted">
                              {item?.description}
                            </Text>
                          </Box>
                        </Table.Cell>
                        <Table.Cell>{item?.quantity || 0}</Table.Cell>
                        <Table.Cell>${(item?.total || 0).toFixed(2)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </ScrollableTable>

              <Box rounded="2xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
                <Flex direction="column" gap="3" fontSize="sm" color="fg.muted">
                  <Flex justify="space-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </Flex>
                  {watchedDiscountRate > 0 && (
                    <Flex justify="space-between">
                      <span>Discount ({watchedDiscountRate}%)</span>
                      <span>- ${discountAmount.toFixed(2)}</span>
                    </Flex>
                  )}
                  {watchedTaxRate > 0 && (
                    <Flex justify="space-between">
                      <span>Tax ({watchedTaxRate}%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </Flex>
                  )}
                  <Flex justify="space-between" borderTopWidth="1px" borderColor="border" pt="3" fontSize="base" fontWeight="semibold" color="fg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </Flex>
                </Flex>
              </Box>

              <Button type="submit" colorPalette="teal" loading={isSubmitting} whiteSpace="nowrap" w={{ base: 'full', md: 'auto' }} minH={{ base: '11', md: '10' }}>
                <Icon as={FiSave} mr="2" />
                {mode === 'create' ? 'Create invoice' : 'Save changes'}
              </Button>
            </Flex>
          </SectionCard>
        </Box>
      </Grid>
    </form>
  )
}
