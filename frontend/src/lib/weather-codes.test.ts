import { describe, expect, it } from 'vitest'
import { CloudRain, Cloud } from 'lucide-react'
import { describeWeatherCode } from './weather-codes'

describe('describeWeatherCode', () => {
  it('TU-10 maps known WMO codes to Portuguese descriptions and icons', () => {
    expect(describeWeatherCode(61)).toEqual({ labelPtBr: 'Chuva fraca', icon: CloudRain })
  })

  it('TU-10 returns a fallback for unknown WMO codes', () => {
    expect(describeWeatherCode(999)).toEqual({ labelPtBr: 'Condição desconhecida', icon: Cloud })
  })
})
