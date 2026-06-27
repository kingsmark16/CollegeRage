export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  role?: string;
  emailVerified?: boolean;
};

export type AuthenticatedUserResponse = {
  user: AuthUser;
};
