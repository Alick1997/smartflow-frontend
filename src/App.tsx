import { Loader, Center } from '@mantine/core'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { Layout } from './components/Layout'
import { ContactDetail } from './pages/ContactDetail'
import { Contacts } from './pages/Contacts'
import { Events } from './pages/Events'
import { Login } from './pages/Login'
import { NoAccess } from './pages/NoAccess'
import { NumberDetail } from './pages/NumberDetail'
import { Numbers } from './pages/Numbers'
import { Overview } from './pages/Overview'
import { TenantDetail } from './pages/TenantDetail'
import { Tenants } from './pages/Tenants'
import { ROUTES } from './routes'

export function App() {
  const { user, signedIn, loading, noAccess, isAdmin } = useAuth()

  if (loading) return <Center mih="100vh"><Loader size="sm" /></Center>

  if (noAccess) return <NoAccess />

  return (
    <Routes>
      <Route path={ROUTES.login} element={<Login />} />
      {signedIn && user ? (
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="numbers" element={<Numbers />} />
          <Route path="numbers/:id" element={<NumberDetail />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="contacts/:id" element={<ContactDetail />} />
          <Route path="events" element={<Events />} />
          {isAdmin && <Route path="tenants" element={<Tenants />} />}
          {isAdmin && <Route path="tenants/:id" element={<TenantDetail />} />}
          <Route path="*" element={<Navigate to={ROUTES.overview} replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
      )}
    </Routes>
  )
}
