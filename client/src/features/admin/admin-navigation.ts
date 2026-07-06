import { Cloud, Disc3, LayoutDashboard, Upload } from 'lucide-react';

export const adminNavigationItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Session, connection status, and quick admin summary.',
  },
  {
    title: 'Music',
    href: '/admin/music',
    icon: Disc3,
    description: 'Upload and manage background tracks.',
  },
  {
    title: 'Media',
    href: '/admin/media',
    icon: Upload,
    description: 'Image and video tools live here next.',
  },
] as const;

export const adminUtilityItems = [
  {
    title: 'Dropbox',
    href: '/admin',
    icon: Cloud,
    description: 'Connection and storage controls.',
  },
] as const;
