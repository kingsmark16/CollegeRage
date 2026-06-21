import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ARCJET_ENV: process.env.ARCJET_ENV || 'development',
  ARCJET_KEY: process.env.ARCJET_KEY!,
};

export default env;
