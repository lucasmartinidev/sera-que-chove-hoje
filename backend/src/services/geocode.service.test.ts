import { afterEach, describe, expect, it, vi } from 'vitest';
import { findCandidates } from './geocode.service';
import { openMeteoClient } from '../data/openmeteo.client';
import { logger } from '../logger';

describe('findCandidates', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TU-01 mapeia resultados Open-Meteo para candidatos normalizados', async () => {
    vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([{
      id: 1,
      name: 'Lisboa',
      latitude: 38.7,
      longitude: -9.1,
      country: 'Portugal',
      country_code: 'PT',
      admin1: 'Lisboa',
      timezone: 'Europe/Lisbon',
      population: 545000,
    }, {
      id: 2,
      name: 'Porto',
      latitude: 41.1,
      longitude: -8.6,
    }]);
    const candidates = await findCandidates('service mapping task three');
    expect(candidates).toEqual([{
      id: 1,
      name: 'Lisboa',
      admin1: 'Lisboa',
      country: 'Portugal',
      countryCode: 'PT',
      latitude: 38.7,
      longitude: -9.1,
      timezone: 'Europe/Lisbon',
      population: 545000,
    }, {
      id: 2,
      name: 'Porto',
      admin1: null,
      country: null,
      countryCode: null,
      latitude: 41.1,
      longitude: -8.6,
      timezone: null,
      population: null,
    }]);
  });

  it('TU-02 retorna lista vazia quando a Open-Meteo não encontra cidades', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([]);
    await expect(findCandidates('city not found task three')).resolves.toEqual([]);
    expect(warn).toHaveBeenCalledWith('Busca de cidade sem correspondências');
  });

  it('TU-03 normaliza caixa e espaços e reutiliza a chave de cache', async () => {
    const searchCity = vi.spyOn(openMeteoClient, 'searchCity').mockResolvedValue([]);
    await findCandidates('  cache normalization task three  ');
    await findCandidates('CACHE NORMALIZATION TASK THREE');
    expect(searchCity).toHaveBeenCalledOnce();
    expect(searchCity).toHaveBeenCalledWith('cache normalization task three');
  });
});
