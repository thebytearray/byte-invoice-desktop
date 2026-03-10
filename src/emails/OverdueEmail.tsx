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

export interface OverdueEmailProps {
  invoiceNumber: string
  clientName: string
  companyName: string
  total: string
  dueDate: string
  daysOverdue?: number
}

export function OverdueEmail({
  invoiceNumber,
  clientName,
  companyName,
  total,
  dueDate,
  daysOverdue = 0,
}: OverdueEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={headerTitle}>Overdue Payment Notice</Heading>
            <Text style={headerSubtitle}>
              {companyName} • URGENT
            </Text>
          </Section>
          <Section style={content}>
            <Text style={greeting}>Dear {clientName},</Text>
            <Section style={urgentBadge}>
              <Text style={urgentText}>
                <strong>URGENT:</strong> Invoice #{invoiceNumber} for ${total} is now overdue.
                {daysOverdue > 0 && ` (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue)`}
              </Text>
            </Section>
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
                <span style={detailLabel}>Original due date:</span>
                <span style={detailValue}>{dueDate}</span>
              </Text>
            </Section>
            <Text style={message}>
              Please contact us immediately to resolve this matter and avoid any
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
            <Text style={footerText}>This is an automated overdue notice from {companyName}.</Text>
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
  background: 'linear-gradient(135deg, #dc2626, #dc2626dd)',
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

const urgentBadge = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '24px',
}

const urgentText = {
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#991b1b',
}

const invoiceDetails = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  borderLeft: '4px solid #dc2626',
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

const message = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#374151',
  margin: '24px 0',
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
