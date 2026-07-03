import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authenticatedRequest, getApiErrorMessage } from '@/services/api.service';
import {
  type AuthCredentials,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '@/services/auth.service';
import { startDropboxAuthorization } from '@/services/dropbox.service';
import type { AuthenticatedUserResponse } from '../auth.types';
import { authSessionQueryKey, authSessionQueryOptions } from '../queries/session.query';
import { useAuthSessionStore } from '../stores/auth-session.store';

type AuthMode = 'sign-in' | 'sign-up';

export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const setApiUser = useAuthSessionStore((state) => state.setApiUser);
  const setError = useAuthSessionStore((state) => state.setError);
  const resetSession = useAuthSessionStore((state) => state.resetSession);

  const refreshSession = async () => {
    await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
    return queryClient.fetchQuery(authSessionQueryOptions);
  };

  const authMutation = useMutation({
    mutationFn: async ({ mode, credentials }: { mode: AuthMode; credentials: AuthCredentials }) => {
      if (mode === 'sign-up') {
        return signUpWithEmail(credentials);
      }

      return signInWithEmail(credentials);
    },
    onSuccess: async () => {
      setError(null);
      setApiUser(null);
      await refreshSession();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Authentication failed.'));
    },
  });

  const verifyApiMutation = useMutation({
    mutationFn: () => authenticatedRequest<AuthenticatedUserResponse>('/auth/me'),
    onSuccess: (response) => {
      setError(null);
      setApiUser(response.user);
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Unable to verify API session.'));
    },
  });

  const connectDropboxMutation = useMutation({
    mutationFn: startDropboxAuthorization,
    onSuccess: (authorizationUrl) => {
      setError(null);
      window.location.assign(authorizationUrl);
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Unable to start Dropbox authorization.'));
    },
  });

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      resetSession();
      await refreshSession();
    },
    onError: (error) => {
      setError(getApiErrorMessage(error, 'Unable to sign out.'));
    },
  });

  return {
    authMutation,
    connectDropboxMutation,
    signOutMutation,
    verifyApiMutation,
  };
};
