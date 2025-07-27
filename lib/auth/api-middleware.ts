import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { verifyAccessToken } from './jwt';
interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or invalid authorization header' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      
      // Verify the JWT token
      const payload = await verifyAccessToken(token);
      if (!payload?.sub) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      // Create authenticated request with user info
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: payload.sub,
        email: payload.email || '',
        name: '',
      };

      // Call the handler with authenticated request
      return await handler(authenticatedReq);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

// Optional: Create a middleware for optional authentication
export function withOptionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<Response>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = await verifyAccessToken(token);
        
        if (payload?.sub) {
          const authenticatedReq = req as AuthenticatedRequest;
          authenticatedReq.user = {
            id: payload.sub,
            email: payload.email || '',
            name: '',
          };
        }
      }
    } catch (error) {
      // Ignore auth errors for optional auth
      console.warn('Optional auth failed:', error);
    }

    // Call handler regardless of auth status
    return await handler(req as AuthenticatedRequest);
  };
}