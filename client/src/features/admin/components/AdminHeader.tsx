import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { adminNavigationItems } from '../admin-navigation';

const AdminHeader = () => {
  const location = useLocation();
  const activeItem = adminNavigationItems.find((item) => item.href === location.pathname) ?? adminNavigationItems[0];

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#131616]/92 px-3 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
      <div className="flex min-h-10 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <SidebarTrigger className="shrink-0 text-[#f2ede4] hover:bg-[#1d2121] hover:text-[#f2ede4]" />
          <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c79a31] sm:text-xs sm:tracking-[0.24em]">
            {activeItem.title}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="h-9 shrink-0 border-[#3e3f3f] px-3 text-xs text-[#f2ede4] hover:bg-[#181b1b] hover:text-[#f2ede4] sm:h-10 sm:px-4 sm:text-sm"
        >
          <Link to="/">View site</Link>
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
