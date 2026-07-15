import { Film, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import AdminVideoPlayer from '@/features/media/components/AdminVideoPlayer';
import type { MediaItem } from '@/features/media/media.types';
import CircularGallery, { type CircularGalleryItem } from './CircularGallery';

type VideoVariantLabel = '480p' | '720p' | '1080p';

type VideoMemoriesSectionProps = {
  isError: boolean;
  isLoading: boolean;
  media: MediaItem[];
  onPlayerOpenChange?: (isOpen: boolean) => void;
};

type VideoGalleryItem = CircularGalleryItem & {
  media: MediaItem;
};

const fallbackThumbnail = () =>
  `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <rect width="1280" height="720" fill="#151818"/>
      <path d="M0 540L300 360L560 500L830 250L1280 520V720H0Z" fill="#24211a"/>
      <circle cx="640" cy="360" r="74" fill="#c79a31" fill-opacity=".9"/>
      <path d="M620 318L694 360L620 402Z" fill="#131110"/>
    </svg>
  `)}`;

const getVideoLabel = (media: MediaItem) => media.description?.trim() || media.sanitizedName;

const getVideoVariants = (media: MediaItem) =>
  (['1080p', '720p', '480p'] as const).flatMap((label) => {
    const url = media.variants?.[label];
    return url ? [{ label, url }] : [];
  });

const VideoMemoriesSection = ({ isError, isLoading, media, onPlayerOpenChange }: VideoMemoriesSectionProps) => {
  const [selectedVideo, setSelectedVideo] = useState<MediaItem | null>(null);
  const [activeVariantLabel, setActiveVariantLabel] = useState<VideoVariantLabel | null>(null);
  const [isPreparingPlayer, setIsPreparingPlayer] = useState(false);
  const openPlayerTimerRef = useRef<number | null>(null);

  const videoItems = useMemo<VideoGalleryItem[]>(
    () =>
      media
        .filter((item) => item.type === 'video')
        .map((item) => ({
          id: item.id,
          image: item.thumbnail?.trim() || fallbackThumbnail(),
          media: item,
        })),
    [media]
  );

  const selectedVariants = selectedVideo ? getVideoVariants(selectedVideo) : [];
  const activeVariantUrl = selectedVariants.find((variant) => variant.label === activeVariantLabel)?.url ?? selectedVariants[0]?.url ?? null;

  useEffect(() => {
    onPlayerOpenChange?.(Boolean(selectedVideo || isPreparingPlayer));
  }, [isPreparingPlayer, onPlayerOpenChange, selectedVideo]);

  useEffect(() => {
    if (!selectedVideo) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [selectedVideo]);

  useEffect(() => {
    return () => {
      if (openPlayerTimerRef.current !== null) {
        window.clearTimeout(openPlayerTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedVideo) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeVideoPlayer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo]);

  const handleVideoSelect = (item: CircularGalleryItem) => {
    const selectedItem = videoItems.find((videoItem) => videoItem.id === item.id);

    if (!selectedItem) {
      return;
    }

    if (openPlayerTimerRef.current !== null) {
      window.clearTimeout(openPlayerTimerRef.current);
    }

    setIsPreparingPlayer(true);
    openPlayerTimerRef.current = window.setTimeout(() => {
      setSelectedVideo(selectedItem.media);
      setActiveVariantLabel(getVideoVariants(selectedItem.media)[0]?.label ?? null);
      setIsPreparingPlayer(false);
      openPlayerTimerRef.current = null;
    }, 80);
  };

  const closeVideoPlayer = () => {
    if (openPlayerTimerRef.current !== null) {
      window.clearTimeout(openPlayerTimerRef.current);
      openPlayerTimerRef.current = null;
    }

    setIsPreparingPlayer(false);
    setSelectedVideo(null);
  };

  return (
    <section className="border-t border-white/10 bg-[#101212] px-4 py-10 sm:px-8 sm:py-16 lg:px-10 lg:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:gap-10">
        <div className="grid gap-3 sm:max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c79a31]">Video memories</p>
          <h2 className="font-heading text-2xl text-[#f2ede4] sm:text-3xl lg:text-4xl">Every moment, still moving.</h2>
          <p className="max-w-xl text-xs leading-6 text-[#beb7af] sm:text-sm sm:leading-7">
            Scroll through the archive, choose a memory, and let it play in full.
          </p>
        </div>

        {videoItems.length > 0 ? (
          <div className="h-[210px] border border-white/10 bg-[#151818] shadow-[0_24px_60px_rgba(0,0,0,0.24)] min-[400px]:h-[240px] sm:h-[520px]">
            <CircularGallery
              items={videoItems}
              pauseImageLoading={Boolean(selectedVideo)}
              onItemSelect={handleVideoSelect}
            />
          </div>
        ) : (
          <div className="grid min-h-72 place-items-center border border-dashed border-white/15 bg-[#151818] px-6 text-center">
            <div className="grid max-w-sm justify-items-center gap-3 text-[#8f887e]">
              <Film className="size-9" aria-hidden="true" />
              <p className="text-sm leading-6">
                {isLoading ? 'Loading video memories...' : isError ? 'Video memories could not be loaded right now.' : 'No public videos are available yet.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {selectedVideo && activeVariantUrl ? (
        <div className="fixed inset-0 z-[1000] isolate grid place-items-center p-1 sm:p-3" role="dialog" aria-label={getVideoLabel(selectedVideo)} aria-modal="true">
          <button
            aria-label="Close video player"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            type="button"
            onClick={closeVideoPlayer}
          />
          <div className="relative z-10 grid max-h-[calc(100dvh-0.5rem)] w-[calc(100vw-0.5rem)] max-w-5xl place-items-center overflow-y-auto border border-white/10 bg-[#101212] p-0.5 shadow-[0_30px_80px_rgba(0,0,0,0.58)] sm:max-h-[calc(100dvh-1.5rem)] sm:w-[calc(100vw-1.5rem)] sm:p-2">
            <Button
              className="absolute right-2 top-2 z-20 size-8 border border-white/10 bg-[#171b1b]/90 text-[#f2ede4] hover:border-[#c79a31]/60 hover:bg-[#211b18] hover:text-[#f3cf7a] sm:right-3 sm:top-3"
              size="icon"
              type="button"
              variant="ghost"
              onClick={closeVideoPlayer}
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">Close video player</span>
            </Button>

            <AdminVideoPlayer
              activeVariantLabel={activeVariantLabel}
              activeVariantUrl={activeVariantUrl}
              isOpen
              poster={selectedVideo.thumbnail}
              variants={selectedVariants}
              onVariantSelect={setActiveVariantLabel}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default VideoMemoriesSection;
