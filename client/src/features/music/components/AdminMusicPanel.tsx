import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Ellipsis,
  Music,
  Pause,
  Play,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getErrorMessage, notifyAsync } from '@/lib/toast';
import AdminMusicPlayer from './AdminMusicPlayer';
import { useAdminMusicTracks } from '../hooks/useAdminMusicTracks';
import type { MusicTrack } from '../music.types';
 
const formatDuration = (duration: number | null) => {
  if (!duration) {
    return 'Unknown length';
  }

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const getTitleFromFilename = (filename: string) =>
  filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

type ToggleCardProps = {
  checked: boolean;
  description?: string;
  label: string;
  onToggle: () => void;
};

const ToggleCard = ({ checked, description, label, onToggle }: ToggleCardProps) => {
  return (
    <button
      className={cn(
        'flex items-start justify-between gap-4 rounded-xl border px-4 py-4 text-left transition',
        checked
          ? 'border-[#c79a31]/65 bg-[#1d1a12] text-[#f3cf7a] shadow-[0_0_24px_rgba(199,154,49,0.12)]'
          : 'border-white/10 bg-[#121515] text-[#f2ede4] hover:border-white/20 hover:bg-[#181b1b]'
      )}
      type="button"
      onClick={onToggle}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em]">{label}</p>
        {description ? (
          <p className={cn('mt-1 text-sm leading-6', checked ? 'text-[#e7d7b0]' : 'text-[#8f887e]')}>
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          'grid size-6 shrink-0 place-items-center border transition',
          checked ? 'rounded-full border-[#c79a31]/60 bg-[#c79a31] text-[#131110]' : 'rounded-full border-white/10 bg-[#141717] text-transparent'
        )}
      >
        <Check className="size-3.5" />
      </div>
    </button>
  );
};

const AdminMusicPanel = () => {
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const { deleteMutation, tracksQuery, updateMutation, uploadMutation } = useAdminMusicTracks();
  const tracks = tracksQuery.data ?? [];
  const isBusy = uploadMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setActiveMenuTrackId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, []);

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setArtist('');
    setIsActive(true);
    setIsDefault(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    try {
      await notifyAsync(
        uploadMutation.mutateAsync({
          file,
          title,
          artist,
          isActive,
          isDefault,
        }),
        {
          loading: 'Uploading track...',
          success: 'Track uploaded successfully.',
          error: (error) => getErrorMessage(error, 'Music upload failed.'),
        }
      );
      resetForm();
    } catch {
      // The toast reports the failure; keep the form values for retry.
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);

    if (selectedFile) {
      setTitle(getTitleFromFilename(selectedFile.name));
      return;
    }

    setTitle('');
  };

  const toggleActive = async (track: MusicTrack) => {
    try {
      await notifyAsync(
        updateMutation.mutateAsync({
          id: track.id,
          input: { isActive: !track.isActive },
        }),
        {
          loading: track.isActive ? 'Hiding track...' : 'Showing track...',
          success: track.isActive ? 'Track hidden.' : 'Track is now visible.',
          error: (error) => getErrorMessage(error, 'Unable to update track visibility.'),
        }
      );
    } catch {
      // The toast reports the failure; no additional UI change is needed here.
    }
  };

  const setDefault = async (track: MusicTrack) => {
    try {
      await notifyAsync(
        updateMutation.mutateAsync({
          id: track.id,
          input: { isDefault: true, isActive: true },
        }),
        {
          loading: 'Setting default track...',
          success: 'Default track updated.',
          error: (error) => getErrorMessage(error, 'Unable to update the default track.'),
        }
      );
    } catch {
      // The toast reports the failure; no additional UI change is needed here.
    }
  };

  const deleteTrack = async (track: MusicTrack) => {
    try {
      await notifyAsync(deleteMutation.mutateAsync(track.id), {
        loading: 'Deleting track...',
        success: 'Track deleted successfully.',
        error: (error) => getErrorMessage(error, 'Unable to delete track.'),
      });
    } catch {
      // The toast reports the failure; no additional UI change is needed here.
    }
  };

  const togglePlayer = (trackId: string) => {
    setExpandedTrackId((current) => (current === trackId ? null : trackId));
  };

  return (
    <section className="grid gap-5 py-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <article className="relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,#171b1b_0%,#101313_100%)] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[#c79a31]/10 blur-3xl" />
        <div className="relative flex items-center gap-3 text-[#c79a31]">
          <span className="grid size-10 place-items-center rounded-xl border border-[#c79a31]/25 bg-[#c79a31]/10">
            <Music className="size-5" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.24em]">Soundtrack</p>
        </div>
        <h2 className="relative mt-5 text-2xl font-semibold tracking-tight text-[#f2ede4]">Upload soundtrack</h2>
        <p className="relative mt-2 text-sm leading-6 text-[#8f887e]">Add a track to your archive and choose how it appears in the player.</p>
        {tracksQuery.error ? (
          <div className="mt-5 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {getErrorMessage(tracksQuery.error, 'Unable to load music tracks.')}
          </div>
        ) : null}

        <form className="relative mt-6 grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-2 text-sm text-[#f2ede4]">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#beb7af]">Audio file</span>
            <label className="group flex min-h-20 min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-dashed border-white/15 bg-[#0d1010]/75 px-3 py-3 transition hover:border-[#c79a31]/60 hover:bg-[#1a1a15] focus-within:border-[#c79a31] focus-within:ring-2 focus-within:ring-[#c79a31]/20 sm:gap-3 sm:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#c79a31]/12 text-[#f3cf7a] transition group-hover:bg-[#c79a31]/22 sm:size-10">
                  <Upload className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f2ede4] sm:text-xs sm:tracking-[0.16em]">
                  {file ? file.name : 'Select soundtrack'}
                  </p>
                  <p className="mt-1 text-xs text-[#8f887e]">MP3, M4A, AAC, WAV, OGG, or FLAC</p>
                </div>
              </div>

              <span className="inline-flex h-9 min-w-0 max-w-20 shrink items-center justify-center overflow-hidden rounded-lg border border-[#c79a31]/45 bg-[#c79a31]/10 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#f3cf7a] transition group-hover:bg-[#c79a31]/20 sm:max-w-none sm:shrink-0 sm:px-3 sm:text-[11px] sm:tracking-[0.16em]">
                <span className="truncate">Browse files</span>
              </span>

              <input
                accept=".mp3,.m4a,.aac,.wav,.ogg,.flac,audio/*"
                className="hidden"
                type="file"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <label className="grid gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#beb7af]">
            Title
            <Input
              className="h-11 rounded-xl border-white/10 border-b-white/10 bg-[#0d1010] px-3 py-2 text-sm font-normal leading-5 tracking-normal text-[#f2ede4] placeholder:text-[#6f6a63] focus-visible:border-[#c79a31]/70 focus-visible:border-b-[#c79a31]/70 focus-visible:ring-0"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Selected filename will appear here"
            />
          </label>

          <label className="grid gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#beb7af]">
            Artist
            <Input
              className="h-11 rounded-xl border-white/10 border-b-white/10 bg-[#0d1010] px-3 py-2 text-sm font-normal leading-5 tracking-normal text-[#f2ede4] placeholder:text-[#6f6a63] focus-visible:border-[#c79a31]/70 focus-visible:border-b-[#c79a31]/70 focus-visible:ring-0"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleCard
              checked={isActive}
              label="Show track"
              onToggle={() => setIsActive((current) => !current)}
            />
            <ToggleCard
              checked={isDefault}
              label="Set as default"
              onToggle={() => setIsDefault((current) => !current)}
            />
          </div>

          <Button
            className="mt-2 h-11 rounded-xl border-[#c79a31] bg-[#c79a31] font-semibold text-[#131110] shadow-[0_8px_24px_rgba(199,154,49,0.16)] transition hover:-translate-y-0.5 hover:border-[#e5bc63] hover:bg-[#e5bc63] disabled:border-white/10 disabled:bg-[#292b2b] disabled:text-[#77736d]"
            disabled={!file || isBusy}
            type="submit"
          >
            <Upload aria-hidden="true" data-icon="inline-start" />
            {uploadMutation.isPending ? 'Uploading' : 'Upload track'}
          </Button>
        </form>
      </article>

      <article className="min-w-0 rounded-2xl border border-white/10 bg-[#151818] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Playlist catalog</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#f2ede4]">Uploaded tracks</h2>
          </div>
          <p className="text-sm text-[#beb7af]">{tracks.length} track{tracks.length === 1 ? '' : 's'}</p>
        </div>

        <div className="mt-6 grid gap-4">
          {tracksQuery.isLoading ? (
            <p className="text-sm text-[#beb7af]">Loading tracks...</p>
          ) : null}

          {!tracksQuery.isLoading && tracks.length === 0 ? (
            <p className="border border-dashed border-white/15 px-4 py-8 text-center text-sm text-[#beb7af]">
              No background tracks uploaded yet.
            </p>
          ) : null}

          {tracks.map((track) => (
            <div key={track.id} className="min-w-0 rounded-xl border border-white/10 bg-[#101313]/80 p-3 transition hover:border-white/20 hover:bg-[#141818] sm:p-4">
              {(() => {
                const isPlayerOpen = expandedTrackId === track.id;

                return (
                  <>
              <div className="flex min-w-0 flex-row items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-full border transition',
                        isPlayerOpen
                          ? 'border-[#c79a31]/60 bg-[#c79a31]/12 text-[#f3cf7a]'
                          : 'border-white/10 bg-[#141717] text-[#f2ede4] hover:border-[#c79a31]/45 hover:bg-[#181b1b] hover:text-[#f3cf7a]'
                      )}
                      type="button"
                      onClick={() => togglePlayer(track.id)}
                    >
                      {isPlayerOpen ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4 fill-current" />}
                    </button>
                    <h3 className="min-w-0 max-w-full truncate text-base font-semibold text-[#f2ede4] sm:text-lg">{track.title}</h3>
                    {track.isDefault ? (
                      <span className="border border-[#c79a31]/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#d7b15f]">
                        Default
                      </span>
                    ) : null}
                    <span className="border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#beb7af]">
                      {track.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#beb7af]">
                    {track.artist || 'Unknown artist'} | {formatDuration(track.duration)}
                  </p>
                </div>
                <div ref={activeMenuTrackId === track.id ? actionsMenuRef : null} className="relative ml-auto shrink-0 self-start">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="rounded-full border-white/10 bg-[#141717] text-[#f2ede4] hover:border-[#c79a31]/45 hover:bg-[#181b1b] hover:text-[#f3cf7a]"
                    onClick={() =>
                      setActiveMenuTrackId((current) => (current === track.id ? null : track.id))
                    }
                    disabled={isBusy}
                    type="button"
                  >
                    <Ellipsis aria-hidden="true" />
                    <span className="sr-only">Track actions</span>
                  </Button>

                  {activeMenuTrackId === track.id ? (
                    <div className="absolute right-0 top-11 z-20 grid w-max min-w-40 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-[#121515] shadow-2xl">
                      <button
                        className="flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#d6e3e3] transition hover:bg-[#223034] hover:text-white"
                        type="button"
                        onClick={() => {
                          setActiveMenuTrackId(null);
                          void toggleActive(track);
                        }}
                      >
                        {track.isActive ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        {track.isActive ? 'Hide' : 'Show'}
                      </button>
                      <button
                        className="flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#f0d38a] transition hover:bg-[#312713] hover:text-[#ffe3a0]"
                        type="button"
                        onClick={() => {
                          setActiveMenuTrackId(null);
                          void setDefault(track);
                        }}
                      >
                        <Star className="size-4" />
                        Default
                      </button>
                      <button
                        className="flex items-center gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#ff9e9e] transition hover:bg-[#381919] hover:text-[#ffd2d2]"
                        type="button"
                        onClick={() => {
                          setActiveMenuTrackId(null);
                          void deleteTrack(track);
                        }}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {isPlayerOpen ? (
                <div className="mt-4">
                  <AdminMusicPlayer autoPlay artist={track.artist} title={track.title} url={track.url} />
                </div>
              ) : null}
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};

export default AdminMusicPanel;
