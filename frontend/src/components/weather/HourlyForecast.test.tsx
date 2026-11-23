import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { sampleWeather } from '@/test/weather-fixtures'
import { HourlyForecast } from './HourlyForecast'

describe('HourlyForecast', () => {
  it('TU-19 displays six hours with temperature, condition, and precipitation chance', () => {
    render(<HourlyForecast hours={sampleWeather.hourly} temperatureUnit="celsius" />)
    const list = screen.getByRole('list')
    const forecastRegion = screen.getByRole('region', { name: 'Previsão das próximas seis horas' })
    const hours = within(list).getAllByRole('listitem')
    expect(forecastRegion).toHaveAttribute('tabindex', '0')
    expect(hours).toHaveLength(6)
    expect(within(hours[0]).getByText('13:00')).toBeVisible()
    expect(within(hours[0]).getByText('21°C')).toBeVisible()
    expect(within(hours[0]).getByText('Predominantemente limpo')).toBeVisible()
    expect(within(hours[0]).getByText('Chuva 10%')).toBeVisible()
    expect(within(hours[0]).getByText('Ameno')).toBeVisible()
    expect(within(list).getByText('Condição indisponível')).toBeVisible()
  })
})
