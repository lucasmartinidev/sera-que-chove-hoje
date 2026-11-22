import type { GeocodingCandidate } from '@/types/geocoding-candidate'
import type { CurrentWeather, HourForecast, WeatherData, WeatherLocation, WeatherUnits } from '@/types/weather'

type UnknownRecord = Record<string, unknown>

const CURRENT_NUMBER_FIELDS = ['temperatureC', 'apparentTemperatureC', 'relativeHumidity', 'precipitationProbability', 'precipitationMm', 'windSpeedKmh', 'windDirectionDeg', 'surfacePressureHpa']

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value)
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function hasNullableNumbers(record: UnknownRecord, fields: string[]): boolean {
  return fields.every((field) => isNullableNumber(record[field]))
}

function isGeocodingCandidate(value: unknown): value is GeocodingCandidate {
  if (!isRecord(value)) return false
  return Number.isInteger(value.id) && typeof value.name === 'string' && isNullableString(value.admin1) && isNullableString(value.country) && isNullableString(value.countryCode) && isFiniteNumber(value.latitude) && isFiniteNumber(value.longitude) && isNullableString(value.timezone) && isNullableNumber(value.population)
}

export function isGeocodeResponse(value: unknown): value is { candidates: GeocodingCandidate[] } {
  return isRecord(value) && Array.isArray(value.candidates) && value.candidates.every(isGeocodingCandidate)
}

function isWeatherLocation(value: unknown): value is WeatherLocation {
  return isRecord(value) && isFiniteNumber(value.latitude) && isFiniteNumber(value.longitude) && isNullableString(value.timezone) && isNullableNumber(value.utcOffsetSeconds)
}

function isCurrentWeather(value: unknown): value is CurrentWeather {
  return isRecord(value) && typeof value.time === 'string' && isFiniteNumber(value.weatherCode) && typeof value.isDay === 'boolean' && hasNullableNumbers(value, CURRENT_NUMBER_FIELDS)
}

function isHourForecast(value: unknown): value is HourForecast {
  return isRecord(value) && typeof value.time === 'string' && (value.weatherCode === null || isFiniteNumber(value.weatherCode)) && hasNullableNumbers(value, ['temperatureC', 'precipitationProbability', 'precipitationMm'])
}

function isWeatherUnits(value: unknown): value is WeatherUnits {
  return isRecord(value) && value.temperature === 'celsius' && value.windSpeed === 'kmh' && value.precipitation === 'mm' && value.pressure === 'hpa'
}

export function isWeatherData(value: unknown): value is WeatherData {
  return isRecord(value) && isWeatherLocation(value.location) && isCurrentWeather(value.current) && Array.isArray(value.hourly) && value.hourly.every(isHourForecast) && isWeatherUnits(value.units)
}
