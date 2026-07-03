import { useEffect } from 'react';
import { queryOptions, useQuery } from '@tanstack/react-query';
import type { AuthUser } from '../auth.types';
import { getCurrentSession, normalizeSessionUser } from '@/services/auth.service';
import { useAuthSessionStore } from '../stores/auth-session.store';

export const authSessionQueryKey = ['auth', 'session'] as const;

const getSessionUser = async () => normalizeSessionUser((await getCurrentSession()) ?? null);

export const authSessionQueryOptions = queryOptions<AuthUser | null>({
  queryKey: authSessionQueryKey,
  queryFn: getSessionUser,
  staleTime: 60_000,
  retry: false,
  refetchOnWindowFocus: false,
});

export const useAuthSessionQuery = () => {
  const setStatus = useAuthSessionStore((state) => state.setStatus);
  const setUser = useAuthSessionStore((state) => state.setUser);
  const setError = useAuthSessionStore((state) => state.setError);
  const setApiUser = useAuthSessionStore((state) => state.setApiUser);
  const query = useQuery(authSessionQueryOptions);

  useEffect(() => {
    setStatus(query.isLoading ? 'loading' : 'ready');
  }, [query.isLoading, setStatus]);

  useEffect(() => {
    if (query.data !== undefined) {
      setUser(query.data);

      if (!query.data) {
        setApiUser(null);
      }
    }
  }, [query.data, setApiUser, setUser]);

  useEffect(() => {
    if (query.error) {
      setError(query.error instanceof Error ? query.error.message : 'Unable to load session.');
      setStatus('ready');
      setUser(null);
      setApiUser(null);
      return;
    }

    setError(null);
  }, [query.error, setApiUser, setError, setStatus, setUser]);

  return query;
};
