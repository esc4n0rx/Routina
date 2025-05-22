'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import PWAInstallModal from './PWAInstallModal';
import PWAUpdateNotification from './pwa-update-notification';

interface PWAContextType {
  isInstallable: boolean;
  isStandalone: boolean;
  deviceType: 'android' | 'ios' | 'desktop';
  canShowInstallPrompt: boolean;
  promptInstall: () => Promise<boolean>;
  rejectInstallToday: () => void;
  neverShowAgain: () => void;
  markAsInstalled: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
  config?: {
    showInstallPrompt?: boolean;
    forceInstallOnMobile?: boolean;
    allowDesktopUsage?: boolean;
  };
}

export function PWAProvider({ 
  children, 
  config = {
    showInstallPrompt: true,
    forceInstallOnMobile: true,
    allowDesktopUsage: false,
  }
}: PWAProviderProps) {
  const pwaState = usePWAInstall();

  const handleInstallComplete = () => {
    pwaState.markAsInstalled();
  };

  const shouldBlockApp = config.forceInstallOnMobile && 
    (pwaState.deviceType === 'android' || pwaState.deviceType === 'ios') && 
    !pwaState.isStandalone && 
    pwaState.canShowInstallPrompt;

  const shouldShowDesktopWarning = !config.allowDesktopUsage && 
    pwaState.deviceType === 'desktop' && 
    !pwaState.isStandalone;

  return (
    <PWAContext.Provider value={pwaState}>
      {/* Modal de instalação PWA */}
      {config.showInstallPrompt && pwaState.canShowInstallPrompt && (
        <PWAInstallModal 
          onInstallComplete={handleInstallComplete}
        />
      )}

      {/* Notificação de atualização */}
      <PWAUpdateNotification />

      {/* Conteúdo da aplicação */}
      {shouldBlockApp ? (
        // Não renderizar conteúdo se instalação for obrigatória
        <div className="min-h-screen bg-gradient-to-b from-[#0F0A1F] to-[#2D1B4E] flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="/logo.png" 
                alt="Routina Logo" 
                className="w-12 h-12 object-contain rounded-xl"
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Instalação Necessária
            </h2>
            <p className="text-gray-300 max-w-sm">
              Para usar o Routina, é necessário instalá-lo como um aplicativo nativo.
            </p>
          </div>
        </div>
      ) : shouldShowDesktopWarning ? (
        <div className="min-h-screen bg-gradient-to-b from-[#0F0A1F] to-[#2D1B4E] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <img 
                src="/logo.png" 
                alt="Routina Logo" 
                className="w-12 h-12 object-contain rounded-xl"
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Melhor no Mobile
            </h2>
            <p className="text-gray-300 mb-6">
              O Routina foi otimizado para dispositivos móveis. Para a melhor experiência, acesse pelo seu smartphone.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Continuar Mesmo Assim
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA deve ser usado dentro de um PWAProvider');
  }
  return context;
}