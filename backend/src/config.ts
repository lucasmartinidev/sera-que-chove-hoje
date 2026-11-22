import 'dotenv/config';

const DEFAULT_PORT = 3000;
const DEFAULT_OPEN_METEO_TIMEOUT_MS = 8000;
const DEFAULT_CACHE_TTL_MS = 600000;
const DEFAULT_GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const DEFAULT_FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

export type BackendConfig = {
  port: number;
  geocodingApiUrl: string;
  forecastApiUrl: string;
  openMeteoTimeoutMs: number;
  cacheTtlMs: number;
};

function readPositiveInteger(name: string, value: string | undefined, defaultValue: number): number {
  const parsedValue = Number(value ?? defaultValue);
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} deve ser um inteiro positivo`);
  }
  return parsedValue;
}

function readPort(value: string | undefined): number {
  const port = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535');
  }
  return port;
}

function readHttpUrl(name: string, value: string | undefined, defaultValue: string): string {
  const url = value ?? defaultValue;
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(`${name} deve ser uma URL HTTP ou HTTPS válida`);
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new Error(`${name} deve usar HTTP ou HTTPS`);
  }
  return parsedUrl.toString();
}

export function parseConfig(environment: NodeJS.ProcessEnv): BackendConfig {
  return {
    port: readPort(environment.PORT),
    geocodingApiUrl: readHttpUrl('GEOCODING_API_URL', environment.GEOCODING_API_URL, DEFAULT_GEOCODING_API_URL),
    forecastApiUrl: readHttpUrl('FORECAST_API_URL', environment.FORECAST_API_URL, DEFAULT_FORECAST_API_URL),
    openMeteoTimeoutMs: readPositiveInteger('OPEN_METEO_TIMEOUT_MS', environment.OPEN_METEO_TIMEOUT_MS, DEFAULT_OPEN_METEO_TIMEOUT_MS),
    cacheTtlMs: readPositiveInteger('CACHE_TTL_MS', environment.CACHE_TTL_MS, DEFAULT_CACHE_TTL_MS),
  };
}

export const config = parseConfig(process.env);
