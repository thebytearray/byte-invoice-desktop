import { Box, Flex, Text } from '@chakra-ui/react'

interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <Box as="section" rounded="2xl" borderWidth="1px" borderColor="border" bg="bg.subtle" p={{ base: '4', md: '6' }}>
      <Flex direction="column" gap="1" mb="6">
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
        {description && (
          <Text fontSize="sm" lineHeight="6" color="fg.muted">
            {description}
          </Text>
        )}
      </Flex>
      {children}
    </Box>
  )
}
