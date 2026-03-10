import { Card, Flex, Text } from '@chakra-ui/react'

interface MetricCardProps {
  label: string
  value: string
  detail?: string
  icon?: React.ReactNode
}

export function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <Card.Root minW="0" overflow="hidden">
      <Card.Body overflow="hidden">
        <Flex direction="column" gap="2" p="4" minW="0">
          <Flex align="center" gap="2" minW="0">
            {icon && (
              <Flex
                align="center"
                justify="center"
                rounded="lg"
                borderWidth="1px"
                borderColor="border"
                bg="bg.subtle"
                p="2"
                flexShrink="0"
              >
                {icon}
              </Flex>
            )}
            <Text fontSize="sm" color="fg.muted" lineClamp={1}>
              {label}
            </Text>
          </Flex>
          <Text fontSize="xl" fontWeight="semibold" lineClamp={1} title={value}>
            {value}
          </Text>
          {detail && (
            <Text fontSize="xs" color="fg.muted" lineClamp={1} title={detail}>
              {detail}
            </Text>
          )}
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}
