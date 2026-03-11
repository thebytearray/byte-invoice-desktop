import { useState } from 'react'
import { Box, Button, Dialog, Tabs } from '@chakra-ui/react'
import { FiEye } from 'react-icons/fi'
import { Icon } from '@chakra-ui/react'

export interface EmailTemplatePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceHtml: string
  reminderHtml: string
  overdueHtml: string
}

export function EmailTemplatePreviewModal({
  open,
  onOpenChange,
  invoiceHtml,
  reminderHtml,
  overdueHtml,
}: EmailTemplatePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'invoice' | 'reminder' | 'overdue'>('invoice')

  const currentHtml =
    activeTab === 'invoice'
      ? invoiceHtml
      : activeTab === 'reminder'
        ? reminderHtml
        : overdueHtml

  return (
    <Dialog.Root open={open} onOpenChange={(e) => onOpenChange(e.open)} size="xl" placement="center">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="720px" maxH="90vh" display="flex" flexDirection="column">
          <Dialog.Header>
            <Dialog.Title>Email template preview</Dialog.Title>
            <Dialog.Description>
              Preview how your invoice, reminder, and overdue emails will appear to clients.
            </Dialog.Description>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          <Tabs.Root
            value={activeTab}
            onValueChange={(e) => setActiveTab(e.value as 'invoice' | 'reminder' | 'overdue')}
            variant="line"
            fitted
          >
            <Tabs.List mb="3" borderBottomWidth="1px" borderColor="border">
              <Tabs.Trigger value="invoice" whiteSpace="nowrap">
                Invoice
              </Tabs.Trigger>
              <Tabs.Trigger value="reminder" whiteSpace="nowrap">
                Reminder
              </Tabs.Trigger>
              <Tabs.Trigger value="overdue" whiteSpace="nowrap">
                Overdue
              </Tabs.Trigger>
            </Tabs.List>
            <Box flex="1" minH="0" display="flex" flexDirection="column" pt="0">
              <PreviewFrame html={currentHtml} />
            </Box>
          </Tabs.Root>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => onOpenChange(false)} whiteSpace="nowrap">
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

function PreviewFrame({ html }: { html: string }) {
  return (
    <Box
      flex="1"
      minH="400px"
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
      overflow="hidden"
    >
      <iframe
        srcDoc={html}
        title="Email preview"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          border: 'none',
        }}
      />
    </Box>
  )
}

export function EmailTemplatePreviewButton({
  onClick,
  loading,
}: {
  onClick: () => void
  loading?: boolean
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      whiteSpace="nowrap"
      loading={loading}
    >
      <Icon as={FiEye} mr="2" />
      Preview email templates
    </Button>
  )
}
