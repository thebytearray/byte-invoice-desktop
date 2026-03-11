import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Section,
  Text,
} from '@react-email/components'
import type { ReactNode } from 'react'
import {
  BORDER_COLOR,
  BOX_SHADOW_MD,
  CONTAINER_MAX_WIDTH,
  FONT_FAMILY,
  FONT_SIZE_SM,
  FONT_SIZE_XS,
  FONT_WEIGHT_SEMIBOLD,
  GRAY_500,
  GRAY_700,
  LINE_HEIGHT_NORMAL,
  RADIUS_FULL,
  RADIUS_LG,
  RADIUS_MD,
  SPACE_1,
  SPACE_3,
  SPACE_4,
  SPACE_5,
  SPACE_6,
  SPACE_8,
  SPACE_10,
  TEAL_500,
} from './email-theme'

export interface EmailLayoutProps {
  companyName: string
  companyLogoUrl?: string
  headerTitle: string
  headerSubtitle?: string
  headerAccentColor?: string
  ctaHref?: string
  ctaLabel?: string
  ctaColor?: string
  children: ReactNode
}

export function EmailLayout({
  companyName,
  companyLogoUrl,
  headerTitle,
  headerSubtitle,
  headerAccentColor = TEAL_500,
  ctaHref,
  ctaLabel,
  ctaColor = TEAL_500,
  children,
}: EmailLayoutProps) {
  const logoUrl = companyLogoUrl || undefined

  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </Head>
      <Body style={body}>
        <Container style={container}>
          <Section style={brandingSection}>
            <Text style={brandingText}>ByteInvoice</Text>
          </Section>

          <Section
            style={{
              ...headerSection,
              backgroundColor: headerAccentColor,
            }}
          >
            {logoUrl ? (
              <Img
                src={logoUrl}
                alt={companyName}
                width={56}
                height={56}
                style={logo}
              />
            ) : null}
            <Heading as="h1" style={headerTitleStyle}>
              {headerTitle}
            </Heading>
            <Text style={headerSubtitleStyle}>
              {headerSubtitle ?? companyName}
            </Text>
          </Section>

          <Section style={contentSection}>
            {children}

            {ctaHref && ctaLabel ? (
              <Section style={ctaSection}>
                <Button
                  href={ctaHref}
                  style={{
                    ...ctaButton,
                    backgroundColor: ctaColor,
                  }}
                >
                  {ctaLabel}
                </Button>
              </Section>
            ) : null}
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>{companyName}</Text>
            <Text style={footerPowered}>
              Powered by{' '}
              <Link href="https://byteinvoice.com" style={footerLink}>
                ByteInvoice
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#edf2f7',
  fontFamily: FONT_FAMILY,
  margin: 0,
  padding: `${SPACE_10} ${SPACE_5}`,
}

const container = {
  margin: '0 auto',
  maxWidth: CONTAINER_MAX_WIDTH,
  backgroundColor: '#ffffff',
  borderRadius: RADIUS_LG,
  overflow: 'hidden' as const,
  boxShadow: BOX_SHADOW_MD,
}

const brandingSection = {
  padding: `${SPACE_4} ${SPACE_6}`,
  textAlign: 'center' as const,
  borderBottom: `1px solid ${BORDER_COLOR}`,
}

const brandingText = {
  margin: 0,
  fontSize: FONT_SIZE_XS,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  color: GRAY_500,
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
}

const headerSection = {
  padding: `${SPACE_8} ${SPACE_6}`,
  textAlign: 'center' as const,
}

const logo = {
  display: 'block' as const,
  margin: '0 auto 16px',
  borderRadius: RADIUS_MD,
}

const headerTitleStyle = {
  margin: '0 0 8px 0',
  fontSize: '24px',
  fontWeight: 700,
  color: '#ffffff',
  lineHeight: 1.25,
}

const headerSubtitleStyle = {
  margin: 0,
  fontSize: FONT_SIZE_SM,
  color: 'rgba(255, 255, 255, 0.9)',
  lineHeight: LINE_HEIGHT_NORMAL,
}

const contentSection = {
  padding: `${SPACE_8} ${SPACE_6}`,
}

const ctaSection = {
  marginTop: SPACE_8,
  textAlign: 'center' as const,
}

const ctaButton = {
  display: 'inline-block' as const,
  padding: `${SPACE_3} ${SPACE_6}`,
  borderRadius: RADIUS_FULL,
  color: '#ffffff',
  fontSize: FONT_SIZE_SM,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  textDecoration: 'none',
}

const divider = {
  borderColor: BORDER_COLOR,
  margin: 0,
}

const footerSection = {
  padding: SPACE_6,
  textAlign: 'center' as const,
}

const footerText = {
  margin: `0 0 ${SPACE_1} 0`,
  fontSize: FONT_SIZE_SM,
  color: GRAY_700,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
}

const footerPowered = {
  margin: 0,
  fontSize: FONT_SIZE_XS,
  color: GRAY_500,
}

const footerLink = {
  color: TEAL_500,
  textDecoration: 'none',
  fontWeight: FONT_WEIGHT_SEMIBOLD,
}
