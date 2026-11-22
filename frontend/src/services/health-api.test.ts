import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchHealth } from './health-api'

describe('fetchHealth', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('TU-29 queries the existing health endpoint through the backend client', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' }),
    } as unknown as Response)
    vi.stubGlobal('fetch', fetchMock)
    await expect(fetchHealth()).resolves.toMatchObject({ status: 'healthy' })
    expect(new URL(String(fetchMock.mock.calls[0][0])).pathname).toBe('/health')
  })
})
