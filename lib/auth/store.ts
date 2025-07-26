import bcrypt from 'bcryptjs';

import { env } from '@/lib/env';
import type { AuthUser } from '@/lib/types/auth';
import type { Organization } from '@/lib/types/database';

// Temporary in-memory storage for auth
// TODO: Replace with real database
interface AuthStore {
  users: Map<string, AuthUser>;
  organizations: Map<string, Organization>;
  refreshTokens: Map<string, { userId: string; expiresAt: Date }>;
}

const store: AuthStore = {
  users: new Map(),
  organizations: new Map(),
  refreshTokens: new Map(),
};

// Initialize with a demo user for development
if (env.ENABLE_MOCK_DATA) {
  const demoOrgId = 'org-demo';
  const demoUserId = 'user-demo';

  // Create demo organization
  store.organizations.set(demoOrgId, {
    id: demoOrgId,
    name: 'Demo Organization',
    slug: 'demo-org',
    subscription_tier: 'professional',
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
  });

  // Create demo user with hashed password
  const hashedPassword = bcrypt.hashSync('demo123456', env.BCRYPT_ROUNDS);
  const demoUser: AuthUser = {
    id: demoUserId,
    email: 'demo@example.com',
    password_hash: hashedPassword,
    name: 'Demo User', // Combined name for auth
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    organization_id: demoOrgId,
    role: 'admin',
    department: 'Engineering',
    position: 'Software Engineer',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.users.set(demoUserId, demoUser);
}

// Auth store methods
export const authStore = {
  // User methods
  createUser(user: AuthUser): void {
    store.users.set(user.id, user);
  },

  getUserById(id: string): AuthUser | null {
    return store.users.get(id) ?? null;
  },

  getUserByEmail(email: string): AuthUser | null {
    for (const user of store.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  updateUser(id: string, updates: Partial<AuthUser>): void {
    const user = store.users.get(id);
    if (user) {
      store.users.set(id, { ...user, ...updates, updated_at: new Date().toISOString() });
    }
  },

  // Organization methods
  createOrganization(org: Organization): void {
    store.organizations.set(org.id, org);
  },

  getOrganizationById(id: string): Organization | null {
    return store.organizations.get(id) ?? null;
  },

  getOrganizationBySlug(slug: string): Organization | null {
    for (const org of store.organizations.values()) {
      if (org.slug === slug) {
        return org;
      }
    }
    return null;
  },

  // Refresh token methods
  saveRefreshToken(token: string, userId: string, expiresAt: Date): void {
    store.refreshTokens.set(token, { userId, expiresAt });
  },

  getRefreshToken(token: string): { userId: string; expiresAt: Date } | null {
    const tokenData = store.refreshTokens.get(token);
    if (!tokenData) return null;

    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      store.refreshTokens.delete(token);
      return null;
    }

    return tokenData;
  },

  deleteRefreshToken(token: string): void {
    store.refreshTokens.delete(token);
  },

  deleteUserRefreshTokens(userId: string): void {
    for (const [token, data] of store.refreshTokens.entries()) {
      if (data.userId === userId) {
        store.refreshTokens.delete(token);
      }
    }
  },

  // Utility method to clean expired tokens
  cleanExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of store.refreshTokens.entries()) {
      if (data.expiresAt < now) {
        store.refreshTokens.delete(token);
      }
    }
  },
};

// Clean expired tokens every hour
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      void authStore.cleanExpiredTokens();
    },
    60 * 60 * 1000
  );
}
