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
  RADIUS_MD,
  SENT_ORANGE,
  SPACE_2,
  SPACE_5,
  SPACE_6,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './email-theme'

export interface ReminderEmailProps {
  invoiceNumber: string
  clientName: string
  companyName: string
  companyLogoUrl?: string
  total: string
  dueDate: string
  daysSinceSent?: number
}

export function ReminderEmail({
  invoiceNumber,
  clientName,
  companyName,
  companyLogoUrl,
  total,
  dueDate,
  daysSinceSent = 0,
}: ReminderEmailProps) {
  return (
    <EmailLayout
      companyName={companyName}
      companyLogoUrl={companyLogoUrl}
      headerTitle="Payment Reminder"
      headerSubtitle={companyName}
      headerAccentColor={SENT_ORANGE}
      ctaHref="#"
      ctaLabel="Pay Now"
      ctaColor={SENT_ORANGE}
    >
      <Text style={greeting}>Dear {clientName},</Text>

      <Text style={bodyText}>
        This is a friendly reminder that invoice{' '}
        <strong>#{invoiceNumber}</strong> for <strong>${total}</strong> is still
        awaiting payment.
      </Text>

      {daysSinceSent > 0 ? (
        <Section style={daysNoteSection}>
          <Text style={daysNote}>
            This invoice was sent {daysSinceSent} day
            {daysSinceSent !== 1 ? 's' : ''} ago.
          </Text>
        </Section>
      ) : null}

      <Section
        style={{
          ...detailsCard,
          borderLeft: `4px solid ${SENT_ORANGE}`,
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
          <Column style={detailLabel}>Due Date</Column>
          <Column style={{ ...detailValue, textAlign: 'right' as const }}>
            {dueDate}
          </Column>
        </Row>
      </Section>

      <Text style={bodyText}>
        Please process the payment at your earliest convenience to avoid any
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

const bodyText = {
  margin: `0 0 ${SPACE_5} 0`,
  fontSize: FONT_SIZE_SM,
  color: TEXT_SECONDARY,
  lineHeight: LINE_HEIGHT_RELAXED,
}

const daysNoteSection = {
  marginBottom: SPACE_5,
}

const daysNote = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  color: TEXT_MUTED,
  fontStyle: 'italic',
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

const signOff = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  color: TEXT_SECONDARY,
  lineHeight: LINE_HEIGHT_RELAXED,
}
