import { useQuery } from '@tanstack/react-query'
import { Group, Stack, TextInput, Title } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/endpoints'
import type { Contact } from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { DataTable, type Column } from '../components/DataTable'
import { TenantSelect } from '../components/TenantSelect'
import { useListParams } from '../hooks/useListParams'
import { E164_PATTERN, formatDateTime } from '../lib/format'
import { PAGE_SIZE, ROUTES } from '../routes'

export function Contacts() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const list = useListParams()
  const phone = list.get('phone')
  const tenantId = list.get('tenant_id')
  const phoneInvalid = phone !== '' && !E164_PATTERN.test(phone)

  const query = {
    page: list.page, page_size: PAGE_SIZE, order: list.order,
    phone: phone && !phoneInvalid ? phone : undefined, tenant_id: tenantId || undefined,
  }
  const contacts = useQuery({ queryKey: ['contacts', query], queryFn: () => api.contacts(query) })

  const columns: Column<Contact>[] = [
    { header: 'Number', render: (c) => c.phone },
    ...(isAdmin ? [{ header: 'Tenant', render: (c: Contact) => c.tenant_name }] : []),
    { header: 'Missed calls', align: 'right', render: (c) => c.missed_calls },
    { header: 'SMS sent', align: 'right', render: (c) => c.sms_out },
    { header: 'SMS received', align: 'right', render: (c) => c.sms_in },
    {
      header: 'Last activity',
      render: (c) => formatDateTime(c.last_event_at),
      sortable: { order: list.order, onToggle: () => list.set({ order: list.order === 'asc' ? 'desc' : 'asc' }) },
    },
  ]

  return (
    <Stack>
      <Title order={3}>Contacts</Title>
      <Group align="flex-end">
        <TextInput
          label="Number"
          placeholder="+15551234567"
          value={phone}
          error={phoneInvalid ? 'Use E.164 format' : undefined}
          onChange={(e) => list.set({ phone: e.target.value.trim() })}
        />
        <TenantSelect value={tenantId} onChange={(v) => list.set({ tenant_id: v })} />
      </Group>
      <DataTable
        columns={columns}
        rows={contacts.data?.items}
        rowKey={(c) => c.id}
        loading={contacts.isLoading}
        error={contacts.isError}
        page={list.page}
        pageSize={PAGE_SIZE}
        total={contacts.data?.total ?? 0}
        onPage={(p) => list.set({ page: String(p) })}
        onRowClick={(c) => navigate(ROUTES.contact(c.id))}
      />
    </Stack>
  )
}
