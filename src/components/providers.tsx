'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useFirebaseData } from '@/hooks/use-firebase-data';
import { usePwa } from '@/hooks/use-pwa';
import { WifiOff } from 'lucide-react';

function FirebaseInit() {
  useFirebaseData();
  return null;
}

function PwaInit() {
  const { isOnline } = usePwa();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-amber-500 text-black text-sm font-medium py-2 px-4">
      <WifiOff className="h-4 w-4 flex-shrink-0" />
      <span>Офлайн — изменения сохранятся при подключении</span>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <FirebaseInit />
      <PwaInit />
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
