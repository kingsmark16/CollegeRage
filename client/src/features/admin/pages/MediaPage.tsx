import { useState, type ChangeEvent } from 'react';
import { Film, FlipHorizontal2, Image as ImageIcon, Pencil, Play, Trash2, Upload } from 'lucide-react';
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
import { useAdminMedia } from '@/features/media/hooks/useAdminMedia';
import AdminVideoPlayer from '@/features/media/components/AdminVideoPlayer';

const getPreviewUrl = (item: ReturnType<typeof useAdminMedia>['selectedMedia']) => {
  if (!item) {
    return '';
  }

  if (item.type === 'image') {
    return item.url ?? '';
  }

  return item.thumbnail ?? item.variants?.['720p'] ?? item.variants?.['480p'] ?? item.variants?.['1080p'] ?? '';
};

const MediaPage = () => {
  const {
    activeVariantLabel,
    activeVariantUrl,
    deleteMutation,
    filter,
    filteredItems,
    mediaQuery,
    selectedMedia,
    selectedMediaVariantEntries,
    setFilter,
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

  const error =
    mediaQuery.error ?? uploadMutation.error ?? updateMutation.error ?? deleteMutation.error;

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

    await uploadMutation.mutateAsync(selectedFiles);
    setSelectedFiles([]);
  };

  const handleSave = async () => {
    if (!selectedMedia) {
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedMedia.id,
      input: {
        sanitizedName: draftName.trim(),
        description: draftDescription.trim() || null,
      },
    });
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedMedia) {
      return;
    }

    await deleteMutation.mutateAsync(selectedMedia.id);
    setIsPreviewOpen(false);
    setIsEditOpen(false);
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

      {error ? (
        <div className="border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : 'Media action failed.'}
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

        {!mediaQuery.isLoading && filteredItems.length === 0 ? (
          <div className="col-span-full border border-dashed border-white/15 bg-[#121515] px-6 py-16 text-center text-sm text-[#beb7af]">
            No media has been uploaded for this filter yet.
          </div>
        ) : null}

        {filteredItems.map((item) => {
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
                  <img
                    alt={item.sanitizedName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={previewUrl}
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
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f2ede4] backdrop-blur-sm">
                {selectedMedia.sanitizedName}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-black/45 text-[#f2ede4] hover:bg-white/10"
                  onClick={() => setIsInfoVisible((current) => !current)}
                >
                  <FlipHorizontal2 aria-hidden="true" data-icon="inline-start" />
                  {isInfoVisible ? 'Show media' : 'Show info'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-black/45 text-[#f2ede4] hover:bg-white/10"
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
                  'relative min-h-[70vh] transition-transform duration-500 [transform-style:preserve-3d]',
                  isInfoVisible ? '[transform:rotateY(180deg)]' : ''
                )}
              >
                <div className="relative [backface-visibility:hidden]">
                  <div className="relative flex min-h-[70vh] items-center justify-center bg-[#0b0d0d] pt-20">
                    {selectedMedia.type === 'image' ? (
                      <img alt={selectedMedia.sanitizedName} className="max-h-[70vh] w-full object-contain" src={selectedMedia.url} />
                    ) : (
                      <AdminVideoPlayer
                        activeVariantLabel={activeVariantLabel}
                        activeVariantUrl={activeVariantUrl}
                        poster={selectedMedia.thumbnail}
                        title={selectedMedia.sanitizedName}
                        variants={selectedMediaVariantEntries}
                        onVariantSelect={setSelectedVariantLabel}
                      />
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="flex h-full min-h-[70vh] flex-col bg-[#151818] px-6 pt-20">
                    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center gap-6 pb-6 text-center">
                      <div className="grid gap-2 text-sm text-[#beb7af]">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#c79a31]/70">Description</p>
                        <p className="leading-7">{selectedMedia.description || 'No description added yet.'}</p>
                      </div>
                    </div>

                    <div className="border-t border-white/10 py-5">
                      <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-center gap-3">
                        <Button
                          variant="outline"
                          className="border-white/10 bg-transparent text-[#f2ede4] hover:bg-white/5"
                          onClick={() => {
                            primeDrafts();
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil aria-hidden="true" data-icon="inline-start" />
                          Edit
                        </Button>
                        <Button variant="destructive" onClick={() => void handleDelete()}>
                          <Trash2 aria-hidden="true" data-icon="inline-start" />
                          Delete
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
                <img alt={selectedMedia.sanitizedName} className="aspect-video w-full object-cover" src={getPreviewUrl(selectedMedia)} />
              ) : selectedMedia?.type === 'video' && selectedMedia.thumbnail ? (
                <img alt={selectedMedia.sanitizedName} className="aspect-video w-full object-cover" src={selectedMedia.thumbnail} />
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
              className="border-white/10 bg-transparent text-[#f2ede4] hover:bg-white/5"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="border-[#c79a31] bg-[#c79a31] text-[#131110] hover:bg-[#dfb24c]"
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
