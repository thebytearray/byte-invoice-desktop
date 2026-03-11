import { Link } from 'react-router-dom'
import { Box, Button, Center, Text } from '@chakra-ui/react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
}

export function EmptyState({ icon, title, description, actionLabel, onAction, actionHref }: EmptyStateProps) {
  return (
    <Center
      flexDirection="column"
      rounded="3xl"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="border"
      bg="bg.subtle"
      px={{ base: '4', md: '6' }}
      py={{ base: '6', md: '8' }}
      textAlign="center"
      minW="0"
    >
      <Box mb="4" rounded="3xl" borderWidth="1px" borderColor="border" p="4" bg="bg.muted">
        {icon}
      </Box>
      <Text fontSize="xl" fontWeight="semibold" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" maxW="full">
        {title}
      </Text>
      <Text mt="2" maxW="md" fontSize="sm" lineHeight="7" color="fg.muted" minW="0">
        {description}
      </Text>
      {actionLabel && (
        <Box mt="4">
          {actionHref ? (
          <Button asChild colorPalette="teal" whiteSpace="nowrap">
            <Link to={actionHref}>{actionLabel}</Link>
          </Button>
          ) : onAction ? (
            <Button colorPalette="teal" onClick={onAction} whiteSpace="nowrap">
              {actionLabel}
            </Button>
          ) : null}
        </Box>
      )}
    </Center>
  )
}
