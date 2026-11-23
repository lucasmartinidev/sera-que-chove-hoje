import { Droplets, Gauge, Wind } from 'lucide-react'
import { describeWeatherCode } from '@/lib/weather-codes'
import { getTemperatureBand } from '@/lib/temperature-scale'
import { formatTemperature, formatWindSpeed, toCardinalDirection } from '@/lib/units'
import type { TemperatureUnit, WindSpeedUnit } from '@/types/units'
import type { CurrentWeather } from '@/types/weather'
import { WeatherIcon } from './WeatherIcon'
import { WeatherMetric } from './WeatherMetric'
import { TemperatureBandChip } from './TemperatureBandChip'

type CurrentWeatherCardProps = {
  locationLabel: string
  current: CurrentWeather
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
}

function localTime(time: string): string {
  return time.split('T')[1]?.slice(0, 5) ?? time
}

function TemperatureReading({ current, unit }: { current: CurrentWeather; unit: TemperatureUnit }) {
  const apparent = current.apparentTemperatureC === null ? '—' : formatTemperature(current.apparentTemperatureC, unit)
  const temperature = current.temperatureC === null ? '—' : formatTemperature(current.temperatureC, unit)
  const band = getTemperatureBand(current.temperatureC)
  const temperatureClass = band === null ? 'text-surface-foreground' : 'text-band-accent'
  return (
    <div className="py-5">
      <div className="flex flex-wrap items-center gap-3"><p className={`text-6xl font-semibold leading-none tracking-tight sm:text-7xl ${temperatureClass}`}>{temperature}</p><TemperatureBandChip band={band} /></div>
      <p className="mt-3 text-sm text-surface-muted">Sensação térmica {apparent}</p>
    </div>
  )
}

function RainProbability({ current }: { current: CurrentWeather }) {
  const probability = current.precipitationProbability
  const value = probability === null ? '—' : `${probability}%`
  const amount = current.precipitationMm === null ? '—' : `${current.precipitationMm} mm`
  return (
    <div className="flex min-w-48 items-center justify-between gap-4 border-t border-surface-muted/30 bg-surface-raised px-5 py-4 sm:border-l sm:border-t-0">
      <div>
        <p className="text-sm font-medium text-surface-foreground">Chance de chuva</p>
        <strong className="mt-1 block text-4xl font-semibold tabular-nums text-surface-foreground">{value}</strong>
        <p className="mt-1 text-sm text-surface-muted">Precipitação: {amount}</p>
      </div>
      <Droplets aria-hidden="true" className="h-7 w-7 shrink-0 text-surface-muted" strokeWidth={1.8} />
    </div>
  )
}

export function CurrentWeatherCard({ locationLabel, current, temperatureUnit, windSpeedUnit }: CurrentWeatherCardProps) {
  const condition = describeWeatherCode(current.weatherCode)
  const wind = current.windSpeedKmh === null ? '—' : formatWindSpeed(current.windSpeedKmh, windSpeedUnit)
  const windDirection = current.windDirectionDeg === null ? '' : ` ${toCardinalDirection(current.windDirectionDeg)}`
  const humidity = current.relativeHumidity === null ? '—' : `${current.relativeHumidity}%`
  const pressure = current.surfacePressureHpa === null ? '—' : `${Math.round(current.surfacePressureHpa)} hPa`
  return (
    <section aria-labelledby="current-weather-title" className="border-y border-surface-muted/30 bg-surface px-5 py-6 text-surface-foreground transition-[background-color,color,border-color] duration-[600ms] sm:px-8 sm:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
           <h2 className="text-2xl font-semibold tracking-tight text-surface-foreground" id="current-weather-title">{locationLabel}</h2>
           <p className="mt-1 text-sm text-surface-muted">Agora · horário local {localTime(current.time)}</p>
        </div>
         <div className="flex items-center gap-2 text-sm font-medium text-surface-foreground">
           <WeatherIcon className="h-6 w-6 text-band-accent" code={current.weatherCode} isDay={current.isDay} />
          <span>{condition.labelPtBr}</span>
        </div>
      </header>
      <div className="mt-5 grid sm:grid-cols-[1fr_auto]">
        <TemperatureReading current={current} unit={temperatureUnit} />
        <RainProbability current={current} />
      </div>
      <dl className="mt-3 grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <WeatherMetric icon={Droplets} label="Umidade" value={humidity} />
        <WeatherMetric icon={Wind} label="Vento" value={`${wind}${windDirection}`} />
        <WeatherMetric icon={Gauge} label="Pressão" value={pressure} />
      </dl>
    </section>
  )
}
