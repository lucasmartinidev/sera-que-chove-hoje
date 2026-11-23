import type { KeyboardEvent } from 'react'
import { describeWeatherCode } from '@/lib/weather-codes'
import { getTemperatureBand } from '@/lib/temperature-scale'
import { formatTemperature } from '@/lib/units'
import type { TemperatureUnit } from '@/types/units'
import type { HourForecast } from '@/types/weather'
import { WeatherIcon } from './WeatherIcon'
import { TemperatureBandChip } from './TemperatureBandChip'

type HourlyForecastProps = {
  hours: HourForecast[]
  temperatureUnit: TemperatureUnit
}

function localTime(time: string): string {
  return time.split('T')[1]?.slice(0, 5) ?? time
}

function forecastCondition(code: number | null): string {
  return code === null ? 'Condição indisponível' : describeWeatherCode(code).labelPtBr
}

function handleForecastNavigation(event: KeyboardEvent<HTMLDivElement>): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const direction = event.key === 'ArrowRight' ? 1 : -1
  event.currentTarget.scrollLeft += direction * event.currentTarget.clientWidth * 0.8
}

function ForecastHour({ hour, unit }: { hour: HourForecast; unit: TemperatureUnit }) {
  const temperature = hour.temperatureC === null ? '—' : formatTemperature(hour.temperatureC, unit)
  const band = getTemperatureBand(hour.temperatureC)
  const probability = hour.precipitationProbability === null ? '—' : `${hour.precipitationProbability}%`
  return (
    <li className="min-w-24 border-l border-border py-2 pl-4 first:border-l-0 first:pl-0 sm:py-3">
      <time className="text-sm font-semibold tabular-nums text-foreground" dateTime={hour.time}>{localTime(hour.time)}</time>
      <WeatherIcon className="my-3 h-6 w-6 text-band-accent" code={hour.weatherCode} />
      <div aria-label={`${localTime(hour.time)} — ${temperature}, ${band?.labelPtBr ?? 'Faixa indisponível'}`} className="flex flex-wrap items-center gap-2"><p className="text-lg font-semibold tabular-nums text-band-accent">{temperature}</p><TemperatureBandChip band={band} /></div>
      <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{forecastCondition(hour.weatherCode)}</p>
      <p className="mt-2 text-xs font-medium text-surface-muted">Chuva {probability}</p>
    </li>
  )
}

export function HourlyForecast({ hours, temperatureUnit }: HourlyForecastProps) {
  return (
    <section aria-labelledby="hourly-forecast-title" className="pt-7">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight" id="hourly-forecast-title">Próximas 6 horas</h2>
        <p className="text-sm text-muted-foreground">Previsão horária</p>
      </div>
      <div aria-label="Previsão das próximas seis horas" className="overflow-x-auto pb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" onKeyDown={handleForecastNavigation} role="region" tabIndex={0}>
        <ol className="grid min-w-[680px] grid-cols-6 divide-x divide-border">
          {hours.map((hour) => <ForecastHour hour={hour} key={hour.time} unit={temperatureUnit} />)}
        </ol>
      </div>
    </section>
  )
}
