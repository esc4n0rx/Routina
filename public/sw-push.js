// Service Worker específico para Push Notifications
importScripts('/sw.js');

// Override do push event com lógica mais específica
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification recebida:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Erro ao parsear dados da push notification:', e);
      data = {
        title: 'Routina',
        body: event.data.text() || 'Nova notificação',
      };
    }
  }
  
  const title = data.title || 'Routina';
  const options = {
    body: data.body || data.mensagem || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tipo || 'routina-notification',
    data: {
      url: '/dashboard',
      notificationId: data.id,
      ...data
    },
    actions: [
      {
        action: 'open',
        title: '👁️ Ver',
      },
      {
        action: 'dismiss',
        title: '✖️ Fechar',
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.prioridade >= 3,
    silent: false,
    timestamp: Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Notificação exibida com sucesso');
        
        // Marcar como recebida na API (opcional)
        if (data.id) {
          fetch('/api/notifications/delivered', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: data.id })
          }).catch(console.error);
        }
      })
      .catch((error) => {
        console.error('❌ Erro ao exibir notificação:', error);
      })
  );
});