import { useState } from 'react'
import type { TemperatureUnit, WindSpeedUnit } from '@/types/units'

export function useUnits() {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius')
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>('kmh')

  function toggleTemperatureUnit(): void {
    setTemperatureUnit((unit) => unit === 'celsius' ? 'fahrenheit' : 'celsius')
  }

  function toggleWindSpeedUnit(): void {
    setWindSpeedUnit((unit) => unit === 'kmh' ? 'mph' : 'kmh')
  }

  return { temperatureUnit, windSpeedUnit, toggleTemperatureUnit, toggleWindSpeedUnit }
}
