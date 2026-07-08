import { ImageOff, Music4, ShieldCheck, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { MediaItem } from '@/features/media/media.types';
import LandingHeaderMusicPlayer from '../components/LandingHeaderMusicPlayer';
import DomeGallery from '../components/DomeGallery';
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
        <header className="relative z-20 border-b border-white/10 bg-[#101212]/95 px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-md sm:px-8 lg:px-10">
          <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[minmax(0,220px)_auto_auto] lg:items-center lg:justify-between">
            <Link to="/" className="min-w-0">
              <p className="truncate text-base font-semibold uppercase tracking-[0.28em] text-[#f2ede4] sm:text-lg">
                College Rage
              </p>
              <p className="mt-1 hidden text-xs uppercase tracking-[0.24em] text-[#beb7af] sm:block">
                Relive the glory
              </p>
            </Link>

            <div className="flex items-center justify-start lg:justify-center">
              {publicMusicTracksQuery.data && publicMusicTracksQuery.data.length > 0 ? (
                <Button
                  type="button"
                  className={`relative size-11 rounded-full border bg-[#171b1b] shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition hover:bg-[#1b1f1f] ${
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
                    className={`relative z-10 size-4 ${isSoundtrackPlaying ? 'animate-[pulse_1.6s_ease-in-out_infinite]' : ''}`}
                  />
                  <span className="sr-only">{isMusicPlayerOpen ? 'Close music player' : 'Open music player'}</span>
                </Button>
              ) : (
                <div className="flex size-11 items-center justify-center rounded-full border border-white/10 bg-[#151818] text-[#8f887e]">
                  <Music4 aria-hidden="true" className="size-4" />
                  <span className="sr-only">
                    {publicMusicTracksQuery.isLoading ? 'Loading soundtrack...' : 'No soundtrack available'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-start lg:justify-end">
              <Button asChild className="border-[#c79a31] bg-[#c79a31] text-[#131110] hover:bg-[#f3cf7a]">
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
              className={`absolute inset-0 bg-black/18 transition duration-200 ${
                isMusicPlayerOpen ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              type="button"
              onClick={() => setIsMusicPlayerOpen(false)}
            />

            <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center px-3 sm:top-28">
            <div
              className={`w-full max-w-[820px] rounded-[28px] border border-white/10 bg-[#101212]/98 shadow-[0_30px_60px_rgba(0,0,0,0.38)] transition duration-200 ${
                isMusicPlayerOpen
                  ? 'pointer-events-auto translate-y-0 scale-100'
                  : 'pointer-events-none -translate-y-4 scale-[0.98]'
              }`}
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f2ede4]">Soundtrack</p>
                  <p className="mt-1 text-sm text-[#8f887e]">
                    Play, switch tracks, and control the landing page soundtrack.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="grid place-items-center border border-white/10 bg-[#171311] text-[#efe6da] hover:border-[#7b746b] hover:bg-[#211b18] hover:text-[#ffffff]"
                  size="icon-sm"
                  onClick={() => setIsMusicPlayerOpen(false)}
                >
                  <X aria-hidden="true" className="size-4" />
                  <span className="sr-only">Close music player</span>
                </Button>
              </div>

              <div className="px-4 py-4 sm:px-6 sm:py-5">
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
    </main>
  );
};

export default HomePage;
