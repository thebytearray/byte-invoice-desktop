import { Card, Flex } from '@chakra-ui/react'

interface SectionCardProps {
  title?: string
  description?: string
  endContent?: React.ReactNode
  children: React.ReactNode
  bodyProps?: object
}

export function SectionCard({ title, description, endContent, children, bodyProps }: SectionCardProps) {
  return (
    <Card.Root rounded="2xl">
      {(title || description || endContent) && (
        <Card.Header
          display="flex"
          flexDirection={{ base: 'column', sm: 'row' }}
          alignItems={{ base: 'stretch', sm: 'flex-start' }}
          justifyContent="space-between"
          gap="3"
          borderBottomWidth="1px"
          borderColor="border"
          px={{ base: '4', md: '5' }}
          py={{ base: '3', md: '4' }}
        >
          <Flex direction="column" gap="1" minW="0">
            {title && (
              <Card.Title fontSize="lg" fontWeight="semibold" overflow="hidden" textOverflow="ellipsis">
                {title}
              </Card.Title>
            )}
            {description && (
              <Card.Description fontSize="sm" lineHeight="6" color="fg.muted" minW="0">
                {description}
              </Card.Description>
            )}
          </Flex>
          {endContent && (
            <Flex alignSelf={{ base: 'stretch', sm: 'auto' }} flexShrink={0} css={{ '& button': { whiteSpace: 'nowrap' } }}>
              {endContent}
            </Flex>
          )}
        </Card.Header>
      )}
      <Card.Body p={{ base: '4', md: '5' }} {...bodyProps}>
        {children}
      </Card.Body>
    </Card.Root>
  )
}
