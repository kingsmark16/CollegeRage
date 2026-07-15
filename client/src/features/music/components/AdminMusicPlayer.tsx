import { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminMusicPlayerProps = {
  autoPlay?: boolean;
  artist: string | null;
  title: string;
  url: string;
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

const AdminMusicPlayer = ({ autoPlay = false, artist, title, url }: AdminMusicPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressId = useId();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }
    audio.volume = 0.8;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !autoPlay) {
      return;
    }

    void audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [autoPlay, url]);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

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

  return (
    <div className="overflow-hidden rounded-xl border border-[#c79a31]/20 bg-[linear-gradient(145deg,#171b1b_0%,#0b0e0e_100%)] shadow-[0_14px_35px_rgba(0,0,0,0.18)]">
      <audio
        ref={audioRef}
        preload="metadata"
        src={url}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />

      <div className="grid gap-5 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            className="group relative grid size-12 shrink-0 place-items-center rounded-full border border-[#c79a31]/45 bg-[#c79a31]/10 text-[#f2ede4] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:scale-105 hover:border-[#c79a31]/75 hover:bg-[#c79a31]/20 hover:text-[#f3cf7a] sm:size-14"
            type="button"
            onClick={() => void togglePlayback()}
          >
            <span className="absolute inset-1 rounded-full border border-white/10" />
            {isPlaying ? (
              <Pause className="relative z-10 size-5 fill-current sm:size-6" />
            ) : (
              <Play className="relative z-10 ml-0.5 size-5 fill-current sm:size-6" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[#f2ede4] sm:text-sm sm:tracking-[0.18em]">
                  {title}
                </p>
                <p className="truncate text-[11px] uppercase tracking-[0.14em] text-[#8f887e] sm:text-xs sm:tracking-[0.18em]">
                  {artist?.trim() || 'Background soundtrack'}
                </p>
              </div>

                <div className="hidden items-end gap-1 md:flex">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'w-1 rounded-full bg-[#3d3527]',
                      isPlaying
                        ? index % 3 === 0
                          ? 'h-6 bg-[#c79a31] animate-[music-bar_780ms_ease-in-out_infinite]'
                          : index % 2 === 0
                            ? 'h-4 bg-[#e8d5a4] animate-[music-bar_920ms_ease-in-out_infinite]'
                            : 'h-3 bg-[#8f887e] animate-[music-bar_640ms_ease-in-out_infinite]'
                        : 'h-2'
                    )}
                    style={isPlaying ? { animationDelay: `${index * 90}ms` } : undefined}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <label className="sr-only" htmlFor={progressId}>
                Seek track
              </label>
              <input
                id={progressId}
                aria-label="Seek track"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/12 accent-[#c79a31]"
                max={100}
                min={0}
                type="range"
                value={progress}
                onChange={(event) => handleProgressChange(event.target.value)}
              />

              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#8f887e]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMusicPlayer;
