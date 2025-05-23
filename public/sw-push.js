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
self.addEventListener('push', function(event) {
  console.log('🔔 Push notification recebida:', event);

  if (!event.data) {
    console.warn('Push notification sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📨 Dados da notificação:', data);

    const options = {
      body: data.body || data.mensagem,
      icon: data.icon || '/icons/noti-192x192.png',
      badge: data.badge || '/icons/noti-192x192.png',
      data: {
        id: data.id,
        type: data.tipo || data.type,
        url: data.url || '/dashboard',
        ...data.data
      },
      requireInteraction: (data.prioridade || data.priority) >= 8,
      tag: data.tag || `routina-${data.tipo || 'notification'}`,
      vibrate: [200, 100, 200],
      actions: data.actions || []
    };

    const title = data.title || data.titulo || 'Routina';

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Erro ao processar push notification:', error);
    
    // Fallback para notificação simples
    event.waitUntil(
      self.registration.showNotification('Routina', {
        body: 'Você tem uma nova notificação',
        icon: '/icons/icon-192x192.png'
      })
    );
  }
});

// Escutar cliques nas notificações
self.addEventListener('notificationclick', function(event) {
  console.log('👆 Notificação clicada:', event.notification);

  event.notification.close();

  const data = event.notification.data;
  const url = data?.url || '/dashboard';
  const notificationId = data?.id;

  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Tentar focar em uma janela existente
      for (let client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Se não encontrou, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );

  // Marcar notificação como lida
  if (notificationId) {
    event.waitUntil(
      markNotificationAsRead(notificationId)
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('❌ Notificação fechada:', event.notification);
  
  const data = event.notification.data;
  const notificationId = data?.id;

  if (notificationId) {
    event.waitUntil(
      markNotificationAsRead(notificationId)
    );
  }
});

// Função para marcar notificação como lida
async function markNotificationAsRead(notificationId) {
  try {
    const token = await getStoredAuthToken();
    if (!token) {
      console.warn('Token não encontrado para marcar notificação como lida');
      return;
    }

    const response = await fetch(`${self.location.origin}/api/neurolink/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Notificação marcada como lida:', notificationId);
    } else {
      console.warn('❌ Erro ao marcar notificação como lida:', response.status);
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

// Função para obter token de autenticação
async function getStoredAuthToken() {
  try {
    // Tentar obter de diferentes fontes
    const clients = await self.clients.matchAll();
    
    for (let client of clients) {
      try {
        const response = await new Promise((resolve) => {
          const messageChannel = new MessageChannel();
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
          client.postMessage({ type: 'GET_AUTH_TOKEN' }, [messageChannel.port2]);
        });
        
        if (response && response.token) {
          return response.token;
        }
      } catch (error) {
        console.error('Erro ao obter token do cliente:', error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
}

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