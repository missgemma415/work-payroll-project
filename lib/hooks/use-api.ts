'use client';

import { useState } from 'react';
import { useAppContext } from '@/lib/context/app-context';
import type { CreateMoodRequest, CreatePriorityRequest, UpdatePriorityRequest, CreateKudosRequest } from '@/lib/types/api';
import type { MoodCheckin, DailyPriority, Kudo } from '@/lib/types/database';

interface MutationState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useMoodCheckIn() {
  const { refreshData } = useAppContext();
  const [state, setState] = useState<MutationState<MoodCheckin>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const checkIn = async (data: CreateMoodRequest) => {
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

      const result = await response.json();
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

export function usePriorityActions() {
  const { refreshData } = useAppContext();
  const [state, setState] = useState<MutationState<DailyPriority>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const createPriority = async (data: CreatePriorityRequest) => {
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

      const result = await response.json();
      setState({ data: result.data, error: null, isLoading: false });
      
      await refreshData();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const updatePriority = async (id: string, data: UpdatePriorityRequest) => {
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

      const result = await response.json();
      setState({ data: result.data, error: null, isLoading: false });
      
      await refreshData();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const deletePriority = async (id: string) => {
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

  const toggleComplete = async (id: string, completed: boolean) => {
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

export function useKudosActions() {
  const { refreshData } = useAppContext();
  const [state, setState] = useState<MutationState<Kudo>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const giveKudos = async (data: CreateKudosRequest) => {
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

      const result = await response.json();
      setState({ data: result.data, error: null, isLoading: false });
      
      await refreshData();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, error: message, isLoading: false });
      throw error;
    }
  };

  const likeKudos = async (kudosId: string) => {
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