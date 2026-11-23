import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as weatherApi from '../services/weather-api'
import { ApiError } from '../services/api'
import type { WeatherData } from '@/types/weather'
import { useWeather } from './useWeather'

const weather: WeatherData = {
  location: { latitude: -23.5, longitude: -46.6, timezone: 'America/Sao_Paulo', utcOffsetSeconds: -10800 },
  current: {
    time: '2026-11-22T12:00', temperatureC: 22, apparentTemperatureC: 23, relativeHumidity: 60,
    precipitationProbability: 20, precipitationMm: 0, weatherCode: 1, windSpeedKmh: 10,
    windDirectionDeg: 180, surfacePressureHpa: 1013, isDay: true,
  },
  hourly: [],
  units: { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm', pressure: 'hpa' },
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

describe('useWeather', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TU-14 loads coordinates, retains them for retry, and exposes errors', async () => {
    const pending = deferred<WeatherData>()
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockReturnValue(pending.promise)
    const { result } = renderHook(() => useWeather())
    await act(async () => result.current.retry())
    expect(fetchWeather).not.toHaveBeenCalled()
    const coordinates = { latitude: -23.5, longitude: -46.6 }
    act(() => { void result.current.loadWeather(coordinates) })
    expect(result.current.state.status).toBe('loading')
    await act(async () => {
      pending.resolve(weather)
      await pending.promise
    })
    expect(result.current.state).toEqual({ status: 'success', weather })
    fetchWeather.mockResolvedValueOnce(weather)
    await act(async () => result.current.retry())
    expect(fetchWeather).toHaveBeenLastCalledWith(coordinates.latitude, coordinates.longitude)
    fetchWeather.mockRejectedValueOnce(new ApiError({ code: 'UPSTREAM_ERROR', message: 'Não foi possível obter os dados de clima agora. Tente novamente.', statusCode: 502 }))
    await act(async () => result.current.loadWeather({ latitude: 1, longitude: 2 }))
    expect(result.current.state).toEqual({ status: 'error', message: 'Não foi possível obter os dados de clima agora. Tente novamente.' })
  })
  it('ignores the result of an older weather request', async () => {
    const first = deferred<WeatherData>()
    const second = deferred<WeatherData>()
    vi.spyOn(weatherApi, 'fetchWeather').mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { result } = renderHook(() => useWeather())
    act(() => { void result.current.loadWeather({ latitude: 1, longitude: 2 }) })
    act(() => { void result.current.loadWeather({ latitude: 3, longitude: 4 }) })
    await act(async () => {
      second.resolve(weather)
      await second.promise
    })
    await act(async () => {
      first.resolve({ ...weather, current: { ...weather.current, temperatureC: 99 } })
      await first.promise
    })
    expect(result.current.state).toEqual({ status: 'success', weather })
  })
})
