import AdminMusicPanel from '@/features/music/components/AdminMusicPanel';

const MusicPage = () => {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">Music library</p>
      </div>

      <AdminMusicPanel />
    </div>
  );
};

export default MusicPage;
