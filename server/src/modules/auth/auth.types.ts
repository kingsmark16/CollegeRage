export type NeonAuthUser = {
  id: string;
  email?: string;
  name?: string;
  image?: string | null;
  role?: string;
  roles?: string[];
  emailVerified?: boolean;
};

export type AuthenticatedUserResponse = {
  user: NeonAuthUser;
};
