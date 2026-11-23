import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as healthApi from '@/services/health-api'
import { ApiError } from '@/services/api'
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

  it('TI-10 applies the reactive identity after a successful weather query', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([lisbonCandidate])
    vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    const main = await screen.findByRole('main')
    expect(main).toHaveAttribute('data-atmosphere', 'rain')
    expect(main).toHaveAttribute('data-period', 'day')
    expect(main).toHaveAttribute('data-band', 'mild')
    expect(screen.getByTestId('atmospheric-background')).toHaveAttribute('aria-hidden', 'true')
    expect(main.style.getPropertyValue('--surface')).toBe('#101D2B')
  })

  it('TI-12 keeps a neutral atmosphere when no city is found', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([])
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'inexistente')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    const main = await screen.findByRole('main')
    expect(main).toHaveAttribute('data-atmosphere', 'neutral')
    expect(main).not.toHaveAttribute('data-band')
    expect(screen.getByText('Nenhuma cidade encontrada. Tente outro nome.')).toBeVisible()
  })

  it('TI-13 changes units without changing the resolved temperature band', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([lisbonCandidate])
    const fetchWeather = vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValue(sampleWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    const main = await screen.findByRole('main')
    await user.click(screen.getByRole('button', { name: '°F' }))
    expect(main).toHaveAttribute('data-band', 'mild')
    expect(screen.getAllByText('68°F')).toHaveLength(2)
    expect(fetchWeather).toHaveBeenCalledOnce()
  })

  it('TI-11 changes atmosphere immediately with a bounded sky transition', async () => {
    const user = userEvent.setup()
    const clearNightWeather = { ...sampleWeather, current: { ...sampleWeather.current, temperatureC: 28, weatherCode: 0, isDay: false } }
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValueOnce([lisbonCandidate]).mockResolvedValueOnce([vitoriaCandidate])
    vi.spyOn(weatherApi, 'fetchWeather').mockResolvedValueOnce(sampleWeather).mockResolvedValueOnce(clearNightWeather)
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByRole('heading', { name: 'Lisboa, Portugal' })
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Vitória')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    const main = await screen.findByRole('main')
    await waitFor(() => expect(main).toHaveAttribute('data-atmosphere', 'clear'))
    expect(main).toHaveAttribute('data-period', 'night')
    expect(screen.getByTestId('sky-layer').querySelector('[data-sky-layer="current"]')?.getAttribute('style')).toContain('600ms')
  })

  it('TI-14 preserves an actionable service error under the neutral identity', async () => {
    const user = userEvent.setup()
    vi.spyOn(healthApi, 'fetchHealth').mockResolvedValue({ status: 'healthy', timestamp: '2026-11-22T12:00:00.000Z' })
    vi.spyOn(weatherApi, 'searchCity').mockResolvedValue([lisbonCandidate])
    vi.spyOn(weatherApi, 'fetchWeather').mockRejectedValue(new ApiError({ code: 'UPSTREAM_ERROR', message: 'Serviço indisponível.', statusCode: 502 }))
    render(<WeatherDashboardView />)
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    const main = await screen.findByRole('main')
    expect(await screen.findByRole('alert')).toHaveTextContent('Serviço indisponível.')
    expect(main).toHaveAttribute('data-atmosphere', 'neutral')
    expect(main).not.toHaveAttribute('data-band')
  })
})
