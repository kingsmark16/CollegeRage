import { Outlet } from 'react-router-dom';
import AnalyticsTracker from '@/features/analytics/AnalyticsTracker';

const AuthLayout = () => {
  return (
    <>
      <AnalyticsTracker />
      <Outlet />
    </>
  );
};

export default AuthLayout;
