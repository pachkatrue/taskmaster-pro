/**
 * Регистрация Service Worker для приложения
 */

// Проверяем поддержку Service Worker
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

/**
 * Регистрация Service Worker
 */
export const registerServiceWorker = () => {
  if (isServiceWorkerSupported()) {
    window.addEventListener('load', () => {
      // Используем window.location.origin вместо process.env
      const swUrl = `${window.location.origin}/service-worker.js`;

      navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker зарегистрирован успешно:', registration);

        // Обработка обновлений
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            return;
          }

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Если есть действующий контроллер, новый SW установлен и готов взять управление
                console.log('Новая версия приложения доступна, перезагрузите страницу для обновления');

                // Можно показать уведомление пользователю о доступности обновления
                const event = new CustomEvent('swUpdate', { detail: registration });
                window.dispatchEvent(event);
              } else {
                // Первая установка Service Worker
                console.log('Приложение сохранено для работы в оффлайн режиме');
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('Ошибка при регистрации Service Worker:', error);
      });

      // Регистрация обработчика сообщений от Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_STARTED') {
          console.log('Получено сообщение от Service Worker: Начало синхронизации');
          // Здесь можно показать индикатор синхронизации в интерфейсе
        }

        if (event.data && event.data.type === 'SYNC_COMPLETED') {
          console.log('Получено сообщение от Service Worker: Синхронизация завершена');
          // Здесь можно скрыть индикатор синхронизации в интерфейсе
        }
      });
    });
  }
};

/**
 * Отправить сообщение Service Worker о необходимости синхронизации
 */
export const requestSync = () => {
  if (isServiceWorkerSupported() && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SYNC_REQUIRED'
    });
  }
};

/**
 * Запрос разрешения на отправку уведомлений
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Этот браузер не поддерживает уведомления');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Отписка от Service Worker
 */
export const unregisterServiceWorker = async () => {
  if (isServiceWorkerSupported()) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
    console.log('Service Worker успешно удален');
    return true;
  }
  return false;
};