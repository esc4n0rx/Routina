import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export type DeviceType = 'android' | 'ios' | 'desktop';

interface PWAInstallState {
  isInstallable: boolean;
  isStandalone: boolean;
  deviceType: DeviceType;
  deferredPrompt: BeforeInstallPromptEvent | null;
  canShowInstallPrompt: boolean;
}

export const usePWAInstall = () => {
  const [state, setState] = useState<PWAInstallState>({
    isInstallable: false,
    isStandalone: false,
    deviceType: 'desktop',
    deferredPrompt: null,
    canShowInstallPrompt: false,
  });

  // Detectar tipo de dispositivo
  const detectDeviceType = useCallback((): DeviceType => {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  }, []);

  // Verificar se está rodando como PWA instalado
  const checkIfStandalone = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://') ||
      window.location.search.includes('utm_source=homescreen')
    );
  }, []);

  // Verificar se pode mostrar o prompt de instalação
  const checkCanShowInstallPrompt = useCallback((deviceType: DeviceType, isStandalone: boolean): boolean => {
    if (isStandalone) return false;
    
    // Verificar se o usuário rejeitou hoje
    const rejectedToday = localStorage.getItem('pwa-install-rejected-date');
    const today = new Date().toDateString();
    
    if (rejectedToday === today) return false;
    
    // Verificar se já foi instalado antes (nunca mais mostrar)
    const neverShowAgain = localStorage.getItem('pwa-install-never-show');
    if (neverShowAgain === 'true') return false;
    
    // Só mostrar para dispositivos móveis
    return deviceType === 'android' || deviceType === 'ios';
  }, []);

  // Inicializar estado
  useEffect(() => {
    const deviceType = detectDeviceType();
    const isStandalone = checkIfStandalone();
    const canShowInstallPrompt = checkCanShowInstallPrompt(deviceType, isStandalone);

    setState(prev => ({
      ...prev,
      deviceType,
      isStandalone,
      canShowInstallPrompt,
    }));
  }, [detectDeviceType, checkIfStandalone, checkCanShowInstallPrompt]);

  // Escutar evento beforeinstallprompt (Android)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      
      setState(prev => ({
        ...prev,
        isInstallable: true,
        deferredPrompt: e,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isStandalone: true,
        canShowInstallPrompt: false,
      }));
      
      // Marcar como nunca mostrar novamente
      localStorage.setItem('pwa-install-never-show', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Função para tentar instalação nativa
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!state.deferredPrompt) return false;

    try {
      await state.deferredPrompt.prompt();
      const { outcome } = await state.deferredPrompt.userChoice;
      
      setState(prev => ({
        ...prev,
        deferredPrompt: null,
        isInstallable: false,
      }));

      return outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao mostrar prompt de instalação:', error);
      return false;
    }
  }, [state.deferredPrompt]);

  // Função para rejeitar instalação (não mostrar hoje)
  const rejectInstallToday = useCallback(() => {
    localStorage.setItem('pwa-install-rejected-date', new Date().toDateString());
    setState(prev => ({
      ...prev,
      canShowInstallPrompt: false,
    }));
  }, []);

  // Função para nunca mais mostrar
  const neverShowAgain = useCallback(() => {
    localStorage.setItem('pwa-install-never-show', 'true');
    setState(prev => ({
      ...prev,
      canShowInstallPrompt: false,
    }));
  }, []);

  // Função para marcar como instalado (quando usuário completa tutorial manual)
  const markAsInstalled = useCallback(() => {
    localStorage.setItem('pwa-install-never-show', 'true');
    setState(prev => ({
      ...prev,
      isStandalone: true,
      canShowInstallPrompt: false,
    }));
  }, []);

  return {
    ...state,
    promptInstall,
    rejectInstallToday,
    neverShowAgain,
    markAsInstalled,
  };
};