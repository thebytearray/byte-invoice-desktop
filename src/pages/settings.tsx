import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { open, save } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'
import { Box, Button, Checkbox, Flex, Icon, Input, Skeleton, Tabs } from '@chakra-ui/react'
import { FiBriefcase, FiDatabase, FiDownload, FiMail, FiSave, FiTrash2 } from 'react-icons/fi'
import { useStore } from '@/lib/store'
import type { Company, SMTPSettings } from '@/types'
import { toaster } from '@/components/ui/toaster'
import { PageHeader } from '@/components/saas/page-header'
import { SectionCard } from '@/components/saas/section-card'
import { CountryCombobox, StateCombobox } from '@/components/saas/location-select'
import { Dialog, Field } from '@chakra-ui/react'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address'),
  website: z.string().optional(),
  taxId: z.string().optional(),
})

const smtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  fromName: z.string().min(1, 'From name is required'),
  fromEmail: z.string().email('Invalid email address'),
})

type CompanyFormData = z.infer<typeof companySchema>
type SMTPFormData = z.infer<typeof smtpSchema>

export function SettingsPage() {
  const { company, setCompany, settings, setSettings, isLoading, exportData, importData, clearAllData } = useStore()
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false)
  const [isSubmittingSMTP, setIsSubmittingSMTP] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const [isClearingData, setIsClearingData] = useState(false)

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name || '',
      address: company.address || '',
      city: company.city || '',
      state: company.state || '',
      zipCode: company.zipCode || '',
      country: company.country || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      taxId: company.taxId || '',
    },
  })

  const smtpForm = useForm<SMTPFormData>({
    resolver: zodResolver(smtpSchema),
    defaultValues: {
      host: settings.smtp?.host || '',
      port: settings.smtp?.port || 587,
      secure: settings.smtp?.secure ?? false,
      username: settings.smtp?.username || '',
      password: settings.smtp?.password || '',
      fromName: settings.smtp?.fromName || '',
      fromEmail: settings.smtp?.fromEmail || '',
    },
  })

  const onSubmitCompany = async (data: CompanyFormData) => {
    setIsSubmittingCompany(true)
    try {
      await setCompany(data as Company)
      toaster.create({ title: 'Company information updated successfully!', type: 'success' })
    } catch {
      toaster.create({ title: 'Failed to update company information', type: 'error' })
    } finally {
      setIsSubmittingCompany(false)
    }
  }

  const onSubmitSMTP = async (data: SMTPFormData) => {
    setIsSubmittingSMTP(true)
    try {
      await setSettings({ ...settings, smtp: data as SMTPSettings })
      toaster.create({ title: 'Email settings updated successfully!', type: 'success' })
    } catch {
      toaster.create({ title: 'Failed to update email settings', type: 'error' })
    } finally {
      setIsSubmittingSMTP(false)
    }
  }

  const handleExportData = async () => {
    try {
      const data = await exportData()
      if (!data) return

      const filePath = await save({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        defaultPath: `byte-invoice-backup-${new Date().toISOString().slice(0, 10)}.json`,
      })
      if (filePath) {
        await writeTextFile(filePath, JSON.stringify(data, null, 2))
        toaster.create({ title: 'Data exported successfully!', type: 'success' })
      }
    } catch {
      toaster.create({ title: 'Failed to export data', type: 'error' })
    }
  }

  const handleImportData = async () => {
    try {
      const filePath = await open({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        multiple: false,
      })
      if (!filePath || typeof filePath !== 'string') return

      const text = await readTextFile(filePath)
      const data = JSON.parse(text)
      await importData(data)
      toaster.create({ title: 'Data imported successfully!', type: 'success' })
      if (data.settings?.smtp) {
        smtpForm.reset({
          host: data.settings.smtp.host || '',
          port: data.settings.smtp.port || 587,
          secure: data.settings.smtp.secure ?? false,
          username: data.settings.smtp.username || '',
          password: data.settings.smtp.password || '',
          fromName: data.settings.smtp.fromName || '',
          fromEmail: data.settings.smtp.fromEmail || '',
        })
      }
      companyForm.reset({
        name: data.company?.name || '',
        address: data.company?.address || '',
        city: data.company?.city || '',
        state: data.company?.state || '',
        zipCode: data.company?.zipCode || '',
        country: data.company?.country || '',
        phone: data.company?.phone || '',
        email: data.company?.email || '',
        website: data.company?.website || '',
        taxId: data.company?.taxId || '',
      })
    } catch {
      toaster.create({ title: 'Failed to import data. Please check the file format.', type: 'error' })
    }
  }

  const handleClearAllData = async () => {
    setIsClearingData(true)
    try {
      await clearAllData()
      toaster.create({ title: 'All data cleared successfully!', type: 'success' })
      companyForm.reset()
      setClearDialogOpen(false)
    } catch {
      toaster.create({ title: 'Failed to clear data', type: 'error' })
    } finally {
      setIsClearingData(false)
    }
  }

  if (isLoading) {
    return (
      <Flex direction="column" gap={{ base: '4', md: '5' }}>
        <Skeleton h="12" w="72" rounded="2xl" />
        <Skeleton h="520px" rounded="3xl" />
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap={{ base: '4', md: '5' }}>
      <PageHeader
        eyebrow="Settings"
        title="Company and data settings"
        description="Configure the company identity used across invoices, emails, exports, and the rest of the billing workflow."
      />

      <Tabs.Root defaultValue="company" variant="line" fitted>
        <Tabs.List mb="4" borderBottomWidth="1px" borderColor="border">
          <Tabs.Trigger value="company" display="flex" alignItems="center" justifyContent="center" gap="2">
            <Icon as={FiBriefcase} />
            Company
          </Tabs.Trigger>
          <Tabs.Trigger value="email" display="flex" alignItems="center" justifyContent="center" gap="2">
            <Icon as={FiMail} />
            Email
          </Tabs.Trigger>
          <Tabs.Trigger value="data" display="flex" alignItems="center" justifyContent="center" gap="2">
            <Icon as={FiDatabase} />
            Data
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="company">
          <SectionCard
            title="Company information"
            description="These details appear across invoices, exports, and outgoing communication."
          >
        <Flex
          as="form"
          onSubmit={companyForm.handleSubmit(onSubmitCompany)}
          direction="column"
          gap="4"
          display="grid"
          gridTemplateColumns={{ md: '1fr 1fr' }}
        >
          <Field.Root invalid={!!companyForm.formState.errors.name} gridColumn={{ md: '1 / -1' }}>
            <Field.Label>Company name</Field.Label>
            <Input {...companyForm.register('name')} />
            <Field.ErrorText>{companyForm.formState.errors.name?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.email}>
            <Field.Label>Email</Field.Label>
            <Input type="email" {...companyForm.register('email')} />
            <Field.ErrorText>{companyForm.formState.errors.email?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.phone}>
            <Field.Label>Phone</Field.Label>
            <Input {...companyForm.register('phone')} />
            <Field.ErrorText>{companyForm.formState.errors.phone?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.address} gridColumn={{ md: '1 / -1' }}>
            <Field.Label>Street address</Field.Label>
            <Input {...companyForm.register('address')} />
            <Field.ErrorText>{companyForm.formState.errors.address?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.city}>
            <Field.Label>City</Field.Label>
            <Input {...companyForm.register('city')} />
            <Field.ErrorText>{companyForm.formState.errors.city?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.state}>
            <Field.Label>State or province</Field.Label>
            <Controller
              name="state"
              control={companyForm.control}
              render={({ field }) => (
                <StateCombobox
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search state or province..."
                  invalid={!!companyForm.formState.errors.state}
                />
              )}
            />
            <Field.ErrorText>{companyForm.formState.errors.state?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.zipCode}>
            <Field.Label>ZIP or postal code</Field.Label>
            <Input {...companyForm.register('zipCode')} />
            <Field.ErrorText>{companyForm.formState.errors.zipCode?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.country}>
            <Field.Label>Country</Field.Label>
            <Controller
              name="country"
              control={companyForm.control}
              render={({ field }) => (
                <CountryCombobox
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Search country..."
                  invalid={!!companyForm.formState.errors.country}
                />
              )}
            />
            <Field.ErrorText>{companyForm.formState.errors.country?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.website}>
            <Field.Label>Website</Field.Label>
            <Input {...companyForm.register('website')} />
            <Field.ErrorText>{companyForm.formState.errors.website?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!companyForm.formState.errors.taxId}>
            <Field.Label>Tax ID</Field.Label>
            <Input {...companyForm.register('taxId')} />
            <Field.ErrorText>{companyForm.formState.errors.taxId?.message}</Field.ErrorText>
          </Field.Root>
          <Box gridColumn={{ md: '1 / -1' }}>
            <Button type="submit" colorPalette="teal" loading={isSubmittingCompany}>
              <Icon as={FiSave} mr="2" />
              Save company information
            </Button>
          </Box>
        </Flex>
      </SectionCard>
        </Tabs.Content>

        <Tabs.Content value="email">
          <SectionCard
            title="Email settings"
            description="Configure SMTP for sending invoices and reminders via email."
          >
        <Flex
          as="form"
          onSubmit={smtpForm.handleSubmit(onSubmitSMTP)}
          direction="column"
          gap="4"
          display="grid"
          gridTemplateColumns={{ md: '1fr 1fr' }}
        >
          <Field.Root invalid={!!smtpForm.formState.errors.host} gridColumn={{ md: '1 / -1' }}>
            <Field.Label>SMTP host</Field.Label>
            <Input placeholder="smtp.gmail.com" {...smtpForm.register('host')} />
            <Field.ErrorText>{smtpForm.formState.errors.host?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!smtpForm.formState.errors.port}>
            <Field.Label>Port</Field.Label>
            <Controller
              name="port"
              control={smtpForm.control}
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="587"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 587)}
                />
              )}
            />
            <Field.ErrorText>{smtpForm.formState.errors.port?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root gridColumn={{ md: '1 / -1' }}>
            <Controller
              name="secure"
              control={smtpForm.control}
              render={({ field }) => (
                <Checkbox.Root
                  checked={field.value}
                  onCheckedChange={(e) => field.onChange(!!e.checked)}
                >
                  <Checkbox.Control />
                  <Checkbox.Label>Use TLS (secure connection)</Checkbox.Label>
                </Checkbox.Root>
              )}
            />
          </Field.Root>
          <Field.Root invalid={!!smtpForm.formState.errors.username}>
            <Field.Label>Username</Field.Label>
            <Input placeholder="your-email@gmail.com" {...smtpForm.register('username')} />
            <Field.ErrorText>{smtpForm.formState.errors.username?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!smtpForm.formState.errors.password}>
            <Field.Label>Password</Field.Label>
            <Input type="password" placeholder="App password" {...smtpForm.register('password')} />
            <Field.ErrorText>{smtpForm.formState.errors.password?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!smtpForm.formState.errors.fromName}>
            <Field.Label>From name</Field.Label>
            <Input placeholder="Your Company Name" {...smtpForm.register('fromName')} />
            <Field.ErrorText>{smtpForm.formState.errors.fromName?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!smtpForm.formState.errors.fromEmail}>
            <Field.Label>From email</Field.Label>
            <Input type="email" placeholder="noreply@yourcompany.com" {...smtpForm.register('fromEmail')} />
            <Field.ErrorText>{smtpForm.formState.errors.fromEmail?.message}</Field.ErrorText>
          </Field.Root>
          <Box gridColumn={{ md: '1 / -1' }}>
            <Button type="submit" colorPalette="teal" loading={isSubmittingSMTP}>
              <Icon as={FiMail} mr="2" />
              Save email settings
            </Button>
          </Box>
        </Flex>
      </SectionCard>
        </Tabs.Content>

        <Tabs.Content value="data">
          <SectionCard
            title="Data management"
            description="Back up, restore, or reset the workspace data that powers your billing workflow."
          >
            <Flex gap="3" flexWrap="wrap">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Icon as={FiDownload} mr="2" />
                Export backup
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportData}>
                <Icon as={FiDatabase} mr="2" />
                Choose backup file
              </Button>
              <Button colorPalette="red" variant="outline" size="sm" onClick={() => setClearDialogOpen(true)}>
                <Icon as={FiTrash2} mr="2" />
                Clear all data
              </Button>
            </Flex>
          </SectionCard>
        </Tabs.Content>
      </Tabs.Root>

      <Dialog.Root open={clearDialogOpen} onOpenChange={(e) => setClearDialogOpen(e.open)} placement="center">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header flexDirection="column" alignItems="flex-start" gap="1">
              <Dialog.Title>Clear all data</Dialog.Title>
              <Dialog.Description>
                This will permanently delete your company information, client records, products, invoices, and
                settings. Continue only if you are sure.
              </Dialog.Description>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setClearDialogOpen(false)} disabled={isClearingData}>
                Cancel
              </Button>
              <Button colorPalette="red" onClick={handleClearAllData} loading={isClearingData}>
                Clear everything
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  )
}
