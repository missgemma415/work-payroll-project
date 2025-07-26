import bcrypt from 'bcryptjs';
import type { AuthUser } from '@/lib/types/auth';
import type { Organization } from '@/lib/types/database';
import { env } from '@/lib/env';

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
  store.users.set(demoUserId, {
    id: demoUserId,
    clerk_id: 'demo-clerk-id',
    email: 'demo@example.com',
    password_hash: hashedPassword,
    first_name: 'Demo',
    last_name: 'User',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    organization_id: demoOrgId,
    role: 'admin',
    department: 'Engineering',
    position: 'Software Engineer',
    hire_date: '2024-01-01',
    status: 'active',
    timezone: 'UTC',
    preferences: {
      notifications: {
        email: true,
        push: true,
        inApp: true,
      },
      privacy: {
        anonymousMoodCheckins: false,
        showProfileToTeam: true,
      },
      display: {
        theme: 'light',
        compactMode: false,
      },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

// Auth store methods
export const authStore = {
  // User methods
  async createUser(user: AuthUser): Promise<void> {
    store.users.set(user.id, user);
  },

  async getUserById(id: string): Promise<AuthUser | null> {
    return store.users.get(id) || null;
  },

  async getUserByEmail(email: string): Promise<AuthUser | null> {
    for (const user of store.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  },

  async updateUser(id: string, updates: Partial<AuthUser>): Promise<void> {
    const user = store.users.get(id);
    if (user) {
      store.users.set(id, { ...user, ...updates, updated_at: new Date().toISOString() });
    }
  },

  // Organization methods
  async createOrganization(org: Organization): Promise<void> {
    store.organizations.set(org.id, org);
  },

  async getOrganizationById(id: string): Promise<Organization | null> {
    return store.organizations.get(id) || null;
  },

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    for (const org of store.organizations.values()) {
      if (org.slug === slug) {
        return org;
      }
    }
    return null;
  },

  // Refresh token methods
  async saveRefreshToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    store.refreshTokens.set(token, { userId, expiresAt });
  },

  async getRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date } | null> {
    const tokenData = store.refreshTokens.get(token);
    if (!tokenData) return null;
    
    // Check if token is expired
    if (tokenData.expiresAt < new Date()) {
      store.refreshTokens.delete(token);
      return null;
    }
    
    return tokenData;
  },

  async deleteRefreshToken(token: string): Promise<void> {
    store.refreshTokens.delete(token);
  },

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    for (const [token, data] of store.refreshTokens.entries()) {
      if (data.userId === userId) {
        store.refreshTokens.delete(token);
      }
    }
  },

  // Utility method to clean expired tokens
  async cleanExpiredTokens(): Promise<void> {
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
  setInterval(() => {
    void authStore.cleanExpiredTokens();
  }, 60 * 60 * 1000);
}