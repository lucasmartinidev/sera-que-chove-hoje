import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('TU-15 returns coordinates and granted state after permission', async () => {
    const position = { coords: { latitude: -23.5, longitude: -46.6 } } as unknown as GeolocationPosition
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success) => success(position))
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
    const { result } = renderHook(() => useGeolocation())
    await act(async () => result.current.requestLocation())
    expect(result.current.state).toEqual({ status: 'granted', coordinates: { latitude: -23.5, longitude: -46.6 } })
    expect(getCurrentPosition).toHaveBeenCalledOnce()
  })

  it('TU-16 distinguishes denied and unavailable states without throwing', async () => {
    const deniedError = { code: 1, message: 'denied' } as GeolocationPositionError
    const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((_success, error) => error?.(deniedError))
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
    const { result } = renderHook(() => useGeolocation())
    await act(async () => result.current.requestLocation())
    expect(result.current.state).toEqual({ status: 'denied' })
    vi.stubGlobal('navigator', {})
    await act(async () => result.current.requestLocation())
    expect(result.current.state).toEqual({ status: 'unavailable' })
  })
})
