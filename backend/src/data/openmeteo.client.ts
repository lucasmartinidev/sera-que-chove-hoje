import { config } from '../config';
import { ApiError, UPSTREAM_ERROR_MESSAGE } from '../types/api-error';
import { Coordinates } from '../types/weather';
import { OpenMeteoForecast, OpenMeteoGeocodingResult } from '../types/open-meteo';
import { parseForecast, parseGeocodingResults } from './openmeteo.parser';

const GEOCODING_COUNT = 10;
const GEOCODING_LANGUAGE = 'pt';
const GEOCODING_FORMAT = 'json';
const CURRENT_VARIABLES = 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m';
const HOURLY_VARIABLES = 'temperature_2m,weather_code,precipitation_probability,precipitation';

export type OpenMeteoClient = {
  searchCity(name: string): Promise<OpenMeteoGeocodingResult[]>;
  fetchForecast(coords: Coordinates): Promise<OpenMeteoForecast>;
};

function buildGeocodingUrl(name: string): string {
  const url = new URL(config.geocodingApiUrl);
  url.searchParams.set('name', name);
  url.searchParams.set('count', String(GEOCODING_COUNT));
  url.searchParams.set('language', GEOCODING_LANGUAGE);
  url.searchParams.set('format', GEOCODING_FORMAT);
  return url.toString();
}

function buildForecastUrl(coords: Coordinates): string {
  const url = new URL(config.forecastApiUrl);
  url.searchParams.set('latitude', String(coords.latitude));
  url.searchParams.set('longitude', String(coords.longitude));
  url.searchParams.set('current', CURRENT_VARIABLES);
  url.searchParams.set('hourly', HOURLY_VARIABLES);
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('temperature_unit', 'celsius');
  url.searchParams.set('wind_speed_unit', 'kmh');
  url.searchParams.set('precipitation_unit', 'mm');
  url.searchParams.set('forecast_days', '2');
  return url.toString();
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.openMeteoTimeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE });
    const payload: unknown = await response.json();
    return payload;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    throw new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE });
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCity(name: string): Promise<OpenMeteoGeocodingResult[]> {
  return parseGeocodingResults(await fetchJson(buildGeocodingUrl(name)));
}

export async function fetchForecast(coords: Coordinates): Promise<OpenMeteoForecast> {
  return parseForecast(await fetchJson(buildForecastUrl(coords)));
}

export const openMeteoClient: OpenMeteoClient = { searchCity, fetchForecast };
