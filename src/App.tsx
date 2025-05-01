import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect, useState } from 'react';
import { useSettings } from './hooks/useSettings';
import { useOffline } from './hooks/useOffline';
import { useNotifications } from './hooks/useNotifications';
import SyncStatus from './components/common/SyncStatus';

/**
 * Корневой компонент приложения
 * Здесь инициализируем основные провайдеры и системы
 */
function App() {
  // Используем хук настроек
  const { theme, loadSettings } = useSettings();

  // Используем улучшенный хук для работы в оффлайн-режиме
  const {
    isOnline,
    isSyncing,
    syncError,
    hasPendingSync,
    registerBackgroundSync
  } = useOffline();

  // Используем хук для работы с уведомлениями
  const { requestNotificationPermission } = useNotifications();

  // Состояние для отображения оффлайн-уведомления
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Состояние для отображения ошибки синхронизации
  const [showSyncError, setShowSyncError] = useState(false);

  // Загружаем настройки при монтировании
  useEffect(() => {
    loadSettings();

    // Запрашиваем разрешение на браузерные уведомления при первом запуске
    const askForNotificationPermission = async () => {
      if (localStorage.getItem('notificationPermissionAsked') !== 'true') {
        await requestNotificationPermission();
        localStorage.setItem('notificationPermissionAsked', 'true');
      }
    };

    // Регистрируем background sync, если поддерживается
    const setupBackgroundSync = async () => {
      await registerBackgroundSync();
    };

    askForNotificationPermission();
    setupBackgroundSync();
  }, [loadSettings, requestNotificationPermission, registerBackgroundSync]);

  // Применяем тему к документу в зависимости от настроек
  useEffect(() => {
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme.darkMode]);

  // Отслеживаем статус подключения и показываем уведомление при изменении
  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
      // Скрываем уведомление через некоторое время
      const timer = setTimeout(() => {
        setShowOfflineAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      // При восстановлении соединения показываем уведомление
      if (showOfflineAlert) {
        setShowOfflineAlert(true);
        const timer = setTimeout(() => {
          setShowOfflineAlert(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, showOfflineAlert]);

  // Отслеживаем ошибки синхронизации
  useEffect(() => {
    if (syncError) {
      setShowSyncError(true);
      const timer = setTimeout(() => {
        setShowSyncError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncError]);

  return (
    <>
      {/* Уведомление о статусе подключения */}
      {showOfflineAlert && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ${
            isOnline
              ? 'bg-green-500 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          {isOnline ? 'Подключение восстановлено' : 'Вы находитесь в автономном режиме'}
        </div>
      )}

      {/* Уведомление об ошибке синхронизации */}
      {showSyncError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 py-2 px-4 rounded-lg shadow-lg transition-all duration-300 bg-red-500 text-white">
          Ошибка синхронизации. Некоторые изменения могут быть недоступны на сервере.
        </div>
      )}

      {/* Блок статуса синхронизации
          Показываем только если есть ожидающие синхронизации элементы или идет синхронизация */}
      {(hasPendingSync || isSyncing) && (
        <div className="fixed bottom-4 right-4 z-50">
          <SyncStatus showDetails={false} />
        </div>
      )}

      <RouterProvider router={router} />
    </>
  );
}

export default App;