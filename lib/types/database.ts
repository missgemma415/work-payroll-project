// Database types for Scientia Capital HR Platform
// Cloudflare D1 (SQLite) Database Types

import type {
  OrganizationSettings,
  UserPreferences,
  MoodCheckinMetadata,
  PriorityMetadata,
  KudoMetadata,
  TeamPulseMetadata,
  ActivityDetails,
  D1BindParams,
} from './metadata';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string; // Clerk user ID
  clerk_id: string;
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
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface MoodCheckin {
  id: string;
  user_id: string;
  organization_id: string;
  mood_value: 'amazing' | 'great' | 'good' | 'okay' | 'tough';
  mood_score: number; // 1-5
  notes: string | null;
  is_anonymous: boolean;
  metadata: MoodCheckinMetadata;
  created_at: string;
}

export interface DailyPriority {
  id: string;
  user_id: string;
  organization_id: string;
  text: string;
  completed: boolean;
  urgency: 'low' | 'medium' | 'high';
  estimated_time: number | null; // in minutes
  completed_at: string | null;
  due_date: string | null;
  category: string | null;
  metadata: PriorityMetadata;
  created_at: string;
  updated_at: string;
}

export interface Kudo {
  id: string;
  from_user_id: string;
  to_user_id: string | null; // NULL for team-wide kudos
  organization_id: string;
  message: string;
  category: 'teamwork' | 'innovation' | 'leadership' | 'helpfulness' | 'excellence';
  is_public: boolean;
  likes_count: number;
  metadata: KudoMetadata;
  created_at: string;
}

export interface KudoLike {
  id: string;
  kudos_id: string;
  user_id: string;
  created_at: string;
}

export interface TeamPulseSnapshot {
  id: string;
  organization_id: string;
  date: string;
  active_users_count: number;
  average_mood_score: number;
  mood_distribution: Record<string, number>; // {"amazing": 5, "great": 10, ...}
  total_priorities_completed: number;
  total_kudos_given: number;
  engagement_score: number;
  metadata: TeamPulseMetadata;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  organization_id: string;
  action_type: string; // 'mood_checkin', 'priority_added', 'kudos_given', etc.
  resource_type: string; // 'mood', 'priority', 'kudos', etc.
  resource_id: string | null;
  details: ActivityDetails;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Extended types with relationships
export interface UserWithOrganization extends User {
  organization: Organization;
}

export interface KudoWithUsers extends Kudo {
  from_user: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  to_user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url'>;
  is_liked_by_current_user?: boolean;
}

export interface TeamMemberStatus {
  user: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url' | 'status'>;
  latest_mood?: Pick<MoodCheckin, 'mood_value' | 'created_at'>;
  last_active: string;
  online_status: 'online' | 'away' | 'offline';
}

// API Request/Response types
export interface CreateMoodCheckinRequest {
  mood_value: MoodCheckin['mood_value'];
  notes?: string;
  is_anonymous?: boolean;
}

export interface CreatePriorityRequest {
  text: string;
  urgency?: DailyPriority['urgency'];
  estimated_time?: number;
  due_date?: string;
  category?: string;
}

export interface UpdatePriorityRequest {
  text?: string;
  completed?: boolean;
  urgency?: DailyPriority['urgency'];
  estimated_time?: number;
  due_date?: string;
  category?: string;
}

export interface CreateKudoRequest {
  to_user_id?: string; // omit for team-wide kudos
  message: string;
  category: Kudo['category'];
  is_public?: boolean;
}

export interface DashboardData {
  user: UserWithOrganization;
  today_priorities: DailyPriority[];
  recent_mood_checkins: MoodCheckin[];
  team_pulse: {
    active_members: number;
    total_members: number;
    average_mood: number;
    mood_distribution: Record<string, number>;
    team_members: TeamMemberStatus[];
  };
  recent_kudos: KudoWithUsers[];
  engagement_stats: {
    priorities_completed_today: number;
    kudos_given_this_week: number;
    mood_streak_days: number;
  };
}

// Database connection type for Cloudflare D1
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  exec(query: string): Promise<D1Result>;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

export interface D1PreparedStatement {
  bind(...values: D1BindParams): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
    last_row_id?: number;
    changes?: number;
  };
}
