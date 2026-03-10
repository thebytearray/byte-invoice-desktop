import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, Flex, Icon, IconButton, Drawer, Text } from '@chakra-ui/react'
import { FiFileText, FiHome, FiMenu, FiPackage, FiSettings, FiUsers } from 'react-icons/fi'
import { ColorModeButton } from '@/components/ui/color-mode'

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Invoices', href: '/invoices', icon: FiFileText },
  { name: 'Clients', href: '/clients', icon: FiUsers },
  { name: 'Products', href: '/products', icon: FiPackage },
  { name: 'Settings', href: '/settings', icon: FiSettings },
]

export function Navbar() {
  const pathname = useLocation().pathname
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box as="nav" position="sticky" top="0" zIndex="50" borderBottomWidth="1px" borderColor="border" bg="bg/95" backdropFilter="blur(12px)">
      <Box maxW="7xl" mx="auto" px="4">
        <Flex h="16" align="center" justify="space-between">
          <Flex align="center">
            <Link to="/">
              <Flex align="center" gap="2">
                <Icon as={FiFileText} boxSize="6" />
                <Text fontSize="xl" fontWeight="bold">
                  Byte Invoice
                </Text>
              </Flex>
            </Link>
          </Flex>

          <Flex display={{ base: 'none', md: 'flex' }} align="center" gap="6">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} to={item.href}>
                  <Flex
                    align="center"
                    gap="2"
                    px="3"
                    py="2"
                    rounded="md"
                    fontSize="sm"
                    fontWeight="medium"
                    bg={isActive ? 'bg.muted' : 'transparent'}
                    color={isActive ? 'fg' : 'fg.muted'}
                    _hover={{ color: 'fg', bg: 'bg.subtle' }}
                  >
                    <Icon className="h-4 w-4" style={{ width: 16, height: 16 }} />
                    <span>{item.name}</span>
                  </Flex>
                </Link>
              )
            })}
          </Flex>

          <Flex align="center" gap="2">
            <ColorModeButton />
            <IconButton
              display={{ md: 'none' }}
              aria-label="Open menu"
              variant="ghost"
              onClick={() => setDrawerOpen(true)}
            >
              <Icon as={FiMenu} boxSize="5" />
            </IconButton>
          </Flex>
        </Flex>
      </Box>

      <Drawer.Root open={drawerOpen} placement="end" onOpenChange={(e) => setDrawerOpen(e.open)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Flex align="center" gap="2">
                <Icon as={FiFileText} boxSize="6" />
                <Text fontSize="xl" fontWeight="bold">
                  Byte Invoice
                </Text>
              </Flex>
            </Drawer.Header>
            <Drawer.Body>
              <Flex direction="column" gap="2" pt="4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} to={item.href} onClick={() => setDrawerOpen(false)}>
                      <Flex
                        align="center"
                        gap="3"
                        px="3"
                        py="3"
                        rounded="md"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={isActive ? 'bg.muted' : 'transparent'}
                        color={isActive ? 'fg' : 'fg.muted'}
                        _hover={{ color: 'fg', bg: 'bg.subtle' }}
                      >
                        <Icon style={{ width: 20, height: 20 }} />
                        <span>{item.name}</span>
                      </Flex>
                    </Link>
                  )
                })}
              </Flex>
              <Box pt="4" mt="4" borderTopWidth="1px" borderColor="border">
                <Text fontSize="sm" color="fg.muted">
                  Professional Invoice Management
                </Text>
              </Box>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  )
}
