import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/api'
import * as healthApi from '@/services/health-api'
import * as weatherApi from '@/services/weather-api'
import { lisbonCandidate, sampleWeather } from '@/test/weather-fixtures'
import { WeatherDashboardView } from './WeatherDashboardView'

const UPSTREAM_ERROR_MESSAGE = 'Não foi possível obter os dados de clima agora. Tente novamente.'

describe('WeatherDashboardView recovery states', () => {
  afterEach(() => vi.restoreAllMocks())

  it('TU-42 retries a failed weather request and recovers the panel', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([lisbonCandidate])
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather')
      .mockRejectedValueOnce(new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE, statusCode: 502 }))
      .mockResolvedValueOnce(sampleWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
    expect(fetchWeather).toHaveBeenCalledTimes(2)
  })

  it('TU-43 retries a failed city search and continues to weather', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    const searchCity = vi.spyOn(weatherApi, 'searchCity')
      .mockRejectedValueOnce(new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE, statusCode: 502 }))
      .mockResolvedValueOnce([lisbonCandidate])
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
    expect(searchCity).toHaveBeenCalledTimes(2)
    expect(fetchWeather).toHaveBeenCalledOnce()
  })

  it('TU-44 informs when no city matches the search', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([])
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'cidade inexistente')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText('Nenhuma cidade encontrada. Tente outro nome.')).toBeVisible()
  })
})
