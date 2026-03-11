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
  Textarea,
} from '@chakra-ui/react'
import { FiEdit, FiPackage, FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import { useStore } from '@/lib/store'
import { useShallow } from 'zustand/react/shallow'
import { toaster } from '@/components/ui/toaster'
import type { Product } from '@/types'
import { ResponsiveList } from '@/components/layout/responsive-list'
import { ScrollableTable } from '@/components/layout/scrollable-table'
import { EmptyState } from '@/components/saas/empty-state'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { Dialog, Field } from '@chakra-ui/react'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive').optional(),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
})

type ProductFormData = z.infer<typeof productSchema>

export function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useStore(
    useShallow((s) => ({
      products: s.products,
      addProduct: s.addProduct,
      updateProduct: s.updateProduct,
      deleteProduct: s.deleteProduct,
      isLoading: s.isLoading,
    }))
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      sku: '',
      category: '',
    },
  })

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data)
        toaster.create({ title: 'Product updated successfully!', type: 'success' })
      } else {
        const newProduct: Product = { id: crypto.randomUUID(), ...data }
        await addProduct(newProduct)
        toaster.create({ title: 'Product added successfully!', type: 'success' })
      }
      setDialogOpen(false)
      setEditingProduct(null)
      form.reset()
    } catch {
      toaster.create({ title: editingProduct ? 'Failed to update product' : 'Failed to add product', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      category: product.category,
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    setIsDeleting(true)
    try {
      await deleteProduct(productToDelete.id)
      toaster.create({ title: 'Product deleted successfully!', type: 'success' })
      setDeleteOpen(false)
      setProductToDelete(null)
    } catch {
      toaster.create({ title: 'Failed to delete product', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    form.reset()
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
        eyebrow="Products"
        title="Products and services"
        description="Build a reusable catalog so invoice creation feels faster, more consistent, and less repetitive."
        actions={
          <Button colorPalette="teal" onClick={() => setDialogOpen(true)} whiteSpace="nowrap">
            <Icon as={FiPlus} mr="2" />
            Add product
          </Button>
        }
      />

      <SectionCard
        title="Catalog"
        description={
          searchTerm
            ? `Showing ${filteredProducts.length} of ${products.length} product${products.length !== 1 ? 's' : ''}.`
            : `${products.length} reusable product${products.length !== 1 ? 's' : ''} and service item${products.length !== 1 ? 's' : ''}.`
        }
      >
        <Flex direction="column" gap="4" mb="6">
          <Box w="full" maxW={{ base: 'full', md: 'xl' }}>
            <Input
              placeholder="Search by name, category, SKU, or description"
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

        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Icon as={FiPackage} boxSize="10" />}
            title={searchTerm ? 'No matching products' : 'No products yet'}
            description={
              searchTerm
                ? 'Try a broader search to surface more products or services.'
                : 'Create reusable products and service templates so invoices can be assembled much faster.'
            }
            actionLabel={searchTerm ? 'Clear search' : 'Add your first product'}
            onAction={searchTerm ? clearSearch : () => setDialogOpen(true)}
          />
        ) : (
          <ResponsiveList
            cards={
              <Flex direction="column" gap="3">
                {filteredProducts.map((product) => (
                  <Box
                    key={product.id}
                    rounded="2xl"
                    borderWidth="1px"
                    borderColor="border"
                    p="4"
                    bg="bg.subtle"
                  >
                    <Flex direction="column" gap="2">
                      <Text fontWeight="medium">{product.name}</Text>
                      <Flex gap="2" fontSize="sm" color="fg.muted" flexWrap="wrap">
                        <Text>{product.sku}</Text>
                        <Text>•</Text>
                        <Text>{product.category}</Text>
                      </Flex>
                      <Text fontSize="sm" color="fg.muted" lineClamp={2}>
                        {product.description}
                      </Text>
                      <Flex justify="space-between" align="center" flexWrap="wrap" gap="2">
                        <Text fontSize="sm" fontWeight="medium">
                          {product.price !== undefined ? `$${product.price.toFixed(2)}` : 'Variable pricing'}
                        </Text>
                        <Flex gap="2">
                          <IconButton
                            aria-label="Edit"
                            size="sm"
                            variant="ghost"
                            minW={{ base: '11', md: '10' }}
                            minH={{ base: '11', md: '10' }}
                            onClick={() => handleEdit(product)}
                          >
                            <Icon as={FiEdit} />
                          </IconButton>
                          <IconButton
                            aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
minW={{ base: '11', md: '10' }}
                              minH={{ base: '11', md: '10' }}
                              onClick={() => handleDeleteClick(product)}
                          >
                            <Icon as={FiTrash2} />
                          </IconButton>
                        </Flex>
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
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>SKU</Table.ColumnHeader>
                    <Table.ColumnHeader>Category</Table.ColumnHeader>
                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                    <Table.ColumnHeader>Price</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredProducts.map((product) => (
                    <Table.Row key={product.id}>
                      <Table.Cell fontWeight="medium" minW="0">{product.name}</Table.Cell>
                      <Table.Cell whiteSpace="nowrap">{product.sku}</Table.Cell>
                      <Table.Cell whiteSpace="nowrap">{product.category}</Table.Cell>
                      <Table.Cell minW="0">
                        <Text maxW={{ base: 'full', md: 'sm' }} fontSize="sm" color="fg.muted" minW="0" lineClamp={2}>
                          {product.description}
                        </Text>
                      </Table.Cell>
                      <Table.Cell whiteSpace="nowrap">
                        {product.price !== undefined ? `$${product.price.toFixed(2)}` : 'Variable pricing'}
                      </Table.Cell>
                      <Table.Cell>
                        <Flex gap="2">
                          <IconButton aria-label="Edit" size="sm" variant="ghost" minW={{ base: '11', md: '10' }} minH={{ base: '11', md: '10' }} onClick={() => handleEdit(product)}>
                            <Icon as={FiEdit} />
                          </IconButton>
                          <IconButton
                            aria-label="Delete"
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
minW={{ base: '11', md: '10' }}
                              minH={{ base: '11', md: '10' }}
                              onClick={() => handleDeleteClick(product)}
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
                <Dialog.Title>{editingProduct ? 'Edit product' : 'Add new product'}</Dialog.Title>
                <Dialog.Description>Define reusable catalog items for faster invoice creation.</Dialog.Description>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <Flex direction="column" gap="4" display="grid" gridTemplateColumns={{ md: '1fr 1fr' }}>
                  <Field.Root invalid={!!form.formState.errors.name} gridColumn={{ md: '1 / -1' }}>
                    <Field.Label>Name</Field.Label>
                    <Input {...form.register('name')} />
                    <Field.ErrorText>{form.formState.errors.name?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.sku}>
                    <Field.Label>SKU</Field.Label>
                    <Input {...form.register('sku')} />
                    <Field.ErrorText>{form.formState.errors.sku?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.category}>
                    <Field.Label>Category</Field.Label>
                    <Input {...form.register('category')} />
                    <Field.ErrorText>{form.formState.errors.category?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.price} gridColumn={{ md: '1 / -1' }}>
                    <Field.Label>Unit price</Field.Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...form.register('price', {
                        setValueAs: (v) => (v === '' || v === undefined ? undefined : parseFloat(v as string)),
                      })}
                    />
                    <Field.ErrorText>{form.formState.errors.price?.message}</Field.ErrorText>
                  </Field.Root>
                  <Field.Root invalid={!!form.formState.errors.description} gridColumn={{ md: '1 / -1' }}>
                    <Field.Label>Description</Field.Label>
                    <Textarea rows={4} {...form.register('description')} />
                    <Field.ErrorText>{form.formState.errors.description?.message}</Field.ErrorText>
                  </Field.Root>
                </Flex>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleDialogClose} disabled={isSubmitting} whiteSpace="nowrap">
                  Cancel
                </Button>
                <Button type="submit" colorPalette="teal" loading={isSubmitting} whiteSpace="nowrap">
                  {editingProduct ? 'Update product' : 'Add product'}
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
              <Dialog.Title>Delete product</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
              </Dialog.Description>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting} whiteSpace="nowrap">
                Cancel
              </Button>
              <Button colorPalette="red" onClick={handleDeleteConfirm} loading={isDeleting} whiteSpace="nowrap">
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  )
}
