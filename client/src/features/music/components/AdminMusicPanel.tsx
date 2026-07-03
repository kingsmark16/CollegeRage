import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Music, Star, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Music action failed.');

const getTitleFromFilename = (filename: string) =>
  filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const AdminMusicPanel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const { deleteMutation, tracksQuery, updateMutation, uploadMutation } = useAdminMusicTracks();
  const tracks = tracksQuery.data ?? [];
  const isBusy = uploadMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const error = uploadMutation.error ?? updateMutation.error ?? deleteMutation.error ?? tracksQuery.error;

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setArtist('');
    setDescription('');
    setSortOrder(0);
    setIsActive(true);
    setIsDefault(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      return;
    }

    await uploadMutation.mutateAsync({
      file,
      title,
      artist,
      description,
      isActive,
      isDefault,
      sortOrder,
    });
    resetForm();
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);

    if (selectedFile) {
      setTitle(getTitleFromFilename(selectedFile.name));
      return;
    }

    setTitle('');
  };

  const toggleActive = (track: MusicTrack) =>
    updateMutation.mutateAsync({
      id: track.id,
      input: { isActive: !track.isActive },
    });

  const setDefault = (track: MusicTrack) =>
    updateMutation.mutateAsync({
      id: track.id,
      input: { isDefault: true, isActive: true },
    });

  return (
    <section className="grid gap-5 py-2 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="border border-white/10 bg-[#151818] p-6">
        <div className="flex items-center gap-3 text-[#c79a31]">
          <Music className="size-5" />
          <p className="text-xs uppercase tracking-[0.24em]">Background music</p>
        </div>
        <h2 className="mt-4 text-2xl font-semibold">Upload soundtrack</h2>
        <p className="mt-3 text-sm leading-7 text-[#beb7af]">
          Add original audio files for the visitor playlist. Active tracks will be available to the public player.
        </p>

        {error ? (
          <div className="mt-5 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {getErrorMessage(error)}
          </div>
        ) : null}

        <form className="mt-6 grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="grid gap-2 text-sm text-[#f2ede4]">
            Audio file
            <input
              className="border border-[#3e3f3f] bg-transparent px-4 py-3 text-sm text-[#beb7af] file:mr-4 file:border-0 file:bg-[#c79a31] file:px-3 file:py-2 file:text-xs file:font-semibold file:uppercase file:tracking-widest file:text-[#131110]"
              type="file"
              accept=".mp3,.m4a,.aac,.wav,.ogg,.flac,audio/*"
              onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
            />
          </label>

          <label className="grid gap-2 text-sm text-[#f2ede4]">
            Title
            <input
              className="border border-[#3e3f3f] bg-transparent px-4 py-3 text-sm text-[#f2ede4] outline-none focus:border-[#c79a31]"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Selected filename will appear here"
            />
          </label>

          <label className="grid gap-2 text-sm text-[#f2ede4]">
            Artist
            <input
              className="border border-[#3e3f3f] bg-transparent px-4 py-3 text-sm text-[#f2ede4] outline-none focus:border-[#c79a31]"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <label className="grid gap-2 text-sm text-[#f2ede4]">
            Description
            <textarea
              className="min-h-24 resize-y border border-[#3e3f3f] bg-transparent px-4 py-3 text-sm text-[#f2ede4] outline-none focus:border-[#c79a31]"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm text-[#f2ede4]">
              Sort
              <input
                className="border border-[#3e3f3f] bg-transparent px-4 py-3 text-sm text-[#f2ede4] outline-none focus:border-[#c79a31]"
                value={sortOrder}
                min={0}
                onChange={(event) => setSortOrder(Number(event.target.value))}
                type="number"
              />
            </label>
            <label className="flex items-center gap-3 border border-[#3e3f3f] px-4 py-3 text-sm text-[#f2ede4]">
              <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
              Active
            </label>
            <label className="flex items-center gap-3 border border-[#3e3f3f] px-4 py-3 text-sm text-[#f2ede4]">
              <input checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} type="checkbox" />
              Default
            </label>
          </div>

          <Button
            className="mt-2 border-[#c79a31] bg-[#c79a31] text-[#131110] hover:bg-[#dfb24c]"
            disabled={!file || isBusy}
            type="submit"
          >
            <Upload aria-hidden="true" data-icon="inline-start" />
            {uploadMutation.isPending ? 'Uploading' : 'Upload track'}
          </Button>
        </form>
      </article>

      <article className="border border-white/10 bg-[#151818] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Playlist catalog</p>
            <h2 className="mt-3 text-2xl font-semibold">Uploaded tracks</h2>
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
            <div key={track.id} className="border border-white/10 bg-black/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-[#f2ede4]">{track.title}</h3>
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
                    {track.artist || 'Unknown artist'} | {formatDuration(track.duration)} | sort {track.sortOrder}
                  </p>
                  {track.description ? (
                    <p className="mt-2 text-sm leading-6 text-[#beb7af]">{track.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b]"
                    onClick={() => void toggleActive(track)}
                    disabled={isBusy}
                  >
                    {track.isActive ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    {track.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b]"
                    onClick={() => void setDefault(track)}
                    disabled={isBusy || track.isDefault}
                  >
                    <Star aria-hidden="true" />
                    Default
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void deleteMutation.mutateAsync(track.id)}
                    disabled={isBusy}
                  >
                    <Trash2 aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </div>
              <audio className="mt-4 w-full" controls preload="metadata" src={track.url} />
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};

export default AdminMusicPanel;
