import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Flex, Icon, IconButton, Drawer, ScrollArea, Text } from '@chakra-ui/react'
import { FiChevronLeft, FiChevronRight, FiFileText, FiHome, FiMenu, FiPackage, FiSettings, FiUsers, FiX } from 'react-icons/fi'
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
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
          w={sidebarCollapsed ? '16' : '64'}
          flexShrink={0}
          flexDirection="column"
          borderRightWidth="1px"
          borderColor="border"
          px={sidebarCollapsed ? '2' : '5'}
          py="6"
          bg="bg.subtle"
          transition="width 0.2s, padding 0.2s"
        >
          <Flex mb="8" direction="column" gap="2">
            <Flex justify={sidebarCollapsed ? 'center' : 'flex-end'}>
              <IconButton
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                variant="ghost"
                size="sm"
                minW="8"
                minH="8"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Icon as={sidebarCollapsed ? FiChevronRight : FiChevronLeft} boxSize="4" />
              </IconButton>
            </Flex>
            <AppLogo compact={sidebarCollapsed} />
          </Flex>
          <Flex as="nav" direction="column" gap="2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Box
                  key={item.href}
                  as="button"
                  cursor="pointer"
                  textAlign="left"
                  w="full"
                  onClick={() => navigate(item.href)}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Flex
                    align="center"
                    justify={sidebarCollapsed ? 'center' : 'flex-start'}
                    gap="3"
                    rounded="2xl"
                    px={sidebarCollapsed ? '2' : '4'}
                    py="3"
                    fontSize="sm"
                    fontWeight="medium"
                    bg={isActive ? 'bg.muted' : 'transparent'}
                    color={isActive ? 'fg' : 'fg.muted'}
                    _hover={{ bg: 'bg.subtle', color: 'fg' }}
                    minW="0"
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {!sidebarCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                  </Flex>
                </Box>
              )
            })}
          </Flex>
          <Box mt="auto" minW="0">
            {!sidebarCollapsed && (
              <Box rounded="3xl" borderWidth="1px" borderColor="border" p="4" bg="bg.subtle" minW="0">
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.24em" color="fg.muted" whiteSpace="nowrap">
                  Workspace
                </Text>
                <Text mt="2" fontSize="sm" color="fg.muted" lineClamp={2}>
                  Keep invoices, clients, settings, and fulfillment in one focused SaaS workspace.
                </Text>
              </Box>
            )}
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
                  minW={{ base: '11', md: '10' }}
                  minH={{ base: '11', md: '10' }}
                  onClick={() => setMobileOpen(true)}
                >
                  <Icon as={FiMenu} boxSize="5" />
                </IconButton>
                <Box minW="0">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="0.26em" color="fg.muted" whiteSpace="nowrap">
                    Billing workspace
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
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
          <Drawer.Content maxW={{ base: 'full', sm: 'xs' }}>
            <Drawer.Header pt="calc(1rem + env(safe-area-inset-top, 0px))">
              <Flex align="center" justify="space-between" w="full">
                <AppLogo />
                <IconButton aria-label="Close" variant="ghost" minW={{ base: '11', md: '10' }} minH={{ base: '11', md: '10' }} onClick={() => setMobileOpen(false)}>
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
                    <Box
                      key={item.href}
                      as="button"
                      cursor="pointer"
                      textAlign="left"
                      w="full"
                      onClick={() => {
                        navigate(item.href)
                        setMobileOpen(false)
                      }}
                    >
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
                        <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                      </Flex>
                    </Box>
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
