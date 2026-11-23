import { ApiError, UPSTREAM_ERROR_MESSAGE } from '../types/api-error';
import {
  OpenMeteoCurrent,
  OpenMeteoForecast,
  OpenMeteoGeocodingResult,
  OpenMeteoHourly,
} from '../types/open-meteo';

type UnknownRecord = Record<string, unknown>;

const GEOCODING_OPTIONAL_STRINGS = ['admin1', 'country', 'country_code', 'timezone'];
const CURRENT_OPTIONAL_NUMBERS = ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'precipitation', 'wind_speed_10m', 'wind_direction_10m', 'surface_pressure'];
const HOURLY_OPTIONAL_ARRAYS = ['temperature_2m', 'weather_code', 'precipitation_probability', 'precipitation'];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOptionalNumber(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isOptionalFiniteNumber(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

function isValidDateTime(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})?$/.test(value) && Number.isFinite(Date.parse(value));
}

function hasValidOptionalStrings(record: UnknownRecord, fields: string[]): boolean {
  return fields.every((field) => record[field] === undefined || typeof record[field] === 'string');
}

function hasValidOptionalNumbers(record: UnknownRecord, fields: string[]): boolean {
  return fields.every((field) => isOptionalNumber(record[field]));
}

function isGeocodingResult(value: unknown): value is OpenMeteoGeocodingResult {
  if (!isRecord(value)) return false;
  return Number.isInteger(value.id) && typeof value.name === 'string' && Number.isFinite(value.latitude) && Number.isFinite(value.longitude) && hasValidOptionalStrings(value, GEOCODING_OPTIONAL_STRINGS) && isOptionalFiniteNumber(value.population);
}

export function parseGeocodingResults(payload: unknown): OpenMeteoGeocodingResult[] {
  if (!isRecord(payload)) throw new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE });
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results) || !payload.results.every(isGeocodingResult)) {
    throw new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE });
  }
  return payload.results;
}

function isCurrent(value: unknown): value is OpenMeteoCurrent {
  if (!isRecord(value)) return false;
  return isValidDateTime(value.time) && (value.is_day === 0 || value.is_day === 1) && Number.isInteger(value.weather_code) && hasValidOptionalNumbers(value, CURRENT_OPTIONAL_NUMBERS);
}

function isNumberArray(value: unknown, expectedLength: number): boolean {
  return Array.isArray(value) && value.length === expectedLength && value.every(isOptionalNumber);
}

function isHourly(value: unknown): value is OpenMeteoHourly {
  if (!isRecord(value)) return false;
  const times = value.time;
  if (!Array.isArray(times) || !times.every(isValidDateTime)) return false;
  return HOURLY_OPTIONAL_ARRAYS.every((field) => value[field] === undefined || isNumberArray(value[field], times.length));
}

function isForecast(value: unknown): value is OpenMeteoForecast {
  if (!isRecord(value) || !isCurrent(value.current) || !isHourly(value.hourly)) return false;
  const validTimezone = value.timezone === undefined || typeof value.timezone === 'string';
  const validOffset = value.utc_offset_seconds === undefined || Number.isInteger(value.utc_offset_seconds);
  return validTimezone && validOffset;
}

export function parseForecast(payload: unknown): OpenMeteoForecast {
  if (!isForecast(payload)) throw new ApiError({ code: 'UPSTREAM_ERROR', message: UPSTREAM_ERROR_MESSAGE });
  return payload;
}
