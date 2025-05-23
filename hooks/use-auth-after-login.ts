// hooks/use-auth-after-login.ts
import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useNotifications } from './use-notifications';

export function useAfterLoginActions() {
  const { user, isLoading } = useAuth();
  const { initialize, isSupported, backendConfigured, permissionStatus } = useNotifications();

  useEffect(() => {
    const checkNotificationPermissions = async () => {
      // Verifica se o usuário está logado e se o carregamento terminou
      if (user && !isLoading) {
        // Verificamos se há suporte para notificações e se o backend está configurado
        if (isSupported && backendConfigured && permissionStatus === 'default') {
          // Inicializa o sistema de notificações
          await initialize();
          
          // Armazena na sessionStorage que já verificamos nesta sessão
          sessionStorage.setItem('notification-check-done', 'true');
        }
      }
    };

    // Só executa se ainda não tiver verificado nesta sessão
    if (!sessionStorage.getItem('notification-check-done')) {
      checkNotificationPermissions();
    }
  }, [user, isLoading, isSupported, backendConfigured, permissionStatus, initialize]);
}