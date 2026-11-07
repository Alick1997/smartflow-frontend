import { request, toQuery } from './client'
import type {
  AddUserResult, AppEvent, Contact, ContactsQuery, EventsQuery, ListQuery, Overview, Page,
  PhoneNumber, SmsResponseInput, Stats, Tenant, TenantsQuery, TenantUser, User,
} from './types'

export const api = {
  me: () => request<User>('GET', '/me'),
  stats: (tenantId?: string) => request<Stats>('GET', `/stats${toQuery({ tenant_id: tenantId })}`),

  numbers: (q: ListQuery) => request<Page<PhoneNumber>>('GET', `/numbers${toQuery({ ...q })}`),
  number: (id: string) => request<PhoneNumber>('GET', `/numbers/${id}`),
  updateSmsResponse: (id: string, input: SmsResponseInput) =>
    request<SmsResponseInput>('PUT', `/numbers/${id}/sms-response`, input),

  contacts: (q: ContactsQuery) => request<Page<Contact>>('GET', `/contacts${toQuery({ ...q })}`),
  contact: (id: string) => request<Contact>('GET', `/contacts/${id}`),
  events: (q: EventsQuery) => request<Page<AppEvent>>('GET', `/events${toQuery({ ...q })}`),

  overview: () => request<Overview>('GET', '/admin/overview'),
  tenants: (q: TenantsQuery) => request<Page<Tenant>>('GET', `/admin/tenants${toQuery({ ...q })}`),
  tenant: (id: string) => request<Tenant>('GET', `/admin/tenants/${id}`),
  createTenant: (name: string) => request<Tenant>('POST', '/admin/tenants', { name }),
  setTenantActive: (id: string, active: boolean) => request<Tenant>('PATCH', `/admin/tenants/${id}`, { active }),
  tenantUsers: (id: string) => request<TenantUser[]>('GET', `/admin/tenants/${id}/users`),
  createTenantUser: (id: string, email: string) =>
    request<AddUserResult>('POST', `/admin/tenants/${id}/users`, { email }),
  createTenantNumber: (id: string, number: string, label: string) =>
    request<{ id: string }>('POST', `/admin/tenants/${id}/numbers`, { number, label }),
}
