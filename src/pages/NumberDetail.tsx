import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, Group, Loader, Paper, Stack, Switch, Text, Textarea, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useParams } from 'react-router-dom'
import { api } from '../api/endpoints'
import { EventsPanel } from '../components/EventsPanel'

const MAX_BODY = 320

export function NumberDetail() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const number = useQuery({ queryKey: ['number', id], queryFn: () => api.number(id) })
  const [body, setBody] = useState('')
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (number.data) {
      setBody(number.data.response_body)
      setEnabled(number.data.response_enabled)
    }
  }, [number.data])

  const save = useMutation({
    mutationFn: () => api.updateSmsResponse(id, { body, enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['number', id] })
      void queryClient.invalidateQueries({ queryKey: ['numbers'] })
      notifications.show({ message: 'SMS response saved' })
    },
    onError: () => notifications.show({ message: 'Unable to save', color: 'gray' }),
  })

  if (number.isLoading) return <Loader size="sm" />
  if (number.isError || !number.data) return <Text c="dimmed">Number not found</Text>

  const trimmed = body.trim()
  const invalid = trimmed.length === 0 || body.length > MAX_BODY

  return (
    <Stack gap="lg">
      <Title order={3}>{number.data.number}</Title>
      <Paper withBorder p="md">
        <Stack>
          <Title order={5}>SMS response</Title>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            autosize
            minRows={3}
            error={body.length > MAX_BODY ? `Maximum ${MAX_BODY} characters` : undefined}
            description={`${body.length}/${MAX_BODY}`}
          />
          <Group justify="space-between">
            <Switch label="Send automatically" checked={enabled} onChange={(e) => setEnabled(e.currentTarget.checked)} />
            <Button onClick={() => save.mutate()} loading={save.isPending} disabled={invalid}>Save</Button>
          </Group>
        </Stack>
      </Paper>
      <Title order={4}>Events</Title>
      <EventsPanel fixed={{ number_id: id }} allowPhoneFilter />
    </Stack>
  )
}
