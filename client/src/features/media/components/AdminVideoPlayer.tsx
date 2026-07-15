'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Expand, Pause, Play, Settings2, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type VideoVariant = {
  label: '480p' | '720p' | '1080p';
  url: string;
};

type AdminVideoPlayerProps = {
  poster?: string;
  variants: VideoVariant[];
  activeVariantLabel: '480p' | '720p' | '1080p' | null;
  activeVariantUrl: string | null;
  isOpen: boolean;
  className?: string;
  onVariantSelect: (label: '480p' | '720p' | '1080p') => void;
};

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return '0:00';
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
};

const AdminVideoPlayer = ({
  poster,
  variants,
  activeVariantLabel,
  activeVariantUrl,
  isOpen,
  className,
  onVariantSelect,
}: AdminVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const qualityMenuRef = useRef<HTMLDivElement | null>(null);
  const pendingResumeTimeRef = useRef<number | null>(null);
  const pendingResumePlaybackRef = useRef(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const progress = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  useEffect(() => {
    if (!isQualityMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!qualityMenuRef.current?.contains(event.target as Node)) {
        setIsQualityMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isQualityMenuOpen]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!isOpen) {
      video.pause();
      setIsPlaying(false);
      setIsBuffering(false);
      return;
    }

    setIsBuffering(true);
    pendingResumePlaybackRef.current = true;
    void handleSourceReady();
  }, [isOpen, activeVariantUrl]);

  const togglePlayback = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (video.paused) {
      setIsBuffering(true);

      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsBuffering(false);
        setIsPlaying(false);
      }
      return;
    }

    video.pause();
    setIsBuffering(false);
    setIsPlaying(false);
  };

  const handleSeek = (value: string) => {
    const video = videoRef.current;

    if (!video || !duration) {
      return;
    }

    const nextProgress = Number(value);
    const nextTime = (nextProgress / 100) * duration;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && video.volume === 0) {
      video.volume = 0.6;
      setVolume(0.6);
    }
  };

  const enterFullscreen = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await video.requestFullscreen();
  };

  const handleVariantSelect = (label: '480p' | '720p' | '1080p') => {
    const video = videoRef.current;

    if (video) {
      pendingResumeTimeRef.current = video.currentTime;
      pendingResumePlaybackRef.current = !video.paused && !video.ended;
    }

    setIsBuffering(true);
    setIsQualityMenuOpen(false);
    onVariantSelect(label);
  };

  const handleSourceReady = async () => {
    const video = videoRef.current;

    if (!video || !isOpen) {
      return;
    }

    const pendingResumeTime = pendingResumeTimeRef.current;

    if (pendingResumeTime !== null) {
      const boundedTime =
        video.duration && Number.isFinite(video.duration)
          ? Math.min(pendingResumeTime, Math.max(video.duration - 0.1, 0))
          : pendingResumeTime;

      video.currentTime = Math.max(boundedTime, 0);
      setCurrentTime(video.currentTime);
      pendingResumeTimeRef.current = null;
    }

    if (pendingResumePlaybackRef.current) {
      pendingResumePlaybackRef.current = false;

      try {
        await video.play();
      } catch {
        setIsBuffering(false);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className={cn('relative w-full overflow-hidden border border-white/10 bg-[#050606]', className)}>
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          poster={poster}
          preload={isOpen ? 'auto' : 'metadata'}
          src={activeVariantUrl ?? undefined}
          onLoadStart={() => setIsBuffering(true)}
          onWaiting={() => setIsBuffering(true)}
          onStalled={() => setIsBuffering(true)}
          onLoadedData={() => setIsBuffering(false)}
          onCanPlay={() => {
            setIsBuffering(false);
            void handleSourceReady();
          }}
          onClick={() => void togglePlayback()}
          onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
          onEnded={() => {
            setIsBuffering(false);
            setIsPlaying(false);
          }}
          onLoadedMetadata={() => {
            void handleSourceReady();
          }}
          onPause={() => {
            setIsBuffering(false);
            setIsPlaying(false);
          }}
          onPlay={() => setIsPlaying(true)}
          onPlaying={() => setIsBuffering(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onVolumeChange={(event) => {
            setIsMuted(event.currentTarget.muted);
            setVolume(event.currentTarget.volume);
          }}
        >
          Your browser does not support inline video playback.
        </video>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {isBuffering ? (
          <div aria-live="polite" className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid size-12 place-items-center rounded-full border border-white/20 bg-black/30 backdrop-blur-sm sm:size-16">
              <span
                aria-hidden="true"
                className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-[#c79a31] sm:size-8"
              />
              <span className="sr-only">Loading video</span>
            </span>
          </div>
        ) : null}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div className="min-w-0 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f2ede4] backdrop-blur-sm sm:px-3 sm:text-xs">
            {activeVariantLabel ?? 'Video'}
          </div>
        </div>

        {!isPlaying && !isBuffering ? (
          <div className="absolute inset-0 grid place-items-center">
            <button
              className="grid size-12 place-items-center rounded-full border border-white/16 bg-[#1b2128]/88 text-[#f2ede4] backdrop-blur-md transition hover:scale-[1.03] hover:border-[#d3aa51]/60 hover:bg-[#26313b]/94 hover:text-[#f8d98f] active:scale-100 active:border-[#e0b862]/70 active:bg-[#2f3b47]/96 active:text-[#ffe3a8] sm:size-20"
              type="button"
              onClick={() => void togglePlayback()}
            >
              <Play className="size-5 fill-current sm:size-8" />
            </button>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 grid gap-2 p-2.5 sm:gap-4 sm:p-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button
                size="sm"
                variant="outline"
                className="grid size-7 place-items-center border-white/12 bg-[#171d24]/88 p-0 text-[#f2ede4] hover:border-[#d3aa51]/40 hover:bg-[#25303a]/94 hover:text-[#fff1c8] active:border-[#e0b862]/55 active:bg-[#2d3843]/96 active:text-[#ffe3a8] sm:size-10"
                onClick={() => void togglePlayback()}
              >
                {isPlaying ? (
                  <Pause aria-hidden="true" className="size-3.5 sm:size-4" />
                ) : (
                  <Play aria-hidden="true" className="size-3.5 sm:size-4" />
                )}
                <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
              </Button>

              <Button
                size="icon-sm"
                variant="outline"
                className="size-7 border-white/12 bg-[#171d24]/88 text-[#f2ede4] hover:border-[#d3aa51]/40 hover:bg-[#25303a]/94 hover:text-[#fff1c8] active:border-[#e0b862]/55 active:bg-[#2d3843]/96 active:text-[#ffe3a8] sm:size-10"
                onClick={toggleMute}
              >
                {isMuted || volume === 0 ? <VolumeX className="size-3.5 sm:size-4" /> : <Volume2 className="size-3.5 sm:size-4" />}
                <span className="sr-only">Toggle mute</span>
              </Button>
            </div>

            <div className="grid min-w-0 gap-1">
              <input
                aria-label="Seek video"
                className="h-1 min-w-0 w-full cursor-pointer appearance-none bg-white/15 accent-[#c79a31] sm:h-1.5"
                max={100}
                min={0}
                type="range"
                value={progress}
                onChange={(event) => handleSeek(event.target.value)}
              />

              <p className="text-center text-[9px] tabular-nums text-[#beb7af] sm:text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>

            <div className="flex items-center justify-end gap-1.5 sm:gap-3">
              <div ref={qualityMenuRef} className="relative">
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="size-7 border-white/12 bg-[#171d24]/88 text-[#f2ede4] hover:border-[#d3aa51]/40 hover:bg-[#25303a]/94 hover:text-[#fff1c8] active:border-[#e0b862]/55 active:bg-[#2d3843]/96 active:text-[#ffe3a8] sm:size-10"
                  onClick={() => setIsQualityMenuOpen((current) => !current)}
                >
                  <Settings2 className="size-3.5 sm:size-4" />
                  <span className="sr-only">Open quality settings</span>
                </Button>

                {isQualityMenuOpen ? (
                  <div className="absolute right-0 bottom-11 z-20 flex min-w-36 flex-col border border-white/10 bg-[#0b0d0d]/95 p-2 shadow-2xl backdrop-blur-md sm:bottom-12 sm:min-w-40">
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f887e]">
                      Quality
                    </p>

                    {variants.map((variant) => (
                      <button
                        key={variant.label}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-[0.18em] transition sm:text-xs',
                          activeVariantLabel === variant.label
                            ? 'bg-[#c79a31]/15 text-[#f3cf7a]'
                            : 'text-[#f2ede4] hover:bg-white/10 hover:text-[#f3cf7a]'
                        )}
                        type="button"
                        onClick={() => handleVariantSelect(variant.label)}
                      >
                        <span>{variant.label}</span>
                        {activeVariantLabel === variant.label ? (
                          <span className="text-[10px] text-[#c79a31]">Active</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

                <Button
                  size="icon-sm"
                  variant="outline"
                  className="size-7 border-white/12 bg-[#171d24]/88 text-[#f2ede4] hover:border-[#d3aa51]/40 hover:bg-[#25303a]/94 hover:text-[#fff1c8] active:border-[#e0b862]/55 active:bg-[#2d3843]/96 active:text-[#ffe3a8] sm:size-10"
                  onClick={() => void enterFullscreen()}
                >
                  <Expand className="size-3.5 sm:size-4" />
                  <span className="sr-only">Toggle fullscreen</span>
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVideoPlayer;
