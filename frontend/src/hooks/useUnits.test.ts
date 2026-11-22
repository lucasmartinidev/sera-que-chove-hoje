import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useUnits } from './useUnits'

describe('useUnits', () => {
  it('TU-34 alternates temperature and wind units independently', () => {
    const { result } = renderHook(() => useUnits())
    expect(result.current).toMatchObject({ temperatureUnit: 'celsius', windSpeedUnit: 'kmh' })
    act(() => result.current.toggleTemperatureUnit())
    expect(result.current).toMatchObject({ temperatureUnit: 'fahrenheit', windSpeedUnit: 'kmh' })
    act(() => result.current.toggleWindSpeedUnit())
    expect(result.current).toMatchObject({ temperatureUnit: 'fahrenheit', windSpeedUnit: 'mph' })
  })
})
