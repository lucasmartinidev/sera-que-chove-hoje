import { describe, expect, it } from 'vitest'
import { contrastRatio, meetsNonTextAA, meetsTextAA, relativeLuminance } from './contrast'

describe('contrast utilities', () => {
  it('TU-49 calculates relative luminance and WCAG contrast ratio', () => {
    expect(relativeLuminance('#000')).toBe(0)
    expect(relativeLuminance('#fff')).toBe(1)
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#abc', '#aabbcc')).toBeCloseTo(1, 5)
  })

  it('TU-49 exposes text and non-text AA predicates', () => {
    expect(meetsTextAA('#000', '#fff')).toBe(true)
    expect(meetsTextAA('#777', '#fff')).toBe(false)
    expect(meetsNonTextAA('#777', '#fff')).toBe(true)
  })
})
