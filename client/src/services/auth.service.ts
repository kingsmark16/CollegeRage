import { createInternalNeonAuth } from '@neondatabase/neon-js/auth';

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
