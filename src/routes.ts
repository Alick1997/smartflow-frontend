export const ROUTES = {
  login: '/login',
  overview: '/',
  numbers: '/numbers',
  number: (id: string) => `/numbers/${id}`,
  contacts: '/contacts',
  contact: (id: string) => `/contacts/${id}`,
  events: '/events',
  tenants: '/tenants',
  tenant: (id: string) => `/tenants/${id}`,
} as const

export const PAGE_SIZE = 20
