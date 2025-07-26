import { errorResponse, successResponse } from '@/lib/api-response';
import { extractTokenFromHeader, verifyAccessToken } from '@/lib/auth/jwt';
import { authStore } from '@/lib/auth/store';

import type { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return errorResponse('MISSING_TOKEN', 'Authorization token is required', 401);
    }

    // Verify token
    const payload = await verifyAccessToken(token);
    if (!payload) {
      return errorResponse('INVALID_TOKEN', 'Invalid or expired token', 401);
    }

    // Get user from store
    const authUser = authStore.getUserById(payload.sub);
    if (!authUser) {
      return errorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    // Get organization
    const organization = authStore.getOrganizationById(authUser.organization_id);
    if (!organization) {
      return errorResponse('ORG_NOT_FOUND', 'Organization not found', 404);
    }

    // Remove password from response
    const { password_hash: _password_hash, ...user } = authUser;

    return successResponse({
      user,
      organization,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred while fetching user data', 500);
  }
}
