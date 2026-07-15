import { useState, type ChangeEvent } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, FilePlus2, Film, Image as ImageIcon, MoreVertical, Play, SlidersHorizontal, Trash2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getErrorMessage, notifyAsync } from '@/lib/toast';
import { useAdminMedia } from '@/features/media/hooks/useAdminMedia';
import AdminVideoPlayer from '@/features/media/components/AdminVideoPlayer';
import RetryingMediaImage from '@/features/media/components/RetryingMediaImage';
import { getPaginationItems } from '@/features/media/utils/pagination';

const getPreviewUrl = (item: ReturnType<typeof useAdminMedia>['selectedMedia']) => {
  if (!item) {
    return '';
  }

  if (item.type === 'image') {
    return item.url ?? '';
  }

  return item.thumbnail ?? item.variants?.['720p'] ?? item.variants?.['480p'] ?? item.variants?.['1080p'] ?? '';
};

const PAGE_BUTTON_BASE_CLASSNAME =
  'h-9 min-w-9 rounded-full border px-3 text-xs font-semibold text-[#beb7af] transition hover:text-[#f2ede4]';

const MediaPage = () => {
  const {
    activeVariantLabel,
    activeVariantUrl,
    deleteMutation,
    filter,
    items,
    mediaQuery,
    page,
    selectedMedia,
    selectedMediaVariantEntries,
    setFilter,
    setPage,
    setSelectedMediaId,
    setSelectedVariantLabel,
    uploadMutation,
  } = useAdminMedia();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const paginationItems = mediaQuery.data ? getPaginationItems(page, mediaQuery.data.totalPages) : [];
  const isDeletingMedia = deleteMutation.isPending;

  const handleUploadSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(event.target.files ?? []).slice(0, 10));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    try {
      await notifyAsync(uploadMutation.mutateAsync(selectedFiles), {
        loading: selectedFiles.length === 1 ? 'Uploading media...' : `Uploading ${selectedFiles.length} files...`,
        success: selectedFiles.length === 1 ? 'Media uploaded successfully.' : 'Media files uploaded successfully.',
        error: (uploadError) => getErrorMessage(uploadError, 'Media upload failed.'),
      });
      setSelectedFiles([]);
    } catch {
      // The toast reports the failure; keep the selection available for retry.
    }
  };

  const handleDelete = async () => {
    if (!selectedMedia) {
      return;
    }

    try {
      await notifyAsync(deleteMutation.mutateAsync(selectedMedia.id), {
        loading: 'Deleting media...',
        success: 'Media deleted successfully.',
        error: (deleteError) => getErrorMessage(deleteError, 'Media delete failed.'),
      });
      setIsPreviewOpen(false);
    } catch {
      // The toast reports the failure; keep the media preview visible.
    }
  };

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#151818]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-5">
        <div className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full bg-[#c79a31]/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Media gallery</p>
            <p className="mt-1 text-sm text-[#8f887e]">Add images and videos to your archive.</p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row md:w-auto">
            <label className="group flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#101313]/80 px-4 py-2.5 text-sm text-[#d7d0c7] transition hover:border-[#c79a31]/70 hover:bg-[#1b1a16] focus-within:border-[#c79a31] focus-within:ring-2 focus-within:ring-[#c79a31]/20 md:min-w-64 md:flex-none">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#c79a31]/15 text-[#f3cf7a] transition group-hover:bg-[#c79a31]/25">
                <FilePlus2 aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[#f2ede4]">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Choose media files'}
                </span>
                <span className="block text-[11px] text-[#8f887e]">Up to 10 files</span>
              </span>
            <input
              accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.mkv,.avi,.webm"
              className="hidden"
              multiple
              type="file"
              onChange={handleUploadSelection}
            />
            </label>
            <Button
              className="min-h-12 rounded-xl border-[#c79a31] bg-[#c79a31] px-5 text-[#131110] shadow-[0_8px_24px_rgba(199,154,49,0.18)] transition hover:-translate-y-0.5 hover:border-[#e5bc63] hover:bg-[#e5bc63] disabled:border-white/10 disabled:bg-[#292b2b] disabled:text-[#77736d]"
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              onClick={() => void handleUpload()}
            >
              <Upload aria-hidden="true" data-icon="inline-start" />
              {uploadMutation.isPending ? 'Uploading...' : 'Upload media'}
            </Button>
          </div>
        </div>
      </section>

      {mediaQuery.error ? (
        <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(mediaQuery.error, 'Media could not be loaded.')}
        </div>
      ) : null}

      <section className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#121515] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <label className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#c79a31]/25 bg-[#c79a31]/10 text-[#f3cf7a]">
            <SlidersHorizontal aria-hidden="true" className="size-4" />
          </span>
          <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-[#a9a39b]">View</span>
          <span className="relative min-w-0 flex-1 sm:flex-none">
            <select
              aria-label="Filter media"
              className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-[#1c1f1f] py-2.5 pl-3 pr-9 text-xs font-semibold uppercase tracking-[0.12em] text-[#f2ede4] outline-none transition hover:border-[#c79a31]/50 hover:bg-[#202323] focus:border-[#c79a31] focus:ring-2 focus:ring-[#c79a31]/20 sm:w-52"
              value={filter}
              onChange={(event) => setFilter(event.target.value as 'all' | 'image' | 'video')}
            >
              <option value="all">Show All</option>
              <option value="image">Images Only</option>
              <option value="video">Videos Only</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#c79a31]" />
          </span>
        </label>

        <p className="pl-12 text-xs text-[#8f887e] sm:pl-0 sm:text-right">
          {mediaQuery.data ? `${mediaQuery.data.totalItems.toLocaleString()} media items` : 'Loading media'}
        </p>
      </section>

      <section className="grid gap-3 grid-cols-3 lg:grid-cols-5">
        {mediaQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden border border-white/10 bg-[#151818]">
                <Skeleton className="aspect-[4/3] w-full bg-white/5" />
                <div className="grid gap-3 p-4">
                  <Skeleton className="h-4 w-3/4 bg-white/5" />
                  <Skeleton className="h-3 w-1/2 bg-white/5" />
                </div>
              </div>
            ))
          : null}

        {!mediaQuery.isLoading && items.length === 0 ? (
          <div className="col-span-full border border-dashed border-white/15 bg-[#121515] px-6 py-16 text-center text-sm text-[#beb7af]">
            No media has been uploaded for this filter yet.
          </div>
        ) : null}

        {items.map((item) => {
          const previewUrl = getPreviewUrl(item);

          return (
            <button
              key={item.id}
              className="group overflow-hidden border border-white/10 bg-[#151818] text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#181b1b]"
              type="button"
              onClick={() => {
                setSelectedMediaId(item.id);
                setSelectedVariantLabel(null);
                setIsActionsMenuOpen(false);
                setIsPreviewOpen(true);
              }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0f1212]">
                {previewUrl ? (
                  <RetryingMediaImage
                    alt={item.sanitizedName}
                    iconClassName="size-8"
                    imgClassName="object-cover duration-500 group-hover:scale-105"
                    key={previewUrl}
                    overlayClassName="bg-[#0f1212]/88"
                    src={previewUrl}
                    wrapperClassName="h-full w-full"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[#6f6a63]">
                    {item.type === 'video' ? <Film className="size-10" /> : <ImageIcon className="size-10" />}
                  </div>
                )}

                {item.type === 'video' ? (
                  <div className="absolute inset-0 grid place-items-center bg-black/25">
                    <div className="grid size-14 place-items-center rounded-full border border-white/15 bg-black/35 text-[#f2ede4] backdrop-blur-sm transition group-hover:scale-105">
                      <Play className="ml-1 size-5 fill-current" />
                    </div>
                  </div>
                ) : null}
              </div>

            </button>
          );
        })}
      </section>

      {mediaQuery.data && mediaQuery.data.totalPages > 1 ? (
        <section className="flex flex-col items-center gap-3 border-t border-white/10 pt-4 text-center lg:flex-row lg:justify-between lg:text-left">
          <p className="text-sm text-[#8f887e] lg:flex-none">
            Page {page} of {mediaQuery.data.totalPages}
          </p>

          <div className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row lg:justify-end">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-[#121515] text-[#beb7af] hover:border-[#5f8599] hover:bg-[#1a232b] hover:text-[#f2ede4]"
                disabled={page <= 1 || mediaQuery.isFetching}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft />
                Prev
              </Button>
              {paginationItems.map((item, index) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="px-1 text-sm text-[#6f6a63]">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={cn(
                      PAGE_BUTTON_BASE_CLASSNAME,
                      item === page
                        ? 'border-[#c79a31]/70 bg-[#c79a31]/15 text-[#f3cf7a] shadow-[0_0_24px_rgba(199,154,49,0.16)]'
                        : 'border-white/10 bg-[#121515] hover:border-[#5f8599] hover:bg-[#1a232b]'
                    )}
                    disabled={mediaQuery.isFetching}
                    type="button"
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-[#121515] text-[#beb7af] hover:border-[#5f8599] hover:bg-[#1a232b] hover:text-[#f2ede4]"
              disabled={page >= mediaQuery.data.totalPages || mediaQuery.isFetching}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight />
            </Button>
          </div>
        </section>
      ) : null}

      {selectedMedia ? (
        <div
          className={cn(
            'fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm transition sm:p-3',
            isPreviewOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => {
            setIsActionsMenuOpen(false);
            setIsPreviewOpen(false);
          }}
        >
          <div
            className="relative flex h-dvh max-h-dvh w-screen max-w-6xl flex-col overflow-hidden border border-white/10 bg-[#1a1d1d] shadow-2xl sm:h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-1.5rem)] sm:w-[calc(100vw-1.5rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-end gap-2 p-3 sm:p-4">
              <div className="relative">
                <Button
                  aria-label="Media actions"
                  variant="outline"
                  size="icon"
                  className="size-8 border-white/10 bg-[#171311]/90 text-[#efe6da] backdrop-blur-sm hover:border-[#c79a31]/60 hover:bg-[#211b18] hover:text-[#f3cf7a] sm:size-10"
                  onClick={() => setIsActionsMenuOpen((current) => !current)}
                >
                  <MoreVertical aria-hidden="true" className="size-4 sm:size-5" />
                </Button>

                {isActionsMenuOpen ? (
                  <div className="absolute right-0 top-full z-30 mt-2 grid min-w-32 gap-1 border border-white/10 bg-[#101212]/95 p-1.5 shadow-2xl backdrop-blur-md">
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#ff9e9e] transition hover:bg-red-500/10 hover:text-[#ffd2d2]"
                      disabled={isDeletingMedia}
                      type="button"
                      onClick={() => {
                        setIsActionsMenuOpen(false);
                        void handleDelete();
                      }}
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                      {isDeletingMedia ? 'Deleting' : 'Delete'}
                    </button>
                  </div>
                ) : null}
              </div>

              <Button
                aria-label="Close media preview"
                variant="outline"
                size="icon"
                className="size-8 border-white/10 bg-[#171311]/90 text-[#efe6da] backdrop-blur-sm hover:border-[#c79a31]/60 hover:bg-[#211b18] hover:text-[#f3cf7a] sm:size-10"
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  setIsPreviewOpen(false);
                }}
              >
                <X aria-hidden="true" className="size-4 sm:size-5" />
                <span className="sr-only">Close media preview</span>
              </Button>
            </div>

            <div className="relative min-h-0 flex-1">
              <div className="relative flex h-full min-h-0 items-center justify-center bg-[#0b0d0d] px-2 pb-2 pt-14 sm:px-4 sm:pb-4 sm:pt-16 lg:pb-6 lg:pt-20">
                    {selectedMedia.type === 'image' ? (
                      <div className="flex w-full items-center justify-center">
                        <RetryingMediaImage
                          alt={selectedMedia.sanitizedName}
                          imgClassName="max-h-[calc(100dvh-5rem)] w-auto max-w-full object-contain sm:max-h-[calc(100dvh-6rem)]"
                          key={`${selectedMedia.id}-${selectedMedia.url ?? ''}`}
                          overlayClassName="bg-[#0b0d0d]/86"
                          src={selectedMedia.url}
                          wrapperClassName="inline-flex max-h-[calc(100dvh-5rem)] w-auto max-w-full items-center justify-center sm:max-h-[calc(100dvh-6rem)]"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <AdminVideoPlayer
                          key={selectedMedia.id}
                          activeVariantLabel={activeVariantLabel}
                          activeVariantUrl={activeVariantUrl}
                          className="max-h-full w-full max-w-[min(100%,calc((100dvh-5rem)*1.7778))] sm:max-w-[min(100%,calc((100dvh-6rem)*1.7778))]"
                          isOpen={isPreviewOpen}
                          poster={selectedMedia.thumbnail}
                          variants={selectedMediaVariantEntries}
                          onVariantSelect={setSelectedVariantLabel}
                        />
                      </div>
                    )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MediaPage;
