import { Outlet } from 'react-router-dom';
import AnalyticsTracker from '@/features/analytics/AnalyticsTracker';

const PublicLayout = () => {
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
};

export default PublicLayout;
