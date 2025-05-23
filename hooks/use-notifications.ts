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

  // Verificar configuração do backend
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

  // Verificar status da permissão
  const checkPermissionStatus = useCallback(() => {
    if (!pushNotificationService.isSupported()) {
      setPermissionStatus('unsupported');
      return 'unsupported';
    }
    
    const status = Notification.permission as 'granted' | 'denied' | 'default';
    setPermissionStatus(status);
    return status;
  }, []);

  // Inicializar o serviço
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

      // Verificar status atual da permissão
      const currentPermission = checkPermissionStatus();
      
      // Verificar configuração do backend
      const configured = await checkBackendConfig();
      if (!configured) {
        return false;
      }

      // Verificar se o serviço já está inicializado
      const initialized = await pushNotificationService.initialize();
      
      // Verificar se existe subscrição ativa
      const hasActiveSubscription = await pushNotificationService.hasActiveSubscription();
      setIsEnabled(initialized && currentPermission === 'granted' && hasActiveSubscription);

      // Carregar configurações se tiver permissão
      if (currentPermission === 'granted') {
        await loadSettings();
      }
      
      if (initialized && currentPermission === 'granted' && hasActiveSubscription) {
        // Iniciar polling para verificar notificações
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

  // Carregar configurações
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

  // Ativar notificações
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

      // Verifica se já inicializou
      if (!await pushNotificationService.isInitialized) {
        await initialize();
      }

      // Solicita permissão explicitamente
      const hasPermission = await pushNotificationService.requestPermission();
      
      // Atualiza o status de permissão após a solicitação
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
        
        // Carrega configurações após ativação bem-sucedida
        await loadSettings();
        
        toast({
          title: 'Notificações ativadas',
          description: 'Você receberá notificações do Routina.',
        });
        
        // Testar notificação
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

  // Desativar notificações
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

  // Testar notificação
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

  // Atualizar configurações
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