// public/sw-push.js
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Escutar eventos de push
self.addEventListener('push', (event) => {
  console.log('Push recebido:', event);

  let notificationData = {
    title: 'Routina',
    body: 'Você tem uma nova notificação',
    icon: '/icons/noti-192x192.png',
    badge: '/icons/noti-192x192.png',
    data: { url: '/dashboard' }
  };

  // Se houver dados no push, usar eles
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.titulo || notificationData.title,
        body: data.mensagem || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        data: {
          id: data.id,
          type: data.tipo,
          url: getNotificationUrl(data.tipo) || '/dashboard'
        }
      };
    } catch (error) {
      console.error('Erro ao parsear dados do push:', error);
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: [
        {
          action: 'open',
          title: 'Abrir'
        },
        {
          action: 'dismiss',
          title: 'Dispensar'
        }
      ],
      requireInteraction: false,
      tag: 'routina-notification',
      renotify: true,
      vibrate: [200, 100, 200]
    }
  );

  event.waitUntil(notificationPromise);
});

// Escutar cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Notificação clicada:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Abrir a URL apropriada
  const url = data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Verificar se já tem uma janela aberta
      const existingClient = clients.find(client => 
        client.url.includes(url) && 'focus' in client
      );

      if (existingClient) {
        return existingClient.focus();
      }

      // Abrir nova janela
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );

  // Marcar como lida após 3 segundos
  if (data?.id) {
    setTimeout(() => {
      fetch(`${self.registration.scope}api/neurolink/notifications/${data.id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      }).catch(console.error);
    }, 3000);
  }
});

// Função auxiliar para obter URL baseada no tipo
function getNotificationUrl(type) {
  switch (type) {
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

// Função para obter token (simplificada)
function getAuthToken() {
  // Em um cenário real, você precisaria de uma forma mais segura de obter o token
  return localStorage.getItem('routina_token') || '';
}