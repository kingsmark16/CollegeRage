import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
import { useAuthSessionStore } from '@/features/auth/stores/auth-session.store';

const AdminRoute = () => {
  const { isAdmin, isLoading, user } = useAuthSession();
  const setRedirectPath = useAuthSessionStore((state) => state.setRedirectPath);
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      setRedirectPath(`${location.pathname}${location.search}`);
      return;
    }

    if (!isLoading && user && isAdmin) {
      setRedirectPath(null);
    }
  }, [isAdmin, isLoading, location.pathname, location.search, setRedirectPath, user]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0f1111] px-6 text-[#f5f0e8]">
        <p className="text-sm text-[#b2aba3]">Loading the dashboard...</p>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminRoute;
