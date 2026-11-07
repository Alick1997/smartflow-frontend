import { Button, Center, Group, Paper, Stack, Text } from '@mantine/core'
import { useAuth } from '../auth/AuthContext'

export function AuthError() {
  const { retry, logout } = useAuth()
  return (
    <Center mih="100vh" bg="gray.0">
      <Paper withBorder p="xl" w={380}>
        <Stack>
          <Text fw={600} size="lg">Unable to sign in</Text>
          <Text size="sm" c="dimmed">The service could not verify your session. Try again, or sign out and back in.</Text>
          <Group>
            <Button onClick={retry}>Try again</Button>
            <Button variant="default" onClick={() => void logout()}>Sign out</Button>
          </Group>
        </Stack>
      </Paper>
    </Center>
  )
}
