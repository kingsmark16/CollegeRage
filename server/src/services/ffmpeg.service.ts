import { spawn } from 'node:child_process';
import path from 'node:path';
import AppError from '../common/errors/AppError.js';
import { ensureDirectory, getFileSize, safeJoin } from '../common/utils/file.js';
import env from '../config/env.js';
import { THUMBNAIL_SEEK_SECONDS, VIDEO_VARIANTS } from '../modules/media/media.constants.js';
import type {
  ProcessedThumbnail,
  ProcessedVideo,
  ProcessedVideoVariant,
  VideoMetadata,
} from '../modules/media/media.types.js';

type ProbeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  duration?: string;
};

type ProbeOutput = {
  streams?: ProbeStream[];
  format?: {
    duration?: string;
  };
};

type FfmpegOutput = {
  filePath: string;
  width: number;
  height: number;
  sizeBytes: number;
};

let activeVideoJobs = 0;
const videoQueue: Array<() => void> = [];

const acquireVideoSlot = async () => {
  const maxConcurrency = Math.max(1, env.MEDIA_VIDEO_CONCURRENCY);

  if (activeVideoJobs < maxConcurrency) {
    activeVideoJobs += 1;
    return;
  }

  await new Promise<void>((resolve) => videoQueue.push(resolve));
  activeVideoJobs += 1;
};

const releaseVideoSlot = () => {
  activeVideoJobs = Math.max(0, activeVideoJobs - 1);
  const nextJob = videoQueue.shift();

  if (nextJob) {
    nextJob();
  }
};

const getTargetVariants = (metadata: VideoMetadata) => {
  const sourceHeight = metadata.height ?? 0;
  const supportedVariants = VIDEO_VARIANTS.filter((variant) => sourceHeight >= variant.height);

  if (supportedVariants.length > 0) {
    return supportedVariants;
  }

  return VIDEO_VARIANTS.slice(0, 1);
};

const runProcess = async (command: string, args: string[], failureMessage: string) =>
  new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => {
      if (Buffer.concat(stderrChunks).length < 16_384) {
        stderrChunks.push(chunk);
      }
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') {
        reject(new AppError(`${command} was not found. Install FFmpeg or set the correct ${command === env.FFPROBE_PATH ? 'FFPROBE_PATH' : 'FFMPEG_PATH'} value.`, 500));
        return;
      }

      reject(new AppError(`${failureMessage}: ${error.message}`, 500));
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdoutChunks).toString('utf8'));
        return;
      }

      reject(new AppError(`${failureMessage}: ${Buffer.concat(stderrChunks).toString('utf8').trim()}`, 422));
    });
  });

export const probeVideo = async (inputPath: string): Promise<VideoMetadata> => {
  const output = await runProcess(
    env.FFPROBE_PATH,
    ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', inputPath],
    'Unable to inspect uploaded video'
  );

  const parsed = JSON.parse(output) as ProbeOutput;
  const videoStream = parsed.streams?.find((stream) => stream.codec_type === 'video');

  if (!videoStream?.width || !videoStream.height) {
    throw new AppError('Invalid or corrupted video upload.', 400);
  }

  const streamDuration = videoStream.duration ? Number(videoStream.duration) : undefined;
  const formatDuration = parsed.format?.duration ? Number(parsed.format.duration) : undefined;
  const duration = Number.isFinite(streamDuration) ? streamDuration : formatDuration;

  return {
    width: videoStream.width,
    height: videoStream.height,
    ...(duration && Number.isFinite(duration) ? { duration } : {}),
  };
};

const encodeVariant = async (inputPath: string, outputDirectory: string, targetHeight: number): Promise<FfmpegOutput> => {
  const outputPath = safeJoin(outputDirectory, `${targetHeight}p.mp4`);
  const scaleFilter = [
    `scale=w=-2:h=min(${targetHeight}\\,ih):force_original_aspect_ratio=decrease`,
    'scale=w=trunc(iw/2)*2:h=trunc(ih/2)*2',
  ].join(',');

  await runProcess(
    env.FFMPEG_PATH,
    [
      '-y',
      '-i',
      inputPath,
      '-map',
      '0:v:0',
      '-map',
      '0:a?',
      '-vf',
      scaleFilter,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-movflags',
      '+faststart',
      '-threads',
      '2',
      outputPath,
    ],
    `Unable to encode ${targetHeight}p video`
  );

  const metadata = await probeVideo(outputPath);
  return {
    filePath: outputPath,
    width: metadata.width ?? 0,
    height: metadata.height ?? targetHeight,
    sizeBytes: await getFileSize(outputPath),
  };
};

const generateThumbnail = async (
  inputPath: string,
  outputDirectory: string,
  metadata: VideoMetadata
): Promise<ProcessedThumbnail & { filePath: string }> => {
  const outputPath = safeJoin(outputDirectory, 'thumbnail.jpg');
  const seekTime = metadata.duration && metadata.duration < THUMBNAIL_SEEK_SECONDS ? Math.max(0.1, metadata.duration / 2) : THUMBNAIL_SEEK_SECONDS;

  await runProcess(
    env.FFMPEG_PATH,
    ['-y', '-ss', String(seekTime), '-i', inputPath, '-frames:v', '1', '-q:v', '3', outputPath],
    'Unable to generate video thumbnail'
  );

  return {
    filePath: outputPath,
    path: '',
    url: '',
    sizeBytes: await getFileSize(outputPath),
  };
};

export const processVideo = async (inputPath: string, outputDirectory: string): Promise<ProcessedVideo & { outputFiles: Array<ProcessedVideoVariant & { filePath: string }>; thumbnailFile: ProcessedThumbnail & { filePath: string } }> => {
  await acquireVideoSlot();

  try {
    await ensureDirectory(outputDirectory);
    const metadata = await probeVideo(inputPath);
    const targetVariants = getTargetVariants(metadata);
    const outputFiles = [];

    for (const variant of targetVariants) {
      const output = await encodeVariant(inputPath, outputDirectory, variant.height);
      outputFiles.push({
        filePath: output.filePath,
        quality: variant.quality,
        label: variant.label,
        width: output.width,
        height: output.height,
        sizeBytes: output.sizeBytes,
        path: '',
        url: '',
      });
    }

    const thumbnailFile = await generateThumbnail(inputPath, outputDirectory, metadata);

    return {
      metadata,
      variants: outputFiles,
      thumbnail: thumbnailFile,
      outputFiles,
      thumbnailFile,
    };
  } finally {
    releaseVideoSlot();
  }
};
