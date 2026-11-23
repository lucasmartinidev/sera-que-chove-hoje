import { getConditionFamily, type ConditionFamily } from '@/lib/condition-family'
import { resolveTheme, themeToCssVariables, type CssVariables } from '@/lib/resolve-theme'
import { getTemperatureBand } from '@/lib/temperature-scale'
import { THEME_TRANSITION_MS, type AtmosphereMotion } from '@/components/atmosphere/atmosphere-constants'
import { useReducedMotion } from './useReducedMotion'
import type { DashboardFeedback } from './weather-dashboard.logic'
import type { WeatherState } from './useWeather'

type AtmosphereThemeInput = {
  weather: WeatherState
  feedback: DashboardFeedback
}

type AtmosphereAttributes = {
  atmosphere: ConditionFamily
  period: 'day' | 'night'
  band: string | undefined
  motion: 'reduced' | 'continuous'
}

export type AtmosphereTheme = {
  cssVariables: CssVariables
  attributes: AtmosphereAttributes
  backgroundProps: {
    family: ConditionFamily
    period: 'day' | 'night'
    sky: { top: string; bottom: string }
    bandDeep: string | null
    motion: AtmosphereMotion
  }
}

export function useAtmosphereTheme(input: AtmosphereThemeInput): AtmosphereTheme {
  const reduced = useReducedMotion()
  const successfulWeather = input.weather.status === 'success' && !input.feedback.error ? input.weather : null
  const weather = successfulWeather?.weather ?? null
  const family = weather === null ? 'neutral' : getConditionFamily(weather.current.weatherCode)
  const period = weather === null || weather.current.isDay ? 'day' : 'night'
  const band = weather === null ? null : getTemperatureBand(weather.current.temperatureC)
  const tokens = resolveTheme({ conditionFamily: family, temperatureBand: band, isDay: period === 'day' })
  const motion = { reduced, transitionMs: reduced ? 0 : THEME_TRANSITION_MS }
  return {
    cssVariables: themeToCssVariables(tokens),
    attributes: { atmosphere: family, period, band: band?.id, motion: reduced ? 'reduced' : 'continuous' },
    backgroundProps: { family, period, sky: { top: tokens['sky-top'], bottom: tokens['sky-bottom'] }, bandDeep: band === null ? null : tokens['band-deep'], motion },
  }
}
