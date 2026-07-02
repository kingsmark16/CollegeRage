export type DropboxTokenResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  account_id?: string;
  uid?: string;
};

export type StoredDropboxCredential = {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: Date;
};
