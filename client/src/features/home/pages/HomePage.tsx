import { ImageOff, LogIn, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import type { MediaItem } from '@/features/media/media.types';
import DomeGallery from '../components/DomeGallery';
import { usePublicMediaGallery } from '../hooks/usePublicMediaGallery';

type GalleryImage = {
  src: string;
  alt: string;
};

const getMediaPreviewUrl = (item: MediaItem) => {
  if (item.type === 'image') {
    return item.url ?? '';
  }

  return item.thumbnail ?? item.variants?.['720p'] ?? item.variants?.['480p'] ?? item.variants?.['1080p'] ?? '';
};

const getMediaAltText = (item: MediaItem) => {
  return item.description?.trim() || item.sanitizedName;
};

const HomePage = () => {
  const { isAdmin, isLoading, user } = useAuthSession();
  const mediaGalleryQuery = usePublicMediaGallery();
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
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
            <Link to="/" className="min-w-0">
              <p className="truncate text-base font-semibold uppercase tracking-[0.28em] text-[#f2ede4] sm:text-lg">
                College Rage
              </p>
              <p className="mt-1 hidden text-xs uppercase tracking-[0.24em] text-[#beb7af] sm:block">
                Relive the glory
              </p>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-[#151818] text-[#f2ede4] shadow-[0_0_0_1px_rgba(255,255,255,0.03)] hover:bg-[#1c2020]"
              >
                <Link to="/auth/sign-in" aria-label="Sign in">
                  <LogIn aria-hidden="true" data-icon="inline-start" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </Button>
              <Button asChild className="border-[#c79a31] bg-[#c79a31] text-[#131110] hover:bg-[#f3cf7a]">
                <Link to={dashboardHref}>
                  <ShieldCheck aria-hidden="true" data-icon="inline-start" />
                  <span>{isLoading ? 'Checking' : user && isAdmin ? 'Dashboard' : 'Admin'}</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 basis-0 overflow-hidden">
          {hasGalleryImages ? (
            <DomeGallery
              images={galleryImages}
              fit={0.78}
              fitBasis="max"
              minRadius={300}
              maxRadius={800}
              padFactor={0.1}
              maxPad={56}
              verticalStageOffset="-8%"
              maxVerticalRotationDeg={4}
              segments={24}
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
