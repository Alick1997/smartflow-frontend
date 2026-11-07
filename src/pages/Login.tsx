import { SignIn } from '@clerk/clerk-react'
import { Center } from '@mantine/core'
import { ROUTES } from '../routes'

export function Login() {
  return (
    <Center mih="100vh" bg="gray.0">
      <SignIn routing="hash" fallbackRedirectUrl={ROUTES.overview} />
    </Center>
  )
}
