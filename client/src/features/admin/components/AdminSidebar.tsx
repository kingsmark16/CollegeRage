import { Link, NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import screenLogo from '@/assets/screen.png';
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
import { adminNavigationItems } from '../admin-navigation';

const AdminSidebar = () => {
  const { signOutMutation, signOutUser } = useAuthActions();
  const isBusy = signOutMutation.isPending;

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="bg-[#04060a] [--sidebar:#080b11] [--sidebar-accent:#141a24] [--sidebar-accent-foreground:#f5f1ea] [--sidebar-border:rgb(255_255_255_/_0.08)] [--sidebar-foreground:#d7d2ca] [--sidebar-primary:#8f7cff] [--sidebar-primary-foreground:#ffffff] [--sidebar-ring:#8f7cff]"
    >
      <SidebarHeader className="items-center gap-3 px-3 py-6">
        <Link to="/admin" className="flex items-center justify-center group-data-[collapsible=icon]:w-full">
          <div className="flex size-40 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#0f1420] shadow-[0_0_28px_rgba(143,124,255,0.18)] transition-transform duration-200 hover:scale-[1.02] group-data-[collapsible=icon]:size-13">
            <img
              src={screenLogo}
              alt="College Rage"
              className="size-full rounded-full object-cover"
            />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-white/8" />

      <SidebarContent className="px-2 pb-2 group-data-[collapsible=icon]:items-center">
        <SidebarGroup className="group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
          <SidebarGroupLabel className="px-3 text-[10px] tracking-[0.24em] text-[#7f89a3]">
            Admin Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {adminNavigationItems.map((item) => (
                <SidebarMenuItem
                  key={item.href}
                  className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center"
                >
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="text-[#b9c0ce] hover:bg-[#141a24] hover:text-[#f5f1ea] data-[active=true]:bg-[#141a24] data-[active=true]:text-[#f5f1ea] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                  >
                    <NavLink
                      to={item.href}
                      end={item.href === '/admin'}
                      className={({ isActive }) =>
                        cn(
                          'transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0',
                          isActive ? 'bg-[#141a24] text-[#f5f1ea]' : 'text-[#b9c0ce]'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon aria-hidden="true" className={isActive ? 'text-[#8f7cff]' : 'text-[#7f89a3]'} />
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
          className="w-full justify-start border-white/10 bg-[#0d1118] text-[#f5f1ea] hover:border-[#8f7cff]/45 hover:bg-[#121720] hover:text-[#fcfbf8] group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => void signOutUser()}
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
