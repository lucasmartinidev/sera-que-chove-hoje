import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import * as healthApi from '../services/health-api'
import { useApiHealth } from './useApiHealth'

describe('useApiHealth', () => {
  afterEach(() => vi.restoreAllMocks())

  it('TU-32 maps healthy responses to online and failures to offline', async () => {
    const healthRequest = vi.spyOn(healthApi, 'fetchHealth')
      .mockResolvedValueOnce({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
      .mockResolvedValueOnce({ status: 'degraded', timestamp: '2026-11-22T12:00:00.000Z' })
      .mockRejectedValueOnce(new Error('unavailable'))
    const online = renderHook(() => useApiHealth())
    await waitFor(() => expect(online.result.current).toBe('online'))
    online.unmount()
    const degraded = renderHook(() => useApiHealth())
    await waitFor(() => expect(degraded.result.current).toBe('offline'))
    degraded.unmount()
    const offline = renderHook(() => useApiHealth())
    await waitFor(() => expect(offline.result.current).toBe('offline'))
    expect(healthRequest).toHaveBeenCalledTimes(3)
  })
})
