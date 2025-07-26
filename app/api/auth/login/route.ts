import { NextResponse, type NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { LoginRequestSchema } from '@/lib/types/auth';
import { authStore } from '@/lib/auth/store';
import { generateTokens } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/api-response';
import { env } from '@/lib/env';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = LoginRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        validationResult.error.errors[0]?.message || 'Invalid request data',
        400
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const authUser = await authStore.getUserByEmail(email);
    if (!authUser) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, authUser.password_hash);
    if (!isPasswordValid) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Check if user is active
    if (authUser.status !== 'active') {
      return errorResponse('ACCOUNT_INACTIVE', 'Your account is not active', 403);
    }

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await generateTokens({
      sub: authUser.id,
      email: authUser.email,
      organizationId: authUser.organization_id,
      role: authUser.role,
    });

    // Save refresh token
    const refreshTokenExpiry = new Date(
      Date.now() + parseDuration(env.REFRESH_TOKEN_EXPIRES_IN)
    );
    await authStore.saveRefreshToken(refreshToken, authUser.id, refreshTokenExpiry);

    // Remove password from response
    const { password_hash, ...user } = authUser;

    return successResponse({
      user,
      accessToken,
      refreshToken,
      expiresIn,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred during login', 500);
  }
}

// Helper function to parse duration
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default to 7 days

  const [, value, unit] = match;
  const num = parseInt(value!, 10);

  switch (unit) {
    case 'd': return num * 24 * 60 * 60 * 1000;
    case 'h': return num * 60 * 60 * 1000;
    case 'm': return num * 60 * 1000;
    case 's': return num * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}