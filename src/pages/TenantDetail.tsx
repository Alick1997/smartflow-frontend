import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Anchor, Button, Group, Loader, Modal, PasswordInput, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { api } from '../api/endpoints'
import type { PhoneNumber } from '../api/types'
import { DataTable, type Column } from '../components/DataTable'
import { StatCard } from '../components/StatCard'
import { useListParams } from '../hooks/useListParams'
import { E164_PATTERN } from '../lib/format'
import { PAGE_SIZE, ROUTES } from '../routes'

type Dialog = 'number' | 'user' | null

const errorMessage = (err: unknown): string =>
  err instanceof ApiError && err.status === 409 ? 'Already exists' : 'Request failed'

export function TenantDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const list = useListParams()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [number, setNumber] = useState('')
  const [label, setLabel] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const tenant = useQuery({ queryKey: ['tenant', id], queryFn: () => api.tenant(id) })
  const stats = useQuery({ queryKey: ['stats', id], queryFn: () => api.stats(id) })
  const numbersQuery = { page: list.page, page_size: PAGE_SIZE, tenant_id: id }
  const numbers = useQuery({ queryKey: ['numbers', numbersQuery], queryFn: () => api.numbers(numbersQuery) })

  const close = () => {
    setDialog(null)
    setNumber(''); setLabel(''); setEmail(''); setPassword('')
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
    mutationFn: () => api.createTenantUser(id, email, password),
    onSuccess: () => {
      notifications.show({ message: 'User created' })
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

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={3}>{t.name}</Title>
        <Group>
          <Button variant="default" onClick={() => setDialog('user')}>Add user</Button>
          <Button
            variant="default"
            c={t.active ? 'red.7' : undefined}
            loading={toggle.isPending}
            onClick={() => toggle.mutate(!t.active)}
          >
            {t.active ? 'Deactivate' : 'Activate'}
          </Button>
        </Group>
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
          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={password && password.length < 10 ? 'At least 10 characters' : undefined}
          />
          <Button onClick={() => addUser.mutate()} loading={addUser.isPending} disabled={!email.includes('@') || password.length < 10}>
            Create
          </Button>
        </Stack>
      </Modal>
    </Stack>
  )
}
