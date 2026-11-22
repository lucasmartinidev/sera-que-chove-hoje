import { describe, expect, it } from 'vitest'
import { celsiusToFahrenheit, formatTemperature, formatWindSpeed, kilometersPerHourToMilesPerHour, toCardinalDirection } from './units'

describe('weather unit formatting', () => {
  it('TU-11 converts and formats temperature and wind speed in both unit systems', () => {
    expect(celsiusToFahrenheit(0)).toBe(32)
    expect(formatTemperature(20, 'fahrenheit')).toBe('68°F')
    expect(formatTemperature(20, 'celsius')).toBe('20°C')
    expect(kilometersPerHourToMilesPerHour(100)).toBeCloseTo(62.1371)
    expect(formatWindSpeed(100, 'mph')).toBe('62 mph')
    expect(formatWindSpeed(10, 'kmh')).toBe('10 km/h')
  })

  it('TU-12 converts degrees to normalized cardinal directions', () => {
    expect(toCardinalDirection(145)).toBe('SE')
    expect(toCardinalDirection(360)).toBe('N')
    expect(toCardinalDirection(-45)).toBe('NW')
    expect(toCardinalDirection(Number.NaN)).toBe('N')
  })
})
