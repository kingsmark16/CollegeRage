import env from './config/env.js';
import logger from './config/logger.js';
import { createServer } from './server.js';

const server = createServer();

server.listen(env.PORT, () => {
  logger.info(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});
