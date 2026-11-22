import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError } from './api'

type TextPayload = { message: string }

function isTextPayload(value: unknown): value is TextPayload {
  return typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string'
}

function response(payload: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: vi.fn().mockResolvedValue(payload) } as unknown as Response
}

describe('apiRequest', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('TU-29 sends requests to the backend base and validates a successful payload', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response({ message: 'ok' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(apiRequest('/api/test', isTextPayload)).resolves.toEqual({ message: 'ok' })
    const url = new URL(String(fetchMock.mock.calls[0][0]))
    expect(url.origin).toBe('http://localhost:3000')
    expect(url.pathname).toBe('/api/test')
    vi.stubEnv('VITE_API_URL', 'https://weather-api.example')
    await apiRequest('/health', isTextPayload)
    expect(new URL(String(fetchMock.mock.calls[1][0])).origin).toBe('https://weather-api.example')
  })

  it('TU-30 maps API, network, malformed JSON, and invalid payload errors', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response({ error: { code: 'UPSTREAM_ERROR', message: 'Tente novamente.' } }, 502))
      .mockRejectedValueOnce(new Error('internal socket detail'))
      .mockResolvedValueOnce({ ok: true, status: 200, json: vi.fn().mockRejectedValue(new Error('bad json')) } as unknown as Response)
      .mockResolvedValueOnce(response({ unexpected: true }))
      .mockResolvedValueOnce(response({ error: { code: 'FUTURE_CODE', message: 'Erro externo.' } }, 502))
      .mockResolvedValueOnce(response({ unexpected: true }, 503))
    vi.stubGlobal('fetch', fetchMock)
    await expect(apiRequest('/api/test', isTextPayload)).rejects.toMatchObject({ name: 'ApiError', code: 'UPSTREAM_ERROR', statusCode: 502, message: 'Tente novamente.' })
    await expect(apiRequest('/api/test', isTextPayload)).rejects.toMatchObject({ code: 'API_UNAVAILABLE', statusCode: 0 })
    await expect(apiRequest('/api/test', isTextPayload)).rejects.toBeInstanceOf(ApiError)
    await expect(apiRequest('/api/test', isTextPayload)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    await expect(apiRequest('/api/test', isTextPayload)).rejects.toMatchObject({ code: 'API_ERROR', statusCode: 502 })
    await expect(apiRequest('/api/test', isTextPayload)).rejects.toMatchObject({ code: 'API_ERROR', statusCode: 503 })
  })
})
