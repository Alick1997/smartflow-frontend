import { Paper, Text } from '@mantine/core'

export function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Paper withBorder p="md">
      <Text size="sm" c="dimmed">{label}</Text>
      <Text fz={28} fw={600}>{value ?? '-'}</Text>
    </Paper>
  )
}
