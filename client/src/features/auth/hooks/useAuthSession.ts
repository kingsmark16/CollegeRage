import { isAdminUser } from '@/services/auth.service';
import { useAuthSessionQuery } from '../queries/session.query';
import { useAuthSessionStore } from '../stores/auth-session.store';

export const useAuthSession = () => {
  const query = useAuthSessionQuery();
  const user = useAuthSessionStore((state) => state.user);
  const apiUser = useAuthSessionStore((state) => state.apiUser);
  const error = useAuthSessionStore((state) => state.error);
  const status = useAuthSessionStore((state) => state.status);

  return {
    apiUser,
    error,
    isAdmin: isAdminUser(user),
    isLoading: status === 'loading' || query.isLoading,
    query,
    user,
  };
};
