import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as healthApi from '@/services/health-api'
import * as weatherApi from '@/services/weather-api'
import { lisbonCandidate, rioCandidate, sampleWeather, vitoriaCandidate } from '@/test/weather-fixtures'
import { WeatherDashboardView } from './WeatherDashboardView'

describe('WeatherDashboardView search and units', () => {
  afterEach(() => vi.restoreAllMocks())

  it('TU-20 changes displayed units without requesting weather again', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([lisbonCandidate])
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(await screen.findByRole('heading', { name: 'Lisboa, Portugal' })).toBeVisible()
    expect(screen.getAllByText('20°C')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: '°C' }))
    await user.click(screen.getByRole('button', { name: 'km/h' }))
    expect(screen.getAllByText('20°C')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: '°F' }))
    expect(screen.getAllByText('68°F')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: 'mph' }))
    expect(screen.getByText('6 mph S')).toBeVisible()
    expect(fetchWeather).toHaveBeenCalledOnce()
  })

  it('TU-39 presents ambiguous cities and loads the selected candidate', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([vitoriaCandidate, rioCandidate])
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Vitória')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await user.click(await screen.findByRole('button', { name: 'Vitória, Espírito Santo · Brasil' }))
    expect(await screen.findByRole('heading', { name: 'Vitória, Espírito Santo, Brasil' })).toBeVisible()
    expect(fetchWeather).toHaveBeenCalledWith(vitoriaCandidate.latitude, vitoriaCandidate.longitude)
  })
})
