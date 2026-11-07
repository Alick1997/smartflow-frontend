import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Anchor, Button, Group, Loader, Modal, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { api } from '../api/endpoints'
import { AddUserStatus, TenantUserStatus, type PhoneNumber, type TenantUser } from '../api/types'
import { DataTable, type Column } from '../components/DataTable'
import { StatCard } from '../components/StatCard'
import { useListParams } from '../hooks/useListParams'
import { E164_PATTERN } from '../lib/format'
import { PAGE_SIZE, ROUTES } from '../routes'

type Dialog = 'number' | 'user' | null

const errorMessage = (err: unknown): string => {
  if (err instanceof ApiError && err.status === 409) return 'Already exists, or the user is an admin or belongs to another tenant'
  return 'Request failed'
}

export function TenantDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const list = useListParams()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [number, setNumber] = useState('')
  const [label, setLabel] = useState('')
  const [email, setEmail] = useState('')

  const tenant = useQuery({ queryKey: ['tenant', id], queryFn: () => api.tenant(id) })
  const stats = useQuery({ queryKey: ['stats', id], queryFn: () => api.stats(id) })
  const numbersQuery = { page: list.page, page_size: PAGE_SIZE, tenant_id: id }
  const users = useQuery({ queryKey: ['tenant-users', id], queryFn: () => api.tenantUsers(id) })
  const numbers = useQuery({ queryKey: ['numbers', numbersQuery], queryFn: () => api.numbers(numbersQuery) })

  const close = () => {
    setDialog(null)
    setNumber(''); setLabel(''); setEmail('')
  }

  const toggle = useMutation({
    mutationFn: (active: boolean) => api.setTenantActive(id, active),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant', id] })
      void queryClient.invalidateQueries({ queryKey: ['tenants'] })
    },
  })
  const addNumber = useMutation({
    mutationFn: () => api.createTenantNumber(id, number, label),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['numbers'] })
      close()
    },
    onError: (err) => notifications.show({ message: errorMessage(err), color: 'gray' }),
  })
  const addUser = useMutation({
    mutationFn: () => api.createTenantUser(id, email),
    onSuccess: (res) => {
      notifications.show({ message: res.status === AddUserStatus.Invited ? 'Invitation sent' : 'User added' })
      void queryClient.invalidateQueries({ queryKey: ['tenant-users', id] })
      close()
    },
    onError: (err) => notifications.show({ message: errorMessage(err), color: 'gray' }),
  })

  if (tenant.isLoading) return <Loader size="sm" />
  if (tenant.isError || !tenant.data) return <Text c="dimmed">Tenant not found</Text>
  const t = tenant.data

  const columns: Column<PhoneNumber>[] = [
    { header: 'Number', render: (n) => n.number },
    { header: 'Label', render: (n) => n.label || '-' },
    { header: 'Missed calls', align: 'right', render: (n) => n.missed_calls },
    { header: 'SMS sent', align: 'right', render: (n) => n.sms_out },
  ]

  const userColumns: Column<TenantUser>[] = [
    { header: 'Email', render: (u) => u.email },
    { header: 'Status', render: (u) => (u.status === TenantUserStatus.Invited ? 'Invited' : 'Active') },
  ]

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>{t.name}</Title>
        <Button
          variant="default"
          c={t.active ? 'red.7' : undefined}
          loading={toggle.isPending}
          onClick={() => toggle.mutate(!t.active)}
        >
          {t.active ? 'Deactivate' : 'Activate'}
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <StatCard label="Missed calls" value={stats.data?.missed_calls} />
        <StatCard label="SMS sent" value={stats.data?.sms_out} />
        <StatCard label="SMS received" value={stats.data?.sms_in} />
        <StatCard label="SMS failed" value={stats.data?.sms_failed} />
      </SimpleGrid>

      <Group justify="space-between">
        <Title order={4}>Numbers</Title>
        <Group>
          <Anchor component={Link} to={`${ROUTES.events}?tenant_id=${id}`} size="sm">View events</Anchor>
          <Button onClick={() => setDialog('number')}>Add number</Button>
        </Group>
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

      <Group justify="space-between">
        <Title order={4}>Users</Title>
        <Button onClick={() => setDialog('user')}>Add user</Button>
      </Group>
      <DataTable
        columns={userColumns}
        rows={users.data}
        rowKey={(u) => u.email}
        loading={users.isLoading}
        error={users.isError}
        page={1}
        pageSize={users.data?.length || 1}
        total={users.data?.length ?? 0}
        onPage={() => undefined}
      />

      <Modal opened={dialog === 'number'} onClose={close} title="Add number">
        <Stack>
          <TextInput
            label="Twilio number"
            placeholder="+15551234567"
            value={number}
            error={number && !E164_PATTERN.test(number) ? 'Use E.164 format' : undefined}
            onChange={(e) => setNumber(e.target.value.trim())}
            data-autofocus
          />
          <TextInput label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={() => addNumber.mutate()} loading={addNumber.isPending} disabled={!E164_PATTERN.test(number)}>
            Add
          </Button>
        </Stack>
      </Modal>

      <Modal opened={dialog === 'user'} onClose={close} title="Add user">
        <Stack>
          <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-autofocus />
          <Button onClick={() => addUser.mutate()} loading={addUser.isPending} disabled={!email.includes('@')}>
            Invite
          </Button>
        </Stack>
      </Modal>
    </Stack>
  )
}
