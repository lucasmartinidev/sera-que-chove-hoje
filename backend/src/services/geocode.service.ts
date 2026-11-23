import { memoryCache } from '../data/cache';
import { openMeteoClient } from '../data/openmeteo.client';
import { logger } from '../logger';
import { GeocodingCandidate } from '../types/geocoding-candidate';
import { OpenMeteoGeocodingResult } from '../types/open-meteo';

const GEOCODING_CACHE_PREFIX = 'geocode:';
const CITY_LOCALE = 'pt-BR';

function normalizeCity(city: string): string {
  return city.trim().toLocaleLowerCase(CITY_LOCALE);
}

function mapCandidate(result: OpenMeteoGeocodingResult): GeocodingCandidate {
  return {
    id: result.id,
    name: result.name,
    admin1: result.admin1 ?? null,
    country: result.country ?? null,
    countryCode: result.country_code ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? null,
    population: result.population ?? null,
  };
}

export async function findCandidates(city: string): Promise<GeocodingCandidate[]> {
  const normalizedCity = normalizeCity(city);
  const cacheKey = `${GEOCODING_CACHE_PREFIX}${normalizedCity}`;
  const cachedCandidates = memoryCache.get<GeocodingCandidate[]>(cacheKey);
  if (cachedCandidates !== undefined) {
    logger.info('Cache de geocodificação consultado', { result: 'hit' });
    return cachedCandidates;
  }
  logger.info('Cache de geocodificação consultado', { result: 'miss' });
  const results = await openMeteoClient.searchCity(normalizedCity);
  if (results.length === 0) logger.warn('Busca de cidade sem correspondências');
  const candidates = results.map(mapCandidate);
  memoryCache.set(cacheKey, candidates);
  return candidates;
}
