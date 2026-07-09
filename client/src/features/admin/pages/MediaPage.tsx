import { useState, type ChangeEvent } from 'react';
import { ChevronLeft, ChevronRight, Film, FlipHorizontal2, Image as ImageIcon, Pencil, Play, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
    updateMutation,
    uploadMutation,
  } = useAdminMedia();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const paginationItems = mediaQuery.data ? getPaginationItems(page, mediaQuery.data.totalPages) : [];
  const isDeletingMedia = deleteMutation.isPending;

  const handleUploadSelection = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(Array.from(event.target.files ?? []).slice(0, 10));
  };

  const primeDrafts = () => {
    setDraftName(selectedMedia?.sanitizedName ?? '');
    setDraftDescription(selectedMedia?.description ?? '');
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

  const handleSave = async () => {
    if (!selectedMedia) {
      return;
    }

    try {
      await notifyAsync(
        updateMutation.mutateAsync({
          id: selectedMedia.id,
          input: {
            sanitizedName: draftName.trim(),
            description: draftDescription.trim() || null,
          },
        }),
        {
          loading: 'Updating media...',
          success: 'Media updated successfully.',
          error: (updateError) => getErrorMessage(updateError, 'Media update failed.'),
        }
      );
      setIsEditOpen(false);
    } catch {
      // The toast reports the failure; keep the editor open for correction or retry.
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
      setIsEditOpen(false);
    } catch {
      // The toast reports the failure; keep the media preview visible.
    }
  };

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-5 items-center justify-between md:flex-row">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Media gallery</p>
        </div>

        <div className="flex flex-row gap-3 sm:items-end">
          <label className="flex cursor-pointer items-center justify-center gap-3 border border-white/10 bg-[#151818] px-4 py-3 text-sm text-[#f2ede4] transition hover:border-[#c79a31]/60 hover:bg-[#181b1b] sm:w-auto">
            <Upload className="size-4 text-[#c79a31]" />
            <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Select up to 10 files'}</span>
            <input
              accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.mkv,.avi,.webm"
              className="hidden"
              multiple
              type="file"
              onChange={handleUploadSelection}
            />
          </label>
          <Button
            className="border-[#c79a31] bg-[#f2ede4] text-[#131110] hover:bg-[#ffffff]"
            disabled={selectedFiles.length === 0 || uploadMutation.isPending}
            onClick={() => void handleUpload()}
          >
            <Upload aria-hidden="true" data-icon="inline-start" />
            {uploadMutation.isPending ? 'Uploading' : 'Upload new'}
          </Button>
        </div>
      </section>

      {mediaQuery.error ? (
        <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {getErrorMessage(mediaQuery.error, 'Media could not be loaded.')}
        </div>
      ) : null}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'Show All' },
            { key: 'image', label: 'Images Only' },
            { key: 'video', label: 'Videos Only' },
          ].map((option) => (
            <button
              key={option.key}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition',
                filter === option.key
                  ? 'border-[#c79a31]/70 bg-[#c79a31]/15 text-[#f3cf7a] shadow-[0_0_24px_rgba(199,154,49,0.16)]'
                  : 'border-white/10 bg-[#1c1f1f] text-[#a9a39b] hover:border-white/20 hover:text-[#f2ede4]'
              )}
              type="button"
              onClick={() => setFilter(option.key as 'all' | 'image' | 'video')}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-[#8f887e]">
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
                setIsInfoVisible(false);
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

              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#f2ede4]">{item.sanitizedName}</p>
                </div>
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
            'fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm transition',
            isPreviewOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          )}
          onClick={() => {
            setIsInfoVisible(false);
            setIsPreviewOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden border border-white/10 bg-[#1a1d1d] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4">
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-[11px] border-[#3c5362] bg-[#132028]/92 text-[#d7e7ee] hover:border-[#4f7083] hover:bg-[#162730] hover:text-[#ffffff] sm:h-10 sm:px-4 sm:text-sm"
                  onClick={() => setIsInfoVisible((current) => !current)}
                >
                  <FlipHorizontal2 aria-hidden="true" data-icon="inline-start" />
                  {isInfoVisible ? 'Show media' : 'Show info'}
                </Button>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-[11px] border-[#4a4540] bg-[#171311]/92 text-[#efe6da] hover:border-[#6c645c] hover:bg-[#1d1715] hover:text-[#ffffff] sm:h-10 sm:px-4 sm:text-sm"
                  onClick={() => {
                    setIsInfoVisible(false);
                    setIsPreviewOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="[perspective:1600px]">
              <div
                className={cn(
                  'relative h-[min(52vh,22rem)] min-h-[18rem] transition-transform duration-500 [transform-style:preserve-3d] sm:h-[min(58vh,26rem)] sm:min-h-[22rem] lg:h-[70vh] lg:min-h-[70vh]',
                  isInfoVisible ? '[transform:rotateY(180deg)]' : ''
                )}
              >
                <div className="relative [backface-visibility:hidden]">
                  <div className="relative flex h-full min-h-[18rem] items-center justify-center bg-[#0b0d0d] px-4 pb-4 pt-14 sm:min-h-[22rem] sm:pb-4 sm:pt-16 lg:min-h-[70vh] lg:pb-6 lg:pt-20">
                    {selectedMedia.type === 'image' ? (
                      <div className="flex w-full items-center justify-center">
                        <RetryingMediaImage
                          alt={selectedMedia.sanitizedName}
                          imgClassName="max-h-[calc(min(52vh,22rem)-4.5rem)] w-auto max-w-full object-contain sm:max-h-[calc(min(58vh,26rem)-5rem)] lg:max-h-[calc(70vh-6.5rem)]"
                          key={`${selectedMedia.id}-${selectedMedia.url ?? ''}`}
                          overlayClassName="bg-[#0b0d0d]/86"
                          src={selectedMedia.url}
                          wrapperClassName="inline-flex max-h-[calc(min(52vh,22rem)-4.5rem)] w-auto max-w-full items-center justify-center sm:max-h-[calc(min(58vh,26rem)-5rem)] lg:max-h-[calc(70vh-6.5rem)]"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <AdminVideoPlayer
                          key={selectedMedia.id}
                          activeVariantLabel={activeVariantLabel}
                          activeVariantUrl={activeVariantUrl}
                          className="max-h-full w-full max-w-[min(100%,calc((min(52vh,22rem)-4.5rem)*1.7778))] sm:max-w-[min(100%,calc((min(58vh,26rem)-5rem)*1.7778))] lg:max-w-[min(100%,calc((70vh-6.5rem)*1.7778))]"
                          isOpen={isPreviewOpen}
                          poster={selectedMedia.thumbnail}
                          variants={selectedMediaVariantEntries}
                          onVariantSelect={setSelectedVariantLabel}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="flex h-full min-h-[18rem] flex-col bg-[#151818] px-6 pb-4 pt-14 sm:min-h-[22rem] sm:pb-4 sm:pt-16 lg:min-h-[70vh] lg:pb-6 lg:pt-20">
                    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 pb-6 text-center">
                      <div className="grid gap-2 text-sm text-[#beb7af]">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[#c79a31]/70 sm:text-xs">Description</p>
                        <p className="text-xs leading-6 sm:text-sm sm:leading-7">{selectedMedia.description || 'No description added yet.'}</p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 py-5">
                      <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-center gap-3">
                        <Button
                          variant="outline"
                          className="h-8 px-2.5 text-[11px] border-[#705929] bg-[#221b0f] text-[#f0d38a] hover:border-[#b88f3c] hover:bg-[#2a2111] hover:text-[#ffe3a0] sm:h-10 sm:px-4 sm:text-sm"
                          disabled={isDeletingMedia}
                          onClick={() => {
                            primeDrafts();
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil aria-hidden="true" data-icon="inline-start" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          className="h-8 px-2.5 text-[11px] border border-[#7a2b2b] bg-[#2a1414] text-[#ff9e9e] hover:border-[#a33d3d] hover:bg-[#321717] hover:text-[#ffd2d2] sm:h-10 sm:px-4 sm:text-sm"
                          disabled={isDeletingMedia}
                          onClick={() => void handleDelete()}
                        >
                          <Trash2 aria-hidden="true" data-icon="inline-start" />
                          {isDeletingMedia ? 'Deleting' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent className="w-full border-white/10 bg-[#171919] text-[#f2ede4] sm:max-w-[440px]">
          <SheetHeader className="border-b border-white/10 px-6 py-6">
            <SheetTitle className="text-[#f2ede4]">Edit media</SheetTitle>
            <SheetDescription className="text-[#8f887e]">
              Update the display name and description stored against this asset.
            </SheetDescription>
          </SheetHeader>

          <div className="grid flex-1 gap-6 overflow-y-auto px-6 py-6">
            <div className="overflow-hidden border border-white/10 bg-[#121515]">
              {selectedMedia?.type === 'image' && getPreviewUrl(selectedMedia) ? (
                <RetryingMediaImage
                  alt={selectedMedia.sanitizedName}
                  imgClassName="aspect-video object-cover"
                  key={`${selectedMedia.id}-${getPreviewUrl(selectedMedia)}`}
                  src={getPreviewUrl(selectedMedia)}
                  wrapperClassName="aspect-video w-full"
                />
              ) : selectedMedia?.type === 'video' && selectedMedia.thumbnail ? (
                <RetryingMediaImage
                  alt={selectedMedia.sanitizedName}
                  imgClassName="aspect-video object-cover"
                  key={`${selectedMedia.id}-${selectedMedia.thumbnail}`}
                  src={selectedMedia.thumbnail}
                  wrapperClassName="aspect-video w-full"
                />
              ) : (
                <div className="aspect-video bg-[#121515]" />
              )}
            </div>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-[0.18em] text-[#c79a31]/70">Title</label>
                <Input
                  className="border-white/10 bg-[#111414] text-[#f2ede4] placeholder:text-[#6d675f]"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-[0.18em] text-[#c79a31]/70">Description</label>
                <textarea
                  className="min-h-32 resize-y border border-white/10 bg-[#111414] px-3 py-2 text-sm text-[#f2ede4] outline-none transition focus:border-[#c79a31]/60"
                  value={draftDescription}
                  onChange={(event) => setDraftDescription(event.target.value)}
                />
              </div>
            </div>
          </div>

          <SheetFooter className="border-t border-white/10 px-6 py-5 sm:flex-row">
            <Button
              variant="outline"
              className="border-[#4a4540] bg-[#171311] text-[#efe6da] hover:border-[#7b746b] hover:bg-[#211b18] hover:text-[#ffffff]"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="border-[#c79a31] bg-[#c79a31] text-[#131110] hover:border-[#e5bc63] hover:bg-[#dfb24c]"
              disabled={!selectedMedia || !draftName.trim() || updateMutation.isPending}
              onClick={() => void handleSave()}
            >
              {updateMutation.isPending ? 'Saving' : 'Save changes'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MediaPage;
