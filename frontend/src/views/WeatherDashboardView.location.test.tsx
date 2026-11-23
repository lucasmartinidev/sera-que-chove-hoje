import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as healthApi from '@/services/health-api'
import * as weatherApi from '@/services/weather-api'
import { lisbonCandidate, sampleWeather } from '@/test/weather-fixtures'
import { WeatherDashboardView } from './WeatherDashboardView'

function mockGrantedLocation(): void {
  const position = { coords: { latitude: -23.5, longitude: -46.6 } } as unknown as GeolocationPosition
  const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((success) => success(position))
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
}

function mockDeniedLocation(): void {
  const error = { code: 1, message: 'denied' } as GeolocationPositionError
  const getCurrentPosition = vi.fn<Geolocation['getCurrentPosition']>((_success, onError) => onError?.(error))
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
}

describe('WeatherDashboardView location', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('TU-40 loads weather as Minha localização when permission is granted', async () => {
    const user = userEvent.setup()
    mockGrantedLocation()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.click(screen.getByRole('button', { name: 'Minha localização' }))
    expect(await screen.findByRole('heading', { name: 'Minha localização' })).toBeVisible()
    expect(fetchWeather).toHaveBeenCalledWith(-23.5, -46.6)
  })

  it('TU-41 keeps manual city search available after location permission is denied', async () => {
    const user = userEvent.setup()
    mockDeniedLocation()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([lisbonCandidate])
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.click(screen.getByRole('button', { name: 'Minha localização' }))
    expect(await screen.findByText(/Permissão de localização negada/)).toBeVisible()
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
    expect(fetchWeather).toHaveBeenCalledWith(lisbonCandidate.latitude, lisbonCandidate.longitude)
  })
})
