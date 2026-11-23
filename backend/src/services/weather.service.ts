import { memoryCache } from '../data/cache';
import { openMeteoClient } from '../data/openmeteo.client';
import { logger } from '../logger';
import { Coordinates, CurrentWeather, HourForecast, WeatherData, WeatherUnits } from '../types/weather';
import { OpenMeteoForecast } from '../types/open-meteo';

const FORECAST_HOUR_COUNT = 6;
const WEATHER_CACHE_PREFIX = 'weather:';
const WEATHER_UNITS: WeatherUnits = { temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm', pressure: 'hpa' };

function cacheKey(coords: Coordinates): string {
  return `${WEATHER_CACHE_PREFIX}${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`;
}

function hourlyValue(values: Array<number | null> | undefined, index: number | undefined): number | null {
  if (values === undefined || index === undefined) return null;
  return values[index] ?? null;
}

function findClosestHourIndex(times: string[], currentTime: string): number | undefined {
  const targetTime = Date.parse(currentTime);
  if (!Number.isFinite(targetTime) || times.length === 0) return undefined;
  let closestIndex = -1;
  let closestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < times.length; index += 1) {
    const hourTime = Date.parse(times[index]);
    const distance = Math.abs(hourTime - targetTime);
    if (Number.isFinite(distance) && distance < closestDistance) {
      closestIndex = index;
      closestDistance = distance;
    }
  }
  return closestIndex < 0 ? undefined : closestIndex;
}

function currentWeather(forecast: OpenMeteoForecast): CurrentWeather {
  const current = forecast.current;
  const probabilityIndex = findClosestHourIndex(forecast.hourly.time, current.time);
  return {
    time: current.time,
    temperatureC: current.temperature_2m ?? null,
    apparentTemperatureC: current.apparent_temperature ?? null,
    relativeHumidity: current.relative_humidity_2m ?? null,
    precipitationProbability: hourlyValue(forecast.hourly.precipitation_probability, probabilityIndex),
    precipitationMm: current.precipitation ?? null,
    weatherCode: current.weather_code,
    windSpeedKmh: current.wind_speed_10m ?? null,
    windDirectionDeg: current.wind_direction_10m ?? null,
    surfacePressureHpa: current.surface_pressure ?? null,
    isDay: current.is_day === 1,
  };
}

function hourlyForecast(forecast: OpenMeteoForecast, startIndex: number): HourForecast[] {
  if (startIndex < 0) return [];
  const times = forecast.hourly.time.slice(startIndex, startIndex + FORECAST_HOUR_COUNT);
  return times.map((time, offset) => {
    const index = startIndex + offset;
    return {
      time,
      temperatureC: hourlyValue(forecast.hourly.temperature_2m, index),
      weatherCode: hourlyValue(forecast.hourly.weather_code, index),
      precipitationProbability: hourlyValue(forecast.hourly.precipitation_probability, index),
      precipitationMm: hourlyValue(forecast.hourly.precipitation, index),
    };
  });
}

function mapWeather(coords: Coordinates, forecast: OpenMeteoForecast): WeatherData {
  const startIndex = forecast.hourly.time.findIndex((time) => time >= forecast.current.time);
  const weather = {
    location: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: forecast.timezone ?? null,
      utcOffsetSeconds: forecast.utc_offset_seconds ?? null,
    },
    current: currentWeather(forecast),
    hourly: hourlyForecast(forecast, startIndex),
    units: WEATHER_UNITS,
  };
  if (weather.current.precipitationProbability === null) logger.warn('Probabilidade de precipitação indisponível');
  return weather;
}

export async function getWeather(coords: Coordinates): Promise<WeatherData> {
  const key = cacheKey(coords);
  const cachedWeather = memoryCache.get<WeatherData>(key);
  if (cachedWeather !== undefined) {
    logger.info('Cache de clima consultado', { result: 'hit' });
    return cachedWeather;
  }
  logger.info('Cache de clima consultado', { result: 'miss' });
  const forecast = await openMeteoClient.fetchForecast(coords);
  const weather = mapWeather(coords, forecast);
  memoryCache.set(key, weather);
  return weather;
}
