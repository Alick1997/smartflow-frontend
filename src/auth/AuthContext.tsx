import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth as useClerkAuth } from '@clerk/clerk-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, setTokenGetter } from '../api/client'
import { api } from '../api/endpoints'
import type { User } from '../api/types'

interface AuthState {
  user: User | null
  signedIn: boolean
  loading: boolean
  noAccess: boolean
  failed: boolean
  retry: () => void
  isAdmin: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// Clerk proves who is signed in; the backend decides whether that person has access and whether they are an admin.
export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth()
  const queryClient = useQueryClient()
  const [tokenReady, setTokenReady] = useState(false)

  useEffect(() => {
    setTokenGetter(() => getToken())
    setTokenReady(true)
  }, [getToken])

  const me = useQuery({
    queryKey: ['me'],
    queryFn: api.me,
    enabled: Boolean(isSignedIn) && tokenReady,
  })

  const logout = useCallback(async () => {
    await signOut()
    queryClient.clear()
  }, [signOut, queryClient])

  const value = useMemo<AuthState>(
    () => ({
      user: me.data ?? null,
      signedIn: Boolean(isSignedIn),
      loading: !isLoaded || (Boolean(isSignedIn) && !me.isFetched),
      noAccess: me.error instanceof ApiError && me.error.status === 403,
      failed: me.isError && !(me.error instanceof ApiError && me.error.status === 403),
      retry: () => void me.refetch(),
      isAdmin: me.data?.admin === true,
      logout,
    }),
    [me, isSignedIn, isLoaded, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
