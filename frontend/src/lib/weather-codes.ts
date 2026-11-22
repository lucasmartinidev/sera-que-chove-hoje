import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Snowflake,
  Sun,
} from 'lucide-react'
import type { WeatherCondition } from '@/types/weather-code'

const WEATHER_CONDITIONS: Record<number, WeatherCondition> = {
  0: { labelPtBr: 'Céu limpo', icon: Sun },
  1: { labelPtBr: 'Predominantemente limpo', icon: CloudSun },
  2: { labelPtBr: 'Parcialmente nublado', icon: CloudSun },
  3: { labelPtBr: 'Nublado', icon: Cloud },
  45: { labelPtBr: 'Nevoeiro', icon: CloudFog },
  48: { labelPtBr: 'Nevoeiro com deposição de gelo', icon: CloudFog },
  51: { labelPtBr: 'Chuvisco fraco', icon: CloudDrizzle },
  53: { labelPtBr: 'Chuvisco moderado', icon: CloudDrizzle },
  55: { labelPtBr: 'Chuvisco denso', icon: CloudDrizzle },
  56: { labelPtBr: 'Chuvisco congelante fraco', icon: CloudDrizzle },
  57: { labelPtBr: 'Chuvisco congelante denso', icon: CloudDrizzle },
  61: { labelPtBr: 'Chuva fraca', icon: CloudRain },
  63: { labelPtBr: 'Chuva moderada', icon: CloudRain },
  65: { labelPtBr: 'Chuva forte', icon: CloudRain },
  66: { labelPtBr: 'Chuva congelante fraca', icon: CloudRain },
  67: { labelPtBr: 'Chuva congelante forte', icon: CloudRain },
  71: { labelPtBr: 'Neve fraca', icon: CloudSnow },
  73: { labelPtBr: 'Neve moderada', icon: CloudSnow },
  75: { labelPtBr: 'Neve forte', icon: CloudSnow },
  77: { labelPtBr: 'Grãos de neve', icon: Snowflake },
  80: { labelPtBr: 'Pancadas de chuva fracas', icon: CloudRain },
  81: { labelPtBr: 'Pancadas de chuva moderadas', icon: CloudRain },
  82: { labelPtBr: 'Pancadas de chuva violentas', icon: CloudRain },
  85: { labelPtBr: 'Pancadas de neve fracas', icon: CloudSnow },
  86: { labelPtBr: 'Pancadas de neve fortes', icon: CloudSnow },
  95: { labelPtBr: 'Trovoada', icon: CloudLightning },
  96: { labelPtBr: 'Trovoada com granizo leve', icon: CloudLightning },
  97: { labelPtBr: 'Trovoada forte', icon: CloudLightning },
  99: { labelPtBr: 'Trovoada com granizo forte', icon: CloudLightning },
}

const UNKNOWN_CONDITION: WeatherCondition = { labelPtBr: 'Condição desconhecida', icon: Cloud }

export function describeWeatherCode(code: number): WeatherCondition {
  return WEATHER_CONDITIONS[code] ?? UNKNOWN_CONDITION
}
