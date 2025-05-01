// Константы для кэширования
const CACHE_NAME = 'taskmaster-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/global.css',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  // Пропускаем фазу ожидания и переходим к активации
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэширование статических ресурсов');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация нового Service Worker
self.addEventListener('activate', (event) => {
  // Очистка старых кэшей
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Удаление старого кэша:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Берём управление над всеми клиентами
      console.log('Service Worker активирован');
      return self.clients.claim();
    })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Для API запросов используем стратегию "сначала сеть, затем кэш"
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // Для статических ресурсов используем "сначала кэш, затем сеть"
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// Обработка сообщений
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_REQUIRED') {
    console.log('Получен запрос на синхронизацию');

    // Отправляем сообщение о начале синхронизации
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_STARTED' });
      });
    });

    // Выполняем синхронизацию (в реальном приложении здесь будет более сложная логика)
    setTimeout(() => {
      // Отправляем сообщение о завершении синхронизации
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_COMPLETED' });
        });
      });
    }, 2000);
  }
});

// Реализация стратегии "сначала сеть, затем кэш"
async function networkFirstStrategy(request) {
  try {
    // Пытаемся получить из сети
    const networkResponse = await fetch(request);

    // Кэшируем ответ для будущего использования
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());

    return networkResponse;
  } catch (error) {
    console.log('Сеть недоступна, используем кэш:', request.url);

    // Если сеть недоступна, пытаемся получить из кэша
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Если ни сеть, ни кэш не доступны, возвращаем заглушку
    // В реальном приложении здесь можно вернуть специальную страницу оффлайна
    // или показать какое-то сообщение
    return new Response('Сеть недоступна и данные не найдены в кэше', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Реализация стратегии "сначала кэш, затем сеть"
async function cacheFirstStrategy(request) {
  // Пытаемся получить из кэша
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Если нет в кэше, пытаемся получить из сети
    const networkResponse = await fetch(request);

    // Кэшируем ответ для будущего использования
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Ресурс не найден ни в кэше, ни в сети:', request.url);

    // Если ресурс не найден ни в кэше, ни в сети
    return new Response('Ресурс недоступен', {
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Обработка фоновых синхронизаций
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncData());
  }
});

// Функция синхронизации данных
async function syncData() {
  // Здесь будет логика синхронизации данных с сервером
  console.log('Выполняется фоновая синхронизация данных');

  // Отправляем сообщение о начале синхронизации
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_STARTED' });
    });
  });

  // Имитация запросов к серверу
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Отправляем сообщение о завершении синхронизации
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SYNC_COMPLETED' });
    });
  });
}

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.message,
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data;
  if (data && data.url) {
    // Открываем указанный URL при клике на уведомление
    event.waitUntil(
      clients.openWindow(data.url)
    );
  }
});