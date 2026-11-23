import { describe, expect, it } from 'vitest'
import { getConditionFamily } from './condition-family'

describe('getConditionFamily', () => {
  it('TU-48 maps every WMO family code deterministically', () => {
    const cases = [
      [[0], 'clear'], [[1, 2, 3], 'cloudy'], [[45, 48], 'fog'],
      [[51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], 'rain'],
      [[71, 73, 75, 77, 85, 86], 'snow'], [[95, 96, 97, 99], 'thunderstorm'],
    ] as const
    cases.forEach(([codes, family]) => codes.forEach((code) => expect(getConditionFamily(code)).toBe(family)))
  })

  it('TU-48 maps unknown and missing codes to neutral', () => {
    expect(getConditionFamily(999)).toBe('neutral')
    expect(getConditionFamily(null)).toBe('neutral')
  })
})
