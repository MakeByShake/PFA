'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';
import { MobileHeader } from '@/components/layout/mobile-header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) { router.replace('/login'); return; }
    if (currentUser.role !== 'admin') { router.replace('/dashboard'); }
  }, [currentUser, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <MobileHeader />
      <main className="md:ml-64 pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen">
        <div className="hidden md:flex fixed top-4 right-4 z-30">
          <ThemeToggle />
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
