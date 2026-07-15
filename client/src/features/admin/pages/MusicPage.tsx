import AdminMusicPanel from '@/features/music/components/AdminMusicPanel';

const MusicPage = () => {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c79a31]">Music library</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#f2ede4] sm:text-3xl">Set the atmosphere.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#8f887e]">
            Upload, organize, and preview the soundtrack that brings your memories to life.
          </p>
        </div>
      </div>

      <AdminMusicPanel />
    </div>
  );
};

export default MusicPage;
