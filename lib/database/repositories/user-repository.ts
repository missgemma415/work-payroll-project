import { hash, compare } from 'bcryptjs';

import { env } from '@/lib/env';
import type { RegisterRequest } from '@/lib/types/auth';

import { query, queryOne, transaction } from '../connection';

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  organization_id: string;
  role: 'owner' | 'admin' | 'member';
  department: string | null;
  position: string | null;
  hire_date: string | null;
  status: 'active' | 'inactive' | 'pending';
  timezone: string;
  preferences: Record<string, unknown>;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  revoked: boolean;
  created_at: string;
}

export class UserRepository {
  // Create user with organization
  async createUserWithOrganization(
    userData: RegisterRequest
  ): Promise<{ user: User; organization: Organization }> {
    return transaction(async (client) => {
      // Generate organization slug from name
      const slug = userData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create organization first
      const orgResult = await client.query(
        `INSERT INTO organizations (name, slug, subscription_tier)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userData.organizationName, slug, 'starter']
      );

      const organization = orgResult.rows[0] as Organization;

      // Hash password
      const passwordHash = await hash(userData.password, env.BCRYPT_ROUNDS);

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (
           email, password_hash, first_name, last_name,
           organization_id, role, department, position
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, first_name, last_name, avatar_url,
                   organization_id, role, department, position,
                   hire_date, status, timezone, preferences,
                   email_verified, last_login, created_at, updated_at`,
        [
          userData.email,
          passwordHash,
          userData.firstName,
          userData.lastName,
          organization.id,
          'owner', // First user in organization is owner
          userData.department ?? null,
          userData.position ?? null,
        ]
      );

      const user = userResult.rows[0] as User;

      return { user, organization };
    });
  }

  // Find user by email for login
  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    return queryOne<UserWithPassword>(
      `SELECT u.*, o.name as organization_name, o.slug as organization_slug
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.email = $1 AND u.status = 'active'`,
      [email]
    );
  }

  // Find user by ID
  async findById(userId: string): Promise<User | null> {
    return queryOne<User>(
      `SELECT id, email, first_name, last_name, avatar_url,
              organization_id, role, department, position,
              hire_date, status, timezone, preferences,
              email_verified, last_login, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [userId]
    );
  }

  // Find user with organization details
  async findByIdWithOrganization(
    userId: string
  ): Promise<(User & { organization: Organization }) | null> {
    return queryOne<User & { organization: Organization }>(
      `SELECT 
         u.id, u.email, u.first_name, u.last_name, u.avatar_url,
         u.organization_id, u.role, u.department, u.position,
         u.hire_date, u.status, u.timezone, u.preferences,
         u.email_verified, u.last_login, u.created_at, u.updated_at,
         jsonb_build_object(
           'id', o.id,
           'name', o.name,
           'slug', o.slug,
           'subscription_tier', o.subscription_tier,
           'settings', o.settings,
           'created_at', o.created_at,
           'updated_at', o.updated_at
         ) as organization
       FROM users u
       JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [userId]
    );
  }

  // Verify password
  async verifyPassword(email: string, password: string): Promise<User | null> {
    const userWithPassword = await this.findByEmailWithPassword(email);
    if (!userWithPassword) {
      return null;
    }

    const isValid = await compare(password, userWithPassword.password_hash);
    if (!isValid) {
      return null;
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [userWithPassword.id]);

    // Return user without password hash
    const { password_hash: _password_hash, ...user } = userWithPassword;
    return user as User;
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const result = await queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
      [email]
    );
    return result?.exists ?? false;
  }

  // Store refresh token
  async storeRefreshToken(userId: string, token: string, expiresInMs: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInMs);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
  }

  // Find refresh token
  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return queryOne<RefreshToken>(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND expires_at > NOW() AND revoked = false`,
      [token]
    );
  }

  // Revoke refresh token
  async revokeRefreshToken(token: string): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked = true WHERE token = $1', [token]);
  }

  // Revoke all user refresh tokens
  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    await query('SELECT cleanup_expired_tokens()');
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updates: Partial<
      Pick<
        User,
        | 'first_name'
        | 'last_name'
        | 'avatar_url'
        | 'department'
        | 'position'
        | 'timezone'
        | 'preferences'
      >
    >
  ): Promise<User | null> {
    const setParts: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      setParts.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    });

    if (setParts.length === 0) {
      return this.findById(userId);
    }

    values.push(userId);

    return queryOne<User>(
      `UPDATE users 
       SET ${setParts.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, email, first_name, last_name, avatar_url,
                 organization_id, role, department, position,
                 hire_date, status, timezone, preferences,
                 email_verified, last_login, created_at, updated_at`,
      values
    );
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
