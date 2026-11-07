import { AppShell, Burger, Button, Group, Image, NavLink, Stack, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ROUTES } from '../routes'

interface NavItem {
  label: string
  to: string
  adminOnly?: boolean
}

const NAV: NavItem[] = [
  { label: 'Overview', to: ROUTES.overview },
  { label: 'Numbers', to: ROUTES.numbers },
  { label: 'Contacts', to: ROUTES.contacts },
  { label: 'Events', to: ROUTES.events },
  { label: 'Tenants', to: ROUTES.tenants, adminOnly: true },
]

const isActive = (pathname: string, to: string): boolean =>
  to === ROUTES.overview ? pathname === to : pathname.startsWith(to)

export function Layout() {
  const { user, isAdmin, logout } = useAuth()
  const { pathname } = useLocation()
  const [opened, { toggle, close }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header hiddenFrom="sm">
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Text fw={600} c="blue.7">Missed Call</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Group gap="xs" mb="lg" visibleFrom="sm">
          <Image src="/logo.svg" w={26} h={26} alt="" />
          <Text fw={600} c="blue.7">Missed Call</Text>
        </Group>
        <Stack gap={2} style={{ flex: 1 }}>
          {NAV.filter((n) => !n.adminOnly || isAdmin).map((n) => (
            <NavLink
              key={n.to}
              component={Link}
              to={n.to}
              label={n.label}
              active={isActive(pathname, n.to)}
              onClick={close}
            />
          ))}
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
          <Button variant="subtle" size="compact-sm" justify="flex-start" onClick={() => void logout()}>
            Sign out
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
