import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleWeather } from '@/test/weather-fixtures'
import type { CurrentWeather } from '@/types/weather'
import { CurrentWeatherCard } from './CurrentWeatherCard'

describe('CurrentWeatherCard', () => {
  it('TU-18 displays current metrics, place, local time, and accessible condition text', () => {
    render(<CurrentWeatherCard current={sampleWeather.current} locationLabel="Vitória, Espírito Santo, Brasil" temperatureUnit="celsius" windSpeedUnit="kmh" />)
    expect(screen.getByRole('heading', { name: 'Vitória, Espírito Santo, Brasil' })).toBeVisible()
    expect(screen.getByText('Chuva fraca')).toBeVisible()
    expect(screen.getByText('20°C')).toBeVisible()
    expect(screen.getByText('Sensação térmica 21°C')).toBeVisible()
    expect(screen.getByText('Chance de chuva')).toBeVisible()
    expect(screen.getByText('30%')).toBeVisible()
    expect(screen.getByText('56%')).toBeVisible()
    expect(screen.getByText('10 km/h S')).toBeVisible()
    expect(screen.getByText('1013 hPa')).toBeVisible()
    expect(screen.getByText(/12:00/)).toBeVisible()
  })

  it('TU-18 uses placeholders when optional current metrics are unavailable', () => {
    const current: CurrentWeather = {
      ...sampleWeather.current,
      temperatureC: null,
      apparentTemperatureC: null,
      relativeHumidity: null,
      precipitationProbability: null,
      precipitationMm: null,
      windSpeedKmh: null,
      windDirectionDeg: null,
      surfacePressureHpa: null,
    }
    render(<CurrentWeatherCard current={current} locationLabel="Minha localização" temperatureUnit="celsius" windSpeedUnit="kmh" />)
    expect(screen.getAllByText('—')).toHaveLength(5)
    expect(screen.getByText(/Sensação térmica/)).toHaveTextContent('Sensação térmica —')
    expect(screen.getByText(/Precipitação:/)).toHaveTextContent('Precipitação: —')
    expect(screen.queryByLabelText(/Faixa de temperatura/)).not.toBeInTheDocument()
  })

  it('TU-62 keeps the Celsius-derived band when displaying Fahrenheit', () => {
    render(<CurrentWeatherCard current={sampleWeather.current} locationLabel="Vitória" temperatureUnit="fahrenheit" windSpeedUnit="kmh" />)
    expect(screen.getByText('Ameno')).toBeVisible()
    expect(screen.getByText('68°F')).toBeVisible()
  })
})
