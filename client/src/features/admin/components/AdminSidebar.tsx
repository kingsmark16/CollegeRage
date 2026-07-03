import { Link, NavLink } from 'react-router-dom';
import { Cloud, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { adminNavigationItems } from '../admin-navigation';

const AdminSidebar = () => {
  const { user } = useAuthSession();
  const { connectDropboxMutation, signOutMutation } = useAuthActions();
  const isBusy = connectDropboxMutation.isPending || signOutMutation.isPending;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-4 px-3 py-4">
        <Link to="/admin" className="block">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f2ede4]">College Rage</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#c79a31]">Admin dashboard</p>
        </Link>
        <div className="border border-white/10 bg-black/10 px-3 py-3 group-data-[collapsible=icon]:hidden">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#c79a31]">Signed in</p>
          <p className="mt-2 text-sm text-[#d5d0c8]">{user?.email ?? user?.name ?? user?.id}</p>
        </div>
      </SidebarHeader>

      <SidebarSeparator className="bg-white/10" />

      <SidebarContent className="px-2 pb-2">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="text-[#d5d0c8] hover:bg-[#1d2121] hover:text-[#f2ede4]"
                  >
                    <NavLink
                      to={item.href}
                      end={item.href === '/admin'}
                      className={({ isActive }) =>
                        cn(
                          'transition-colors',
                          isActive ? 'bg-[#1d2121] text-[#f2ede4]' : 'text-[#d5d0c8]'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon aria-hidden="true" className={isActive ? 'text-[#c79a31]' : 'text-[#a89f93]'} />
                          <span>{item.title}</span>
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 px-3 py-4">
        <Button
          variant="outline"
          className="w-full justify-start border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => void connectDropboxMutation.mutateAsync()}
          disabled={isBusy}
        >
          <Cloud aria-hidden="true" />
          <span className="group-data-[collapsible=icon]:hidden">Connect Dropbox</span>
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start border-[#3e3f3f] text-[#f2ede4] hover:bg-[#181b1b] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => void signOutMutation.mutateAsync()}
          disabled={isBusy}
        >
          <LogOut aria-hidden="true" />
          <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AdminSidebar;
