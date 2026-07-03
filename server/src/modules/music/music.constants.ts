export const MAX_MUSIC_FILES = 1;
export const MUSIC_MAX_BYTES = 100 * 1024 * 1024;

export const MUSIC_EXTENSIONS = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'flac'] as const;

export const MUSIC_MIME_TYPES = [
  'audio/aac',
  'audio/flac',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/x-flac',
  'audio/x-m4a',
  'audio/x-wav',
  'application/ogg',
] as const;
