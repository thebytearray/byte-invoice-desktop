import { Flex, Text } from '@chakra-ui/react'

interface MetricCapsuleProps {
  label: string
  value: string
}

export function MetricCapsule({ label, value }: MetricCapsuleProps) {
  return (
    <Flex
      align="center"
      gap="2"
      rounded="full"
      px="3"
      py="1.5"
      borderWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      minW="0"
      flex="1 1 auto"
    >
      <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap" flexShrink={0}>
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold" truncate>
        {value}
      </Text>
    </Flex>
  )
}
