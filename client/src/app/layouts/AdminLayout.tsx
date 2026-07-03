import { Outlet } from 'react-router-dom';
import AnalyticsTracker from '@/features/analytics/AnalyticsTracker';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AdminFooter from '@/features/admin/components/AdminFooter';
import AdminHeader from '@/features/admin/components/AdminHeader';
import AdminSidebar from '@/features/admin/components/AdminSidebar';

const AdminLayout = () => {
  return (
    <TooltipProvider>
      <AnalyticsTracker />
      <SidebarProvider defaultOpen>
        <AdminSidebar />
        <SidebarInset className="min-h-screen bg-[#0f1111] text-[#f2ede4]">
          <AdminHeader />
          <div className="flex flex-1 flex-col">
            <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
            <AdminFooter />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default AdminLayout;
