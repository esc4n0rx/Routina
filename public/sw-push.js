// public/sw-push.js (crie ou modifique este arquivo)

// Nome da versão do cache para controle de atualizações
const CACHE_VERSION = 'routina-pwa-v1';

// Evento de instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker para notificações push: instalando...');
  
  // Força a ativação imediata do SW, sem esperar pelo refresh da página
  self.skipWaiting();
  
  console.log('Service Worker para notificações push: instalado!');
});

// Evento de ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker para notificações push: ativando...');
  
  // Toma controle de todas as páginas imediatamente
  event.waitUntil(clients.claim());
  
  console.log('Service Worker para notificações push: ativado!');
});

// Evento para receber notificações push
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);
  
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    console.warn('Permissão de notificação não concedida, ignorando push.');
    return;
  }

  // Extrair dados da mensagem push
  let payload;
  try {
    if (event.data) {
      payload = event.data.json();
      console.log('Payload da notificação:', payload);
    } else {
      console.warn('Sem dados na mensagem push');
      payload = {
        title: 'Routina',
        message: 'Você tem uma nova notificação',
        data: {
          url: '/'
        }
      };
    }
  } catch (error) {
    console.error('Erro ao processar payload da notificação:', error);
    payload = {
      title: 'Routina',
      message: 'Nova notificação recebida',
      data: {
        url: '/'
      }
    };
  }

  // Configurações da notificação
  const options = {
    body: payload.message || payload.body || 'Nova notificação do Routina',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: payload.data || { url: '/' },
    tag: payload.id || 'default',
    requireInteraction: true,
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
      {
        action: 'close',
        title: 'Fechar',
      }
    ]
  };

  // Exibir a notificação
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Routina', options)
  );
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Clique em notificação:', event);
  
  event.notification.close();
  
  // Obtém a URL para onde navegar quando a notificação for clicada
  const urlToOpen = event.notification.data && event.notification.data.url 
    ? event.notification.data.url 
    : '/';

  // Ação específica baseada no botão clicado
  if (event.action === 'open') {
    // Abre a URL especificada
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Verifica se já existe uma janela/aba aberta do app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Se não existir uma janela aberta, abra uma nova
        return clients.openWindow(urlToOpen);
      })
    );
  }
});

// Evento para verificar autenticação com o client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_AUTH_TOKEN') {
    event.ports[0].postMessage({ 
      received: true, 
      message: 'Solicitação de token recebida pelo Service Worker' 
    });
  }
});

// Lidar com notificações push que chegam em segundo plano
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Subscription expirada ou alterada');
  
  // Notificar o app para recriar a subscription
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        console.log('Nova subscription:', subscription.endpoint);
        
        // Tentar encontrar uma janela do client para enviar a nova subscription
        return clients.matchAll({ type: 'window' }).then((clientList) => {
          if (clientList.length > 0) {
            clientList[0].postMessage({
              type: 'SUBSCRIPTION_UPDATED',
              subscription: subscription
            });
          }
        });
      })
  );
});

console.log('Service Worker para notificações push carregado!');