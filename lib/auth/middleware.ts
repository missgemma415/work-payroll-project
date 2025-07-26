import { NextResponse, type NextRequest } from 'next/server';
import { verifyAccessToken, extractTokenFromHeader } from './jwt';
import { authStore } from './store';
import type { TokenPayload } from '@/lib/types/auth';
import type { User } from '@/lib/types/database';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  auth?: TokenPayload;
}

// Middleware to verify JWT and attach user to request
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_TOKEN',
              message: 'Authorization token is required',
            },
          },
          { status: 401 }
        );
      }

      // Verify token
      const payload = await verifyAccessToken(token);
      if (!payload) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired token',
            },
          },
          { status: 401 }
        );
      }

      // Get user from store
      const authUser = await authStore.getUserById(payload.sub);
      if (!authUser) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          },
          { status: 404 }
        );
      }

      // Check if user is active
      if (authUser.status !== 'active') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'ACCOUNT_INACTIVE',
              message: 'Your account is not active',
            },
          },
          { status: 403 }
        );
      }

      // Remove password from user object
      const { password_hash, ...user } = authUser;

      // Create authenticated request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;
      authenticatedRequest.auth = payload;

      // Call the handler with authenticated request
      return handler(authenticatedRequest);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Authentication failed',
          },
        },
        { status: 500 }
      );
    }
  };
}

// Middleware to check if user has specific role
export function withRole(allowedRoles: Array<'owner' | 'admin' | 'member'>) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'You do not have permission to perform this action',
            },
          },
          { status: 403 }
        );
      }

      return handler(req);
    });
  };
}

// Middleware to check if user belongs to the organization
export function withOrganization(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    // Extract organization ID from request (e.g., from query params or body)
    const orgId = req.nextUrl.searchParams.get('organizationId') || 
                  req.auth?.organizationId;

    if (!orgId || req.user?.organization_id !== orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORGANIZATION_MISMATCH',
            message: 'You do not have access to this organization',
          },
        },
        { status: 403 }
      );
    }

    return handler(req);
  });
}