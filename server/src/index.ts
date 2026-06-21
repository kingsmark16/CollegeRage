import env from './config/env.js';
import { createServer } from './server.js';

const server = createServer();

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode.`);
});
