import { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../logger';
import { ApiError } from '../types/api-error';
import { errorHandler } from './error-handler';

function createResponse(): Response {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json } as unknown as Response;
}

describe('errorHandler', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TU-21 serializa ApiError e oculta mensagens de erros inesperados', () => {
    const logError = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const upstreamResponse = createResponse();
    errorHandler(new ApiError({ code: 'UPSTREAM_ERROR', message: 'Tente novamente.' }), {} as Request, upstreamResponse, vi.fn() as NextFunction);
    expect(upstreamResponse.status).toHaveBeenCalledWith(502);
    expect(upstreamResponse.json).toHaveBeenCalledWith({ error: { code: 'UPSTREAM_ERROR', message: 'Tente novamente.' } });
    const validationResponse = createResponse();
    errorHandler(new ApiError({ code: 'INVALID_PARAM', message: 'Informe uma cidade.' }), {} as Request, validationResponse, vi.fn() as NextFunction);
    expect(validationResponse.status).toHaveBeenCalledWith(400);
    const internalResponse = createResponse();
    errorHandler(new Error('segredo interno'), {} as Request, internalResponse, vi.fn() as NextFunction);
    expect(internalResponse.status).toHaveBeenCalledWith(500);
    expect(internalResponse.json).toHaveBeenCalledWith({ error: { code: 'INTERNAL_ERROR', message: 'Ocorreu um erro interno. Tente novamente.' } });
    expect(logError).toHaveBeenCalledTimes(2);
  });
});
