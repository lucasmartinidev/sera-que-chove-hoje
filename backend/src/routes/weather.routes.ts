import { Router } from 'express';
import { getWeather } from '../services/weather.service';
import { ApiError } from '../types/api-error';
import { findCandidates } from '../services/geocode.service';

export const weatherRouter = Router();

const MIN_CITY_SEARCH_LENGTH = 2;
const LATITUDE_MIN = -90;
const LATITUDE_MAX = 90;
const LONGITUDE_MIN = -180;
const LONGITUDE_MAX = 180;
const INVALID_CITY_MESSAGE = 'Informe uma cidade com pelo menos 2 caracteres.';
const INVALID_COORDINATES_MESSAGE = 'Informe latitude e longitude válidas.';

function parseCoordinate(value: unknown, minimum: number, maximum: number): number | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) return undefined;
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate) || coordinate < minimum || coordinate > maximum) return undefined;
  return coordinate;
}

weatherRouter.get('/geocode', async (request, response) => {
  const city = request.query.city;
  if (typeof city !== 'string' || city.trim().length < MIN_CITY_SEARCH_LENGTH) {
    throw new ApiError({ code: 'INVALID_PARAM', message: INVALID_CITY_MESSAGE });
  }
  const candidates = await findCandidates(city);
  response.json({ candidates });
});

weatherRouter.get('/weather', async (request, response) => {
  const latitude = parseCoordinate(request.query.lat, LATITUDE_MIN, LATITUDE_MAX);
  const longitude = parseCoordinate(request.query.lon, LONGITUDE_MIN, LONGITUDE_MAX);
  if (latitude === undefined || longitude === undefined) {
    throw new ApiError({ code: 'INVALID_PARAM', message: INVALID_COORDINATES_MESSAGE });
  }
  const weather = await getWeather({ latitude, longitude });
  response.json(weather);
});
