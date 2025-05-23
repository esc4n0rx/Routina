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

  // Inicializar service worker e subscription
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (!this.isSupported()) {
        return false;
      }

      // Registrar service worker
      this.registration = await navigator.serviceWorker.register('/sw-push.js');
      await navigator.serviceWorker.ready;

      // Verificar se já tem subscription
      this.subscription = await this.registration.pushManager.getSubscription();

      if (!this.subscription) {
        // Criar nova subscription se não existir
        await this.subscribe();
      }

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

      // VAPID key pública - você deve obter isso do seu backend
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Enviar subscription para o backend (você deve implementar esse endpoint)
      await this.sendSubscriptionToServer(this.subscription);

      return true;
    } catch (error) {
      console.error('Erro ao se inscrever para push notifications:', error);
      return false;
    }
  }

  // Cancelar inscrição
  async unsubscribe(): Promise<boolean> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        this.subscription = null;
        // Remover do backend também
        // await this.removeSubscriptionFromServer();
      }
      return true;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return false;
    }
  }

  // Verificar novas notificações
  async checkForNotifications(): Promise<void> {
    try {
      const response = await neurolinkService.getNotifications({
        status: 'SENT',
        limite: 10
      });

      if (!response.erro && response.notifications) {
        for (const notification of response.notifications) {
          await this.showNotification(notification);
          
          // Marcar como lida após 3 segundos
          setTimeout(async () => {
            await neurolinkService.markAsRead(notification.id);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  }

  // Mostrar notificação nativa
  private async showNotification(notification: NeuroLinkNotification): Promise<void> {
    if (!this.registration) return;

    const options: NotificationOptions = {
      body: notification.mensagem,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        id: notification.id,
        type: notification.tipo,
        url: this.getNotificationUrl(notification)
      },
      requireInteraction: notification.prioridade >= 8, // Alta prioridade
      tag: `routina-${notification.tipo.toLowerCase()}`
    };

    await this.registration.showNotification(notification.titulo, options);
  }

  // Obter URL baseada no tipo de notificação
  private getNotificationUrl(notification: NeuroLinkNotification): string {
    switch (notification.tipo) {
      case 'REMINDER':
        return '/tasks';
      case 'ACHIEVEMENT':
        return '/dashboard';
      case 'PROGRESS':
        return '/dashboard';
      default:
        return '/dashboard';
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
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const subscriptionData: PushSubscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
      }
    };

    // Aqui você deve implementar o endpoint no backend para salvar a subscription
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscriptionData)
    // });
  }

  // Iniciar polling para verificar notificações
  startPolling(intervalMs: number = 30000): void {
    setInterval(() => {
      this.checkForNotifications();
    }, intervalMs);
  }

  // Parar o service worker
  async stop(): Promise<void> {
    if (this.registration) {
      await this.registration.unregister();
      this.registration = null;
    }
    this.isInitialized = false;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();