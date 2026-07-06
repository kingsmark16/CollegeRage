const AdminFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0d1117] px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#7f89a3]">Admin workspace</p>
          <p className="mt-2 text-sm font-medium text-[#f2ede4]">College Rage dashboard</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#8f9ab2]">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#8f7cff]" />
            <span>Music</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#c79a31]" />
            <span>Media</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#5f8599]" />
            <span>Overview</span>
          </div>
        </div>

        <div className="text-xs text-[#6f788b] lg:text-right">
          <p>Built for repeat admin workflows and future moderation tools.</p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
