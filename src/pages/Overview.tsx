import { useQuery } from '@tanstack/react-query'
import { SimpleGrid, Stack, Title } from '@mantine/core'
import { api } from '../api/endpoints'
import { useAuth } from '../auth/AuthContext'
import { EventsPanel } from '../components/EventsPanel'
import { StatCard } from '../components/StatCard'

export function Overview() {
  const { isAdmin } = useAuth()
  const stats = useQuery({ queryKey: ['stats'], queryFn: () => api.stats() })
  const overview = useQuery({ queryKey: ['overview'], queryFn: api.overview, enabled: isAdmin })

  return (
    <Stack gap="lg">
      <Title order={3}>Overview</Title>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }}>
        <StatCard label="Missed calls" value={stats.data?.missed_calls} />
        <StatCard label="Missed calls, last 7 days" value={stats.data?.missed_calls_7d} />
        <StatCard label="SMS sent" value={stats.data?.sms_out} />
        <StatCard label="SMS received" value={stats.data?.sms_in} />
        <StatCard label="SMS failed" value={stats.data?.sms_failed} />
        {isAdmin && <StatCard label="Active tenants" value={overview.data?.tenants_active} />}
      </SimpleGrid>
      <Title order={4}>Recent activity</Title>
      <EventsPanel pageSize={10} filters={false} />
    </Stack>
  )
}
