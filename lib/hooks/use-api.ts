'use client';

import { useState } from 'react';

import { useAppContext } from '@/lib/context/app-context';
import type {
  CreateMoodRequest,
  CreatePriorityRequest,
  UpdatePriorityRequest,
  CreateKudosRequest,
} from '@/lib/types/api';
import type { MoodCheckin, DailyPriority, Kudo } from '@/lib/types/database';

interface MutationState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useMoodCheckIn(): {
  checkIn: (data: CreateMoodRequest) => Promise<MoodCheckin>;
  data: MoodCheckin | null;
  error: string | null;
  isLoading: boolean;
} {
  const { refreshData } = useAppContext();
  const [state, setState] = useState<MutationState<MoodCheckin>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const checkIn = async (data: CreateMoodRequest): Promise<MoodCheckin> => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit mood check-in');
      }

      const result = (await response.json()) as { data: MoodCheckin };
      setState({ data: result.data, error: null, isLoading: false });

      // Refresh mood history
      await refreshData();

      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  return { checkIn, ...state };
}

export function usePriorityActions(): {
  createPriority: (data: CreatePriorityRequest) => Promise<DailyPriority>;
  updatePriority: (id: string, data: UpdatePriorityRequest) => Promise<DailyPriority>;
  deletePriority: (id: string) => Promise<void>;
  toggleComplete: (id: string, completed: boolean) => Promise<DailyPriority>;
  data: DailyPriority | null;
  error: string | null;
  isLoading: boolean;
} {
  const { refreshData } = useAppContext();
  const [state, setState] = useState<MutationState<DailyPriority>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const createPriority = async (data: CreatePriorityRequest): Promise<DailyPriority> => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const response = await fetch('/api/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create priority');
      }

      const result = (await response.json()) as { data: DailyPriority };
      setState({ data: result.data, error: null, isLoading: false });

      await refreshData();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const updatePriority = async (
    id: string,
    data: UpdatePriorityRequest
  ): Promise<DailyPriority> => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const response = await fetch(`/api/priorities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update priority');
      }

      const result = (await response.json()) as { data: DailyPriority };
      setState({ data: result.data, error: null, isLoading: false });

      await refreshData();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const deletePriority = async (id: string): Promise<void> => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const response = await fetch(`/api/priorities/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete priority');
      }

      setState({ data: null, error: null, isLoading: false });
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const toggleComplete = async (id: string, completed: boolean): Promise<DailyPriority> => {
    return updatePriority(id, { completed });
  };

  return {
    createPriority,
    updatePriority,
    deletePriority,
    toggleComplete,
    ...state,
  };
}

export function useKudosActions(): {
  giveKudos: (data: CreateKudosRequest) => Promise<Kudo>;
  likeKudos: (kudosId: string) => Promise<void>;
  data: Kudo | null;
  error: string | null;
  isLoading: boolean;
} {
  const { refreshData } = useAppContext();
  const [state, setState] = useState<MutationState<Kudo>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const giveKudos = async (data: CreateKudosRequest): Promise<Kudo> => {
    setState({ data: null, error: null, isLoading: true });

    try {
      const response = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to give kudos');
      }

      const result = (await response.json()) as { data: Kudo };
      setState({ data: result.data, error: null, isLoading: false });

      await refreshData();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const likeKudos = async (kudosId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/kudos/${kudosId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to like kudos');
      }

      await refreshData();
    } catch (error) {
      console.error('Failed to like kudos:', error);
      throw error;
    }
  };

  return {
    giveKudos,
    likeKudos,
    ...state,
  };
}
