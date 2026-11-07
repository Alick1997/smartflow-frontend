export const Role = { Admin: 'admin', Tenant: 'tenant' } as const
export type Role = (typeof Role)[keyof typeof Role]

export const EventType = { MissedCall: 'missed_call', SmsIn: 'sms_in', SmsOut: 'sms_out' } as const
export type EventType = (typeof EventType)[keyof typeof EventType]

export const EventStatus = { Received: 'received', Queued: 'queued', Sent: 'sent', Failed: 'failed' } as const
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  missed_call: 'Missed call',
  sms_in: 'SMS received',
  sms_out: 'SMS sent',
}

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  received: 'Received',
  queued: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
}

export interface User {
  id: string
  email: string
  role: Role
  tenant_id: string | null
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface Stats {
  missed_calls: number
  missed_calls_7d: number
  sms_out: number
  sms_in: number
  sms_failed: number
}

export interface Overview {
  tenants_total: number
  tenants_active: number
}

export interface PhoneNumber {
  id: string
  tenant_id: string
  tenant_name: string
  number: string
  label: string
  response_body: string
  response_enabled: boolean
  missed_calls: number
  sms_out: number
  created_at: string
}

export interface Contact {
  id: string
  tenant_id: string
  tenant_name: string
  phone: string
  missed_calls: number
  sms_out: number
  sms_in: number
  last_event_at: string
}

export interface AppEvent {
  id: string
  tenant_id: string
  tenant_name: string
  number_id: string
  number: string
  contact_id: string
  contact_phone: string
  type: EventType
  status: EventStatus
  body: string
  created_at: string
}

export interface Tenant {
  id: string
  name: string
  active: boolean
  number_count: number
  missed_calls: number
  created_at: string
}

export interface SmsResponseInput {
  body: string
  enabled: boolean
}

export type Order = 'asc' | 'desc'

export interface ListQuery {
  page?: number
  page_size?: number
  order?: Order
  search?: string
  tenant_id?: string
}

export interface EventsQuery extends ListQuery {
  type?: EventType
  number_id?: string
  contact_id?: string
  phone?: string
  from?: string
  to?: string
}

export interface ContactsQuery extends ListQuery {
  phone?: string
}

export interface TenantsQuery extends ListQuery {
  active?: 'true' | 'false'
}
