import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import { openMeteoClient } from '../data/openmeteo.client';
import { logger } from '../logger';
import { ApiError, UPSTREAM_ERROR_MESSAGE } from '../types/api-error';
import { OpenMeteoForecast } from '../types/open-meteo';

function makeForecast(): OpenMeteoForecast {
  return {
    current: { time: '2026-11-22T10:00', is_day: 1, weather_code: 1 },
    hourly: {
      time: ['2026-11-22T10:00', '2026-11-22T11:00', '2026-11-22T12:00', '2026-11-22T13:00', '2026-11-22T14:00', '2026-11-22T15:00', '2026-11-22T16:00'],
      temperature_2m: [22, 23, 24, 25, 26, 27, 28],
      weather_code: [1, 2, 3, 3, 2, 1, 0],
      precipitation_probability: [10, 20, 30, 40, 50, 60, 70],
      precipitation: [0, 0, 0.1, 0.2, 0.3, 0, 0],
    },
  };
}

describe('GET /api/weather', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TI-05 retorna clima para coordenadas válidas', async () => {
    vi.spyOn(openMeteoClient, 'fetchForecast').mockResolvedValue(makeForecast());
    const response = await request(createApp()).get('/api/weather').query({ lat: '-50.11', lon: '-80.11' });
    expect(response.status).toBe(200);
    expect(response.body.location).toMatchObject({ latitude: -50.11, longitude: -80.11, timezone: null });
    expect(response.body.current.weatherCode).toBe(1);
    expect(response.body.hourly).toHaveLength(6);
  });

  it('TI-06 rejeita coordenadas ausentes, inválidas ou fora de faixa', async () => {
    const fetchForecast = vi.spyOn(openMeteoClient, 'fetchForecast').mockResolvedValue(makeForecast());
    const missing = await request(createApp()).get('/api/weather');
    const invalid = await request(createApp()).get('/api/weather').query({ lat: 'abc', lon: '-80' });
    const outOfRange = await request(createApp()).get('/api/weather').query({ lat: '91', lon: '-80' });
    expect([missing.status, invalid.status, outOfRange.status]).toEqual([400, 400, 400]);
    expect(missing.body.error.code).toBe('INVALID_PARAM');
    expect(fetchForecast).not.toHaveBeenCalled();
  });

  it('TI-07 converte falha do serviço em UPSTREAM_ERROR', async () => {
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    vi.spyOn(openMeteoClient, 'fetchForecast').mockRejectedValue(new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE }));
    const response = await request(createApp()).get('/api/weather').query({ lat: '-51', lon: '-81' });
    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
  });
});
