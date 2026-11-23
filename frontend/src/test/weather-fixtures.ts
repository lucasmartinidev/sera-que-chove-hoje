import type { GeocodingCandidate } from '@/types/geocoding-candidate'
import type { WeatherData } from '@/types/weather'

export const lisbonCandidate: GeocodingCandidate = {
  id: 2267057,
  name: 'Lisboa',
  admin1: 'Lisboa',
  country: 'Portugal',
  countryCode: 'PT',
  latitude: 38.71667,
  longitude: -9.13333,
  timezone: 'Europe/Lisbon',
  population: 517802,
}

export const vitoriaCandidate: GeocodingCandidate = {
  id: 3445026,
  name: 'Vitória',
  admin1: 'Espírito Santo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -20.31944,
  longitude: -40.33778,
  timezone: 'America/Sao_Paulo',
  population: 369534,
}

export const rioCandidate: GeocodingCandidate = {
  id: 3451190,
  name: 'Vitória',
  admin1: 'Minas Gerais',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -19.19361,
  longitude: -42.67944,
  timezone: 'America/Sao_Paulo',
  population: 100000,
}

export const sampleWeather: WeatherData = {
  location: { latitude: -20.31944, longitude: -40.33778, timezone: 'America/Sao_Paulo', utcOffsetSeconds: -10800 },
  current: {
    time: '2026-11-22T12:00',
    temperatureC: 20,
    apparentTemperatureC: 21,
    relativeHumidity: 56,
    precipitationProbability: 30,
    precipitationMm: 0,
    weatherCode: 61,
    windSpeedKmh: 10,
    windDirectionDeg: 180,
    surfacePressureHpa: 1013,
    isDay: true,
  },
  hourly: [
    { time: '2026-11-22T13:00', temperatureC: 21, weatherCode: 1, precipitationProbability: 10, precipitationMm: 0 },
    { time: '2026-11-22T14:00', temperatureC: 22, weatherCode: 2, precipitationProbability: 20, precipitationMm: 0 },
    { time: '2026-11-22T15:00', temperatureC: 23, weatherCode: 3, precipitationProbability: 30, precipitationMm: 0.1 },
    { time: '2026-11-22T16:00', temperatureC: 22, weatherCode: null, precipitationProbability: 40, precipitationMm: 0 },
    { time: '2026-11-22T17:00', temperatureC: 21, weatherCode: 61, precipitationProbability: 50, precipitationMm: 0.2 },
    { time: '2026-11-22T18:00', temperatureC: 20, weatherCode: 0, precipitationProbability: 10, precipitationMm: 0 },
  ],
  units: { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm', pressure: 'hpa' },
}
