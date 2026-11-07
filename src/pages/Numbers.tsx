import { useQuery } from '@tanstack/react-query'
import { Group, Stack, TextInput, Title } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/endpoints'
import type { PhoneNumber } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { TenantSelect } from '../components/TenantSelect'
import { useListParams } from '../hooks/useListParams'
import { PAGE_SIZE, ROUTES } from '../routes'

export function Numbers() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const list = useListParams()
  const tenantId = list.get('tenant_id')
  const search = list.get('search')

  const query = { page: list.page, page_size: PAGE_SIZE, order: list.order, search, tenant_id: tenantId || undefined }
  const numbers = useQuery({ queryKey: ['numbers', query], queryFn: () => api.numbers(query) })

  const columns: Column<PhoneNumber>[] = [
    { header: 'Number', render: (n) => n.number },
    { header: 'Label', render: (n) => n.label || '-' },
    ...(isAdmin ? [{ header: 'Tenant', render: (n: PhoneNumber) => n.tenant_name }] : []),
    { header: 'Missed calls', align: 'right', render: (n) => n.missed_calls },
    { header: 'SMS sent', align: 'right', render: (n) => n.sms_out },
  ]

  return (
    <Stack>
      <Title order={3}>Numbers</Title>
      <Group align="flex-end">
        <TextInput label="Search" value={search} onChange={(e) => list.set({ search: e.target.value })} />
        <TenantSelect value={tenantId} onChange={(v) => list.set({ tenant_id: v })} />
      </Group>
      <DataTable
        columns={columns}
        rows={numbers.data?.items}
        rowKey={(n) => n.id}
        loading={numbers.isLoading}
        error={numbers.isError}
        page={list.page}
        pageSize={PAGE_SIZE}
        total={numbers.data?.total ?? 0}
        onPage={(p) => list.set({ page: String(p) })}
        onRowClick={(n) => navigate(ROUTES.number(n.id))}
      />
    </Stack>
  )
}
