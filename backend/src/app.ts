import cors from 'cors';
import express, { Express } from 'express';
import { errorHandler } from './middleware/error-handler';
import { weatherRouter } from './routes/weather.routes';

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.get('/health', (_request, response) => {
    response.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });
  app.use('/api', weatherRouter);
  app.use(errorHandler);
  return app;
}
