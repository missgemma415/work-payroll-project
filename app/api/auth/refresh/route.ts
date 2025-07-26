import { errorResponse, successResponse } from '@/lib/api-response';
import { generateTokens } from '@/lib/auth/jwt';
import { authStore } from '@/lib/auth/store';
import { env } from '@/lib/env';
import { RefreshTokenRequestSchema } from '@/lib/types/auth';

import type { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body = (await request.json()) as unknown;
    const validationResult = RefreshTokenRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        validationResult.error.errors[0]?.message ?? 'Invalid request data',
        400
      );
    }

    const { refreshToken } = validationResult.data;

    // Get refresh token data
    const tokenData = authStore.getRefreshToken(refreshToken);
    if (!tokenData) {
      return errorResponse('INVALID_TOKEN', 'Invalid or expired refresh token', 401);
    }

    // Get user
    const authUser = authStore.getUserById(tokenData.userId);
    if (!authUser) {
      return errorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    // Check if user is still active
    if (authUser.status !== 'active') {
      // Delete the refresh token since user is not active
      authStore.deleteRefreshToken(refreshToken);
      return errorResponse('ACCOUNT_INACTIVE', 'Your account is not active', 403);
    }

    // Delete old refresh token
    authStore.deleteRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = await generateTokens({
      sub: authUser.id,
      email: authUser.email,
      organizationId: authUser.organization_id,
      role: authUser.role,
    });

    // Save new refresh token
    const refreshTokenExpiry = new Date(Date.now() + parseDuration(env.REFRESH_TOKEN_EXPIRES_IN));
    authStore.saveRefreshToken(tokens.refreshToken, authUser.id, refreshTokenExpiry);

    // Remove password from response
    const { password_hash: _password_hash, ...user } = authUser;

    return successResponse({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while refreshing token', 500);
  }
}

// Helper function to parse duration
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([dhms])$/);
  if (!match) return 30 * 24 * 60 * 60 * 1000; // Default to 30 days

  const [, value, unit] = match;
  const num = parseInt(value ?? '30', 10);

  switch (unit) {
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'm':
      return num * 60 * 1000;
    case 's':
      return num * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
}
