import { Link } from 'react-router-dom'
import { Box, Flex, Image } from '@chakra-ui/react'

interface AppLogoProps {
  href?: string
  compact?: boolean
  className?: string
}

export function AppLogo({ href = '/', compact = false }: AppLogoProps) {
  return (
    <Link to={href}>
      <Flex
        align="center"
        gap="3"
        rounded="full"
        borderWidth="1px"
        borderColor="border"
        px="3"
        py="2"
        bg="bg.subtle"
        _hover={{ borderColor: 'border.emphasized', bg: 'bg.muted' }}
        transition="all 0.2s"
      >
        <Image
          src="/logo.png"
          alt="Byte Invoice"
          w="10"
          h="10"
          rounded="full"
          objectFit="cover"
        />
        {!compact && (
          <Flex align="center" gap="1" lineHeight="none">
            <Box as="span" fontSize="xs" textTransform="uppercase" letterSpacing="0.3em" color="fg.muted">
              Byte
            </Box>
            <Box as="span" fontSize="xs" textTransform="uppercase" letterSpacing="0.3em" color="fg.muted">
              Invoice
            </Box>
          </Flex>
        )}
      </Flex>
    </Link>
  )
}
