export const MAX_MEDIA_FILES = 10;

export const IMAGE_MAX_BYTES = 20 * 1024 * 1024;
export const VIDEO_MAX_BYTES = Math.floor(1.5 * 1024 * 1024 * 1024);

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'] as const;
export const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'avi', 'webm'] as const;

export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/x-msvideo',
  'video/webm',
] as const;

export const BLOCKED_EXTENSIONS = new Set([
  'bat',
  'bin',
  'cmd',
  'com',
  'dll',
  'exe',
  'js',
  'msi',
  'ps1',
  'scr',
  'sh',
  'vbs',
]);

export const VIDEO_VARIANTS = [
  { quality: 'P480', label: '480p', height: 480 },
  { quality: 'P720', label: '720p', height: 720 },
  { quality: 'P1080', label: '1080p', height: 1080 },
] as const;

export const THUMBNAIL_SEEK_SECONDS = 3;
