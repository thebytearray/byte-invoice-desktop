import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, Flex, Icon, IconButton, Drawer, ScrollArea, Text } from '@chakra-ui/react'
import { FiFileText, FiHome, FiMenu, FiPackage, FiSettings, FiUsers, FiX } from 'react-icons/fi'
import { ColorModeButton } from '@/components/ui/color-mode'
import { AppLogo } from './app-logo'

const navigation = [
  { href: '/', label: 'Overview', icon: FiHome },
  { href: '/invoices', label: 'Invoices', icon: FiFileText },
  { href: '/clients', label: 'Clients', icon: FiUsers },
  { href: '/products', label: 'Products', icon: FiPackage },
  { href: '/settings', label: 'Settings', icon: FiSettings },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeItem = useMemo(
    () => navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)),
    [pathname]
  )

  return (
    <Box h="100vh">
      <Flex h="100vh">
        <Box
          as="aside"
          display={{ base: 'none', md: 'flex' }}
          position="sticky"
          top="0"
          h="100vh"
          w="64"
          flexShrink={0}
          flexDirection="column"
          borderRightWidth="1px"
          borderColor="border"
          px="5"
          py="6"
          bg="bg.subtle"
        >
          <Box mb="8">
            <AppLogo />
          </Box>
          <Flex as="nav" direction="column" gap="2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link key={item.href} to={item.href}>
                  <Flex
                    align="center"
                    gap="3"
                    rounded="2xl"
                    px="4"
                    py="3"
                    fontSize="sm"
                    fontWeight="medium"
                    bg={isActive ? 'bg.muted' : 'transparent'}
                    color={isActive ? 'fg' : 'fg.muted'}
                    _hover={{ bg: 'bg.subtle', color: 'fg' }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    <span>{item.label}</span>
                  </Flex>
                </Link>
              )
            })}
          </Flex>
          <Box mt="auto" rounded="3xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.24em" color="fg.muted">
              Workspace
            </Text>
            <Text mt="2" fontSize="sm" color="fg.muted">
              Keep invoices, clients, settings, and fulfillment in one focused SaaS workspace.
            </Text>
          </Box>
        </Box>

        <Flex direction="column" h="100vh" minW="0" flex="1">
          <Box
            as="header"
            position="sticky"
            top="0"
            zIndex="30"
            borderBottomWidth="1px"
            borderColor="border"
            bg="bg/95"
            backdropFilter="blur(12px)"
            pt="calc(0.75rem + env(safe-area-inset-top, 0px))"
            pb="3"
            px={{ base: '4', md: '6' }}
          >
            <Flex align="center" justify="space-between" w="full">
              <Flex align="center" gap="3">
                <IconButton
                  display={{ md: 'none' }}
                  aria-label="Open menu"
                  variant="ghost"
                  minW="10"
                  minH="10"
                  onClick={() => setMobileOpen(true)}
                >
                  <Icon as={FiMenu} boxSize="5" />
                </IconButton>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.26em" color="fg.muted">
                    Billing workspace
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {activeItem?.label ?? 'Dashboard'}
                  </Text>
                </Box>
              </Flex>
              <ColorModeButton />
            </Flex>
          </Box>

          <ScrollArea.Root flex="1" minH="0" minW="0" size="sm" variant="hover">
            <ScrollArea.Viewport>
              <ScrollArea.Content>
                <Box
                  py={{ base: '4', md: '5' }}
                  pt={{ base: '4', md: '5' }}
                  pb={{ base: 'calc(1rem + env(safe-area-inset-bottom, 0px))', md: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
                  px={{ base: '4', md: '6' }}
                  w="full"
                >
                  {children}
                </Box>
              </ScrollArea.Content>
            </ScrollArea.Viewport>
          </ScrollArea.Root>
        </Flex>
      </Flex>

      <Drawer.Root open={mobileOpen} placement="start" onOpenChange={(e) => setMobileOpen(e.open)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW="xs">
            <Drawer.Header pt="calc(1rem + env(safe-area-inset-top, 0px))">
              <Flex align="center" justify="space-between" w="full">
                <AppLogo />
                <IconButton aria-label="Close" variant="ghost" minW="10" minH="10" onClick={() => setMobileOpen(false)}>
                  <Icon as={FiX} boxSize="5" />
                </IconButton>
              </Flex>
            </Drawer.Header>
            <Drawer.Body>
              <Flex as="nav" direction="column" gap="2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)}>
                      <Flex
                        align="center"
                        gap="3"
                        rounded="2xl"
                        px="4"
                        py="3"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={isActive ? 'bg.muted' : 'transparent'}
                        color={isActive ? 'fg' : 'fg.muted'}
                        _hover={{ bg: 'bg.subtle', color: 'fg' }}
                      >
                        <Icon style={{ width: 16, height: 16 }} />
                        <span>{item.label}</span>
                      </Flex>
                    </Link>
                  )
                })}
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </Box>
  )
}
