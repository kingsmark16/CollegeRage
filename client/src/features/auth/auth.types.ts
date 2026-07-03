export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  role?: string;
  emailVerified?: boolean;
};

export type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
};

export type SessionData = {
  user?: SessionUser | null;
};

export type AuthenticatedUserResponse = {
  user: AuthUser;
};
