import { useMutation, useQueryClient } from '@tanstack/react-query';
import { appToast, getErrorMessage, notifyAsync } from '@/lib/toast';
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
      setApiUser(null);
      await refreshSession();
    },
  });

  const verifyApiMutation = useMutation({
    mutationFn: () => authenticatedRequest<AuthenticatedUserResponse>('/auth/me'),
    onSuccess: (response) => {
      setApiUser(response.user);
    },
    onError: () => {
      setApiUser(null);
    },
  });

  const connectDropboxMutation = useMutation({
    mutationFn: startDropboxAuthorization,
  });

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      resetSession();
      await refreshSession();
    },
  });

  const submitAuth = async ({
    mode,
    credentials,
  }: {
    mode: AuthMode;
    credentials: AuthCredentials;
  }) => {
    return notifyAsync(authMutation.mutateAsync({ mode, credentials }), {
      loading: mode === 'sign-in' ? 'Signing in...' : 'Creating account...',
      success: mode === 'sign-in' ? 'Signed in successfully.' : 'Account created successfully.',
      error: (error) => getApiErrorMessage(error, 'Authentication failed.'),
    });
  };

  const verifyApi = async () => {
    return notifyAsync(verifyApiMutation.mutateAsync(), {
      loading: 'Verifying API session...',
      success: (response) => `API verified for ${response.user.email ?? response.user.id}.`,
      error: (error) => getApiErrorMessage(error, 'Unable to verify API session.'),
    });
  };

  const connectDropbox = async () => {
    const toastId = appToast.loading('Preparing Dropbox connection...');

    try {
      const authorizationUrl = await connectDropboxMutation.mutateAsync();
      appToast.success('Redirecting to Dropbox...', { id: toastId });
      window.location.assign(authorizationUrl);
      return authorizationUrl;
    } catch (error) {
      appToast.error(getErrorMessage(error, 'Unable to start Dropbox authorization.'), { id: toastId });
      throw error;
    }
  };

  const signOutUser = async () => {
    return notifyAsync(signOutMutation.mutateAsync(), {
      loading: 'Signing out...',
      success: 'Signed out successfully.',
      error: (error) => getApiErrorMessage(error, 'Unable to sign out.'),
    });
  };

  return {
    authMutation,
    connectDropbox,
    connectDropboxMutation,
    signOutUser,
    signOutMutation,
    submitAuth,
    verifyApi,
    verifyApiMutation,
  };
};
