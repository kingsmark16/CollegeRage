import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  NEON_AUTH_BASE_URL: process.env.NEON_AUTH_BASE_URL,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ARCJET_KEY: process.env.ARCJET_KEY!,
  DROPBOX_REDIRECT_URI: process.env.DROPBOX_REDIRECT_URI,
  DROPBOX_CLIENT_ID: process.env.DROPBOX_CLIENT_ID,
  DROPBOX_CLIENT_SECRET: process.env.DROPBOX_CLIENT_SECRET,
  DROPBOX_TOKEN_ENCRYPTION_KEY: process.env.DROPBOX_TOKEN_ENCRYPTION_KEY,
  DROPBOX_UPLOAD_ROOT: process.env.DROPBOX_UPLOAD_ROOT || '/uploads',
  FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg',
  FFPROBE_PATH: process.env.FFPROBE_PATH || 'ffprobe',
  MEDIA_TEMP_DIR: process.env.MEDIA_TEMP_DIR,
  MEDIA_VIDEO_CONCURRENCY: Number(process.env.MEDIA_VIDEO_CONCURRENCY || 1),
  DROPBOX_UPLOAD_RETRIES: Number(process.env.DROPBOX_UPLOAD_RETRIES || 3),
};

export default env;
