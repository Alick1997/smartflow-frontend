import { useQuery } from '@tanstack/react-query'
import { Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core'
import { useParams } from 'react-router-dom'
import { api } from '../api/endpoints'
import { EventsPanel } from '../components/EventsPanel'
import { StatCard } from '../components/StatCard'

export function ContactDetail() {
  const { id = '' } = useParams()
  const contact = useQuery({ queryKey: ['contact', id], queryFn: () => api.contact(id) })

  if (contact.isLoading) return <Loader size="sm" />
  if (contact.isError || !contact.data) return <Text c="dimmed">Contact not found</Text>

  return (
    <Stack gap="lg">
      <Title order={3}>{contact.data.phone}</Title>
      <SimpleGrid cols={{ base: 1, xs: 3 }}>
        <StatCard label="Missed calls" value={contact.data.missed_calls} />
        <StatCard label="SMS sent" value={contact.data.sms_out} />
        <StatCard label="SMS received" value={contact.data.sms_in} />
      </SimpleGrid>
      <Title order={4}>History</Title>
      <EventsPanel fixed={{ contact_id: id }} />
    </Stack>
  )
}
