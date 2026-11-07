import { useQuery } from '@tanstack/react-query'
import { Anchor, Group, Select, TextInput } from '@mantine/core'
import { Link } from 'react-router-dom'
import { api } from '../api/endpoints'
import {
  EVENT_STATUS_LABEL, EVENT_TYPE_LABEL, EventStatus, EventType, type AppEvent, type EventsQuery,
} from '../api/types'
import { useAuth } from '../auth/AuthContext'
import { useListParams } from '../hooks/useListParams'
import { E164_PATTERN, dayStart, formatDateTime } from '../lib/format'
import { PAGE_SIZE, ROUTES } from '../routes'
import { DataTable, type Column } from './DataTable'
import { TenantSelect } from './TenantSelect'

type Fixed = Pick<EventsQuery, 'tenant_id' | 'number_id' | 'contact_id'>

interface Props {
  fixed?: Fixed
  allowPhoneFilter?: boolean
  pageSize?: number
  tenantFilter?: boolean
  filters?: boolean
}

const TYPE_OPTIONS = Object.values(EventType).map((t) => ({ value: t, label: EVENT_TYPE_LABEL[t] }))

function isEventType(v: string): v is EventType {
  return (Object.values(EventType) as string[]).includes(v)
}

export function EventsPanel({ fixed = {}, allowPhoneFilter = false, pageSize = PAGE_SIZE, tenantFilter = false, filters = true }: Props) {
  const { isAdmin } = useAuth()
  const list = useListParams()
  const phone = list.get('phone')
  const type = list.get('type')
  const from = list.get('from')
  const to = list.get('to')
  const tenantId = fixed.tenant_id ?? (tenantFilter ? list.get('tenant_id') : '')
  const phoneInvalid = phone !== '' && !E164_PATTERN.test(phone)

  const query: EventsQuery = {
    ...fixed,
    tenant_id: tenantId || undefined,
    page: list.page,
    page_size: pageSize,
    order: list.order,
    type: isEventType(type) ? type : undefined,
    phone: phone && !phoneInvalid ? phone : undefined,
    from: dayStart(from),
    to: dayStart(to, 1),
  }
  const events = useQuery({ queryKey: ['events', query], queryFn: () => api.events(query) })

  const columns: Column<AppEvent>[] = [
    {
      header: 'Time',
      render: (e) => formatDateTime(e.created_at),
      sortable: { order: list.order, onToggle: () => list.set({ order: list.order === 'asc' ? 'desc' : 'asc' }) },
    },
    { header: 'Type', render: (e) => EVENT_TYPE_LABEL[e.type] },
    ...(isAdmin ? [{ header: 'Tenant', render: (e: AppEvent) => e.tenant_name }] : []),
    { header: 'Number', render: (e) => e.number },
    {
      header: 'Contact',
      render: (e) => (
        <Anchor component={Link} to={ROUTES.contact(e.contact_id)} size="sm" onClick={(ev) => ev.stopPropagation()}>
          {e.contact_phone}
        </Anchor>
      ),
    },
    { header: 'Status', render: (e) => EVENT_STATUS_LABEL[e.status] },
    {
      header: 'Message',
      render: (e) => (
        <span style={e.status === EventStatus.Failed ? { color: 'var(--mantine-color-red-7)' } : undefined}>
          {e.body || '-'}
        </span>
      ),
    },
  ]

  return (
    <>
      {filters && (
      <Group mb="md" align="flex-end">
        <Select
          label="Type"
          data={TYPE_OPTIONS}
          value={isEventType(type) ? type : null}
          onChange={(v) => list.set({ type: v ?? undefined })}
          clearable
          w={160}
        />
        <TextInput label="From" type="date" value={from} onChange={(e) => list.set({ from: e.target.value })} />
        <TextInput label="To" type="date" value={to} onChange={(e) => list.set({ to: e.target.value })} />
        {allowPhoneFilter && (
          <TextInput
            label="Contact number"
            placeholder="+15551234567"
            value={phone}
            error={phoneInvalid ? 'Use E.164 format' : undefined}
            onChange={(e) => list.set({ phone: e.target.value.trim() })}
          />
        )}
        {tenantFilter && <TenantSelect value={tenantId} onChange={(v) => list.set({ tenant_id: v })} />}
      </Group>
      )}
      <DataTable
        columns={columns}
        rows={events.data?.items}
        rowKey={(e) => e.id}
        loading={events.isLoading}
        error={events.isError}
        page={list.page}
        pageSize={pageSize}
        total={events.data?.total ?? 0}
        onPage={(p) => list.set({ page: String(p) })}
      />
    </>
  )
}
