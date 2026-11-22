import type { Server } from 'node:http';
import { logger } from './logger';

export const SHUTDOWN_TIMEOUT_MS = 10000;

type HttpServer = Pick<Server, 'close'>;
type SignalTarget = Pick<NodeJS.Process, 'once'>;

export function registerGracefulShutdown(server: HttpServer, signalTarget: SignalTarget = process): void {
  let shutdownStarted = false;
  const shutdown = (signal: NodeJS.Signals): void => {
    if (shutdownStarted) return;
    shutdownStarted = true;
    logger.info('Sinal recebido; encerrando servidor', { signal });
    const forceExit = setTimeout(() => {
      logger.error('Prazo de encerramento excedido');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    server.close((error?: Error) => {
      if (error) {
        logger.error('Falha ao encerrar servidor HTTP', error);
        process.exitCode = 1;
      }
      clearTimeout(forceExit);
    });
  };
  signalTarget.once('SIGTERM', () => shutdown('SIGTERM'));
  signalTarget.once('SIGINT', () => shutdown('SIGINT'));
}
