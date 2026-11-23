import { describe, expect, it } from 'vitest'
import { contrastRatio, meetsNonTextAA, meetsTextAA, relativeLuminance } from './contrast'
import { resolveTheme, themeToCssVariables } from './resolve-theme'
import { BAND_COLORS, FIXED_TOKENS, SKIES, SURFACES, type SurfacePeriod } from './theme-tokens'
import { getTemperatureBand } from './temperature-scale'

const FAMILIES = ['neutral', 'clear', 'cloudy', 'fog', 'rain', 'snow', 'thunderstorm'] as const
const PERIODS = ['day', 'night'] as const
const BANDS = Object.keys(BAND_COLORS) as (keyof typeof BAND_COLORS)[]

describe('theme resolution', () => {
  it('TU-50 audits text, component and focus contrast across the token matrix', () => {
    FAMILIES.forEach((family) => PERIODS.forEach((period: SurfacePeriod) => auditSurface(family, period)))
    BANDS.forEach((band) => auditBandContrast(band))
  })

  it('TU-51 keeps band accent luminance strictly ordered from cold to hot', () => {
    const luminances = BANDS.map((band) => relativeLuminance(BAND_COLORS[band].accent))
    luminances.slice(1).forEach((luminance, index) => expect(luminance).toBeGreaterThan(luminances[index]))
  })

  it('TU-52 resolves family, period and band tokens from a successful query', () => {
    const tokens = resolveTheme({ conditionFamily: 'rain', temperatureBand: getTemperatureBand(28), isDay: false })
    expect(tokens.surface).toBe(SURFACES.rain.night)
    expect(tokens['sky-top']).toBe(SKIES.rain.night[0])
    expect(tokens['band-accent']).toBe(BAND_COLORS.warm.accent)
  })

  it('TU-53 resolves neutral tokens without a temperature or condition', () => {
    const tokens = resolveTheme({ conditionFamily: 'neutral', temperatureBand: null, isDay: true })
    expect(tokens.surface).toBe(SURFACES.neutral.day)
    expect(tokens['band-accent']).toBe(FIXED_TOKENS.foreground)
    expect(tokens['band-deep']).toBe(FIXED_TOKENS.foreground)
  })

  it('TU-54 produces identical tokens for the same temperature in different cities', () => {
    const first = resolveTheme({ conditionFamily: 'clear', temperatureBand: getTemperatureBand(20), isDay: true })
    const second = resolveTheme({ conditionFamily: 'clear', temperatureBand: getTemperatureBand(20), isDay: true })
    expect(first).toEqual(second)
  })

  it('TU-63 creates every required CSS variable with hex values', () => {
    const variables = themeToCssVariables(resolveTheme({ conditionFamily: 'clear', temperatureBand: getTemperatureBand(20), isDay: true }))
    expect(Object.keys(variables)).toHaveLength(13)
    Object.values(variables).forEach((value) => expect(value).toMatch(/^#[\da-f]{6}$/i))
    expect(contrastRatio(variables['--surface-foreground'], variables['--surface'])).toBeGreaterThan(4.5)
  })
})

function auditSurface(family: typeof FAMILIES[number], period: SurfacePeriod): void {
  const tokens = resolveTheme({ conditionFamily: family, temperatureBand: getTemperatureBand(20), isDay: period === 'day' })
  expect(meetsTextAA(tokens['surface-foreground'], tokens.surface)).toBe(true)
  expect(meetsTextAA(tokens['surface-muted'], tokens.surface)).toBe(true)
  expect(meetsTextAA(tokens['surface-foreground'], tokens['surface-raised'])).toBe(true)
  expect(meetsTextAA(tokens['surface-muted'], tokens['surface-raised'])).toBe(true)
  expect(meetsNonTextAA(tokens['focus-ring'], tokens.surface)).toBe(true)
  expect(meetsTextAA(tokens['status-ok'], tokens.surface)).toBe(true)
  expect(meetsTextAA(tokens['status-warn'], tokens.surface)).toBe(true)
  expect(meetsTextAA(tokens['status-error'], tokens.surface)).toBe(true)
  BANDS.forEach((band) => {
    expect(meetsTextAA(BAND_COLORS[band].accent, tokens.surface)).toBe(true)
  })
}

function auditBandContrast(band: keyof typeof BAND_COLORS): void {
  expect(meetsTextAA(FIXED_TOKENS.contrastText, BAND_COLORS[band].accent)).toBe(true)
}
