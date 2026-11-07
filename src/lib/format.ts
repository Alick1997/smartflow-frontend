const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export const formatDateTime = (iso: string): string => dateTime.format(new Date(iso))

export const E164_PATTERN = /^\+[1-9][0-9]{7,14}$/

// Date input value (yyyy-mm-dd) to the start of that local day as an RFC 3339 instant.
export function dayStart(value: string, addDays = 0): string | undefined {
  if (!value) return undefined
  const d = new Date(`${value}T00:00:00`)
  d.setDate(d.getDate() + addDays)
  return d.toISOString()
}
