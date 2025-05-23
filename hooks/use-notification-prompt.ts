// hooks/use-notification-prompt.ts
import { useEffect, useState } from 'react';
import { useNotifications } from './use-notifications';
import { useAuth } from '@/context/auth-context';

export function useNotificationPrompt() {
  const { user, isLoading: authLoading } = useAuth();
  const { permissionStatus, enableNotifications, isSupported, backendConfigured } = useNotifications();
  const [hasPrompted, setHasPrompted] = useState(false);

  // Verifica se já pediu permissão hoje para não ficar solicitando múltiplas vezes
  const hasPromptedToday = () => {
    try {
      const lastPrompt = localStorage.getItem('notification-prompt-date');
      if (!lastPrompt) return false;
      
      const today = new Date().toDateString();
      return lastPrompt === today;
    } catch (e) {
      return false;
    }
  };

  // Marca que já solicitou hoje
  const markAsPromptedToday = () => {
    try {
      localStorage.setItem('notification-prompt-date', new Date().toDateString());
    } catch (e) {
      console.error('Erro ao salvar data de prompt:', e);
    }
  };

  useEffect(() => {
    const promptForNotifications = async () => {
      // Só solicita se: usuário está logado, suporta notificações, backend configurado, 
      // não está no status "denied", e não solicitou hoje
      if (
        user && 
        !authLoading && 
        isSupported && 
        backendConfigured && 
        permissionStatus !== 'denied' && 
        permissionStatus !== 'granted' && 
        !hasPrompted && 
        !hasPromptedToday()
      ) {
        // Delay para não solicitar imediatamente após o login
        setTimeout(async () => {
          setHasPrompted(true);
          markAsPromptedToday();
          
          try {
            await enableNotifications();
          } catch (error) {
            console.error('Erro ao solicitar notificações após login:', error);
          }
        }, 2000); // 2 segundos de delay
      }
    };

    promptForNotifications();
  }, [user, authLoading, permissionStatus, isSupported, backendConfigured, hasPrompted, enableNotifications]);

  return {
    hasPrompted
  };
}