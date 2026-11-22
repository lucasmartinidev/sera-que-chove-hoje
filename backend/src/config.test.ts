import { describe, expect, it } from 'vitest';
import { parseConfig } from './config';

describe('parseConfig', () => {
  it('TU-09 aplica os padrões e rejeita configuração inválida', () => {
    const defaults = parseConfig({});
    expect(defaults).toMatchObject({
      port: 3000,
      geocodingApiUrl: 'https://geocoding-api.open-meteo.com/v1/search',
      forecastApiUrl: 'https://api.open-meteo.com/v1/forecast',
      openMeteoTimeoutMs: 8000,
      cacheTtlMs: 600000,
    });
    expect(parseConfig({ PORT: '3100', OPEN_METEO_TIMEOUT_MS: '5000' })).toMatchObject({ port: 3100, openMeteoTimeoutMs: 5000 });
    expect(() => parseConfig({ PORT: '70000' })).toThrow('PORT deve ser um inteiro');
    expect(() => parseConfig({ CACHE_TTL_MS: '0' })).toThrow('CACHE_TTL_MS deve ser um inteiro positivo');
    expect(() => parseConfig({ GEOCODING_API_URL: 'não é URL' })).toThrow('deve ser uma URL HTTP ou HTTPS válida');
    expect(() => parseConfig({ GEOCODING_API_URL: 'file:///tmp/api' })).toThrow('deve usar HTTP ou HTTPS');
  });
});
