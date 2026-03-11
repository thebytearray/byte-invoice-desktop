import {
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components'
import { EmailLayout } from './EmailLayout'
import {
  BORDER_COLOR,
  DETAILS_BG,
  FONT_SIZE_MD,
  FONT_SIZE_SM,
  FONT_SIZE_XS,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_SEMIBOLD,
  LINE_HEIGHT_NORMAL,
  LINE_HEIGHT_RELAXED,
  RADIUS_MD,
  SPACE_1,
  SPACE_2,
  SPACE_4,
  SPACE_5,
  SPACE_6,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './email-theme'

export interface InvoiceEmailProps {
  invoiceNumber: string
  invoiceDate: string
  clientName: string
  companyName: string
  companyLogoUrl?: string
  total: string
  dueDate: string
  pdfNote?: string
  statusMessage: string
  statusColor: string
}

export function InvoiceEmail({
  invoiceNumber,
  invoiceDate,
  clientName,
  companyName,
  companyLogoUrl,
  total,
  dueDate,
  pdfNote,
  statusMessage,
  statusColor,
}: InvoiceEmailProps) {
  return (
    <EmailLayout
      companyName={companyName}
      companyLogoUrl={companyLogoUrl}
      headerTitle={`Invoice #${invoiceNumber}`}
      headerSubtitle={companyName}
      headerAccentColor={statusColor}
      ctaHref="#"
      ctaLabel="View Invoice"
      ctaColor={statusColor}
    >
      <Text style={greeting}>Dear {clientName},</Text>

      <Section
        style={{
          ...statusBanner,
          backgroundColor: DETAILS_BG,
          borderLeft: `4px solid ${statusColor}`,
        }}
      >
        <Text style={{ ...statusText, color: statusColor }}>
          {statusMessage}
        </Text>
      </Section>

      <Section style={detailsCard}>
        <Row>
          <Column style={detailLabel}>Invoice</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            #{invoiceNumber}
          </Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Date</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            {invoiceDate}
          </Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Amount Due</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            ${total}
          </Column>
        </Row>
        <Row>
          <Column style={{ ...detailLabel, ...detailLabelLast }}>Due Date</Column>
          <Column style={{ ...detailValue, ...detailValueLast, textAlign: 'right' as const }}>
            {dueDate}
          </Column>
        </Row>
      </Section>

      {pdfNote ? (
        <Section style={noteSection}>
          <Text style={noteLabel}>Note</Text>
          <Text style={noteText}>{pdfNote}</Text>
        </Section>
      ) : null}

      <Text style={bodyText}>
        Please find your invoice attached to this email. If you have any
        questions about this invoice, please don&apos;t hesitate to reach out.
      </Text>

      <Text style={signOff}>
        Best regards,
        <br />
        {companyName}
      </Text>
    </EmailLayout>
  )
}

const greeting = {
  margin: `0 0 ${SPACE_5} 0`,
  fontSize: FONT_SIZE_MD,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  color: TEXT_PRIMARY,
}

const statusBanner = {
  padding: `${SPACE_4} ${SPACE_5}`,
  borderRadius: RADIUS_MD,
  marginBottom: SPACE_6,
}

const statusText = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  lineHeight: LINE_HEIGHT_NORMAL,
  fontWeight: FONT_WEIGHT_MEDIUM,
}

const detailsCard = {
  backgroundColor: DETAILS_BG,
  borderRadius: RADIUS_MD,
  padding: `${SPACE_5} ${SPACE_6}`,
  marginBottom: SPACE_6,
  border: `1px solid ${BORDER_COLOR}`,
}

const detailLabel = {
  padding: `${SPACE_2} 0`,
  fontSize: FONT_SIZE_SM,
  color: TEXT_MUTED,
  fontWeight: FONT_WEIGHT_MEDIUM,
}

const detailLabelLast = {
  borderTop: `1px solid ${BORDER_COLOR}`,
  paddingTop: SPACE_4,
  marginTop: SPACE_1,
}

const detailValue = {
  padding: `${SPACE_2} 0`,
  fontSize: FONT_SIZE_SM,
  color: TEXT_PRIMARY,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
}

const detailValueLast = {
  borderTop: `1px solid ${BORDER_COLOR}`,
  paddingTop: SPACE_4,
  marginTop: SPACE_1,
  fontSize: FONT_SIZE_MD,
}

const noteSection = {
  marginBottom: SPACE_6,
}

const noteLabel = {
  margin: `0 0 ${SPACE_1} 0`,
  fontSize: FONT_SIZE_XS,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  color: TEXT_MUTED,
  textTransform: 'uppercase' as const,
}

const noteText = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  color: TEXT_SECONDARY,
  lineHeight: LINE_HEIGHT_NORMAL,
}

const bodyText = {
  margin: `0 0 ${SPACE_6} 0`,
  fontSize: FONT_SIZE_SM,
  color: TEXT_SECONDARY,
  lineHeight: LINE_HEIGHT_RELAXED,
}

const signOff = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  color: TEXT_SECONDARY,
  lineHeight: LINE_HEIGHT_RELAXED,
}
