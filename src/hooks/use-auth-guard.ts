'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/lib/types';

export function useAuthGuard(requiredRole?: UserRole) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  useEffect(() => {
    // Wait for Firebase to determine auth state before redirecting
    if (isLoading) return;
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (requiredRole && currentUser.role !== requiredRole) {
      router.replace('/dashboard');
    }
  }, [currentUser, isLoading, requiredRole, router]);

  return { currentUser, isAdmin: currentUser?.role === 'admin', isLoading };
}
