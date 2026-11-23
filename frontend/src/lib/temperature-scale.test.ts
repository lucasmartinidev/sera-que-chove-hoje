import { describe, expect, it } from 'vitest'
import { getTemperatureBand } from './temperature-scale'

describe('getTemperatureBand', () => {
  it('TU-45 maps exact temperature limits to the expected bands', () => {
    const cases = [
      [-10, 'extreme-cold'], [-9.9, 'very-cold'], [0, 'very-cold'], [0.1, 'cold'],
      [10, 'cold'], [10.1, 'cool'], [18, 'cool'], [18.1, 'mild'], [24, 'mild'],
      [24.1, 'warm'], [30, 'warm'], [30.1, 'very-warm'], [38, 'very-warm'], [38.1, 'extreme-heat'],
    ] as const
    cases.forEach(([temperature, id]) => expect(getTemperatureBand(temperature)?.id).toBe(id))
  })

  it('TU-46 clamps temperatures outside the scale to extreme bands', () => {
    expect(getTemperatureBand(-80)?.id).toBe('extreme-cold')
    expect(getTemperatureBand(55)?.id).toBe('extreme-heat')
  })

  it('TU-47 returns null when temperature is unavailable', () => {
    expect(getTemperatureBand(null)).toBeNull()
  })
})
