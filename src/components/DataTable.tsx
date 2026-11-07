import type { ReactNode } from 'react'
import { Center, Group, Loader, Pagination, Table, Text, UnstyledButton } from '@mantine/core'
import type { Order } from '../api/types'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right'
  sortable?: { order: Order; onToggle: () => void }
}

interface Props<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string
  loading: boolean
  error?: boolean
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  columns, rows, rowKey, loading, error, page, pageSize, total, onPage, onRowClick,
}: Props<T>) {
  const pages = Math.max(1, Math.ceil(total / pageSize))

  if (loading) {
    return <Center py="xl"><Loader size="sm" /></Center>
  }
  if (error) return <Text c="dimmed" py="md">Unable to load data</Text>
  if (!rows?.length) return <Text c="dimmed" py="md">No results</Text>

  return (
    <>
      <Table.ScrollContainer minWidth={640}>
        <Table highlightOnHover={!!onRowClick} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((c) => (
                <Table.Th key={c.header} ta={c.align}>
                  {c.sortable ? (
                    <UnstyledButton fz="inherit" fw="inherit" onClick={c.sortable.onToggle}>
                      {c.header} {c.sortable.order === 'asc' ? '\u2191' : '\u2193'}
                    </UnstyledButton>
                  ) : (
                    c.header
                  )}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((c) => (
                  <Table.Td key={c.header} ta={c.align}>{c.render(row)}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Group justify="space-between" mt="md">
        <Text size="sm" c="dimmed">{total} total</Text>
        {pages > 1 && <Pagination value={page} onChange={onPage} total={pages} size="sm" />}
      </Group>
    </>
  )
}
