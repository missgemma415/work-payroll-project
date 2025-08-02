'use client';

import { useState } from 'react';

import type { MoodCheckin } from '@/lib/types/database';

interface MoodCheckInData {
  mood_value: MoodCheckin['mood_value'];
  mood_score: number;
}

interface UseMoodCheckInReturn {
  checkIn: (data: MoodCheckInData) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook for mood check-in functionality
 */
export function useMoodCheckIn(): UseMoodCheckInReturn {
  const [isLoading, setIsLoading] = useState(false);

  const checkIn = async (data: MoodCheckInData): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mood/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to check in mood');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkIn,
    isLoading,
  };
}
