import AdminMusicPanel from '@/features/music/components/AdminMusicPanel';

const MusicPage = () => {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Music library</p>
        <h1 className="mt-3 font-heading text-4xl text-[#f2ede4]">Background soundtrack</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#beb7af]">
          Upload, preview, reorder, and control the tracks visitors can choose while browsing the site.
        </p>
      </div>

      <AdminMusicPanel />
    </div>
  );
};

export default MusicPage;
