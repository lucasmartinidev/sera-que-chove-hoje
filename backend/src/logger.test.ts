import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  afterEach(() => vi.restoreAllMocks());

  it('TU-22 escreve logs JSON estruturados pelo adaptador central', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    logger.info('Servidor iniciado', { port: 3000 });
    logger.warn('Sem correspondências');
    logger.error('Falha na requisição', new Error('indisponível'));
    logger.error('Falha sem objeto Error', 'detalhe');
    logger.error('Falha sem causa');
    expect(JSON.parse(log.mock.calls[0][0])).toMatchObject({ level: 'info', message: 'Servidor iniciado', port: 3000 });
    expect(JSON.parse(log.mock.calls[1][0])).toMatchObject({ level: 'warn', message: 'Sem correspondências' });
    expect(JSON.parse(error.mock.calls[0][0])).toMatchObject({ level: 'error', message: 'Falha na requisição', error: 'indisponível' });
    expect(JSON.parse(error.mock.calls[1][0])).toMatchObject({ error: 'detalhe' });
    expect(JSON.parse(error.mock.calls[2][0])).toMatchObject({ level: 'error', message: 'Falha sem causa' });
  });
});
