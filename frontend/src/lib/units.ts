import type { TemperatureUnit, WindSpeedUnit } from '@/types/units'

const CELSIUS_TO_FAHRENHEIT_FACTOR = 9 / 5
const FAHRENHEIT_OFFSET = 32
const KILOMETERS_TO_MILES_FACTOR = 0.621371
const CARDINAL_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
const DEGREES_PER_DIRECTION = 360 / CARDINAL_DIRECTIONS.length

export function celsiusToFahrenheit(celsius: number): number {
  return celsius * CELSIUS_TO_FAHRENHEIT_FACTOR + FAHRENHEIT_OFFSET
}

export function kilometersPerHourToMilesPerHour(kilometersPerHour: number): number {
  return kilometersPerHour * KILOMETERS_TO_MILES_FACTOR
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : celsius
  const symbol = unit === 'fahrenheit' ? '°F' : '°C'
  return `${Math.round(value)}${symbol}`
}

export function formatWindSpeed(kilometersPerHour: number, unit: WindSpeedUnit): string {
  const speed = unit === 'mph' ? kilometersPerHourToMilesPerHour(kilometersPerHour) : kilometersPerHour
  const label = unit === 'mph' ? 'mph' : 'km/h'
  return `${Math.round(speed)} ${label}`
}

export function toCardinalDirection(degrees: number): string {
  if (!Number.isFinite(degrees)) return CARDINAL_DIRECTIONS[0]
  const normalizedDegrees = ((degrees % 360) + 360) % 360
  const directionIndex = Math.round(normalizedDegrees / DEGREES_PER_DIRECTION) % CARDINAL_DIRECTIONS.length
  return CARDINAL_DIRECTIONS[directionIndex]
}
