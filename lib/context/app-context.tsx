'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import { useAuth } from '@/lib/context/auth-context';
import type { User, Organization, MoodCheckin, DailyPriority, Kudo } from '@/lib/types/database';

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

export function AppProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const { user: authUser, organization: authOrg, accessToken } = useAuth();

  // Initialize state
  const [state, setState] = useState<AppState>({
    user: null,
    organization: null,
    moodHistory: [],
    priorities: [],
    kudos: [],
    isLoading: false,
    error: null,
  });

  // Sync auth user/org with app state
  useEffect(() => {
    if (authUser && authOrg) {
      // Convert AuthUser to User type
      const [firstName, ...lastNameParts] = authUser.name.split(' ');
      const user: User = {
        id: authUser.id,
        clerk_id: authUser.id, // Use same id for now
        email: authUser.email,
        first_name: firstName ?? null,
        last_name: lastNameParts.join(' ') || null,
        avatar_url: authUser.avatar ?? null,
        role: authUser.role,
        department: authUser.department ?? null,
        position: authUser.position ?? null,
        hire_date: null,
        status: authUser.status,
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
        organization_id: authUser.organization_id,
        created_at: authUser.created_at,
        updated_at: authUser.updated_at,
      };

      setState((prev) => ({
        ...prev,
        user,
        organization: authOrg,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        user: null,
        organization: null,
      }));
    }
  }, [authUser, authOrg]);

  // Save to localStorage on state change
  useEffect(() => {
    const { user: _user, organization: _organization, ...dataToSave } = state;
    localStorage.setItem('app-state', JSON.stringify(dataToSave));
  }, [state]);

  // Fetch all data
  const refreshData = async (): Promise<void> => {
    if (!accessToken) {
      // Not authenticated, clear data
      setState((prev) => ({
        ...prev,
        moodHistory: [],
        priorities: [],
        kudos: [],
        isLoading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch all data in parallel with auth headers
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const [moodsRes, prioritiesRes, kudosRes] = await Promise.all([
        fetch('/api/moods', { headers }),
        fetch('/api/priorities', { headers }),
        fetch('/api/kudos', { headers }),
      ]);

      if (!moodsRes.ok || !prioritiesRes.ok || !kudosRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [moodsData, prioritiesData, kudosData] = await Promise.all([
        moodsRes.json() as Promise<{ data: MoodCheckin[] }>,
        prioritiesRes.json() as Promise<{ data: DailyPriority[] }>,
        kudosRes.json() as Promise<{ data: Kudo[] }>,
      ]);

      setState((prev) => ({
        ...prev,
        moodHistory: moodsData.data ?? [],
        priorities: prioritiesData.data ?? [],
        kudos: kudosData.data ?? [],
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  // Initial data load when auth changes
  useEffect(() => {
    if (accessToken) {
      void refreshData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const value: AppContextValue = {
    ...state,
    setUser: (user) => setState((prev) => ({ ...prev, user })),
    setOrganization: (organization) => setState((prev) => ({ ...prev, organization })),
    setMoodHistory: (moodHistory) => setState((prev) => ({ ...prev, moodHistory })),
    setPriorities: (priorities) => setState((prev) => ({ ...prev, priorities })),
    setKudos: (kudos) => setState((prev) => ({ ...prev, kudos })),
    setError: (error) => setState((prev) => ({ ...prev, error })),
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// Convenience hooks for specific data
export function useUser(): User | null {
  const { user } = useAppContext();
  return user;
}

export function useOrganization(): Organization | null {
  const { organization } = useAppContext();
  return organization;
}

export function useMoodHistory(): MoodCheckin[] {
  const { moodHistory } = useAppContext();
  return moodHistory;
}

export function usePriorities(): DailyPriority[] {
  const { priorities } = useAppContext();
  return priorities;
}

export function useKudos(): Kudo[] {
  const { kudos } = useAppContext();
  return kudos;
}
