import { createApp } from './app';
import { config } from './config';
import { logger } from './logger';
import { registerGracefulShutdown } from './server-lifecycle';

const server = createApp().listen(config.port, () => {
  logger.info(`Servidor iniciado na porta ${config.port}`);
});

registerGracefulShutdown(server);
