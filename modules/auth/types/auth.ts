export const AUTH_KEY = "auth_data";

export type LoginCredentials = {
  username: string;
  password: string;
};

export interface TokenResponse {
  access_token: string;
}

export interface LoginData {
  access_token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
}
