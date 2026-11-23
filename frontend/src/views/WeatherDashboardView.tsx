import { CityCandidateList } from '@/components/weather/CityCandidateList'
import { CitySearchForm } from '@/components/weather/CitySearchForm'
import { CurrentWeatherCard } from '@/components/weather/CurrentWeatherCard'
import { HourlyForecast } from '@/components/weather/HourlyForecast'
import { LocationButton } from '@/components/weather/LocationButton'
import { StatusMessage } from '@/components/weather/StatusMessage'
import { UnitSelector } from '@/components/weather/UnitSelector'
import { useWeatherDashboard } from '@/hooks/useWeatherDashboard'
import type { WeatherData } from '@/types/weather'
import type { TemperatureUnit, WindSpeedUnit } from '@/types/units'
import type { ApiStatus as ApiStatusValue } from '@/hooks/useApiHealth'

const API_STATUS_LABELS: Record<ApiStatusValue, string> = {
  checking: 'Verificando API',
  online: 'API online',
  offline: 'API indisponível',
}

const API_STATUS_INDICATORS: Record<ApiStatusValue, string> = {
  checking: 'bg-amber-500',
  online: 'bg-emerald-600',
  offline: 'bg-rose-600',
}

function ApiStatus({ status }: { status: ApiStatusValue }) {
  const label = API_STATUS_LABELS[status]
  const indicator = API_STATUS_INDICATORS[status]
  return <p aria-label={label} aria-live="polite" className="flex items-center gap-2 text-xs font-medium text-muted-foreground" role="status"><span aria-hidden="true" className={`h-2 w-2 rounded-full ${indicator}`} />{label}</p>
}

type WeatherResultsProps = {
  weather: WeatherData
  locationLabel: string
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
  onToggleTemperature: () => void
  onToggleWindSpeed: () => void
}

function WeatherResults({ weather, locationLabel, temperatureUnit, windSpeedUnit, onToggleTemperature, onToggleWindSpeed }: WeatherResultsProps) {
  return (
    <div className="mt-8">
      <CurrentWeatherCard current={weather.current} locationLabel={locationLabel} temperatureUnit={temperatureUnit} windSpeedUnit={windSpeedUnit} />
      <div className="flex justify-end border-b border-border py-3"><UnitSelector onToggleTemperature={onToggleTemperature} onToggleWindSpeed={onToggleWindSpeed} temperatureUnit={temperatureUnit} windSpeedUnit={windSpeedUnit} /></div>
      <HourlyForecast hours={weather.hourly} temperatureUnit={temperatureUnit} />
    </div>
  )
}

export function WeatherDashboardView() {
  const dashboard = useWeatherDashboard()
  const candidates = dashboard.citySearch.status === 'success' && dashboard.citySearch.candidates.length > 1 && dashboard.location === null ? dashboard.citySearch.candidates : []
  const weather = dashboard.weather.status === 'success' && dashboard.location !== null ? dashboard.weather.weather : null
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Será que chove hoje?</h1><p className="mt-2 text-muted-foreground">Clima de agora e previsão para as próximas horas.</p></div>
          <ApiStatus status={dashboard.apiStatus} />
        </header>
        <section aria-label="Buscar clima" className="grid gap-3 border-y border-border py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <CitySearchForm city={dashboard.city} disabled={dashboard.weather.status === 'loading' || dashboard.geolocation.status === 'prompting'} isLoading={dashboard.citySearch.status === 'loading'} onCityChange={dashboard.setCity} onSubmit={dashboard.submitSearch} />
          <LocationButton disabled={dashboard.weather.status === 'loading' || dashboard.citySearch.status === 'loading'} onRequest={dashboard.requestLocation} status={dashboard.geolocation.status} />
        </section>
        <StatusMessage busy={dashboard.feedback.busy} error={dashboard.feedback.error} message={dashboard.feedback.message} onRetry={dashboard.feedback.retryable ? dashboard.retry : undefined} />
        <CityCandidateList candidates={candidates} onSelect={dashboard.selectCandidate} />
        {weather !== null && dashboard.location !== null && <WeatherResults onToggleTemperature={dashboard.units.toggleTemperatureUnit} onToggleWindSpeed={dashboard.units.toggleWindSpeedUnit} temperatureUnit={dashboard.units.temperatureUnit} weather={weather} windSpeedUnit={dashboard.units.windSpeedUnit} locationLabel={dashboard.location.label} />}
      </div>
    </main>
  )
}
