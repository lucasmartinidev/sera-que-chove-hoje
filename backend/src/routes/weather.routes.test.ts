import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';
import { openMeteoClient } from '../data/openmeteo.client';
import { logger } from '../logger';
import { ApiError, UPSTREAM_ERROR_MESSAGE } from '../types/api-error';

describe('GET /api/geocode', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TI-01 retorna candidatos para uma busca válida', async () => {
    const searchCity = vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([{
      id: 1,
      name: 'São Paulo',
      latitude: -23.5,
      longitude: -46.6,
      country: 'Brasil',
      country_code: 'BR',
    }]);
    const response = await request(createApp()).get('/api/geocode').query({ city: 'São Paulo' });
    expect(response.status).toBe(200);
    expect(response.body.candidates).toMatchObject([{ name: 'São Paulo', countryCode: 'BR', latitude: -23.5 }]);
    expect(searchCity).toHaveBeenCalledWith('são paulo');
  });

  it('TI-02 retorna INVALID_PARAM quando city está ausente ou curta', async () => {
    const searchCity = vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([]);
    const missing = await request(createApp()).get('/api/geocode');
    const short = await request(createApp()).get('/api/geocode').query({ city: 'a' });
    const blank = await request(createApp()).get('/api/geocode').query({ city: '   ' });
    expect(missing.status).toBe(400);
    expect(missing.body.error.code).toBe('INVALID_PARAM');
    expect(short.status).toBe(400);
    expect(blank.status).toBe(400);
    expect(searchCity).not.toHaveBeenCalled();
  });

  it('TI-03 retorna candidatos vazios quando não há correspondência', async () => {
    vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([]);
    const response = await request(createApp()).get('/api/geocode').query({ city: 'unknown location ti03' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ candidates: [] });
  });

  it('TI-04 converte falha da Open-Meteo em UPSTREAM_ERROR', async () => {
    vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    vi.spyOn(openMeteoClient, 'searchCity').mockRejectedValue(new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE }));
    const response = await request(createApp()).get('/api/geocode').query({ city: 'upstream failure ti04' });
    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_ERROR');
    expect(response.body.error.message).toBe(UPSTREAM_ERROR_MESSAGE);
  });

  it('TI-09 usa cache e evita chamadas externas repetidas', async () => {
    const searchCity = vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([]);
    const city = 'cache integration ti09';
    await request(createApp()).get('/api/geocode').query({ city });
    await request(createApp()).get('/api/geocode').query({ city });
    expect(searchCity).toHaveBeenCalledOnce();
  });
});
