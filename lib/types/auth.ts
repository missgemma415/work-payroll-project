import { z } from 'zod';
import type { User } from './database';

// Auth-specific user type with password
export interface AuthUser extends User {
  password_hash: string;
}

// JWT Token payload
export interface TokenPayload {
  sub: string; // user id
  email: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  iat?: number;
  exp?: number;
}

// Auth session
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Register request schema
export const RegisterRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  department: z.string().optional(),
  position: z.string().optional(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// Refresh token request
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

// Auth response types
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterResponse extends LoginResponse {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

// Password reset schemas
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;