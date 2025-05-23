// hooks/use-notifications.ts
import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/push-notification-service';
import { neurolinkService, NeuroLinkNotification, NotificationSettings } from '@/services/api/neurolink-service';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [notifications, setNotifications] = useState<NeuroLinkNotification[]>([]);
  const [backendConfigured, setBackendConfigured] = useState(false);
  const { toast } = useToast();

  const checkBackendConfig = useCallback(async () => {
    try {
      const configured = await pushNotificationService.checkBackendConfiguration();
      setBackendConfigured(configured);
      
      if (!configured) {
        console.warn('Push notifications não estão configuradas no servidor.');
      }
      
      return configured;
    } catch (error) {
      console.error('Erro ao verificar configuração do backend:', error);
      setBackendConfigured(false);
      return false;
    }
  }, []);

  const checkPermissionStatus = useCallback(() => {
    if (!pushNotificationService.isSupported()) {
      setPermissionStatus('unsupported');
      return 'unsupported';
    }
    
    const status = Notification.permission as 'granted' | 'denied' | 'default';
    setPermissionStatus(status);
    return status;
  }, []);

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!pushNotificationService.isSupported()) {
        setPermissionStatus('unsupported');
        toast({
          title: 'Não suportado',
          description: 'Seu dispositivo não suporta notificações push.',
          variant: 'destructive'
        });
        return false;
      }

      const currentPermission = checkPermissionStatus();
      
      const configured = await checkBackendConfig();
      if (!configured) {
        return false;
      }

      const initialized = await pushNotificationService.initialize();
      
      const hasActiveSubscription = await pushNotificationService.hasActiveSubscription();
      setIsEnabled(initialized && currentPermission === 'granted' && hasActiveSubscription);

      if (currentPermission === 'granted') {
        await loadSettings();
      }
      
      if (initialized && currentPermission === 'granted' && hasActiveSubscription) {
        pushNotificationService.startPolling(30000);
      }
      
      return initialized;
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, checkBackendConfig, checkPermissionStatus]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await neurolinkService.getSettings();
      if (!response.erro && response.configuracoes) {
        setSettings(response.configuracoes);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  const enableNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!backendConfigured) {
        toast({
          title: 'Configuração necessária',
          description: 'Push notifications não estão configuradas no servidor.',
          variant: 'destructive'
        });
        return false;
      }

      if (!await pushNotificationService.isInitialized) {
        await initialize();
      }

      const hasPermission = await pushNotificationService.requestPermission();
      
      checkPermissionStatus();
      
      if (!hasPermission) {
        toast({
          title: 'Permissão negada',
          description: 'Você precisa permitir notificações nas configurações do navegador.',
          variant: 'destructive'
        });
        return false;
      }

      const success = await pushNotificationService.subscribe();
      if (success) {
        setIsEnabled(true);
        pushNotificationService.startPolling(30000);
        
        await loadSettings();
        
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá notificações do Routina.',
        });
        
        setTimeout(async () => {
          await pushNotificationService.testNotification();
        }, 2000);
      } else {
        toast({
          title: 'Erro na ativação',
          description: 'Não foi possível ativar as notificações. Tente novamente.',
          variant: 'destructive'
        });
      }

      return success;
    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar as notificações.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast, backendConfigured, initialize, checkPermissionStatus, loadSettings]);

  const disableNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      
      await pushNotificationService.unsubscribe();
      setIsEnabled(false);
      
      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais notificações.',
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar as notificações.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const testNotification = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const success = await pushNotificationService.testNotification();
      
      if (success) {
        toast({
          title: 'Teste enviado',
          description: 'Você deve receber uma notificação de teste em breve.',
        });
      } else {
        toast({
          title: 'Erro no teste',
          description: 'Não foi possível enviar a notificação de teste.',
          variant: 'destructive'
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a notificação de teste.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      setIsLoading(true);
      
      const response = await neurolinkService.updateSettings(newSettings);
      if (!response.erro && response.configuracoes) {
        setSettings(response.configuracoes);
        
        toast({
          title: 'Configurações atualizadas',
          description: 'Suas preferências foram salvas.',
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    try {
      const response = await neurolinkService.getNotifications({
        limite: 20
      });
      
      if (!response.erro && response.notifications) {
        setNotifications(response.notifications);
      }
      
      return !response.erro;
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      return false;
    }
  }, []);

  // Marcar como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await neurolinkService.markAsRead(notificationId);
      
      // Atualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read', lido_em: new Date().toISOString() }
            : notif
        )
      );
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      return false;
    }
  }, []);

  // Inicializar ao montar
  useEffect(() => {
    // Verificar se já tem permissão e configuração ao montar
    const initOnMount = async () => {
      await initialize();
    };
    
    initOnMount();
    
    // Limpar recursos ao desmontar
    return () => {
      pushNotificationService.stopPolling();
    };
  }, [initialize]);

  return {
    isEnabled,
    isLoading,
    settings,
    notifications,
    backendConfigured,
    permissionStatus,
    enableNotifications,
    disableNotifications,
    testNotification,
    updateSettings,
    loadNotifications,
    markAsRead,
    initialize,
    isSupported: pushNotificationService.isSupported(),
    hasPermission: pushNotificationService.hasPermission(),
    checkPermissionStatus,
  };
}