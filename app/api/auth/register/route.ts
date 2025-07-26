import bcrypt from 'bcryptjs';

import { errorResponse, successResponse } from '@/lib/api-response';
import { generateTokens } from '@/lib/auth/jwt';
import { authStore } from '@/lib/auth/store';
import { env } from '@/lib/env';
import type { AuthUser } from '@/lib/types/auth';
import { RegisterRequestSchema } from '@/lib/types/auth';
import type { Organization } from '@/lib/types/database';

import type { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if registration is enabled
    if (!env.ENABLE_REGISTRATION) {
      return errorResponse('REGISTRATION_DISABLED', 'Registration is currently disabled', 403);
    }

    // Parse and validate request body
    const body = (await request.json()) as unknown;
    const validationResult = RegisterRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        validationResult.error.errors[0]?.message ?? 'Invalid request data',
        400
      );
    }

    const { email, password, firstName, lastName, organizationName, department, position } =
      validationResult.data;

    // Check if user already exists
    const existingUser = authStore.getUserByEmail(email);
    if (existingUser) {
      return errorResponse('USER_EXISTS', 'A user with this email already exists', 409);
    }

    // Generate IDs
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orgId = `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const orgSlug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if org slug is taken
    const existingOrg = authStore.getOrganizationBySlug(orgSlug);
    if (existingOrg) {
      return errorResponse('ORG_EXISTS', 'An organization with this name already exists', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Create organization
    const organization: Organization = {
      id: orgId,
      name: organizationName,
      slug: orgSlug,
      subscription_tier: 'starter',
      settings: {
        features: {
          moodCheckins: true,
          kudos: true,
          priorities: true,
          teamPulse: true,
        },
        notifications: {
          dailyReminders: true,
          weeklyReports: true,
          kudosAlerts: true,
        },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    authStore.createOrganization(organization);

    // Create user
    const newUser: AuthUser = {
      id: userId,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      name: `${firstName} ${lastName}`, // Combined name for auth
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      organization_id: orgId,
      role: 'owner', // First user is the owner
      department: department ?? null,
      position: position ?? null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    authStore.createUser(newUser);

    // Generate tokens
    const { accessToken, refreshToken, expiresIn } = await generateTokens({
      sub: newUser.id,
      email: newUser.email,
      organizationId: newUser.organization_id,
      role: newUser.role,
    });

    // Save refresh token
    const refreshTokenExpiry = new Date(Date.now() + parseDuration(env.REFRESH_TOKEN_EXPIRES_IN));
    authStore.saveRefreshToken(refreshToken, newUser.id, refreshTokenExpiry);

    // Remove password from response
    const { password_hash: _password_hash, ...user } = newUser;

    return successResponse({
      user,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      accessToken,
      refreshToken,
      expiresIn,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('SERVER_ERROR', 'An error occurred during registration', 500);
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
