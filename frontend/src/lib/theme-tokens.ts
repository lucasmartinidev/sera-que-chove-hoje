import type { ConditionFamily } from './condition-family'
import type { TemperatureBandId } from './temperature-scale'

export type ThemeTokenName =
  | 'surface'
  | 'surface-foreground'
  | 'surface-muted'
  | 'surface-raised'
  | 'band-accent'
  | 'band-contrast-text'
  | 'band-deep'
  | 'sky-top'
  | 'sky-bottom'
  | 'status-ok'
  | 'status-warn'
  | 'status-error'
  | 'focus-ring'

export type ThemeTokens = Record<ThemeTokenName, string>

export type SurfacePeriod = 'day' | 'night'

export const SURFACES: Record<ConditionFamily, Record<SurfacePeriod, string>> = {
  neutral: { day: '#0E1524', night: '#0E1524' },
  clear: { day: '#14243F', night: '#0A1226' },
  cloudy: { day: '#171F2D', night: '#0C121B' },
  fog: { day: '#1B2330', night: '#10161F' },
  rain: { day: '#101D2B', night: '#0A121C' },
  snow: { day: '#182434', night: '#0D1520' },
  thunderstorm: { day: '#1A1628', night: '#0D0A16' },
}

export const SKIES: Record<ConditionFamily, Record<SurfacePeriod, [string, string]>> = {
  neutral: { day: ['#1F2937', '#0B1220'], night: ['#1F2937', '#0B1220'] },
  clear: { day: ['#0EA5E9', '#BAE6FD'], night: ['#070B1A', '#1E1B4B'] },
  cloudy: { day: ['#475569', '#94A3B8'], night: ['#0B111C', '#1F2937'] },
  fog: { day: ['#6B7280', '#CBD5E1'], night: ['#1F2733', '#3B4657'] },
  rain: { day: ['#1E293B', '#475569'], night: ['#070D17', '#16202E'] },
  snow: { day: ['#60A5FA', '#DBEAFE'], night: ['#0D1A2E', '#233A54'] },
  thunderstorm: { day: ['#1F2937', '#4C1D95'], night: ['#05050C', '#1E1640'] },
}

export const BAND_COLORS: Record<TemperatureBandId, { accent: string; deep: string }> = {
  'extreme-cold': { accent: '#9F8CF2', deep: '#3730A3' },
  'very-cold': { accent: '#6FA8F5', deep: '#1E40AF' },
  cold: { accent: '#4FC3E8', deep: '#0E7490' },
  cool: { accent: '#5FD9A5', deep: '#0F766E' },
  mild: { accent: '#A8D96B', deep: '#4D7C0F' },
  warm: { accent: '#FFC470', deep: '#C2410C' },
  'very-warm': { accent: '#FFC9B8', deep: '#B91C1C' },
  'extreme-heat': { accent: '#FFD2F2', deep: '#86198F' },
}

export const FIXED_TOKENS = {
  foreground: '#F5F8FC',
  muted: '#C3CEDD',
  contrastText: '#0E1524',
  statusOk: '#34D399',
  statusWarn: '#FBBF24',
  statusError: '#FB7185',
  focusRing: '#7DD3FC',
} as const
