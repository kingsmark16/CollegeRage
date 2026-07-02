import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAuthSessionStore } from '@/features/auth/stores/auth-session.store';

const GuestRoute = () => {
  const { isAdmin, isLoading, user } = useAuthSession();
  const redirectPath = useAuthSessionStore((state) => state.redirectPath);
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#121414] px-6 text-[#e2e2e2]">
        <p className="text-sm text-[#999999]">Checking your session...</p>
      </main>
    );
  }

  if (user && isAdmin) {
    return <Navigate to={redirectPath || '/admin'} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default GuestRoute;
