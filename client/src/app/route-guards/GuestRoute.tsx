import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingExperience from '@/components/LoadingExperience';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAuthSessionStore } from '@/features/auth/stores/auth-session.store';

const GuestRoute = () => {
  const { isAdmin, isLoading, user } = useAuthSession();
  const redirectPath = useAuthSessionStore((state) => state.redirectPath);
  const location = useLocation();

  if (isLoading) {
    return <LoadingExperience variant="session" />;
  }

  if (user && isAdmin) {
    return <Navigate to={redirectPath || '/admin'} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default GuestRoute;
