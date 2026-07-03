import { Link, useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { adminNavigationItems } from '../admin-navigation';

const AdminHeader = () => {
  const location = useLocation();
  const activeItem = adminNavigationItems.find((item) => item.href === location.pathname) ?? adminNavigationItems[0];

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#131616]/92 px-4 py-4 backdrop-blur-sm sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="mt-1 text-[#f2ede4] hover:bg-[#1d2121] hover:text-[#f2ede4]" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#c79a31]">{activeItem.title}</p>
            <h1 className="mt-2 font-heading text-3xl text-[#f2ede4]">{activeItem.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a89f93]">{activeItem.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 border border-white/10 bg-black/10 px-3 py-2">
            <Search className="size-4 text-[#a89f93]" />
            <Input
              className="h-auto border-0 px-0 py-0 text-sm text-[#f2ede4] placeholder:text-[#7e776d] focus-visible:border-0"
              placeholder="Search later"
            />
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b] hover:text-[#f2ede4]"
          >
            <Bell aria-hidden="true" />
          </Button>
          <Button asChild variant="outline" className="border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b] hover:text-[#f2ede4]">
            <Link to="/">View site</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
