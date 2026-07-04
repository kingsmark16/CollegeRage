import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '../query-client';

const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'border border-white/10 bg-[#171919] text-[#f2ede4]',
          duration: 4000,
          style: {
            background: '#171919',
            border: '1px solid rgb(255 255 255 / 0.1)',
            borderRadius: '0px',
            color: '#f2ede4',
          },
          success: {
            iconTheme: {
              primary: '#c79a31',
              secondary: '#171919',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#171919',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};

export default AppProviders;
