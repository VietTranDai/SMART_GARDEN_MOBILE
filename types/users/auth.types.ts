/**
 * Authentication Types
 *
 * Type definitions for authentication-related data
 */
import { AppUser } from "./user.types";

// Storage key for auth data
export const AUTH_KEY = "auth_data";

// Login credentials payload
export interface LoginCredentials {
  username: string;
  password: string;
}

// Token response from API
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// Login data (stored in AsyncStorage)
export interface LoginData {
  access_token: string;
  refresh_token?: string;
  user?: AppUser;
}

// Registration payload
export interface RegisterUserDto {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
}
