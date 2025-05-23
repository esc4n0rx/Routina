// services/push-notification-service.ts
import { neurolinkService, NeuroLinkNotification } from './api/neurolink-service';

// Interface opcional, já que subscription.toJSON() retorna PushSubscriptionJSON
// interface PushSubscriptionData {
//   endpoint: string;
//   keys: {
//     p256dh: string;
//     auth: string;
//   };
// }

export class PushNotificationService {
  private static instance: PushNotificationService;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isInitialized = false;
  private pollingInterval: NodeJS.Timeout | null = null;

  private constructor() { // Construtor privado para reforçar o padrão Singleton
    // Evitar que seja instanciado diretamente
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Verificar se o dispositivo suporta notificações
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' && // Garante que está no browser
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Verificar se já tem permissão
  hasPermission(): boolean {
    if (!this.isSupported()) return false;
    return Notification.permission === 'granted';
  }

  // Solicitar permissão
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Push notifications não suportadas neste dispositivo');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }

  // Obter token de autenticação
  private getAuthToken(): string | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    // Primeiro tenta cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'routina_token') { // Ajuste o nome do cookie se necessário
        return value;
      }
    }

    // Fallback para localStorage
    try {
      // Tenta obter um token JWT específico do localStorage
      const token = localStorage.getItem('routina_auth_token'); // Ajuste a chave se necessário
      if (token) {
        return token;
      }
      // Se não houver token JWT, verifica se há dados do usuário como um indicador de sessão
      // mas isso não fornece um token diretamente, então o comportamento aqui pode precisar de revisão.
      // A lógica original retornava um placeholder, o que não é ideal.
      // Se a presença de 'routina_user' implica que um token *deveria* estar no cookie,
      // então a lógica do cookie já deveria ter coberto.
      // const userData = localStorage.getItem('routina_user');
      // if (userData) {
      //   console.warn('Dados de usuário encontrados no localStorage, mas nenhum token de autenticação explícito. Verifique a lógica de getAuthToken.');
      //   // Dependendo da sua lógica de autenticação, você pode ter um token aqui ou não.
      //   // Se 'routina_user' contém o token, extraia-o.
      // }
    } catch (error) {
      console.error('Erro ao acessar localStorage para obter token:', error);
    }

    return null;
  }


  // Verificar se o backend está configurado - COM AUTENTICAÇÃO
  async checkBackendConfiguration(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Decide se a verificação pode prosseguir sem token ou se deve falhar
        console.warn('Tentando verificar configuração do backend sem token de autenticação.');
        // Se a autenticação for estritamente necessária para este endpoint, retorne false ou lance um erro
        // return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/status`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensagem: 'Erro desconhecido na resposta do backend.' }));
        console.warn(`Push notifications não configuradas no backend (HTTP ${response.status}):`, errorData.mensagem || response.statusText);
        return false;
      }
      
      const data = await response.json();

      if (data.erro) {
        console.warn('Push notifications não configuradas no backend (API error):', data.mensagem);
        return false;
      }

      return !!(data.push_notifications?.configurado && data.push_notifications?.vapid_configurado);
    } catch (error) {
      console.error('Erro ao verificar configuração do backend:', error);
      return false;
    }
  }

  // Obter chave pública VAPID - COM AUTENTICAÇÃO
  async getVapidPublicKey(): Promise<string | null> {
    try {
      const token = this.getAuthToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn('Tentando obter chave VAPID sem token de autenticação.');
        // Se a autenticação for estritamente necessária para este endpoint, retorne null ou lance um erro
        // return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/public-key`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensagem: 'Erro desconhecido na resposta do backend.' }));
        console.warn(`Chave VAPID não disponível (HTTP ${response.status}):`, errorData.mensagem || response.statusText);
        return null;
      }
      
      const data = await response.json();

      if (data.erro) {
        console.warn('Chave VAPID não disponível (API error):', data.mensagem);
        return null;
      }

      return data.public_key || null;
    } catch (error) {
      console.error('Erro ao obter chave VAPID:', error);
      return null;
    }
  }

  // Inicializar service worker e subscription
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (!this.isSupported()) {
      console.warn('Push notifications não suportadas neste dispositivo. Não inicializando.');
      return false;
    }

    try {
      // Verificar se o backend está configurado
      // Esta chamada agora usará a versão de checkBackendConfiguration que tenta obter autenticação
      const backendConfigured = await this.checkBackendConfiguration();
      if (!backendConfigured) {
        console.warn('Backend não está configurado para push notifications. Não registrando Service Worker para push.');
        return false;
      }

      // Registrar service worker (JavaScript, não TypeScript)
      this.registration = await navigator.serviceWorker.register('/sw-push.js', { // Certifique-se que este caminho está correto
        scope: '/', // Escopo mais amplo, ajuste se necessário
      });
      
      await navigator.serviceWorker.ready; // Espera o SW estar ativo
      console.log('✅ Service Worker para push registrado e pronto.');

      // Verificar se já tem subscription
      this.subscription = await this.registration.pushManager.getSubscription();
      if (this.subscription) {
        console.log('ℹ️ Subscrição existente encontrada:', this.subscription.endpoint);
      } else {
        console.log('ℹ️ Nenhuma subscrição existente encontrada.');
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar push notifications:', error);
      this.isInitialized = false; // Garante que não fique em estado inconsistente
      return false;
    }
  }


  // Inscrever-se para receber notificações
  async subscribe(): Promise<boolean> {
    if (!this.isInitialized && !(await this.initialize())) {
        console.warn('Falha ao inicializar o serviço de push. Não é possível inscrever.');
        return false;
    }
    
    // this.registration já deve estar definido se initialize() foi bem-sucedido
    if (!this.registration) {
        console.error('Service Worker registration não encontrado. Não é possível inscrever.');
        return false;
    }

    if (!this.hasPermission()) {
      console.warn('Permissão para notificações não concedida. Solicitando...');
      const permissionGranted = await this.requestPermission();
      if (!permissionGranted) {
        console.warn('Permissão para notificações negada.');
        return false;
      }
    }

    try {
      // Obter chave VAPID do backend (já usa a versão com auth)
      const vapidPublicKey = await this.getVapidPublicKey();
      if (!vapidPublicKey) {
        console.error('Chave VAPID não disponível. Não é possível inscrever.');
        return false;
      }

      const applicationServerKey = this.urlBase64ToUint8Array(vapidPublicKey);
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Enviar subscription para o backend
      const success = await this.sendSubscriptionToServer(this.subscription);
      
      if (success) {
        console.log('✅ Push notifications ativadas e subscrição enviada ao servidor.');
        return true;
      } else {
        console.warn('Falha ao enviar subscrição para o servidor. Desfazendo subscrição local.');
        // Se falhar ao enviar ao servidor, é uma boa prática cancelar a subscrição local
        // para evitar um estado inconsistente.
        await this.subscription.unsubscribe();
        this.subscription = null;
        return false;
      }
    } catch (error) {
      console.error('Erro ao se inscrever para push notifications:', error);
      // Tentar limpar se uma subscrição foi criada mas falhou antes de enviar
      if (this.subscription) {
        try {
          await this.subscription.unsubscribe();
        } catch (unsubError) {
          console.error('Erro adicional ao tentar cancelar subscrição após falha:', unsubError);
        }
        this.subscription = null;
      }
      return false;
    }
  }

  // Cancelar inscrição
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription && this.registration) {
        console.log('Tentando obter subscrição existente para cancelar...');
        this.subscription = await this.registration.pushManager.getSubscription();
    }

    if (!this.subscription) {
      console.warn('Nenhuma subscrição ativa para cancelar.');
      return true; // Considera sucesso, pois não há nada para fazer.
    }

    try {
      // Remover do backend primeiro
      const removedFromServer = await this.removeSubscriptionFromServer(this.subscription.endpoint);
      if (!removedFromServer) {
        console.warn('Falha ao remover subscrição do servidor. O cancelamento local prosseguirá, mas pode haver um endpoint órfão no backend.');
        // Dependendo da criticidade, você pode querer retornar false aqui ou tentar novamente.
      }
      
      // Depois cancelar localmente
      await this.subscription.unsubscribe();
      console.log('✅ Subscrição local cancelada.');
      this.subscription = null;
      
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
        console.error('Token de autenticação não encontrado. Não é possível testar notificação.');
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ payload: "opcional" }) // Se seu endpoint de teste aceitar um corpo
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensagem: 'Erro desconhecido na resposta do backend.' }));
        console.warn(`Erro ao testar notificação (HTTP ${response.status}):`, errorData.mensagem || response.statusText);
        return false;
      }
      
      const data = await response.json();

      if (data.erro) {
        console.warn('Erro ao testar notificação (API error):', data.mensagem);
        return false;
      }

      console.log('✅ Notificação de teste enviada:', data.estatisticas || data);
      return true;
    } catch (error) {
      console.error('Erro ao testar notificação:', error);
      return false;
    }
  }

  // Verificar novas notificações (polling)
  async checkForNotifications(): Promise<void> {
    if (!this.getAuthToken()) {
        console.warn('Usuário não autenticado. Pulando verificação de notificações.');
        return;
    }
    try {
      const response = await neurolinkService.getNotifications({ // Assumindo que neurolinkService lida com auth
        status: 'SENT', // Ou o status apropriado para notificações não vistas/processadas
        limite: 10,
      });

      if (!response.erro && response.notifications && response.notifications.length > 0) {
        console.log(`ℹ️ ${response.notifications.length} notificações recebidas via polling.`);
        for (const notification of response.notifications) {
          // TODO: Processar a notificação (ex: exibir no app, atualizar contador)
          console.log('Notificação recebida:', notification.titulo || notification.id);

          // A lógica de marcar como lida aqui pode ser prematura se a notificação
          // precisa de interação do usuário na UI antes de ser considerada "lida".
          // Considere mover esta lógica para quando o usuário interagir com a notificação na UI.
          setTimeout(async () => {
            try {
              await neurolinkService.markAsRead(notification.id); // Assumindo que neurolinkService lida com auth
              console.log(`🔔 Notificação ${notification.id} marcada como lida.`);
            } catch (markError) {
              console.error(`Erro ao marcar notificação ${notification.id} como lida:`, markError);
            }
          }, 1000); // Delay arbitrário
        }
      } else if (response.erro) {
        console.warn('Erro da API ao verificar notificações:', response.mensagem);
      }
    } catch (error) {
      console.error('Erro crítico ao verificar notificações:', error);
    }
  }

  // Converter VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    if (typeof window === 'undefined') {
        // Fallback para Node.js se atob não estiver disponível (improvável neste contexto de frontend)
        const rawData = Buffer.from(base64, 'base64').toString('binary');
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

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
        console.error('Token de autenticação não encontrado. Não é possível enviar subscrição para o servidor.');
        return false;
      }

      // Usando PushSubscriptionJSON que é o tipo retornado por subscription.toJSON()
      const subscriptionJSON: PushSubscriptionJSON = subscription.toJSON();

      const subscriptionData = {
        subscription: subscriptionJSON,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          // language: navigator.language, // Pode ser útil
          // timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Pode ser útil
        },
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ mensagem: 'Erro desconhecido na resposta do backend.' }));
        throw new Error(errorData.mensagem || `Falha ao registrar subscrição no servidor (HTTP ${response.status})`);
      }
      
      const data = await response.json();

      if (data.erro) {
        throw new Error(data.mensagem || 'Erro da API ao registrar subscrição no servidor');
      }

      console.log('✅ Subscription registrada no servidor:', data.subscription_id || 'ID não retornado');
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
        console.error('Token de autenticação não encontrado. Não é possível remover subscrição do servidor.');
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/push/unsubscribe`, {
        method: 'POST', // Ou DELETE, dependendo da sua API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ mensagem: 'Erro desconhecido na resposta do backend.' }));
        console.warn(`Erro ao remover subscription do servidor (HTTP ${response.status}):`, errorData.mensagem || response.statusText);
        return false; // Indica falha, mas não lança erro para permitir que o unsubscribe local continue
      }
      
      const data = await response.json();

      if (data.erro) {
        console.warn('Erro da API ao remover subscription do servidor:', data.mensagem);
        return false; // Indica falha
      }
      
      console.log('ℹ️ Subscrição removida do servidor.');
      return true;
    } catch (error) {
      console.error('Erro crítico ao remover subscription do servidor:', error);
      return false;
    }
  }

  // Iniciar polling para verificar notificações
  startPolling(intervalMs: number = 30000): void {
    if (typeof window === 'undefined') { // Não iniciar polling no lado do servidor
        console.log("Não é ambiente de navegador, polling não iniciado.");
        return;
    }
    if (this.pollingInterval) {
      console.log('Polling já está ativo. Reiniciando com novo intervalo se necessário.');
      this.stopPolling();
    }

    // Executa uma vez imediatamente, depois no intervalo
    this.checkForNotifications();
    this.pollingInterval = setInterval(() => {
      this.checkForNotifications();
    }, intervalMs);
    console.log(`Polling iniciado com intervalo de ${intervalMs / 1000}s.`);
  }

  // Parar polling
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('Polling parado.');
    }
  }

  // Parar o service worker e limpar
  async stop(): Promise<void> {
    console.log('Parando PushNotificationService...');
    this.stopPolling();
    
    try {
        if (this.subscription) {
            console.log('Tentando cancelar subscrição existente ao parar o serviço...');
            await this.unsubscribe(); // Tenta remover do backend e localmente
        }

        if (this.registration) {
            await this.registration.unregister();
            console.log('Service Worker de push desregistrado.');
            this.registration = null;
        }
    } catch(error) {
        console.error("Erro ao desregistrar o Service Worker ou cancelar subscrição durante parada:", error);
    }

    this.isInitialized = false;
    console.log('PushNotificationService parado e limpo.');
  }
}

// Exporta a instância singleton
export const pushNotificationService = PushNotificationService.getInstance();