import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Order } from '../api/types'

// List state lives in the URL so filters, sorting and pages survive reloads and can be linked.
export function useListParams() {
  const [params, setParams] = useSearchParams()

  const get = (name: string): string => params.get(name) ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const order: Order = params.get('order') === 'asc' ? 'asc' : 'desc'

  const set = useCallback(
    (updates: Record<string, string | undefined>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          if (!('page' in updates)) next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return { get, page, order, set }
}
