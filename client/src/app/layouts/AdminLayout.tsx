import { Outlet } from 'react-router-dom';
import AnalyticsTracker from '@/features/analytics/AnalyticsTracker';

const AdminLayout = () => {
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
};

export default AdminLayout;
