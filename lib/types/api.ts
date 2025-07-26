// API Request and Response types

import type { Kudo, MoodCheckin, DailyPriority } from './database';

// Mood API
export interface CreateMoodRequest {
  mood_value: MoodCheckin['mood_value'];
  mood_score: number;
  notes?: string;
}

// Priority API
export interface CreatePriorityRequest {
  text: string;
  urgency?: DailyPriority['urgency'];
  estimated_time?: number;
  category?: string;
  due_date?: string;
}

export interface UpdatePriorityRequest {
  text?: string;
  completed?: boolean;
  urgency?: DailyPriority['urgency'];
  estimated_time?: number;
  due_date?: string;
  category?: string;
}

// Kudos API
export interface CreateKudosRequest {
  to_user_id?: string;
  message: string;
  category: Kudo['category'];
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
}
