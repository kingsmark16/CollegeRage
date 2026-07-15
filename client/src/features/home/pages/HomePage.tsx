import { ImageOff, Music4, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { MediaItem } from '@/features/media/media.types';
import LandingHeaderMusicPlayer from '../components/LandingHeaderMusicPlayer';
import DomeGallery from '../components/DomeGallery';
import VideoMemoriesSection from '../components/VideoMemoriesSection';
import { usePublicMediaGallery } from '../hooks/usePublicMediaGallery';
import { usePublicMusicTracks } from '../hooks/usePublicMusicTracks';

type GalleryImage = {
  src: string;
  alt: string;
};

const getMediaPreviewUrl = (item: MediaItem) => {
  if (item.type !== 'image') {
    return '';
  }

  return item.url ?? '';
};

const getMediaAltText = (item: MediaItem) => {
  return item.description?.trim() || item.sanitizedName;
};

const HomePage = () => {
  const { isAdmin, isLoading, user } = useAuthSession();
  const mediaGalleryQuery = usePublicMediaGallery();
  const publicMusicTracksQuery = usePublicMusicTracks();
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = useState(false);
  const [isSoundtrackPlaying, setIsSoundtrackPlaying] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const dashboardHref = isAdmin ? '/admin' : '/auth/sign-in';

  const galleryImages = useMemo<GalleryImage[]>(() => {
    return (mediaGalleryQuery.data ?? [])
      .map((item) => ({
        src: getMediaPreviewUrl(item),
        alt: getMediaAltText(item),
      }))
      .filter((item) => item.src.length > 0);
  }, [mediaGalleryQuery.data]);

  const hasGalleryImages = galleryImages.length > 0;

  return (
    <main className="min-h-screen bg-[#101212] text-[#f2ede4]">
      <section className="flex h-dvh min-h-screen flex-col overflow-hidden">
        <header className="relative z-20 overflow-x-clip border-b border-white/10 bg-[#101212]/95 px-2.5 py-2.5 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-md sm:px-5 sm:py-4 lg:px-10 lg:py-4.5">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:gap-4">
            <Link to="/" className="min-w-0 text-left">
              <p className="truncate text-xs font-semibold uppercase tracking-[0.22em] text-[#f2ede4] sm:text-sm sm:tracking-[0.26em] lg:text-lg lg:tracking-[0.28em]">
                College Rage
              </p>
              <p className="mt-1 truncate text-[8px] uppercase tracking-[0.14em] text-[#beb7af] sm:text-[10px] sm:tracking-[0.18em] lg:text-xs lg:tracking-[0.24em]">
                Relive the glory
              </p>
            </Link>

            <div className="flex items-center justify-end gap-1.5 sm:justify-center sm:gap-0">
              {publicMusicTracksQuery.data && publicMusicTracksQuery.data.length > 0 ? (
                <Button
                  type="button"
                  className={`relative size-8 rounded-full border bg-[#171b1b] shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition hover:bg-[#1b1f1f] sm:size-9 lg:size-11 ${
                    isSoundtrackPlaying
                      ? 'border-[#c79a31]/70 text-[#f3cf7a] shadow-[0_0_0_1px_rgba(199,154,49,0.2),0_0_24px_rgba(199,154,49,0.3),0_10px_22px_rgba(0,0,0,0.24)]'
                      : 'border-white/10 text-[#c79a31] hover:border-[#c79a31]/45 hover:text-[#f3cf7a]'
                  }`}
                  size="icon"
                  onClick={() => setIsMusicPlayerOpen((current) => !current)}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-full ${
                      isSoundtrackPlaying ? 'animate-ping bg-[#c79a31]/12' : 'opacity-0'
                    }`}
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute inset-[5px] rounded-full border ${
                      isSoundtrackPlaying ? 'border-[#f3cf7a]/35' : 'border-transparent'
                    }`}
                  />
                  <Music4
                    aria-hidden="true"
                    className={`relative z-10 size-3 sm:size-3.5 lg:size-4 ${isSoundtrackPlaying ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : ''}`}
                  />
                  <span className="sr-only">{isMusicPlayerOpen ? 'Close music player' : 'Open music player'}</span>
                </Button>
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full border border-white/10 bg-[#151818] text-[#8f887e] sm:size-9 lg:size-11">
                  <Music4 aria-hidden="true" className="size-3 sm:size-3.5 lg:size-4" />
                  <span className="sr-only">
                    {publicMusicTracksQuery.isLoading ? 'Loading soundtrack...' : 'No soundtrack available'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-end">
              <Button
                asChild
                className="h-8 whitespace-nowrap rounded-xl border-[#c79a31] bg-[#c79a31] px-2 text-[9px] text-[#131110] hover:bg-[#f3cf7a] sm:h-9 sm:px-3 sm:text-xs lg:h-11 lg:rounded-2xl lg:px-5 lg:text-sm"
              >
                <Link to={dashboardHref}>
                  <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                  <span>{isLoading ? 'Checking' : user && isAdmin ? 'Dashboard' : 'Admin'}</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {publicMusicTracksQuery.data && publicMusicTracksQuery.data.length > 0 ? (
          <div
            aria-hidden={!isMusicPlayerOpen}
            className={`fixed inset-0 z-40 transition duration-200 ${
              isMusicPlayerOpen ? 'visible opacity-100' : 'invisible opacity-0'
            }`}
          >
            <button
              aria-label="Close music player"
              className={`absolute inset-0 z-0 bg-black/18 transition duration-200 ${
                isMusicPlayerOpen ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              type="button"
              onClick={() => setIsMusicPlayerOpen(false)}
            />

            <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex max-h-[calc(100dvh-4.5rem)] justify-center overflow-y-auto px-2 pb-2 sm:top-24 sm:max-h-[calc(100dvh-6rem)] sm:px-3 sm:pb-4">
            <div
              className={`relative w-full max-w-[calc(100vw-1rem)] rounded-[18px] border border-white/10 bg-[#101212]/98 shadow-[0_30px_60px_rgba(0,0,0,0.38)] transition duration-200 sm:max-w-[820px] sm:rounded-[28px] ${
                isMusicPlayerOpen
                  ? 'pointer-events-auto translate-y-0 scale-100'
                  : 'pointer-events-none -translate-y-4 scale-[0.98]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-white/10 px-3 py-3 sm:gap-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-[#f2ede4] sm:text-lg sm:tracking-[0.18em]">Soundtrack</p>
                  <p className="mt-1 max-w-[17rem] text-[11px] leading-5 text-[#8f887e] sm:max-w-none sm:text-sm">
                    Play, switch tracks, and control the landing page soundtrack.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="grid h-8 w-8 place-items-center border border-white/10 bg-[#171311] text-[#efe6da] hover:border-[#7b746b] hover:bg-[#211b18] hover:text-[#ffffff] sm:h-9 sm:w-9"
                  size="icon-sm"
                  onClick={() => setIsMusicPlayerOpen(false)}
                >
                  <X aria-hidden="true" className="size-3.5 sm:size-4" />
                  <span className="sr-only">Close music player</span>
                </Button>
              </div>

              <div className="px-2.5 py-3 sm:px-6 sm:py-5">
                <LandingHeaderMusicPlayer
                  tracks={publicMusicTracksQuery.data}
                  onPlaybackStateChange={setIsSoundtrackPlaying}
                />
              </div>
            </div>
            </div>
          </div>
        ) : null}

        <div className="relative min-h-0 flex-1 basis-0 overflow-hidden">
          {hasGalleryImages ? (
            <DomeGallery
              images={galleryImages}
              pauseImageLoading={isVideoPlayerOpen}
              fit={0.78}
              fitBasis="max"
              minRadius={300}
              maxRadius={800}
              padFactor={0}
              maxPad={0}
              verticalStageOffset="-8%"
              maxVerticalRotationDeg={20}
              dragDampening={1.4}
              grayscale={false}
              overlayBlurColor="#101212"
              imageBorderRadius="8px"
              openedImageBorderRadius="8px"
            />
          ) : (
            <div className="grid h-full place-items-center bg-[#101212]">
              <div className="flex flex-col items-center gap-4 text-center text-[#8f887e]">
                <ImageOff className="size-10" aria-hidden="true" />
                <p className="max-w-sm text-sm leading-6">
                  {mediaGalleryQuery.isLoading ? 'Loading media gallery...' : 'No public media is available yet.'}
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,18,18,0.16)_0%,rgba(16,18,18,0)_34%,rgba(16,18,18,0.68)_100%)]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-7xl px-5 pb-10 sm:px-8 sm:pb-14 lg:px-10">
            {mediaGalleryQuery.isError ? (
              <p className="pointer-events-auto max-w-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-[#f2ede4]">
                Media could not be loaded right now.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <VideoMemoriesSection
        isError={mediaGalleryQuery.isError}
        isLoading={mediaGalleryQuery.isLoading}
        media={mediaGalleryQuery.data ?? []}
        onPlayerOpenChange={setIsVideoPlayerOpen}
      />
    </main>
  );
};

export default HomePage;
