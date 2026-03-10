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

export interface InvoiceEmailProps {
  invoiceNumber: string
  clientName: string
  companyName: string
  total: string
  dueDate: string
  statusMessage: string
  statusColor: string
}

export function InvoiceEmail({
  invoiceNumber,
  clientName,
  companyName,
  total,
  dueDate,
  statusMessage,
  statusColor,
}: InvoiceEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section
            style={{
              ...header,
              background: `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)`,
            }}
          >
            <Heading style={headerTitle}>Invoice {invoiceNumber}</Heading>
            <Text style={headerSubtitle}>{companyName}</Text>
          </Section>
          <Section style={content}>
            <Text style={greeting}>Dear {clientName},</Text>
            <Section
              style={{
                ...statusBadge,
                backgroundColor: `${statusColor}15`,
                color: statusColor,
                border: `2px solid ${statusColor}30`,
              }}
            >
              <Text style={statusText}>{statusMessage}</Text>
            </Section>
            <Section
              style={{
                ...invoiceDetails,
                borderLeft: `4px solid ${statusColor}`,
              }}
            >
              <Text style={detailRow}>
                <span style={detailLabel}>Invoice:</span>
                <span style={detailValue}>#{invoiceNumber}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Amount:</span>
                <span style={detailValue}>${total}</span>
              </Text>
              <Text style={{ ...detailRow, ...detailRowLast }}>
                <span style={detailLabel}>Due date:</span>
                <span style={detailValue}>{dueDate}</span>
              </Text>
            </Section>
            <Text style={message}>
              Please find your invoice attached. If you have any questions,
              don&apos;t hesitate to reach out.
            </Text>
            <Text style={signOff}>
              Best regards,
              <br />
              {companyName}
            </Text>
          </Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>This is an automated message from {companyName}.</Text>
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

const statusBadge = {
  padding: '16px 20px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const statusText = {
  margin: 0,
  fontSize: '14px',
  lineHeight: 1.6,
}

const invoiceDetails = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const detailRow = {
  margin: '0 0 12px 0',
  display: 'flex',
  justifyContent: 'space-between',
}

const detailRowLast = {
  marginBottom: 0,
  paddingTop: '12px',
  borderTop: '2px solid #e5e7eb',
  fontWeight: '700',
  fontSize: '18px',
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
