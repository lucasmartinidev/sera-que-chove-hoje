import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GeocodingCandidate } from '@/types/geocoding-candidate'
import type { WeatherData } from '@/types/weather'
import { fetchWeather, searchCity } from './weather-api'

const candidate: GeocodingCandidate = {
  id: 1,
  name: 'São Paulo',
  admin1: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.5,
  longitude: -46.6,
  timezone: 'America/Sao_Paulo',
  population: 1000000,
}

const weather: WeatherData = {
  location: { latitude: -23.5, longitude: -46.6, timezone: 'America/Sao_Paulo', utcOffsetSeconds: -10800 },
  current: {
    time: '2026-11-22T12:00', temperatureC: 20, apparentTemperatureC: 21, relativeHumidity: 60,
    precipitationProbability: 10, precipitationMm: 0, weatherCode: 1, windSpeedKmh: 5,
    windDirectionDeg: 90, surfacePressureHpa: 1013, isDay: true,
  },
  hourly: [{ time: '2026-11-22T13:00', temperatureC: 21, weatherCode: 2, precipitationProbability: 20, precipitationMm: 0 }],
  units: { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm', pressure: 'hpa' },
}

function jsonResponse(payload: unknown): Response {
  return { ok: true, status: 200, json: vi.fn().mockResolvedValue(payload) } as unknown as Response
}

describe('weather-api', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('TU-31 calls only backend routes and validates both response contracts', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ candidates: [candidate] }))
      .mockResolvedValueOnce(jsonResponse(weather))
      .mockResolvedValueOnce(jsonResponse({ candidates: [{ id: 'invalid' }] }))
      .mockResolvedValueOnce(jsonResponse({ current: {} }))
      .mockResolvedValueOnce(jsonResponse({ candidates: [null] }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(searchCity('São Paulo')).resolves.toEqual([candidate])
    await expect(fetchWeather(-23.5, -46.6)).resolves.toEqual(weather)
    const geocodeUrl = new URL(String(fetchMock.mock.calls[0][0]))
    const weatherUrl = new URL(String(fetchMock.mock.calls[1][0]))
    expect(geocodeUrl.pathname).toBe('/api/geocode')
    expect(geocodeUrl.searchParams.get('city')).toBe('São Paulo')
    expect(weatherUrl.pathname).toBe('/api/weather')
    expect(weatherUrl.searchParams.get('lat')).toBe('-23.5')
    await expect(searchCity('invalid')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    await expect(fetchWeather(0, 0)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    await expect(searchCity('not an object')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
})
