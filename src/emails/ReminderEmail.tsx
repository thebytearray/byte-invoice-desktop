import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
} from '@react-email/components'

export interface ReminderEmailProps {
  invoiceNumber: string
  clientName: string
  companyName: string
  total: string
  dueDate: string
}

export function ReminderEmail({
  invoiceNumber,
  clientName,
  companyName,
  total,
  dueDate,
}: ReminderEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Payment Reminder</Heading>
            <Text style={headerSubtitle}>{companyName}</Text>
          </Section>
          <Section style={content}>
            <Text style={greeting}>Dear {clientName},</Text>
            <Text style={message}>
              This is a friendly reminder that invoice <strong>#{invoiceNumber}</strong> for{' '}
              <strong>${total}</strong> is still pending payment.
            </Text>
            <Section style={invoiceDetails}>
              <Text style={detailRow}>
                <span style={detailLabel}>Invoice:</span>
                <span style={detailValue}>#{invoiceNumber}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Amount:</span>
                <span style={detailValue}>${total}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Due date:</span>
                <span style={detailValue}>{dueDate}</span>
              </Text>
            </Section>
            <Text style={message}>
              Please process the payment at your earliest convenience to avoid any
              service interruptions.
            </Text>
            <Text style={signOff}>
              Best regards,
              <br />
              {companyName}
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>This is an automated reminder from {companyName}.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f9fafb',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #ea580c, #ea580cdd)',
  color: 'white',
}

const headerTitle = {
  margin: '0 0 8px 0',
  fontSize: '28px',
  fontWeight: '700',
}

const headerSubtitle = {
  margin: '0',
  fontSize: '16px',
  opacity: 0.9,
}

const content = {
  padding: '32px 24px',
}

const greeting = {
  fontSize: '18px',
  marginBottom: '24px',
  color: '#1f2937',
}

const message = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#374151',
  margin: '0 0 24px 0',
}

const invoiceDetails = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  borderLeft: '4px solid #ea580c',
}

const detailRow = {
  margin: '0 0 12px 0',
  display: 'flex',
  justifyContent: 'space-between',
}

const detailLabel = {
  color: '#6b7280',
  fontWeight: '500',
}

const detailValue = {
  fontWeight: '600',
  color: '#1f2937',
}

const signOff = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#374151',
  margin: '24px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '0',
}

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
}
