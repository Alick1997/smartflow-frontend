import { Button, Center, Paper, Stack, Text } from '@mantine/core'
import { useUser } from '@clerk/clerk-react'
import { useAuth } from '../auth/AuthContext'

export function NoAccess() {
  const { logout } = useAuth()
  const { user } = useUser()
  return (
    <Center mih="100vh" bg="gray.0">
      <Paper withBorder p="xl" w={380}>
        <Stack>
          <Text fw={600} size="lg">No access</Text>
          <Text size="sm" c="dimmed">
            {user?.primaryEmailAddress?.emailAddress ?? 'This account'} has not been given access. Ask an administrator to add
            this email address to a tenant.
          </Text>
          <Button variant="default" onClick={() => void logout()}>Sign out</Button>
        </Stack>
      </Paper>
    </Center>
  )
}
