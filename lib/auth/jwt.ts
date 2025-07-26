import { SignJWT, jwtVerify } from 'jose';
import { env } from '@/lib/env';
import type { TokenPayload } from '@/lib/types/auth';

// Create a secret key from the environment variable
const secret = new TextEncoder().encode(env.JWT_SECRET);

// Parse duration string (e.g., '7d', '24h', '30m') to milliseconds
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const [, value, unit] = match;
  const num = parseInt(value!, 10);

  switch (unit) {
    case 'd': return num * 24 * 60 * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'm': return num * 60 * 1000;
    case 's': return num * 1000;
    default: throw new Error(`Invalid duration unit: ${unit}`);
  }
}

// Generate access token
export async function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
  const expiresIn = parseDuration(env.JWT_EXPIRES_IN);
  
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + expiresIn))
    .sign(secret);
}

// Generate refresh token
export async function generateRefreshToken(): Promise<string> {
  // Refresh tokens are simple random strings stored in the database
  // This approach allows us to revoke them easily
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64url');
}

// Verify access token
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

// Generate both tokens for a user
export async function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>) {
  const accessToken = await generateAccessToken(payload);
  const refreshToken = await generateRefreshToken();
  const expiresIn = parseDuration(env.JWT_EXPIRES_IN);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: expiresIn / 1000, // Return in seconds
  };
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1] || null;
}