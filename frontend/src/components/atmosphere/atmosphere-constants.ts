export const THEME_TRANSITION_MS = 600
export const THUNDER_FLASH_CYCLE_MS = 8000
export const STAR_SHIMMER_CYCLE_MS = 6000
export const RAIN_FALL_CYCLE_MS = 1200
export const SNOW_FALL_CYCLE_MS = 6000
export const PARTICLE_DENSITY = { desktop: { rain: 60, snow: 40 }, small: { rain: 24, snow: 16 } } as const

export type AtmosphereMotion = {
  reduced: boolean
  transitionMs: number
}
