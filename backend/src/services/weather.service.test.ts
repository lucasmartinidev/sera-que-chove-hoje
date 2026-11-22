import { afterEach, describe, expect, it, vi } from 'vitest';
import { openMeteoClient } from '../data/openmeteo.client';
import { ApiError, UPSTREAM_ERROR_MESSAGE } from '../types/api-error';
import { OpenMeteoForecast } from '../types/open-meteo';
import { getWeather } from './weather.service';

function makeForecast(): OpenMeteoForecast {
  return {
    current: {
      time: '2026-11-22T10:15',
      temperature_2m: 22,
      apparent_temperature: 23,
      relative_humidity_2m: 60,
      is_day: 1,
      precipitation: 0,
      weather_code: 1,
      wind_speed_10m: 12,
      wind_direction_10m: 180,
      surface_pressure: 1013,
    },
    hourly: {
      time: ['2026-11-22T10:00', '2026-11-22T11:00', '2026-11-22T12:00', '2026-11-22T13:00', '2026-11-22T14:00', '2026-11-22T15:00', '2026-11-22T16:00'],
      temperature_2m: [22, 23, 24, 25, 26, 27, 28],
      weather_code: [1, 2, 3, 3, 2, 1, 0],
      precipitation_probability: [30, 40, 50, 60, 70, 80, 90],
      precipitation: [0, 0, 0.1, 0.2, 0.3, 0, 0],
    },
    timezone: 'America/Sao_Paulo',
    utc_offset_seconds: -10800,
  };
}

describe('getWeather', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TU-04 mapeia clima atual e retorna as próximas seis horas', async () => {
    vi.spyOn(openMeteoClient, 'fetchForecast').mockResolvedValue(makeForecast());
    const weather = await getWeather({ latitude: -40.01, longitude: -70.01 });
    expect(weather.current).toMatchObject({ temperatureC: 22, apparentTemperatureC: 23, relativeHumidity: 60, isDay: true });
    expect(weather.hourly).toHaveLength(6);
    expect(weather.hourly[0]).toMatchObject({ time: '2026-11-22T11:00', temperatureC: 23, weatherCode: 2, precipitationProbability: 40 });
    expect(weather.units).toEqual({ temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm', pressure: 'hpa' });
  });

  it('TU-05 deriva a probabilidade atual da hora mais próxima e normaliza ausência para null', async () => {
    const fetchForecast = vi.spyOn(openMeteoClient, 'fetchForecast');
    fetchForecast.mockResolvedValueOnce(makeForecast());
    const forecastWithoutProbability = makeForecast();
    delete forecastWithoutProbability.hourly.precipitation_probability;
    fetchForecast.mockResolvedValueOnce(forecastWithoutProbability);
    const withProbability = await getWeather({ latitude: -41.02, longitude: -71.02 });
    const withoutProbability = await getWeather({ latitude: -42.03, longitude: -72.03 });
    expect(withProbability.current.precipitationProbability).toBe(30);
    expect(withoutProbability.current.precipitationProbability).toBeNull();
  });

  it('TU-06 propaga falha do cliente como UPSTREAM_ERROR', async () => {
    vi.spyOn(openMeteoClient, 'fetchForecast').mockRejectedValue(new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE }));
    await expect(getWeather({ latitude: -43.04, longitude: -73.04 })).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', statusCode: 502 });
  });
});
