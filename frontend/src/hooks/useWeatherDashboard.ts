import { useState } from 'react'
import { useApiHealth } from './useApiHealth'
import { useCitySearch } from './useCitySearch'
import { useGeolocation } from './useGeolocation'
import { useUnits } from './useUnits'
import { useWeather } from './useWeather'
import { createDashboardActions, getDashboardFeedback, type DashboardDependencies, type DashboardLocation } from './weather-dashboard.logic'

export function useWeatherDashboard() {
  const apiStatus = useApiHealth()
  const citySearch = useCitySearch()
  const weather = useWeather()
  const geolocation = useGeolocation()
  const units = useUnits()
  const [location, setLocation] = useState<DashboardLocation | null>(null)
  const dashboard: DashboardDependencies = { citySearch, weather, geolocation, setLocation }
  return {
    apiStatus,
    city: citySearch.city,
    setCity: citySearch.setCity,
    citySearch: citySearch.state,
    weather: weather.state,
    geolocation: geolocation.state,
    location,
    units,
    feedback: getDashboardFeedback({ city: citySearch.state, weather: weather.state, geolocation: geolocation.state, location }),
    ...createDashboardActions(dashboard),
  }
}
