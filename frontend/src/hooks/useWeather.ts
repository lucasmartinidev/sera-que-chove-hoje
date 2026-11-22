import { useRef, useState } from 'react'
import { ApiError } from '../services/api'
import { fetchWeather } from '../services/weather-api'
import type { Coordinates, WeatherData } from '@/types/weather'

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; weather: WeatherData }
  | { status: 'error'; message: string }

function getWeatherErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Não foi possível obter o clima agora. Tente novamente.'
}

export function useWeather() {
  const [state, setState] = useState<WeatherState>({ status: 'idle' })
  const lastCoordinates = useRef<Coordinates | null>(null)

  async function loadWeather(coordinates: Coordinates): Promise<void> {
    lastCoordinates.current = coordinates
    setState({ status: 'loading' })
    try {
      const weather = await fetchWeather(coordinates.latitude, coordinates.longitude)
      setState({ status: 'success', weather })
    } catch (error: unknown) {
      setState({ status: 'error', message: getWeatherErrorMessage(error) })
    }
  }

  async function retry(): Promise<void> {
    const coordinates = lastCoordinates.current
    if (coordinates !== null) await loadWeather(coordinates)
  }

  return { state, loadWeather, retry }
}
