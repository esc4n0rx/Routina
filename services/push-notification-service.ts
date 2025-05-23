// services/push-notification-service.ts
import { neurolinkService, NeuroLinkNotification } from './api/neurolink-service';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isInitialized = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Verificar se o dispositivo suporta notificações
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Verificar se já tem permissão
  hasPermission(): boolean {
    return Notification.permission === 'granted';
  }

  // Solicitar permissão
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications não suportadas neste dispositivo');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Verificar se o backend está configurado
  async checkBackendConfiguration(): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/status`);
      const data = await response.json();
      
      if (data.erro) {
        console.warn('Push notifications não configuradas no backend:', data.mensagem);
        return false;
      }

      return data.push_notifications.configurado && data.push_notifications.vapid_configurado;
    } catch (error) {
      console.error('Erro ao verificar configuração do backend:', error);
      return false;
    }
  }

  // Obter chave pública VAPID
  async getVapidPublicKey(): Promise<string | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/public-key`);
      const data = await response.json();

      if (data.erro) {
        console.warn('Chave VAPID não disponível:', data.mensagem);
        return null;
      }

      return data.public_key;
    } catch (error) {
      console.error('Erro ao obter chave VAPID:', error);
      return null;
    }
  }

  // Inicializar service worker e subscription
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (!this.isSupported()) {
        return false;
      }

      // Verificar se o backend está configurado
      const backendConfigured = await this.checkBackendConfiguration();
      if (!backendConfigured) {
        console.warn('Backend não está configurado para push notifications');
        return false;
      }

      // Registrar service worker
      this.registration = await navigator.serviceWorker.register('/sw-push.js');
      await navigator.serviceWorker.ready;

      // Verificar se já tem subscription
      this.subscription = await this.registration.pushManager.getSubscription();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar push notifications:', error);
      return false;
    }
  }

  // Inscrever-se para receber notificações
  async subscribe(): Promise<boolean> {
    try {
      if (!this.registration || !this.hasPermission()) {
        return false;
      }

      // Obter chave VAPID do backend
      const vapidPublicKey = await this.getVapidPublicKey();
      if (!vapidPublicKey) {
        console.error('Chave VAPID não disponível');
        return false;
      }

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Enviar subscription para o backend
      const success = await this.sendSubscriptionToServer(this.subscription);
      
      if (success) {
        console.log('✅ Push notifications ativadas com sucesso');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao se inscrever para push notifications:', error);
      return false;
    }
  }

  // Cancelar inscrição
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        // Remover do backend primeiro
        await this.removeSubscriptionFromServer(this.subscription.endpoint);
        
        // Depois cancelar localmente
        await this.subscription.unsubscribe();
        this.subscription = null;
        
        console.log('✅ Push notifications desativadas');
      }
      return true;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return false;
    }
  }

  // Testar notificação
  async testNotification(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.erro) {
        console.warn('Erro ao testar notificação:', data.mensagem);
        return false;
      }

      console.log('✅ Notificação de teste enviada:', data.estatisticas);
      return true;
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      return false;
    }
  }

  // Verificar novas notificações (polling)
  async checkForNotifications(): Promise<void> {
    try {
      const response = await neurolinkService.getNotifications({
        status: 'SENT',
        limite: 10
      });

      if (!response.erro && response.notifications) {
        for (const notification of response.notifications) {
          // Marcar como lida após processar
          setTimeout(async () => {
            await neurolinkService.markAsRead(notification.id);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }

  // Converter VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Enviar subscription para o servidor
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const subscriptionData = {
        subscription: subscription.toJSON(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscriptionData)
      });

      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem);
      }

      console.log('✅ Subscription registrada no servidor:', data.subscription_id);
      return true;
    } catch (error) {
      console.error('Erro ao registrar subscription no servidor:', error);
      return false;
    }
  }

  // Remover subscription do servidor
  private async removeSubscriptionFromServer(endpoint: string): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ endpoint })
      });

      const data = await response.json();

      if (data.erro) {
        console.warn('Erro ao remover subscription do servidor:', data.mensagem);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover subscription do servidor:', error);
      return false;
    }
  }

  // Obter token de autenticação
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Primeiro tenta cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'routina_token') {
        return value;
      }
    }
    
    // Fallback para localStorage
    try {
      const userData = localStorage.getItem('routina_user');
      if (userData) {
        // Se tiver dados do usuário, assume que está autenticado
        return 'token_from_cookie'; // Placeholder
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
    }
    
    return null;
  }

  // Iniciar polling para verificar notificações
  startPolling(intervalMs: number = 30000): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(() => {
      this.checkForNotifications();
    }, intervalMs);
  }

  // Parar polling
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Parar o service worker
  async stop(): Promise<void> {
    this.stopPolling();
    
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
    this.isInitialized = false;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();