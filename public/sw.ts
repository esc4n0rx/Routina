export {};
// Certifique-se de ter "webworker" na opção "lib" do seu tsconfig.json ou instale @types/serviceworker
// Ex: "lib": ["es2017", "webworker"]

// Usa type assertion para garantir o tipo correto de self no contexto do Service Worker
const swSelf = self as unknown as ServiceWorkerGlobalScope;

// --- Início da Augmentação para o evento 'sync' ---
// Definição global mínima para SyncEvent se não existir (para evitar erro TS)
interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

declare global {
  /**
   * Estende o mapa de eventos do ServiceWorkerGlobalScope para incluir o evento 'sync'.
   */
  interface ServiceWorkerGlobalScopeEventMap {
    'sync': SyncEvent;
  }
}
// --- Fim da Augmentação ---


const CACHE_NAME_PREFIX = 'routina-app';
const CACHE_VERSION = 'v1'; // Altere esta versão para forçar a atualização do cache
const APP_SHELL_CACHE_NAME = `${CACHE_NAME_PREFIX}-shell-${CACHE_VERSION}`;

const STATIC_ASSETS: string[] = [
  '/',
  '/dashboard',
  '/tasks',
  '/calendar',
  '/settings',
  '/manifest.json',
  '/logo.png',
  '/offline.html', // Importante para fallback offline
  // Adicionar outros assets estáticos críticos
];

// Enum para Estratégias de Cache
enum CacheStrategy {
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
}

interface ExpirationConfig {
  maxEntries: number;
  maxAgeSeconds: number;
}

interface RouteCacheConfigItem {
  pattern: RegExp;
  strategy: CacheStrategy;
  cacheName: string;
  expiration?: ExpirationConfig; // Opcional
}

const API_CACHE_NAME = `${CACHE_NAME_PREFIX}-api-${CACHE_VERSION}`;
const IMAGES_CACHE_NAME = `${CACHE_NAME_PREFIX}-images-${CACHE_VERSION}`;
const STATIC_RESOURCES_CACHE_NAME = `${CACHE_NAME_PREFIX}-static-resources-${CACHE_VERSION}`;

const ROUTE_CACHE_CONFIG: RouteCacheConfigItem[] = [
  {
    pattern: /^https:\/\/api\.routina\.fun\/api\//,
    strategy: CacheStrategy.NETWORK_FIRST,
    cacheName: API_CACHE_NAME,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutos
    },
  },
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i, // Case insensitive
    strategy: CacheStrategy.CACHE_FIRST,
    cacheName: IMAGES_CACHE_NAME,
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
    },
  },
  {
    pattern: /\.(?:js|css)$/i, // Case insensitive
    strategy: CacheStrategy.STALE_WHILE_REVALIDATE,
    cacheName: STATIC_RESOURCES_CACHE_NAME,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
    },
  },
];

// Lista de todos os nomes de cache atuais usados pelo service worker
const ALL_CACHE_NAMES: string[] = [
  APP_SHELL_CACHE_NAME,
  // Adiciona nomes de cache da configuração de rotas, garantindo que sejam únicos
  ...new Set(ROUTE_CACHE_CONFIG.map(config => config.cacheName))
];


// Evento de instalação
swSelf.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Evento: install');
  event.waitUntil(
    caches.open(APP_SHELL_CACHE_NAME)
      .then((cache: Cache) => {
        console.log('[Service Worker] Cacheando App Shell...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] App Shell cacheado com sucesso.');
        return swSelf.skipWaiting(); // Força o novo service worker a assumir o controle imediatamente
      })
      .catch(error => {
        console.error('[Service Worker] Falha ao cachear App Shell:', error);
      })
  );
});

// Evento de ativação
swSelf.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Evento: activate');
  event.waitUntil(
    caches.keys()
      .then((cacheNames: string[]) => {
        return Promise.all(
          cacheNames.map((cacheName: string) => {
            if (!ALL_CACHE_NAMES.includes(cacheName)) {
              console.log('[Service Worker] Deletando cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Ativado com sucesso e caches antigos limpos.');
        return swSelf.clients.claim(); // Permite que o SW ativado controle clientes imediatamente
      })
      .catch(error => {
        console.error('[Service Worker] Falha na ativação:', error);
      })
  );
});

// Interceptar requisições
swSelf.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    // console.log(`[Service Worker] Ignorando requisição não-GET: ${request.method} ${request.url}`);
    return;
  }

  const url = new URL(request.url);

  // Aplicar estratégia baseada na configuração de rotas
  for (const config of ROUTE_CACHE_CONFIG) {
    if (config.pattern.test(request.url)) {
      // console.log(`[Service Worker] Aplicando estratégia "${config.strategy}" para URL: ${request.url}`);
      event.respondWith(handleRequest(request, config));
      return;
    }
  }

  // Estratégia padrão para assets do App Shell (STATIC_ASSETS)
  // Verifica se a URL corresponde a um dos assets estáticos definidos
  if (url.origin === self.location.origin && STATIC_ASSETS.includes(url.pathname)) {
    // console.log(`[Service Worker] Servindo asset do App Shell: ${request.url}`);
    event.respondWith(
      caches.match(request, { cacheName: APP_SHELL_CACHE_NAME })
        .then((cachedResponse?: Response) => {
          if (cachedResponse) {
            // console.log(`[Service Worker] Encontrado no cache do App Shell: ${request.url}`);
            return cachedResponse;
          }
          // console.log(`[Service Worker] Não encontrado no cache, buscando na rede: ${request.url}`);
          // Se não estiver no cache, busca na rede (não armazena aqui, pois deveria estar no `install`)
          return fetch(request);
        })
        .catch(() => {
          // console.log(`[Service Worker] Falha na busca de rede para asset do App Shell: ${request.url}`);
          if (request.destination === 'document') {
            // console.log('[Service Worker] Servindo página offline.');
            return caches.match('/offline.html', { cacheName: APP_SHELL_CACHE_NAME }) as Promise<Response>;
          }
          // Para outros tipos de assets, permite que o erro se propague
          return new Response("Network error, asset not found.", { status: 404, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Estratégia para páginas HTML da mesma origem não listadas em STATIC_ASSETS
  // (ex: páginas de detalhes de tarefas que não são parte do shell básico)
  // Usa StaleWhileRevalidate para um bom equilíbrio entre velocidade e frescor.
  if (url.origin === self.location.origin && request.headers.get('accept')?.includes('text/html')) {
    // console.log(`[Service Worker] Aplicando StaleWhileRevalidate para página HTML: ${request.url}`);
    event.respondWith(
      staleWhileRevalidate(request, APP_SHELL_CACHE_NAME) // Pode usar um cache dedicado ou o APP_SHELL_CACHE_NAME
        .catch(() => {
          // console.log(`[Service Worker] Falha na busca de rede para página HTML: ${request.url}`);
          return caches.match('/offline.html', { cacheName: APP_SHELL_CACHE_NAME }) as Promise<Response>;
        })
    );
    return;
  }

  // Se nenhuma estratégia específica, apenas busca da rede (comportamento padrão do navegador)
  // console.log(`[Service Worker] Nenhuma estratégia específica, buscando da rede: ${request.url}`);
});


async function putInCache(cache: Cache, request: Request, response: Response): Promise<void> {
  // Evita armazenar em cache respostas de erro, mas permite respostas opacas (CDNs)
  if (!response.ok && response.type !== 'opaque') {
    // console.log(`[Service Worker] Não armazenando resposta inválida para ${request.url}: ${response.status}`);
    return;
  }
  await cache.put(request, response.clone()); // Clona a resposta antes de armazenar
  // console.log(`[Service Worker] Cacheado ${request.url} no cache ${cache}`);
  // Lógica de expiração (maxEntries, maxAgeSeconds) seria implementada aqui se necessário
  // Ex: verificar o número de entradas e remover as mais antigas se exceder maxEntries.
  // Isso é complexo e muitas vezes delegado a bibliotecas como Workbox.
}

async function handleRequest(request: Request, config: RouteCacheConfigItem): Promise<Response> {
  const cache: Cache = await caches.open(config.cacheName);

  switch (config.strategy) {
    case CacheStrategy.CACHE_FIRST:
      return cacheFirst(request, cache);
    case CacheStrategy.NETWORK_FIRST:
      return networkFirst(request, cache);
    case CacheStrategy.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cache);
    default:
      // console.log(`[Service Worker] Estratégia desconhecida: ${config.strategy}, buscando da rede.`);
      return fetch(request);
  }
}

async function cacheFirst(request: Request, cache: Cache): Promise<Response> {
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // console.log(`[CacheFirst] Servindo do cache: ${request.url}`);
    return cachedResponse;
  }
  // console.log(`[CacheFirst] Não encontrado no cache, buscando da rede: ${request.url}`);
  const networkResponse = await fetch(request);
  if (networkResponse) { // Garante que a resposta da rede é válida
    await putInCache(cache, request, networkResponse.clone());
  }
  return networkResponse;
}

async function networkFirst(request: Request, cache: Cache): Promise<Response> {
  try {
    // console.log(`[NetworkFirst] Tentando buscar da rede: ${request.url}`);
    const networkResponse = await fetch(request);
    // Se a busca na rede for bem-sucedida, armazena no cache e retorna
    await putInCache(cache, request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // console.log(`[NetworkFirst] Falha na rede, tentando buscar do cache: ${request.url}`, error);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // console.error(`[NetworkFirst] Falha na rede e no cache para ${request.url}.`);
    // Se for um documento e tudo falhar, retorna a página offline
    if (request.destination === 'document') {
      return caches.match('/offline.html', { cacheName: APP_SHELL_CACHE_NAME }) as Promise<Response>;
    }
    throw error; // Relança o erro se não for um documento ou não houver cache
  }
}

async function staleWhileRevalidate(request: Request, cacheOrCacheName: Cache | string): Promise<Response> {
  let cache: Cache;
  if (typeof cacheOrCacheName === 'string') {
    cache = await caches.open(cacheOrCacheName);
  } else {
    cache = cacheOrCacheName;
  }

  const cachedResponsePromise = cache.match(request);
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse) { // Garante que a resposta da rede é válida
        await putInCache(cache, request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      // console.warn(`[StaleWhileRevalidate] Falha na busca de rede para ${request.url}:`, error);
      // Se a rede falhar, ainda podemos ter uma resposta em cache.
      // Se não, este erro se propagará se cachedResponsePromise também resolver para undefined.
      throw error;
    });

  const cachedResponse = await cachedResponsePromise;
  if (cachedResponse) {
    // console.log(`[StaleWhileRevalidate] Servindo do cache (enquanto revalida): ${request.url}`);
    return cachedResponse; // Retorna do cache imediatamente
  }
  // console.log(`[StaleWhileRevalidate] Não encontrado no cache, aguardando a rede: ${request.url}`);
  return fetchPromise; // Se não houver resposta em cache, aguarda a rede
}

interface ClientMessage {
  type: 'SKIP_WAITING';
  // Adicionar outros tipos de mensagens se necessário
}

swSelf.addEventListener('message', (event: ExtendableMessageEvent) => {
  // console.log('[Service Worker] Evento: message, Dados:', event.data);
  const messageData = event.data as ClientMessage; // Afirmação de tipo
  if (messageData && messageData.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Executando skipWaiting() devido à mensagem do cliente.');
    swSelf.skipWaiting();
  }
});

interface PushData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  vibrate?: readonly number[]; // Corrigido para readonly number[] conforme NotificationOptions
  data?: any; // Pode ser mais específico se a estrutura de `data.data` for conhecida
  actions?: NotificationOptions[];
}

swSelf.addEventListener('push', (event: PushEvent) => {
  // console.log('[Service Worker] Evento: push');
  if (!event.data) {
    console.warn('[Service Worker] Evento push mas sem dados.');
    return;
  }

  let pushContent: PushData;
  try {
    pushContent = event.data.json() as PushData;
  } catch (e) {
    console.error('[Service Worker] Falha ao parsear dados do push como JSON:', e);
    // Fallback para notificação padrão
    pushContent = { title: "Nova Notificação", body: "Você tem uma nova mensagem." };
  }

  // console.log('[Service Worker] Dados do push recebidos:', pushContent);

  const options: NotificationOptions = {
    body: pushContent.body,
    icon: pushContent.icon || '/logo.png', // Ícone padrão
    badge: pushContent.badge || '/logo.png', // Badge padrão
    //vibrate: pushContent.vibrate || [200, 100, 200],
    data: pushContent.data || { url: '/dashboard' }, // Garante que data sempre tenha uma URL ou padrão
    //actions: pushContent.actions || [],
  };

  event.waitUntil(
    swSelf.registration.showNotification(pushContent.title, options)
      .catch(err => console.error('[Service Worker] Erro ao mostrar notificação:', err))
  );
});

swSelf.addEventListener('notificationclick', (event: NotificationEvent) => {
  // console.log('[Service Worker] Evento: notificationclick, Notificação:', event.notification);
  event.notification.close(); // Fecha a notificação

  const urlToOpen = event.notification.data?.url || '/dashboard'; // Fallback para dashboard
  // console.log(`[Service Worker] Clique na notificação: tentando abrir ou focar URL: ${urlToOpen}`);

  event.waitUntil(
    swSelf.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (clientList: readonly WindowClient[]) => { // Callback agora é async
        for (const client of clientList) {
          try {
            const clientUrl = new URL(client.url);
            const targetUrl = new URL(urlToOpen, swSelf.location.origin);

            if (clientUrl.origin === targetUrl.origin && clientUrl.pathname === targetUrl.pathname && 'focus' in client) {
              // console.log(`[Service Worker] Focando cliente existente para URL: ${client.url}`);
              await client.focus(); // Aguarda o foco
              return; // Retorna void, a Promise do async resolverá para void
            }
          } catch (e) {
            // console.warn(`[Service Worker] Erro ao parsear URL do cliente ou URL alvo: ${client.url}, ${urlToOpen}`, e);
          }
        }
        if (swSelf.clients.openWindow) {
          // console.log(`[Service Worker] Nenhum cliente existente encontrado, abrindo nova janela para URL: ${urlToOpen}`);
          await swSelf.clients.openWindow(urlToOpen); // Aguarda abrir a janela
          return; // Retorna void
        }
        // console.log('[Service Worker] Nenhum cliente para focar e openWindow não é suportado.');
        // Se nada foi feito, a função async implicitamente retorna Promise<void>
      })
      .catch(err => console.error('[Service Worker] Erro ao manipular clique na notificação:', err))
  );
});


// Sincronização em background (requer que a API Background Sync esteja habilitada)
// A interface SyncEvent e a entrada em ServiceWorkerGlobalScopeEventMap foram movidas para o bloco `declare global` no topo.
swSelf.addEventListener('sync', (event: Event) => { // Cast event to SyncEvent inside handler
  const syncEvent = event as unknown as SyncEvent;
  // console.log(`[Service Worker] Evento: sync, Tag: ${syncEvent.tag}, LastChance: ${syncEvent.lastChance}`);
  if (syncEvent.tag === 'background-sync-routina') { // Torna a tag mais específica
    console.log('[Service Worker] Realizando sincronização em background para routina...');
    syncEvent.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync(): Promise<void> {
  // Implementar sincronização de dados offline
  // Exemplo: reenviar requisições falhas armazenadas no IndexedDB
  console.log('[Service Worker] Executando tarefas de sincronização em background...');
  try {
    // Simula algum trabalho assíncrono
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[Service Worker] Sincronização em background concluída.');
  } catch (error) {
    console.error('[Service Worker] Sincronização em background falhou:', error);
    // Tratar erro, talvez reagendar sincronização
  }
}

// Log para indicar que o script do Service Worker foi carregado e parseado.
console.log('[Service Worker] Script carregado e interpretado.');