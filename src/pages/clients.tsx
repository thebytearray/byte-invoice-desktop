import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  Skeleton,
  Table,
  Text,
} from '@chakra-ui/react'
import { FiEdit, FiMail, FiMapPin, FiPhone, FiPlus, FiTrash2, FiUsers, FiX } from 'react-icons/fi'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { toaster } from '@/components/ui/toaster'
import type { Client } from '@/types'
import { ResponsiveList } from '@/components/layout/responsive-list'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { EmptyState } from '@/components/saas/empty-state'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { LocationSelectGroup } from '@/components/saas/location-select'
import { Dialog, Field } from '@chakra-ui/react'

const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
})

type ClientFormData = z.infer<typeof clientSchema>

export function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient, isLoading } = useStore(
    useShallow((s) => ({
      clients: s.clients,
      addClient: s.addClient,
      updateClient: s.updateClient,
      deleteClient: s.deleteClient,
      isLoading: s.isLoading,
    }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  })

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true)
    try {
      if (editingClient) {
        await updateClient(editingClient.id, data)
        toaster.create({ title: 'Client updated successfully!', type: 'success' })
      } else {
        const newClient: Client = { id: crypto.randomUUID(), ...data }
        await addClient(newClient)
        toaster.create({ title: 'Client added successfully!', type: 'success' })
      }
      setDialogOpen(false)
      setEditingClient(null)
      form.reset()
    } catch {
      toaster.create({ title: editingClient ? 'Failed to update client' : 'Failed to add client', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode || '',
      country: client.country,
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return
    setIsDeleting(true)
    try {
      await deleteClient(clientToDelete.id)
      toaster.create({ title: 'Client deleted successfully!', type: 'success' })
      setDeleteOpen(false)
      setClientToDelete(null)
    } catch {
      toaster.create({ title: 'Failed to delete client', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDialogClose = () => {
    if (!isSubmitting) {
      setDialogOpen(false)
      setEditingClient(null)
      form.reset()
    }
  }

  const clearSearch = () => setSearchTerm('')

  if (isLoading) {
    return (
      <Flex direction="column" gap={{ base: '4', md: '5' }}>
        <Skeleton h="12" w="72" rounded="2xl" />
        <Skeleton h="480px" rounded="3xl" />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Clients"
        title="Client relationships"
        description="Keep client data accurate, searchable, and ready for invoicing without bouncing between disconnected forms."
        actions={
          <Button colorPalette="teal" onClick={() => setDialogOpen(true)} whiteSpace="nowrap">
            <Icon as={FiPlus} mr="2" />
            Add client
          </Button>
        }
      />

      <SectionCard
        title="Client directory"
        description={
          searchTerm
            ? `Showing ${filteredClients.length} of ${clients.length} client${clients.length !== 1 ? 's' : ''}.`
            : `${clients.length} client${clients.length !== 1 ? 's' : ''} in your workspace.`
        }
      >
        <Flex direction="column" gap="4" mb="6">
          <Box w="full" maxW={{ base: 'full', md: 'xl' }}>
            <Input
              placeholder="Search by name, email, or city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          {searchTerm && (
            <Button variant="outline" size="sm" onClick={clearSearch} whiteSpace="nowrap">
              <Icon as={FiX} mr="2" />
              Clear
            </Button>
          )}
        </Flex>

        {filteredClients.length === 0 ? (
          <EmptyState
            icon={<Icon as={FiUsers} boxSize="10" />}
            title={searchTerm ? 'No clients found' : 'No clients yet'}
            description={
              searchTerm
                ? 'Try a different search term to find the client you need.'
                : 'Add your first client so invoicing, follow-ups, and contact management all start from one place.'
            }
            actionLabel={searchTerm ? 'Clear search' : 'Add your first client'}
            onAction={searchTerm ? clearSearch : () => setDialogOpen(true)}
          />
        ) : (
          <ResponsiveList
            cards={
              <Flex direction="column" gap="3">
                {[...filteredClients]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((client) => (
                    <Box
                      key={client.id}
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor="border"
                      p="4"
                      bg="bg.subtle"
                    >
                      <Flex direction="column" gap="2">
                        <Text fontWeight="medium">{client.name}</Text>
                        <Flex align="center" gap="2" fontSize="sm" color="fg.muted">
                          <Icon as={FiMail} boxSize="3.5" />
                          <Text>{client.email}</Text>
                        </Flex>
                        <Flex align="center" gap="2" fontSize="sm" color="fg.muted">
                          <Icon as={FiMapPin} boxSize="3.5" />
                          <Text>
                            {client.city}, {client.state}, {client.country}
                          </Text>
                        </Flex>
                        <Flex gap="2" mt="2">
                          <IconButton
                            aria-label="Edit"
                            size="sm"
                            variant="ghost"
                            minW="10"
                            minH="10"
                            onClick={() => handleEdit(client)}
                          >
                            <Icon as={FiEdit} />
                          </IconButton>
                          <IconButton
                            aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            minW="10"
                            minH="10"
                            onClick={() => handleDeleteClick(client)}
                          >
                            <Icon as={FiTrash2} />
                          </IconButton>
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
              </Flex>
            }
            table={
              <ScrollableTable>
                <Table.Root size="sm">
                  <Table.Header>
                    <Table.Row>
                    <Table.ColumnHeader>Client</Table.ColumnHeader>
                    <Table.ColumnHeader>Contact</Table.ColumnHeader>
                    <Table.ColumnHeader>Location</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {[...filteredClients]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((client) => (
                      <Table.Row key={client.id}>
                        <Table.Cell minW="0">
                          <Text fontWeight="medium">{client.name}</Text>
                          <Text fontSize="xs" color="fg.muted" mt="1">
                            {client.address}
                          </Text>
                        </Table.Cell>
                        <Table.Cell minW="0">
                          <Flex direction="column" gap="2" fontSize="sm">
                            <Flex align="center" gap="2">
                              <Icon as={FiMail} boxSize="3.5" color="fg.muted" />
                              <Text>{client.email}</Text>
                            </Flex>
                            {client.phone && (
                              <Flex align="center" gap="2" color="fg.muted">
                                <Icon as={FiPhone} boxSize="3.5" />
                                <Text>{client.phone}</Text>
                              </Flex>
                            )}
                          </Flex>
                        </Table.Cell>
                        <Table.Cell minW="0">
                          <Flex align="center" gap="2" fontSize="sm" color="fg.muted">
                            <Icon as={FiMapPin} boxSize="3.5" />
                            <Text>
                              {client.city}, {client.state}, {client.country}
                            </Text>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <IconButton aria-label="Edit" size="sm" variant="ghost" minW={{ base: '11', md: '10' }} minH={{ base: '11', md: '10' }} onClick={() => handleEdit(client)}>
                              <Icon as={FiEdit} />
                            </IconButton>
                            <IconButton
                              aria-label="Delete"
                              size="sm"
                              variant="ghost"
                              colorPalette="red"
                              minW={{ base: '11', md: '10' }}
                              minH={{ base: '11', md: '10' }}
                              onClick={() => handleDeleteClick(client)}
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
            }
          />
        )}
      </SectionCard>

      <Dialog.Root open={dialogOpen} onOpenChange={(e) => (!e.open ? handleDialogClose() : setDialogOpen(true))} size={{ base: 'full', md: 'xl' }} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Dialog.Header flexDirection="column" alignItems="flex-start" gap="1">
                <Dialog.Title>{editingClient ? 'Edit client' : 'Add new client'}</Dialog.Title>
                <Dialog.Description>
                  {editingClient ? 'Update the client details below.' : 'Capture the client details you need for smooth invoicing.'}
                </Dialog.Description>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <Flex direction="column" gap="4" display="grid" gridTemplateColumns={{ md: '1fr 1fr' }}>
                  <Field.Root invalid={!!form.formState.errors.name} gridColumn={{ md: '1 / -1' }}>
                    <Field.Label>Client name</Field.Label>
                    <Input {...form.register('name')} />
                    <Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.email}>
                    <Field.Label>Email</Field.Label>
                    <Input type="email" {...form.register('email')} />
                    <Field.ErrorText>{form.formState.errors.email?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.phone}>
                    <Field.Label>Phone</Field.Label>
                    <Input {...form.register('phone')} />
                    <Field.ErrorText>{form.formState.errors.phone?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.address} gridColumn={{ md: '1 / -1' }}>
                    <Field.Label>Address</Field.Label>
                    <Input {...form.register('address')} />
                    <Field.ErrorText>{form.formState.errors.address?.message}</Field.ErrorText>
                  </Field.Root>
                  <LocationSelectGroup
                    country={form.watch('country')}
                    state={form.watch('state')}
                    city={form.watch('city')}
                    onCountryChange={(v) => {
                      form.setValue('country', v)
                      form.setValue('state', '')
                      form.setValue('city', '')
                    }}
                    onStateChange={(v) => {
                      form.setValue('state', v)
                      form.setValue('city', '')
                    }}
                    onCityChange={(v) => form.setValue('city', v)}
                    countryInvalid={!!form.formState.errors.country}
                    stateInvalid={!!form.formState.errors.state}
                    cityInvalid={!!form.formState.errors.city}
                    countryPlaceholder="Select country..."
                    statePlaceholder="Select state or province..."
                    cityPlaceholder="Select city..."
                  >
                    {({ countrySelect, stateSelect, citySelect }) => (
                      <>
                        <Field.Root invalid={!!form.formState.errors.country}>
                          <Field.Label>Country</Field.Label>
                          {countrySelect}
                          <Field.ErrorText>{form.formState.errors.country?.message}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root invalid={!!form.formState.errors.state}>
                          <Field.Label>State</Field.Label>
                          {stateSelect}
                          <Field.ErrorText>{form.formState.errors.state?.message}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root invalid={!!form.formState.errors.city}>
                          <Field.Label>City</Field.Label>
                          {citySelect}
                          <Field.ErrorText>{form.formState.errors.city?.message}</Field.ErrorText>
                        </Field.Root>
                      </>
                    )}
                  </LocationSelectGroup>
                  <Field.Root invalid={!!form.formState.errors.zipCode} gridColumn={{ md: '1 / -1' }}>
                    <Field.Label>ZIP code</Field.Label>
                    <Input {...form.register('zipCode')} />
                    <Field.ErrorText>{form.formState.errors.zipCode?.message}</Field.ErrorText>
                  </Field.Root>
                </Flex>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleDialogClose} disabled={isSubmitting} whiteSpace="nowrap">
                  Cancel
                </Button>
                <Button type="submit" colorPalette="teal" loading={isSubmitting} whiteSpace="nowrap">
                  {editingClient ? 'Update client' : 'Add client'}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <Dialog.Root open={deleteOpen} onOpenChange={(e) => setDeleteOpen(e.open)} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header flexDirection="column" alignItems="flex-start" gap="1">
              <Dialog.Title>Delete client</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete &quot;{clientToDelete?.name}&quot;? This action cannot be undone.
              </Dialog.Description>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting} whiteSpace="nowrap">
                Cancel
              </Button>
              <Button colorPalette="red" onClick={handleDeleteConfirm} loading={isDeleting} whiteSpace="nowrap">
                Delete client
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  )
}
