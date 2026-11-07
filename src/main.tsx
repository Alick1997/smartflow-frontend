import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { ClerkProvider } from '@clerk/clerk-react'
import { App } from './App'
import { AuthProvider } from './auth/AuthContext'
import { theme } from './theme'

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!clerkKey) throw new Error('VITE_CLERK_PUBLISHABLE_KEY is required')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false, staleTime: 15_000 } },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications position="top-right" />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClerkProvider publishableKey={clerkKey} appearance={{ variables: { colorPrimary: '#1c64f2' } }}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ClerkProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
)
