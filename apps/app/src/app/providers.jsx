'use client';

import StartupGuard from '@/components/startup/StartupGuard';
import { AuthProvider } from '@/providers/AuthProvider';

/**
 * Wraps the entire app with client-side providers.
 * Additional providers (theme, feature flags, etc.) can be added here.
 */
export default function Providers({ children }) {
  return (
    <StartupGuard>
      <AuthProvider>{children}</AuthProvider>
    </StartupGuard>
  );
}

