/**
 * Database Types for Prophet Growth Analysis Platform
 * Neon PostgreSQL Database Types
 *
 * Core entities for financial intelligence and workforce planning:
 * - Organizations and Users (multi-tenant)
 * - Employees and Cost Analysis
 * - AI Conversations and Forecasts
 * - Activity Logging and Analytics
 */

import type {
  OrganizationSettings,
  UserPreferences,
  EmployeeCostMetadata,
  ForecastMetadata,
  ConversationMetadata,
  ActivityDetails,
  MoodCheckinMetadata,
  PriorityMetadata,
  KudoMetadata,
  TeamPulseMetadata,
} from './metadata';

// Re-export types for easier import
export type {
  OrganizationSettings,
  UserPreferences,
  EmployeeCostMetadata,
  ForecastMetadata,
  ConversationMetadata,
  MoodCheckinMetadata,
  PriorityMetadata,
  KudoMetadata,
  TeamPulseMetadata,
} from './metadata';

// Core entity interfaces for Prophet Growth Analysis

export interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: 'starter' | 'professional' | 'enterprise';
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  settings: OrganizationSettings;
  created_at: string;
  updated_at: string;
}

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
  preferences: UserPreferences;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

// Employee and workforce management
export interface Employee {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  benefits: number;
  start_date: string;
  end_date: string | null;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'intern';
  location: string;
  manager_id: string | null;
  cost_center: string | null;
  tags: string[] | null;
  metadata: Record<string, unknown>;
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
  updated_at: string;
}

// Cost analysis and financial intelligence
export interface CostAnalysis {
  id: string;
  organization_id: string;
  user_id: string;
  analysis_type: 'employee_cost' | 'department_cost' | 'project_cost' | 'forecast';
  title: string;
  description: string | null;
  data_source: 'manual' | 'imported' | 'api' | 'calculated';
  parameters: Record<string, unknown>;
  results: Record<string, unknown>;
  total_cost: number;
  cost_breakdown: Record<string, number>;
  period_start: string;
  period_end: string;
  currency: string;
  confidence_score: number | null;
  metadata: EmployeeCostMetadata;
  created_at: string;
  updated_at: string;
}

// AI conversation and chat history
export interface Conversation {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  messages: unknown[]; // Array of conversation messages
  context: Record<string, unknown>;
  metadata: ConversationMetadata;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  content_type: 'text' | 'json' | 'markdown';
  token_count: number | null;
  model_used: string | null;
  processing_time: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Forecasting and predictive analytics
export interface Forecast {
  id: string;
  organization_id: string;
  user_id: string;
  forecast_type: 'employee_growth' | 'cost_projection' | 'headcount' | 'budget';
  title: string;
  description: string | null;
  input_data: Record<string, unknown>;
  model_type: 'prophet' | 'linear' | 'arima' | 'custom';
  model_parameters: Record<string, unknown>;
  forecast_horizon: number; // days
  forecast_data: Record<string, unknown>;
  confidence_intervals: Record<string, unknown>;
  accuracy_metrics: Record<string, unknown> | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: ForecastMetadata;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  organization_id: string;
  action_type: string; // 'cost_analysis_created', 'forecast_generated', 'employee_added', etc.
  resource_type: string; // 'employee', 'cost_analysis', 'forecast', 'conversation', etc.
  resource_id: string | null;
  details: ActivityDetails;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// Extended types with relationships and computed fields
export interface UserWithOrganization extends User {
  organization: Organization;
}

export interface EmployeeWithCosts extends Employee {
  total_compensation: number;
  monthly_cost: number;
  annual_cost: number;
  cost_per_hour: number;
  manager?: Pick<Employee, 'id' | 'name' | 'position'>;
}

export interface CostAnalysisWithDetails extends CostAnalysis {
  employee_count: number;
  average_cost_per_employee: number;
  cost_trend: 'increasing' | 'decreasing' | 'stable';
  created_by: Pick<User, 'id' | 'first_name' | 'last_name'>;
}

export interface ConversationWithMessages extends Conversation {
  messages: ConversationMessage[];
  latest_message?: ConversationMessage;
  created_by: Pick<User, 'id' | 'first_name' | 'last_name'>;
}

export interface ForecastWithAccuracy extends Forecast {
  accuracy_score: number | null;
  error_rate: number | null;
  created_by: Pick<User, 'id' | 'first_name' | 'last_name'>;
}

// Legacy entity types (for backward compatibility with existing code)
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

// Legacy extended types
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

// Legacy API request types
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

// API Request/Response types for Prophet Growth Analysis
export interface CreateEmployeeRequest {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  hire_date: string;
  employment_type: Employee['employment_type'];
  salary: number;
  hourly_rate?: number;
  benefits_cost: number;
  equity_value?: number;
  manager_id?: string;
  location: string;
}

export interface UpdateEmployeeRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  department?: string;
  position?: string;
  employment_type?: Employee['employment_type'];
  salary?: number;
  hourly_rate?: number;
  benefits_cost?: number;
  equity_value?: number;
  manager_id?: string;
  location?: string;
  status?: Employee['status'];
  termination_date?: string;
}

export interface CreateCostAnalysisRequest {
  analysis_type: CostAnalysis['analysis_type'];
  title: string;
  description?: string;
  parameters: Record<string, unknown>;
  period_start: string;
  period_end: string;
  currency?: string;
}

export interface CreateForecastRequest {
  forecast_type: Forecast['forecast_type'];
  title: string;
  description?: string;
  input_data: Record<string, unknown>;
  model_type: Forecast['model_type'];
  model_parameters?: Record<string, unknown>;
  forecast_horizon: number;
}

export interface CreateConversationRequest {
  title: string;
  context_type: string;
  initial_message?: string;
}

export interface AnalyticsDashboard {
  user: UserWithOrganization;
  employee_metrics: {
    total_employees: number;
    active_employees: number;
    new_hires_this_month: number;
    terminations_this_month: number;
    average_tenure: number;
  };
  cost_metrics: {
    total_monthly_cost: number;
    total_annual_cost: number;
    average_cost_per_employee: number;
    cost_by_department: Record<string, number>;
    cost_trend: 'increasing' | 'decreasing' | 'stable';
  };
  recent_analyses: CostAnalysisWithDetails[];
  recent_forecasts: ForecastWithAccuracy[];
  recent_conversations: ConversationWithMessages[];
}

// Database query result types for Neon PostgreSQL
export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  command: string;
  fields: Array<{
    name: string;
    dataTypeID: number;
  }>;
}

export interface QueryMeta {
  duration?: number;
  rowCount: number;
  command: string;
}

// Utility types for database operations
export type DatabaseRecord = Record<string, unknown>;

export type WhereCondition = {
  [key: string]: unknown;
};

export type OrderByClause = {
  column: string;
  direction: 'ASC' | 'DESC';
};

export type PaginationOptions = {
  limit: number;
  offset: number;
};

export interface QueryOptions {
  where?: WhereCondition;
  orderBy?: OrderByClause | OrderByClause[];
  pagination?: PaginationOptions;
  include?: string[];
}

// Database schema information
export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  indexes: IndexSchema[];
  constraints: ConstraintSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: unknown;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface IndexSchema {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface ConstraintSchema {
  name: string;
  type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  columns: string[];
  references?: {
    table: string;
    columns: string[];
  };
}
