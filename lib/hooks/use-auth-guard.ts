'use client';

import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { AuthContext } from '@/lib/context/auth-context';

/**
 * Hook to redirect authenticated users away from guest-only pages
 */
export function useGuestGuard(): void {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  // If no auth context, treat as unauthenticated (safe for guest pages)
  const user = authContext?.user ?? null;
  const isLoading = authContext?.isLoading ?? false;

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);
}

/**
 * Hook to redirect unauthenticated users to login page
 */
export function useAuthGuard(): void {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  // If no auth context, redirect to login (safe for protected pages)
  const user = authContext?.user ?? null;
  const isLoading = authContext?.isLoading ?? false;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
}
