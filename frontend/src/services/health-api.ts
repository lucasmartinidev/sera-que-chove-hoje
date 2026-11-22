import { apiRequest } from './api'

export type ApiHealth = {
  status: string
  timestamp: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isApiHealth(value: unknown): value is ApiHealth {
  return isRecord(value) && typeof value.status === 'string' && typeof value.timestamp === 'string'
}

export function fetchHealth(): Promise<ApiHealth> {
  return apiRequest('/health', isApiHealth)
}
