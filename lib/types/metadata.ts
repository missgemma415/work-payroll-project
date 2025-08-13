// Specific metadata types to replace Record<string, any>

// Organization settings
export interface OrganizationSettings {
  features: {
    moodCheckins: boolean;
    kudos: boolean;
    priorities: boolean;
    teamPulse: boolean;
  };
  notifications: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    kudosAlerts: boolean;
  };
  branding?: {
    primaryColor?: string;
    logo?: string;
  };
}

// User preferences
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    anonymousMoodCheckins: boolean;
    showProfileToTeam: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
}

// Metadata for different entities
export interface MoodCheckinMetadata {
  location?: string;
  weather?: string;
  workingFrom?: 'office' | 'home' | 'remote';
}

export interface PriorityMetadata {
  tags?: string[];
  linkedTasks?: string[];
  effort?: 'low' | 'medium' | 'high';
}

export interface KudoMetadata {
  badges?: string[];
  impactLevel?: 'team' | 'department' | 'company';
}

export interface TeamPulseMetadata {
  calculationVersion: string;
  includedDepartments?: string[];
  excludedUsers?: string[];
}

// New metadata types for Prophet Growth Analysis
export interface EmployeeCostMetadata {
  dataSource: 'manual' | 'hr_system' | 'payroll' | 'imported';
  calculationMethod: 'standard' | 'custom' | 'imported';
  includedBenefits: string[];
  excludedCosts: string[];
  adjustments: Array<{
    type: 'bonus' | 'deduction' | 'equity' | 'overtime';
    amount: number;
    reason: string;
    date: string;
  }>;
  assumptions: Record<string, unknown>;
  validationRules: string[];
}

export interface ForecastMetadata {
  modelVersion: string;
  trainingDataPeriod: {
    start: string;
    end: string;
  };
  seasonality: {
    yearly: boolean;
    monthly: boolean;
    weekly: boolean;
  };
  externalFactors: Array<{
    name: string;
    impact: 'high' | 'medium' | 'low';
    correlation: number;
  }>;
  validationMetrics: {
    mape?: number; // Mean Absolute Percentage Error
    rmse?: number; // Root Mean Square Error
    mae?: number; // Mean Absolute Error
  };
  confidenceLevel: number; // 0.8, 0.9, 0.95, etc.
}

export interface ConversationMetadata {
  aiModel: string;
  totalTokens: number;
  averageResponseTime: number;
  topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'moderate' | 'complex';
  relatedAnalyses: string[];
  exportedResults: boolean;
  userSatisfaction?: number; // 1-5 rating
}

// Activity log details
export interface ActivityDetails {
  previousValue?: unknown;
  newValue?: unknown;
  changedFields?: string[];
  triggerSource?: 'user' | 'system' | 'api';
  relatedResources?: Array<{
    type: string;
    id: string;
  }>;
}

// Analysis computation metadata
export interface ComputationMetadata {
  algorithm: string;
  version: string;
  computeTime: number; // milliseconds
  memoryUsage?: number; // bytes
  inputSize: number;
  outputSize: number;
  cacheHit: boolean;
  errorCount: number;
  warnings: string[];
}

// Export/import metadata
export interface DataExportMetadata {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fileSize: number; // bytes
  recordCount: number;
  columns: string[];
  filters: Record<string, unknown>;
  requestedBy: string;
  downloadUrl?: string;
  expiresAt?: string;
}

// Database bind parameters for Neon PostgreSQL
export type DatabaseBindParams = Array<string | number | boolean | null | Date | Buffer>;
