export const pwaUtils = {
  // Verificar se o dispositivo suporta PWA
  isPWASupported: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  // Verificar se está rodando em HTTPS (necessário para PWA)
  isSecureContext: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext || window.location.hostname === 'localhost';
  },

  // Obter informações do manifest
  getManifestInfo: async (): Promise<any> => {
    try {
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) return null;

      const response = await fetch(manifestLink.href);
      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar manifest:', error);
      return null;
    }
  },

  // Verificar se há atualizações do service worker
  checkForUpdates: async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      await registration.update();
      return registration.waiting !== null;
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      return false;
    }
  },

  // Aplicar atualizações pendentes
  applyUpdates: async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao aplicar atualizações:', error);
    }
  },

  // Registrar service worker se não estiver registrado
  registerServiceWorker: async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) return;

    try {
      await navigator.serviceWorker.register('/sw.ts');
      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  },

  // Obter estatísticas de uso (cache, storage, etc)
  getUsageStats: async (): Promise<{
    storage?: StorageEstimate;
    cacheNames?: string[];
  }> => {
    const stats: any = {};

    try {
      // Storage API
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        stats.storage = await navigator.storage.estimate();
      }

      // Cache API
      if ('caches' in window) {
        stats.cacheNames = await caches.keys();
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
    }

    return stats;
  },
};