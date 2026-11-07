import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Group, Modal, Select, Stack, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/endpoints'
import type { Tenant, TenantsQuery } from '../api/types'
import { DataTable, type Column } from '../components/DataTable'
import { useListParams } from '../hooks/useListParams'
import { formatDateTime } from '../lib/format'
import { PAGE_SIZE, ROUTES } from '../routes'

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
]

export function Tenants() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const list = useListParams()
  const search = list.get('search')
  const active = list.get('active')
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  const query: TenantsQuery = {
    page: list.page, page_size: PAGE_SIZE, order: list.order, search,
    active: active === 'true' || active === 'false' ? active : undefined,
  }
  const tenants = useQuery({ queryKey: ['tenants', query], queryFn: () => api.tenants(query) })

  const create = useMutation({
    mutationFn: () => api.createTenant(name.trim()),
    onSuccess: (t) => {
      void queryClient.invalidateQueries({ queryKey: ['tenants'] })
      setCreating(false)
      setName('')
      navigate(ROUTES.tenant(t.id))
    },
    onError: () => notifications.show({ message: 'Unable to create tenant', color: 'gray' }),
  })

  const columns: Column<Tenant>[] = [
    { header: 'Name', render: (t) => t.name },
    { header: 'Status', render: (t) => (t.active ? 'Active' : 'Inactive') },
    { header: 'Numbers', align: 'right', render: (t) => t.number_count },
    { header: 'Missed calls', align: 'right', render: (t) => t.missed_calls },
    {
      header: 'Created',
      render: (t) => formatDateTime(t.created_at),
      sortable: { order: list.order, onToggle: () => list.set({ order: list.order === 'asc' ? 'desc' : 'asc' }) },
    },
  ]

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={3}>Tenants</Title>
        <Button onClick={() => setCreating(true)}>New tenant</Button>
      </Group>
      <Group align="flex-end">
        <TextInput label="Search" value={search} onChange={(e) => list.set({ search: e.target.value })} />
        <Select
          label="Status"
          data={STATUS_OPTIONS}
          value={active || null}
          onChange={(v) => list.set({ active: v ?? undefined })}
          clearable
          w={160}
        />
      </Group>
      <DataTable
        columns={columns}
        rows={tenants.data?.items}
        rowKey={(t) => t.id}
        loading={tenants.isLoading}
        error={tenants.isError}
        page={list.page}
        pageSize={PAGE_SIZE}
        total={tenants.data?.total ?? 0}
        onPage={(p) => list.set({ page: String(p) })}
        onRowClick={(t) => navigate(ROUTES.tenant(t.id))}
      />
      <Modal opened={creating} onClose={() => setCreating(false)} title="New tenant">
        <Stack>
          <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} data-autofocus />
          <Button onClick={() => create.mutate()} loading={create.isPending} disabled={!name.trim()}>Create</Button>
        </Stack>
      </Modal>
    </Stack>
  )
}
