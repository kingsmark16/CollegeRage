import { useCallback, useEffect, useState } from 'react';
import {
  type AuthCredentials,
  type AuthMode,
  getCurrentSession,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '@/services/auth.service';
import { authenticatedRequest } from '@/services/api.service';
import type { AuthenticatedUserResponse, AuthUser } from '../auth.types';

type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
};

type SessionData = {
  user?: SessionUser | null;
};

const normalizeSessionUser = (sessionData: SessionData | null): AuthUser | null => {
  if (!sessionData?.user) {
    return null;
  }

  return {
    id: sessionData.user.id,
    email: sessionData.user.email,
    name: sessionData.user.name,
    image: sessionData.user.image,
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [verifiedApiUser, setVerifiedApiUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    const sessionData = (await getCurrentSession()) as SessionData | null;
    const nextUser = normalizeSessionUser(sessionData);
    setUser(nextUser);
    return nextUser;
  }, []);

  useEffect(() => {
    // Neon Auth owns the session externally; this effect hydrates React state from that source.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSession()
      .catch((sessionError: unknown) => {
        setError(sessionError instanceof Error ? sessionError.message : 'Unable to load session.');
      })
      .finally(() => setIsLoading(false));
  }, [refreshSession]);

  const submitAuth = async (mode: AuthMode, credentials: AuthCredentials) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const sessionData = mode === 'sign-up'
        ? await signUpWithEmail(credentials)
        : await signInWithEmail(credentials);
      setUser(normalizeSessionUser(sessionData as SessionData | null));
      setVerifiedApiUser(null);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyWithApi = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authenticatedRequest<AuthenticatedUserResponse>('/auth/me');
      setVerifiedApiUser(response.user);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : 'Unable to verify API session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const logOut = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await signOut();
      setUser(null);
      setVerifiedApiUser(null);
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : 'Unable to sign out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    error,
    isLoading,
    isSubmitting,
    logOut,
    submitAuth,
    user,
    verifiedApiUser,
    verifyWithApi,
  };
};
