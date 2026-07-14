import express, { type Request, type Response } from 'express';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import securityMiddleware from './middlewares/security.middleware.js';
import apiRoutes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import env from './config/env.js';

export const createServer = () => {
  const app = express();

  app.set('trust proxy', 1);

  app
    .use(helmet())
    .use(cors({ credentials: true, origin: env.CLIENT_ORIGIN }))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
   // .use(securityMiddleware);

  app.get('/', (req: Request, res: Response) => {
    logger.info('Received request for /');
    res.send('Hello, World! The server is running.');
  });

  app.get('/health', (req: Request, res: Response) => {
    logger.info('Received request for /health');
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });

  app.use('/api', apiRoutes);
  app.use(errorMiddleware);

  return app;
};
