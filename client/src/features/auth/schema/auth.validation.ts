import { z } from 'zod';
import type { AuthCredentials, AuthMode } from '@/services/auth.service';

export type AuthFieldErrors = Partial<Record<keyof AuthCredentials, string>>;

const signInSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  name: z.string().optional(),
});

const signUpSchema = signInSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be 80 characters or less.'),
});

const getAuthSchema = (mode: AuthMode) => {
  return mode === 'sign-up' ? signUpSchema : signInSchema;
};

export const validateAuthCredentials = (
  mode: AuthMode,
  credentials: AuthCredentials,
): { credentials: AuthCredentials; errors: null } | { credentials: null; errors: AuthFieldErrors } => {
  const result = getAuthSchema(mode).safeParse(credentials);

  if (result.success) {
    return {
      credentials: result.data,
      errors: null,
    };
  }

  const { fieldErrors } = result.error.flatten();

  return {
    credentials: null,
    errors: {
      email: fieldErrors.email?.[0],
      name: fieldErrors.name?.[0],
      password: fieldErrors.password?.[0],
    },
  };
};

export const validateAuthField = (
  mode: AuthMode,
  field: keyof AuthCredentials,
  credentials: AuthCredentials,
) => {
  const result = getAuthSchema(mode).safeParse(credentials);

  if (result.success) {
    return undefined;
  }

  return result.error.flatten().fieldErrors[field]?.[0];
};
