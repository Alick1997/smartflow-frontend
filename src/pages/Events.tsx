import { Stack, Title } from '@mantine/core'
import { EventsPanel } from '../components/EventsPanel'

export function Events() {
  return (
    <Stack>
      <Title order={3}>Events</Title>
      <EventsPanel allowPhoneFilter tenantFilter />
    </Stack>
  )
}
