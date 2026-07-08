import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LoaderCircle, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { MusicTrack } from '@/features/music/music.types';

type LandingHeaderMusicPlayerProps = {
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  tracks: MusicTrack[];
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

const getInitialTrackIndex = (tracks: MusicTrack[]) => {
  const defaultTrackIndex = tracks.findIndex((track) => track.isDefault);
  return defaultTrackIndex >= 0 ? defaultTrackIndex : 0;
};

const getTrackBadge = (track: MusicTrack) => {
  const source = track.title.trim() || track.artist?.trim() || 'CR';
  return source.slice(0, 2).toUpperCase();
};

const LandingHeaderMusicPlayer = ({ onPlaybackStateChange, tracks }: LandingHeaderMusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const continuePlaybackOnTrackChangeRef = useRef(false);
  const progressId = useId();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => getInitialTrackIndex(tracks));
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioPortalTarget = typeof document === 'undefined' ? null : document.body;
  const resolvedTrackIndex = useMemo(() => {
    if (!tracks.length) {
      return -1;
    }

    if (tracks[currentTrackIndex]) {
      return currentTrackIndex;
    }

    return getInitialTrackIndex(tracks);
  }, [currentTrackIndex, tracks]);
  const currentTrack = resolvedTrackIndex >= 0 ? tracks[resolvedTrackIndex] ?? null : null;

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = 0.8;
  }, []);

  useEffect(() => {
    onPlaybackStateChange?.(isPlaying);
  }, [isPlaying, onPlaybackStateChange]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    audio.pause();
    audio.load();
    setIsAudioLoading(false);
    setDuration(0);
    setCurrentTime(0);

    if (!continuePlaybackOnTrackChangeRef.current) {
      return;
    }

    continuePlaybackOnTrackChangeRef.current = false;

    if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
      audio.load();
    }

    setIsAudioLoading(true);

    void audio.play().catch(() => {
      setIsAudioLoading(false);
      setIsPlaying(false);
    });
  }, [currentTrack?.id]);

  const startPlayback = async (audio: HTMLAudioElement) => {
    try {
      if (audio.readyState === HTMLMediaElement.HAVE_NOTHING) {
        audio.load();
      }

      setIsAudioLoading(true);
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsAudioLoading(false);
      setIsPlaying(false);
    }
  };

  const selectTrack = async (nextIndex: number, shouldPlay: boolean) => {
    const audio = audioRef.current;

    if (!tracks.length || !currentTrack) {
      return;
    }

    const normalizedIndex = (nextIndex + tracks.length) % tracks.length;

    if (normalizedIndex === resolvedTrackIndex) {
      if (!shouldPlay || !audio) {
        return;
      }

      await startPlayback(audio);
      return;
    }

    continuePlaybackOnTrackChangeRef.current = shouldPlay;
    setCurrentTrackIndex(normalizedIndex);

    if (!shouldPlay) {
      return;
    }

    setIsPlaying(true);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio || !currentTrack) {
      return;
    }

    if (audio.paused) {
      await startPlayback(audio);
      return;
    }

    continuePlaybackOnTrackChangeRef.current = false;
    setIsAudioLoading(false);
    audio.pause();
    setIsPlaying(false);
  };

  const handleProgressChange = (value: string) => {
    const audio = audioRef.current;

    if (!audio || !duration) {
      return;
    }

    const nextProgress = Number(value);
    const nextTime = (nextProgress / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const selectOptions = useMemo(
    () =>
      tracks.map((track, index) => ({
        label: track.artist?.trim() ? `${track.title} - ${track.artist}` : track.title,
        value: String(index),
      })),
    [tracks]
  );

  if (!currentTrack) {
    return (
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-center rounded-[22px] border border-white/10 bg-[#141818] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-[#8f887e]">
          No soundtrack
        </div>
      </div>
    );
  }

  const audioElement = (
    <audio
      ref={audioRef}
      preload="auto"
      src={currentTrack.url}
      onCanPlay={() => setIsAudioLoading(false)}
      onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
      onEnded={() => {
        setIsAudioLoading(false);
        void selectTrack(resolvedTrackIndex + 1, true);
      }}
      onLoadStart={() => setIsAudioLoading(true)}
      onPause={() => {
        setIsAudioLoading(false);
        setIsPlaying(false);
      }}
      onPlay={() => setIsPlaying(true)}
      onPlaying={() => {
        setIsAudioLoading(false);
        setIsPlaying(true);
      }}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      onWaiting={() => setIsAudioLoading(true)}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
      {audioPortalTarget ? createPortal(audioElement, audioPortalTarget) : audioElement}

      <div className="min-w-0 sm:max-w-[560px] sm:flex-1">
        <div className="flex min-w-0 items-center gap-2 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,24,24,0.98)_0%,rgba(15,18,18,0.98)_100%)] px-3 py-2 text-[#f2ede4] shadow-[0_12px_26px_rgba(0,0,0,0.28)]">
          <div className="grid size-9 shrink-0 place-items-center rounded-full border border-[#c79a31]/18 bg-[radial-gradient(circle_at_30%_30%,#4d4330_0%,#292318_58%,#161311_100%)] text-[9px] font-semibold uppercase tracking-[0.14em] text-[#f3cf7a] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            {getTrackBadge(currentTrack)}
          </div>

          <div className="min-w-0 flex-[0.9]">
            <p className="truncate text-[12px] font-semibold text-[#f2ede4]">{currentTrack.title}</p>
            <p className="truncate text-[10px] font-medium text-[#8f887e]">
              {currentTrack.artist?.trim() || 'Background soundtrack'}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              className="grid size-7 shrink-0 place-items-center rounded-full text-[#c8b78f] transition hover:bg-white/6 hover:text-[#f3cf7a]"
              type="button"
              onClick={() => void selectTrack(resolvedTrackIndex - 1, isPlaying)}
            >
              <SkipBack className="size-3.5" />
              <span className="sr-only">Previous track</span>
            </button>

            <button
              className="grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#f0c869_0%,#c79a31_100%)] text-[#17120d] shadow-[0_8px_18px_rgba(199,154,49,0.28)] transition hover:scale-[1.02] hover:shadow-[0_10px_22px_rgba(199,154,49,0.34)]"
              type="button"
              onClick={() => void togglePlayback()}
            >
              {isAudioLoading ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="size-3.5" />
              ) : (
                <Play className="ml-0.5 size-3.5 fill-current" />
              )}
              <span className="sr-only">
                {isAudioLoading ? 'Loading track' : isPlaying ? 'Pause track' : 'Play track'}
              </span>
            </button>

            <button
              className="grid size-7 shrink-0 place-items-center rounded-full text-[#c8b78f] transition hover:bg-white/6 hover:text-[#f3cf7a]"
              type="button"
              onClick={() => void selectTrack(resolvedTrackIndex + 1, isPlaying)}
            >
              <SkipForward className="size-3.5" />
              <span className="sr-only">Next track</span>
            </button>
          </div>

          <div className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
            <span className="w-8 shrink-0 text-right text-[10px] font-medium tabular-nums text-[#8f887e]">
              {formatTime(currentTime)}
            </span>

            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor={progressId}>
                Seek track
              </label>
              <input
                id={progressId}
                aria-label="Seek track"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#26211a] accent-[#c79a31]"
                max={100}
                min={0}
                type="range"
                value={progress}
                onChange={(event) => handleProgressChange(event.target.value)}
              />
            </div>

            <span className="w-8 shrink-0 text-[10px] font-medium tabular-nums text-[#8f887e]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-2 px-2 sm:hidden">
          <span className="w-8 shrink-0 text-right text-[10px] font-medium tabular-nums text-[#8f887e]">
            {formatTime(currentTime)}
          </span>

          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor={progressId}>
              Seek track
            </label>
            <input
              id={progressId}
              aria-label="Seek track"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#26211a] accent-[#c79a31]"
              max={100}
              min={0}
              type="range"
              value={progress}
              onChange={(event) => handleProgressChange(event.target.value)}
            />
          </div>

          <span className="w-8 shrink-0 text-[10px] font-medium tabular-nums text-[#8f887e]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="sm:w-[220px] sm:flex-none">
        <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-white/10 bg-[#171b1b] px-3 py-2">
          <span className="shrink-0 text-[9px] uppercase tracking-[0.16em] text-[#8f887e]">Track</span>
          <div className="min-w-0 flex-1">
            <select
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#171b1b] px-3 py-1.5 text-[11px] font-medium text-[#f2ede4] outline-none transition hover:border-white/20 focus:border-[#c79a31]/65"
              value={String(resolvedTrackIndex)}
              onChange={(event) => void selectTrack(Number(event.target.value), isPlaying)}
            >
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHeaderMusicPlayer;
