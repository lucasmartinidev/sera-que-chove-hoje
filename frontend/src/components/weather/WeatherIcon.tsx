import { Cloud } from 'lucide-react'
import { describeWeatherCode } from '@/lib/weather-codes'

type WeatherIconProps = {
  code: number | null
  className?: string
  isDay?: boolean
}

export function WeatherIcon({ code, className, isDay = true }: WeatherIconProps) {
  const Icon = code === null ? Cloud : describeWeatherCode(code, isDay).icon
  return <Icon aria-hidden="true" className={className} focusable="false" strokeWidth={1.7} />
}
