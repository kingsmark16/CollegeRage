import express, { Request, Response } from 'express';
import logger from './config/logger.js';
import helmet from "helmet";
import morgan from 'morgan';
import cors from 'cors';
import securityMiddleware from './middlewares/security.middleware.js';

export const createServer = () => {
  const app = express();

  app
    .use(helmet())
    .use(cors())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
    .use(securityMiddleware);

  app.get('/', (req: Request, res: Response) => {
    logger.info('Received request for /');
    res.send('Hello, World Dockers');
  });

  app.get('/health', (req: Request, res: Response) => {
    logger.info('Received request for /health');
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
  });


  return app;
};
