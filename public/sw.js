// Service Worker para PWA e Push Notifications
const CACHE_NAME = 'routina-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - estratégia cache-first para assets estáticos
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna resposta do cache
        if (response) {
          return response;
        }
        
        // Clona a requisição
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Verifica se recebemos uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clona a resposta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Se offline, retorna página offline para navegação
          if (event.request.destination === 'document') {
            return caches.match('/offline');
          }
        });
      })
  );
});

// Push event - receber notificações push
self.addEventListener('push', (event) => {
  console.log('Push event recebido:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'Routina',
        body: event.data.text() || 'Nova notificação',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      };
    }
  }
  
  const options = {
    body: notificationData.body || 'Nova notificação do Routina',
    icon: notificationData.icon || '/icons/icon-192x192.png',
    badge: notificationData.badge || '/icons/badge-72x72.png',
    tag: notificationData.tag || 'routina-notification',
    data: notificationData.data || {},
    actions: notificationData.actions || [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/action-close.png'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: notificationData.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'Routina',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click recebido:', event);
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Se já tem uma janela aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes('routina.fun') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Caso contrário, abre nova janela
      if (clients.openWindow) {
        const targetUrl = event.notification.data?.url || '/dashboard';
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Message event - comunicação com a aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_AUTH_TOKEN') {
    // Responde com token se disponível
    event.ports[0].postMessage({ token: null });
  }
});