import { afterEach, describe, expect, it, vi } from 'vitest';
import { config } from '../config';
import { fetchForecast, searchCity } from './openmeteo.client';

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status });
}

describe('Open-Meteo client', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('TU-26 constrói a busca de geocodificação e decodifica resultados vazios ou válidos', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 1, name: 'São Paulo', latitude: -23.5, longitude: -46.6 }] }))
      .mockResolvedValueOnce(jsonResponse({}));
    vi.stubGlobal('fetch', fetchMock);
    expect(await searchCity('São Paulo')).toMatchObject([{ id: 1, name: 'São Paulo', latitude: -23.5, longitude: -46.6 }]);
    expect(await searchCity('inexistente')).toEqual([]);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('name')).toBe('São Paulo');
    expect(url.searchParams.get('count')).toBe('10');
    expect(url.searchParams.get('language')).toBe('pt');
    expect(url.searchParams.get('format')).toBe('json');
  });

  it('TU-27 consulta previsão com parâmetros métricos e valida o payload', async () => {
    const payload = {
      current: { time: '2026-11-22T12:00', is_day: 1, weather_code: 1 },
      hourly: { time: ['2026-11-22T12:00'], temperature_2m: [22] },
      timezone: 'America/Sao_Paulo',
      utc_offset_seconds: -10800,
    };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(payload));
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchForecast({ latitude: -23.5, longitude: -46.6 })).toEqual(payload);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');
    expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
    expect(url.searchParams.get('precipitation_unit')).toBe('mm');
    expect(url.searchParams.get('forecast_days')).toBe('2');
    expect(url.searchParams.get('current')).toContain('surface_pressure');
    expect(url.searchParams.get('hourly')).toContain('precipitation_probability');
  });

  it('TU-07 aborta a chamada ao exceder o timeout configurado', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn((_url: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    vi.stubGlobal('fetch', fetchMock);
    const pendingRequest = searchCity('Lisboa');
    const rejection = expect(pendingRequest).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', statusCode: 502 });
    await vi.advanceTimersByTimeAsync(config.openMeteoTimeoutMs);
    await rejection;
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it('TU-28 converte erro HTTP e resposta inválida em UPSTREAM_ERROR', async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({}, 503))
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 'inválido' }] }))
      .mockResolvedValueOnce(jsonResponse({ results: [{ id: 1, name: 'Lisboa', latitude: 38.7, longitude: -9.1, population: null }] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(searchCity('Lisboa')).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', statusCode: 502 });
    await expect(searchCity('Lisboa')).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', statusCode: 502 });
    await expect(searchCity('Lisboa')).rejects.toMatchObject({ code: 'UPSTREAM_ERROR', statusCode: 502 });
  });
});
