import { NextFunction, Request, Response } from 'express';
import { logger } from '../logger';
import { ApiError, ApiErrorEnvelope } from '../types/api-error';

const INTERNAL_ERROR_MESSAGE = 'Ocorreu um erro interno. Tente novamente.';

function errorEnvelope(code: ApiErrorEnvelope['error']['code'], message: string): ApiErrorEnvelope {
  return { error: { code, message } };
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof ApiError) {
    if (error.statusCode >= 500) {
      logger.error('Falha ao processar requisição', error);
    }
    response.status(error.statusCode).json(errorEnvelope(error.code, error.message));
    return;
  }
  logger.error('Erro inesperado ao processar requisição', error);
  response.status(500).json(errorEnvelope('INTERNAL_ERROR', INTERNAL_ERROR_MESSAGE));
}
