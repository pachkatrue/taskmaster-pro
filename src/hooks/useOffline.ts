import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/storage/syncService';

/**
 * Расширенный хук для работы с оффлайн-режимом
 * Отслеживает состояние сети, управляет синхронизацией и предоставляет
 * дополнительные функции для работы в оффлайн-режиме
 */
export const useOffline = () => {
  // Состояние подключения к сети
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Состояние процесса синхронизации
  const [isSyncing, setIsSyncing] = useState(false);

  // Состояние статистики синхронизации
  const [syncStats, setSyncStats] = useState<{
    pendingCount: number;
    errorCount: number;
    oldestItemTimestamp: number | null;
  }>({
    pendingCount: 0,
    errorCount: 0,
    oldestItemTimestamp: null
  });

  // Состояние ошибки при синхронизации
  const [syncError, setSyncError] = useState<string | null>(null);

  // Обновление статистики синхронизации
  const updateSyncStats = useCallback(async () => {
    try {
      const stats = await syncService.getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Ошибка при получении статистики синхронизации:', error);
    }
  }, []);

  // Функция синхронизации
  const synchronize = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncError('Нет подключения к сети');
      return false;
    }

    try {
      setIsSyncing(true);
      setSyncError(null);

      // Запускаем синхронизацию
      const result = await syncService.synchronize();

      // Обновляем статистику после синхронизации
      await updateSyncStats();

      setIsSyncing(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка синхронизации';
      setSyncError(errorMessage);
      setIsSyncing(false);
      return false;
    }
  }, [updateSyncStats]);

  // Обработчики событий подключения к сети
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Попытка синхронизации при восстановлении соединения
      synchronize();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Обработчики событий синхронизации
    const handleSyncStarted = () => {
      setIsSyncing(true);
      setSyncError(null);
    };

    const handleSyncCompleted = (event: CustomEvent) => {
      setIsSyncing(false);
      updateSyncStats();

      // Если есть данные о результате синхронизации
      if (event.detail && !event.detail.success) {
        setSyncError('Синхронизация завершилась с ошибками');
      } else {
        setSyncError(null);
      }
    };

    // Регистрируем слушатели событий
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('syncStarted', handleSyncStarted);
    window.addEventListener('syncCompleted', handleSyncCompleted as EventListener);

    // Инициализируем начальные данные
    updateSyncStats();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('syncStarted', handleSyncStarted);
      window.removeEventListener('syncCompleted', handleSyncCompleted as EventListener);
    };
  }, [synchronize, updateSyncStats]);

  // Функция добавления операции в очередь синхронизации
  const addToSyncQueue = useCallback(async (
    operation: 'create' | 'update' | 'delete',
    entity: 'task' | 'project' | 'user' | 'settings',
    data: Record<string, unknown> // Заменяем any на более конкретный тип
  ) => {
    try {
      await syncService.addToSyncQueue(operation, entity, data);

      // Обновляем статистику после добавления
      await updateSyncStats();

      // Если онлайн, то сразу синхронизируем
      if (navigator.onLine && !isSyncing && syncStats.pendingCount > 0) {
        return synchronize();
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ошибка добавления в очередь синхронизации';
      setSyncError(errorMessage);
      return false;
    }
  }, [isSyncing, synchronize, updateSyncStats, syncStats.pendingCount]);

  // Функция для очистки ошибок синхронизации
  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  // Функция для регистрации background sync (если поддерживается)
  const registerBackgroundSync = useCallback(async () => {
    return await syncService.registerBackgroundSync();
  }, []);

  return {
    isOnline,
    isSyncing,
    syncStats,
    syncError,
    synchronize,
    addToSyncQueue,
    clearSyncError,
    registerBackgroundSync,
    hasPendingSync: syncStats.pendingCount > 0
  };
};

export default useOffline;