const DEFAULT_API_BASE_URL = 'http://localhost:3000'

export type ApiErrorCode = 'INVALID_PARAM' | 'UPSTREAM_ERROR' | 'INTERNAL_ERROR' | 'API_UNAVAILABLE' | 'INVALID_RESPONSE' | 'API_ERROR'

type ApiErrorInput = {
  code: ApiErrorCode
  message: string
  statusCode: number
}

type ErrorEnvelope = {
  error: {
    code: string
    message: string
  }
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly statusCode: number

  constructor(input: ApiErrorInput) {
    super(input.message)
    this.name = 'ApiError'
    this.code = input.code
    this.statusCode = input.statusCode
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isErrorEnvelope(value: unknown): value is ErrorEnvelope {
  if (!isRecord(value) || !isRecord(value.error)) return false
  return typeof value.error.code === 'string' && typeof value.error.message === 'string'
}

function normalizeErrorCode(code: string): ApiErrorCode {
  if (code === 'INVALID_PARAM' || code === 'UPSTREAM_ERROR' || code === 'INTERNAL_ERROR') return code
  return 'API_ERROR'
}

function apiUrl(path: string): URL {
  const baseUrl = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
  return new URL(path, `${baseUrl}/`)
}

export async function apiRequest<T>(path: string, isValid: (value: unknown) => value is T): Promise<T> {
  let response: Response
  try {
    response = await fetch(apiUrl(path))
  } catch {
    throw new ApiError({ code: 'API_UNAVAILABLE', message: 'Não foi possível conectar à API. Tente novamente.', statusCode: 0 })
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new ApiError({ code: 'INVALID_RESPONSE', message: 'A API retornou uma resposta inválida.', statusCode: response.status })
  }
  if (!response.ok) {
    if (isErrorEnvelope(payload)) {
      throw new ApiError({ code: normalizeErrorCode(payload.error.code), message: payload.error.message, statusCode: response.status })
    }
    throw new ApiError({ code: 'API_ERROR', message: 'Não foi possível consultar a API.', statusCode: response.status })
  }
  if (!isValid(payload)) {
    throw new ApiError({ code: 'INVALID_RESPONSE', message: 'A API retornou dados em formato inválido.', statusCode: response.status })
  }
  return payload
}
