import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Alert, Button, Center, Image, Paper, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { ROUTES } from '../routes'

export function Login() {
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={ROUTES.overview} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? 'Too many attempts, try again shortly' : 'Invalid email or password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Center mih="100vh" bg="gray.0">
      <Paper withBorder p="xl" w={360}>
        <form onSubmit={(e) => void submit(e)}>
          <Stack>
            <Stack gap={6} align="center">
              <Image src="/logo.svg" w={36} h={36} alt="" />
              <Text fw={600} size="lg">Sign in</Text>
            </Stack>
            {error && <Alert color="gray">{error}</Alert>}
            <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" loading={busy}>Sign in</Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}
