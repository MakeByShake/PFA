'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileHeader } from '@/components/layout/mobile-header';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <MobileHeader />

      {/* Main content */}
      <main className="md:ml-64 pt-14 pb-20 md:pt-0 md:pb-0 min-h-screen">
        {/* Desktop theme toggle absolute top-right */}
        <div className="hidden md:flex fixed top-4 right-18 z-30">
          <ThemeToggle />
        </div>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
