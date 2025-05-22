"use client";

import { useEffect } from 'react';
import { PWAProvider } from '@/components/pwa/pwa-provider';
import { NativeAuthScreen } from '@/components/auth/native-auth-screen';
import { pwaUtils } from '@/utils/pwa-utils';

export default function Home() {
  useEffect(() => {
    // Registrar service worker
    if (typeof window !== 'undefined') {
      pwaUtils.registerServiceWorker();
    }
  }, []);

  return (
    <PWAProvider 
      config={{
        showInstallPrompt: true,
        forceInstallOnMobile: true, // Bloquear uso via browser no mobile
        allowDesktopUsage: false, // Não permitir desktop por padrão
      }}
    >
      <NativeAuthScreen />
    </PWAProvider>
  );
}