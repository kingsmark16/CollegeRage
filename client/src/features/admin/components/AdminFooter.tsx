import { ArrowUpRight, GitBranch, Heart } from 'lucide-react';
import screenLogo from '@/assets/screen.png';

const featuredNames = ['Mark Angel Concina', 'Alwin Onsay Jr.', 'Gerald Oraller', 'Dino Radores Jr.'];
const githubUrl = 'https://github.com/kingsmark16/CollegeRage';

const AdminFooter = () => {
  return (
    <footer className="border-t border-white/10 bg-[#0b0f14] px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-7xl gap-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr_0.8fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-[#f3cf7a]">
              <span className="grid size-10 place-items-center overflow-hidden rounded-xl border border-[#c79a31]/25 bg-[#c79a31]/10 shadow-[0_0_20px_rgba(199,154,49,0.12)]">
                <img alt="College Rage" className="size-full object-cover transition-transform duration-300 hover:scale-110" src={screenLogo} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">College Rage</p>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#8f9ab2]">
              A shared archive for the moments, music, and memories worth keeping close.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7f89a3]">The Memory Makers</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {featuredNames.map((name, index) => (
                <div
                  key={name}
                  className="group flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-xs text-[#c7cbd3] transition hover:-translate-y-0.5 hover:border-[#c79a31]/40 hover:bg-[#c79a31]/8 hover:text-[#f3cf7a]"
                >
                  <span className="text-[10px] text-[#c79a31]">0{index + 1}</span>
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <a
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-semibold text-[#f2ede4] transition hover:-translate-y-0.5 hover:border-[#c79a31]/60 hover:bg-[#c79a31]/10 hover:text-[#f3cf7a]"
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
            >
              <GitBranch aria-hidden="true" className="size-4" />
              View project on GitHub
              <ArrowUpRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <p className="text-xs text-[#6f788b] lg:text-right">Built for memories that keep moving.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/8 pt-5 text-xs text-[#6f788b] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} College Rage. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with <Heart aria-hidden="true" className="size-3.5 fill-[#c79a31] text-[#c79a31]" /> and care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
