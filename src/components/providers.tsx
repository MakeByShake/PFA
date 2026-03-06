'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useFirebaseData } from '@/hooks/use-firebase-data';

function FirebaseInit() {
  useFirebaseData();
  return null;
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
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
