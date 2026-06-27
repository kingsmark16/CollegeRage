import type { JWTPayload } from 'jose';
import type { AuthenticatedUserResponse, NeonAuthUser } from './auth.types.js';

const getStringClaim = (payload: JWTPayload, key: string) => {
  const value = payload[key];
  return typeof value === 'string' ? value : undefined;
};

const getBooleanClaim = (payload: JWTPayload, key: string) => {
  const value = payload[key];
  return typeof value === 'boolean' ? value : undefined;
};

export const mapNeonAuthPayloadToUser = (payload: JWTPayload): NeonAuthUser => {
  const user: NeonAuthUser = {
    id: payload.sub ?? getStringClaim(payload, 'id') ?? '',
    image: getStringClaim(payload, 'image') ?? null,
  };
  const email = getStringClaim(payload, 'email');
  const name = getStringClaim(payload, 'name');
  const role = getStringClaim(payload, 'role');
  const emailVerified = getBooleanClaim(payload, 'emailVerified');

  if (email) {
    user.email = email;
  }

  if (name) {
    user.name = name;
  }

  if (role) {
    user.role = role;
  }

  if (emailVerified !== undefined) {
    user.emailVerified = emailVerified;
  }

  return user;
};

export const getAuthenticatedUser = (user: NeonAuthUser): AuthenticatedUserResponse => ({
  user,
});
