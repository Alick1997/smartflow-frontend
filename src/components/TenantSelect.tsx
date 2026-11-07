import { useQuery } from '@tanstack/react-query'
import { Select } from '@mantine/core'
import { api } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'

interface Props {
  value: string
  onChange: (tenantId: string | undefined) => void
}

// Admin-only filter; renders nothing for tenants.
export function TenantSelect({ value, onChange }: Props) {
  const { isAdmin } = useAuth()
  const tenants = useQuery({
    queryKey: ['tenants', 'options'],
    queryFn: () => api.tenants({ page_size: 100 }),
    enabled: isAdmin,
  })
  if (!isAdmin) return null
  return (
    <Select
      label="Tenant"
      data={(tenants.data?.items ?? []).map((t) => ({ value: t.id, label: t.name }))}
      value={value || null}
      onChange={(v) => onChange(v ?? undefined)}
      clearable
      searchable
      w={200}
    />
  )
}
