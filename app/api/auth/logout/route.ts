import { successResponse } from '@/lib/api-response';
import { extractTokenFromHeader, verifyAccessToken } from '@/lib/auth/jwt';
import { authStore } from '@/lib/auth/store';

import type { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      // If no token, just return success (already logged out)
      return successResponse({ message: 'Logged out successfully' });
    }

    // Verify token to get user ID
    const payload = await verifyAccessToken(token);
    if (payload) {
      // Delete all refresh tokens for this user
      authStore.deleteUserRefreshTokens(payload.sub);
    }

    return successResponse({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, we return success for logout
    return successResponse({ message: 'Logged out successfully' });
  }
}
