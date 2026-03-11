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
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_SEMIBOLD,
  LINE_HEIGHT_RELAXED,
  OVERDUE_RED,
  RADIUS_MD,
  SPACE_2,
  SPACE_5,
  SPACE_6,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './email-theme'

export interface OverdueEmailProps {
  invoiceNumber: string
  clientName: string
  companyName: string
  companyLogoUrl?: string
  total: string
  dueDate: string
  daysOverdue?: number
}

export function OverdueEmail({
  invoiceNumber,
  clientName,
  companyName,
  companyLogoUrl,
  total,
  dueDate,
  daysOverdue = 0,
}: OverdueEmailProps) {
  const daysText =
    daysOverdue > 0
      ? ` (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue)`
      : ''

  return (
    <EmailLayout
      companyName={companyName}
      companyLogoUrl={companyLogoUrl}
      headerTitle="Overdue Payment Notice"
      headerSubtitle={`${companyName} · URGENT`}
      headerAccentColor={OVERDUE_RED}
      ctaHref="#"
      ctaLabel="Pay Now"
      ctaColor={OVERDUE_RED}
    >
      <Text style={greeting}>Dear {clientName},</Text>

      <Section style={urgentBanner}>
        <Text style={urgentText}>
          <strong>URGENT:</strong> Invoice #{invoiceNumber} for ${total} is now
          overdue{daysText}.
        </Text>
      </Section>

      <Section
        style={{
          ...detailsCard,
          borderLeft: `4px solid ${OVERDUE_RED}`,
        }}
      >
        <Row>
          <Column style={detailLabel}>Invoice</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            #{invoiceNumber}
          </Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Amount Due</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            ${total}
          </Column>
        </Row>
        <Row>
          <Column style={detailLabel}>Original Due Date</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            {dueDate}
          </Column>
        </Row>
      </Section>

      <Text style={bodyText}>
        Please contact us immediately to resolve this matter and avoid any
        service interruptions.
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

const urgentBanner = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: RADIUS_MD,
  padding: `${SPACE_5} ${SPACE_6}`,
  marginBottom: SPACE_6,
}

const urgentText = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  lineHeight: 1.5,
  color: '#991b1b',
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

const detailValue = {
  padding: `${SPACE_2} 0`,
  fontSize: FONT_SIZE_SM,
  color: TEXT_PRIMARY,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
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
