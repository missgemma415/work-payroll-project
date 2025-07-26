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

// D1 bind parameters - more specific than any[]
export type D1BindParams = Array<string | number | boolean | null | Buffer>;
