import React, { useState, useEffect } from 'react';
import { syncService } from '../../services/storage/syncService';

interface SyncStatusProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * Компонент для отображения статуса синхронизации данных
 * Показывает количество элементов в очереди и статус текущей синхронизации
 */
const SyncStatus: React.FC<SyncStatusProps> = ({ className = '', showDetails = false }) => {
  // Состояние синхронизации
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState<{
    pendingCount: number;
    errorCount: number;
    oldestItemTimestamp: number | null;
  }>({
    pendingCount: 0,
    errorCount: 0,
    oldestItemTimestamp: null
  });

  // Обработчик для событий синхронизации
  useEffect(() => {
    // Обработчики событий синхронизации
    const handleSyncStarted = () => {
      setIsSyncing(true);
    };

    const handleSyncCompleted = () => {
      setIsSyncing(false);
      // Обновляем статистику после синхронизации
      updateSyncStats();
    };

    // Регистрируем слушатели событий
    window.addEventListener('syncStarted', handleSyncStarted);
    window.addEventListener('syncCompleted', handleSyncCompleted as EventListener);

    // Обновляем статистику при монтировании
    updateSyncStats();

    // Устанавливаем интервал для периодического обновления статистики
    const interval = setInterval(updateSyncStats, 30000); // Каждые 30 секунд

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('syncStarted', handleSyncStarted);
      window.removeEventListener('syncCompleted', handleSyncCompleted as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Функция для обновления статистики синхронизации
  const updateSyncStats = async () => {
    try {
      const stats = await syncService.getSyncStats();
      setSyncStats(stats);
    } catch (error) {
      console.error('Ошибка при получении статистики синхронизации:', error);
    }
  };

  // Запуск ручной синхронизации
  const handleManualSync = async () => {
    if (isSyncing) return; // Не запускаем, если уже идет синхронизация

    if (!syncService.isOnline()) {
      alert('Нет подключения к сети. Синхронизация невозможна.');
      return;
    }

    try {
      setIsSyncing(true);
      await syncService.synchronize();
      // Статус обновится через события
    } catch (error) {
      console.error('Ошибка при ручной синхронизации:', error);
      setIsSyncing(false);
    }
  };

  // Форматирование даты для отображения
  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return 'Нет данных';

    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Если нет ожидающих элементов и не идет синхронизация, компонент можно не показывать
  if (syncStats.pendingCount === 0 && !isSyncing && !showDetails) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isSyncing ? (
            <svg className="animate-spin h-5 w-5 text-primary mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isSyncing ? 'Синхронизация...' :
              syncStats.pendingCount > 0 ? `Ожидает синхронизации: ${syncStats.pendingCount}` :
                'Синхронизировано'}
          </span>
        </div>

        {/* Кнопка ручной синхронизации */}
        {syncStats.pendingCount > 0 && !isSyncing && (
          <button
            onClick={handleManualSync}
            className="ml-2 text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            disabled={!syncService.isOnline()}
          >
            Синхронизировать
          </button>
        )}
      </div>

      {/* Дополнительная информация, если нужно показывать детали */}
      {showDetails && (
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-1">
            <div>Статус:</div>
            <div className={isSyncing ? 'text-blue-500' : syncStats.pendingCount > 0 ? 'text-yellow-500' : 'text-green-500'}>
              {isSyncing ? 'Синхронизация' : syncStats.pendingCount > 0 ? 'Ожидание' : 'Завершено'}
            </div>

            <div>Подключение:</div>
            <div className={syncService.isOnline() ? 'text-green-500' : 'text-red-500'}>
              {syncService.isOnline() ? 'Онлайн' : 'Оффлайн'}
            </div>

            <div>Ожидает:</div>
            <div>{syncStats.pendingCount}</div>

            <div>С ошибками:</div>
            <div className={syncStats.errorCount > 0 ? 'text-red-500' : 'text-gray-500'}>
              {syncStats.errorCount}
            </div>

            {syncStats.oldestItemTimestamp && (
              <>
                <div>Самый старый:</div>
                <div>{formatTimestamp(syncStats.oldestItemTimestamp)}</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncStatus;