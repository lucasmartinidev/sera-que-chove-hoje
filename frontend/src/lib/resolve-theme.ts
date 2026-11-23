import type { ConditionFamily } from './condition-family'
import { BAND_COLORS, FIXED_TOKENS, SKIES, SURFACES, type ThemeTokenName, type ThemeTokens } from './theme-tokens'
import type { TemperatureBand } from './temperature-scale'

export type ThemeInput = {
  conditionFamily: ConditionFamily
  temperatureBand: TemperatureBand | null
  isDay: boolean
}

export type CssVariables = Record<`--${ThemeTokenName}`, string>

const SURFACE_RAISED_LIGHTEN_AMOUNT = 0.04
const HEX_COMPONENT_COUNT = 3
const HEX_RADIX = 16

function toHex(value: number): string {
  return Math.round(value).toString(HEX_RADIX).padStart(2, '0')
}

export function lighten(hex: string, amount: number): string {
  const components = hex.slice(1).match(/.{2}/g)
  if (!components || components.length !== HEX_COMPONENT_COUNT) throw new Error(`Cor hexadecimal inválida: ${hex}`)
  const channels = components.map((component) => Number.parseInt(component, HEX_RADIX))
  const lightened = channels.map((channel) => channel + (255 - channel) * amount)
  return `#${lightened.map(toHex).join('')}`
}

function getPeriod(isDay: boolean): 'day' | 'night' {
  return isDay ? 'day' : 'night'
}

function getBandTokens(band: TemperatureBand | null, foreground: string): { accent: string; deep: string } {
  if (band === null) return { accent: foreground, deep: foreground }
  return BAND_COLORS[band.id]
}

export function resolveTheme(input: ThemeInput): ThemeTokens {
  const period = getPeriod(input.isDay)
  const surface = SURFACES[input.conditionFamily][period]
  const [skyTop, skyBottom] = SKIES[input.conditionFamily][period]
  const band = getBandTokens(input.temperatureBand, FIXED_TOKENS.foreground)
  return {
    surface,
    'surface-foreground': FIXED_TOKENS.foreground,
    'surface-muted': FIXED_TOKENS.muted,
    'surface-raised': lighten(surface, SURFACE_RAISED_LIGHTEN_AMOUNT),
    'band-accent': band.accent,
    'band-contrast-text': FIXED_TOKENS.contrastText,
    'band-deep': band.deep,
    'sky-top': skyTop,
    'sky-bottom': skyBottom,
    'status-ok': FIXED_TOKENS.statusOk,
    'status-warn': FIXED_TOKENS.statusWarn,
    'status-error': FIXED_TOKENS.statusError,
    'focus-ring': FIXED_TOKENS.focusRing,
  }
}

export function themeToCssVariables(tokens: ThemeTokens): CssVariables {
  return Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--${name}`, value])) as CssVariables
}
