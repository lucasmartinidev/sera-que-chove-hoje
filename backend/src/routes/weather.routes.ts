import { Router } from 'express';
import { ApiError } from '../types/api-error';
import { findCandidates } from '../services/geocode.service';

export const weatherRouter = Router();

const MIN_CITY_SEARCH_LENGTH = 2;
const INVALID_CITY_MESSAGE = 'Informe uma cidade com pelo menos 2 caracteres.';

weatherRouter.get('/geocode', async (request, response) => {
  const city = request.query.city;
  if (typeof city !== 'string' || city.trim().length < MIN_CITY_SEARCH_LENGTH) {
    throw new ApiError({ code: 'INVALID_PARAM', message: INVALID_CITY_MESSAGE });
  }
  const candidates = await findCandidates(city);
  response.json({ candidates });
});
