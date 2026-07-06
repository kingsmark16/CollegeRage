import { createBrowserRouter, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import PublicLayout from './layouts/PublicLayout';
import AdminRoute from './route-guards/AdminRoute';
import GuestRoute from './route-guards/GuestRoute';
import MediaPage from '@/features/admin/pages/MediaPage';
import MusicPage from '@/features/admin/pages/MusicPage';
import OverviewPage from '@/features/admin/pages/OverviewPage';
import AuthPage from '@/features/auth/pages/AuthPage';
import HomePage from '@/features/home/pages/HomePage';

export const appRouter = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'sign-in',
            element: <AuthPage mode="sign-in" />,
          },
          {
            path: 'sign-up',
            element: <AuthPage mode="sign-up" />,
          },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <OverviewPage />,
          },
          {
            path: 'music',
            element: <MusicPage />,
          },
          {
            path: 'media',
            element: <MediaPage />,
          },
          {
            path: 'analytics',
            element: <Navigate to="/admin" replace />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
