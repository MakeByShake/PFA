'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/lib/types';

export function useAuthGuard(requiredRole?: UserRole) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    if (requiredRole && currentUser.role !== requiredRole) {
      router.replace('/dashboard');
    }
  }, [currentUser, requiredRole, router]);

  return { currentUser, isAdmin: currentUser?.role === 'admin' };
}
