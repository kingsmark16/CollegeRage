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

const getRecordClaim = (payload: JWTPayload, key: string) => {
  const value = payload[key];
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
};

const getNestedStringClaim = (payload: JWTPayload, objectKey: string, key: string) => {
  const record = getRecordClaim(payload, objectKey);
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
};

const getStringArrayClaim = (payload: JWTPayload, key: string) => {
  const value = payload[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;
};

const getNestedStringArrayClaim = (payload: JWTPayload, objectKey: string, key: string) => {
  const record = getRecordClaim(payload, objectKey);
  const value = record?.[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : undefined;
};

export const mapNeonAuthPayloadToUser = (payload: JWTPayload): NeonAuthUser => {
  const user: NeonAuthUser = {
    id: payload.sub ?? getStringClaim(payload, 'id') ?? '',
    image: getStringClaim(payload, 'image') ?? null,
  };
  const email = getStringClaim(payload, 'email');
  const name = getStringClaim(payload, 'name');
  const role =
    getStringClaim(payload, 'role') ??
    getNestedStringClaim(payload, 'app_metadata', 'role') ??
    getNestedStringClaim(payload, 'publicMetadata', 'role') ??
    getNestedStringClaim(payload, 'metadata', 'role');
  const roles =
    getStringArrayClaim(payload, 'roles') ??
    getNestedStringArrayClaim(payload, 'app_metadata', 'roles') ??
    getNestedStringArrayClaim(payload, 'publicMetadata', 'roles') ??
    getNestedStringArrayClaim(payload, 'metadata', 'roles');
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

  if (roles?.length) {
    user.roles = roles;
  }

  if (emailVerified !== undefined) {
    user.emailVerified = emailVerified;
  }

  return user;
};

export const getAuthenticatedUser = (user: NeonAuthUser): AuthenticatedUserResponse => ({
  user,
});
