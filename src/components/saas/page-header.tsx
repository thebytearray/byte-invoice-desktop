import { Flex, Heading, Text } from '@chakra-ui/react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Flex
      direction={{ base: 'column', lg: 'row' }}
      gap="4"
      align={{ lg: 'flex-end' }}
      flexWrap="wrap"
    >
      <Flex direction="column" gap="2" flex="1" minW={{ base: 0, lg: 'min(100%, 36rem)' }}>
        {eyebrow && (
          <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="0.28em" color="fg.muted">
            {eyebrow}
          </Text>
        )}
        <Flex direction="column" gap="1" minW="0">
          <Heading size={{ base: 'xl', sm: '2xl' }} fontWeight="semibold" letterSpacing="tight">
            {title}
          </Heading>
          {description && (
            <Text fontSize="sm" lineHeight="6" color="fg.muted" maxW="full">
              {description}
            </Text>
          )}
        </Flex>
      </Flex>
      {actions && (
        <Flex flexWrap="wrap" gap="3">
          {actions}
        </Flex>
      )}
    </Flex>
  )
}
