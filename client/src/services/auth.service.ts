import { createInternalNeonAuth } from '@neondatabase/neon-js/auth';
import type { AuthUser, SessionData } from '@/features/auth/auth.types';

const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL as string | undefined;

const getNeonAuth = () => {
  if (!neonAuthUrl) {
    throw new Error('VITE_NEON_AUTH_URL is required to use Neon Auth.');
  }

  return createInternalNeonAuth(neonAuthUrl);
};

const getAuthClient = () => {
  return getNeonAuth().adapter;
};

export type AuthMode = 'sign-in' | 'sign-up';

export type AuthCredentials = {
  email: string;
  password: string;
  name?: string;
};

const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean);

export const normalizeSessionUser = (sessionData: SessionData | null): AuthUser | null => {
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

export const isAdminUser = (user: AuthUser | null) => {
  if (!user) {
    return false;
  }

  if (user.role?.toLowerCase() === 'admin') {
    return true;
  }

  if (!user.email) {
    return adminEmails.length === 0;
  }

  return adminEmails.length === 0 || adminEmails.includes(user.email.toLowerCase());
};

export const getCurrentSession = async () => {
  const authClient = getAuthClient();
  const result = await authClient.getSession();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
};

export const getAuthToken = async () => {
  const token = await getNeonAuth().getJWTToken();

  if (!token) {
    throw new Error('Authentication token is required. Please sign in again.');
  }

  return token;
};

export const getOptionalAuthToken = async () => {
  try {
    return await getNeonAuth().getJWTToken();
  } catch {
    return null;
  }
};

export const signInWithEmail = async ({ email, password }: AuthCredentials) => {
  const authClient = getAuthClient();
  const result = await authClient.signIn.email({ email, password });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return getCurrentSession();
};

export const signUpWithEmail = async ({ email, password, name }: AuthCredentials) => {
  const authClient = getAuthClient();
  const result = await authClient.signUp.email({
    email,
    password,
    name: name?.trim() || email.split('@')[0] || 'User',
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return getCurrentSession();
};

export const signOut = async () => {
  const authClient = getAuthClient();
  const result = await authClient.signOut();

  if (result.error) {
    throw new Error(result.error.message);
  }
};
