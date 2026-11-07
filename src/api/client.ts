const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type TokenGetter = () => Promise<string | null>
let getToken: TokenGetter = () => Promise.resolve(null)

export function setTokenGetter(fn: TokenGetter): void {
  getToken = fn
}

type Params = Record<string, string | number | boolean | undefined>

export function toQuery(params: Params): string {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') q.set(key, String(value))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    method,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new ApiError(res.status, data.error ?? 'Request failed')
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}
