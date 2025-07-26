'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Organization, MoodCheckin, DailyPriority, Kudo } from '@/lib/types/database';
import { mockUser, mockOrganization } from '@/lib/mock-data';

interface AppState {
  // User & Organization
  user: User | null;
  organization: Organization | null;
  
  // Feature data
  moodHistory: MoodCheckin[];
  priorities: DailyPriority[];
  kudos: Kudo[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
}

interface AppContextValue extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setOrganization: (org: Organization | null) => void;
  setMoodHistory: (moods: MoodCheckin[]) => void;
  setPriorities: (priorities: DailyPriority[]) => void;
  setKudos: (kudos: Kudo[]) => void;
  setError: (error: string | null) => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize with mock data for development
  const [state, setState] = useState<AppState>({
    user: mockUser,
    organization: mockOrganization,
    moodHistory: [],
    priorities: [],
    kudos: [],
    isLoading: false,
    error: null,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('app-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState) as Partial<AppState>;
        setState(prev => ({
          ...prev,
          ...parsed,
          // Always use mock user/org for now
          user: mockUser,
          organization: mockOrganization,
        }));
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    const { user, organization, ...dataToSave } = state;
    localStorage.setItem('app-state', JSON.stringify(dataToSave));
  }, [state]);

  // Fetch all data
  const refreshData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch all data in parallel
      const [moodsRes, prioritiesRes, kudosRes] = await Promise.all([
        fetch('/api/moods'),
        fetch('/api/priorities'),
        fetch('/api/kudos'),
      ]);

      if (!moodsRes.ok || !prioritiesRes.ok || !kudosRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [moodsData, prioritiesData, kudosData] = await Promise.all([
        moodsRes.json(),
        prioritiesRes.json(),
        kudosRes.json(),
      ]);

      setState(prev => ({
        ...prev,
        moodHistory: moodsData.data || [],
        priorities: prioritiesData.data || [],
        kudos: kudosData.data || [],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  // Initial data load
  useEffect(() => {
    void refreshData();
  }, []);

  const value: AppContextValue = {
    ...state,
    setUser: (user) => setState(prev => ({ ...prev, user })),
    setOrganization: (organization) => setState(prev => ({ ...prev, organization })),
    setMoodHistory: (moodHistory) => setState(prev => ({ ...prev, moodHistory })),
    setPriorities: (priorities) => setState(prev => ({ ...prev, priorities })),
    setKudos: (kudos) => setState(prev => ({ ...prev, kudos })),
    setError: (error) => setState(prev => ({ ...prev, error })),
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useUser() {
  const { user } = useAppContext();
  return user;
}

export function useOrganization() {
  const { organization } = useAppContext();
  return organization;
}

export function useMoodHistory() {
  const { moodHistory } = useAppContext();
  return moodHistory;
}

export function usePriorities() {
  const { priorities } = useAppContext();
  return priorities;
}

export function useKudos() {
  const { kudos } = useAppContext();
  return kudos;
}