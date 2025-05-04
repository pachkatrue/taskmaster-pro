import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/storage/dbService';
import AuthSessionManager from './AuthSessionManager';

interface DbInitializerProps {
  children: React.ReactNode;
}

/**
 * Компонент для инициализации базы данных
 * Обрабатывает различные ошибки и предоставляет пользователю информацию о проблеме
 */
const DbInitializer: React.FC<DbInitializerProps> = ({ children }) => {
  // Состояние инициализации
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<{
    message: string;
    details?: string;
    critical: boolean;
  } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Инициализируем базу данных при монтировании компонента
  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('Инициализация базы данных...');
        setIsRetrying(true);

        // Пробуем открыть базу данных
        const success = await dbService.initDatabase();

        if (success) {
          setIsInitialized(true);
          setError(null);
        } else {
          throw new Error('Не удалось инициализировать базу данных');
        }
      } catch (err) {
        console.error('Ошибка при инициализации базы данных:', err);

        // Определяем тип ошибки
        let errorMessage = 'Не удалось инициализировать базу данных.';
        let errorDetails = '';
        let isCritical = true;

        if (err instanceof DOMException) {
          if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            errorMessage = 'Превышен лимит локального хранилища.';
            errorDetails = 'Попробуйте очистить кэш браузера или освободить место на устройстве.';
            isCritical = true;
          } else if (err.name === 'SecurityError') {
            errorMessage = 'Доступ к хранилищу ограничен.';
            errorDetails = 'Возможно, вы используете приватный режим браузера. Попробуйте открыть приложение в обычном режиме.';
            isCritical = true;
          }
        }

        if (!window.indexedDB) {
          errorMessage = 'Ваш браузер не поддерживает IndexedDB.';
          errorDetails = 'Попробуйте обновить браузер или использовать другой, например Chrome, Firefox или Edge.';
          isCritical = true;
        }

        setError({
          message: errorMessage,
          details: errorDetails || (err instanceof Error ? err.message : String(err)),
          critical: isCritical
        });
      } finally {
        setIsRetrying(false);
      }
    };

    initDb();
  }, []);

  // Функция для повторной попытки инициализации
  const handleRetry = () => {
    setError(null);
    dbService.initDatabase()
    .then(success => {
      if (success) {
        setIsInitialized(true);
      } else {
        setError({
          message: 'Не удалось инициализировать базу данных при повторной попытке.',
          critical: true
        });
      }
    })
    .catch(err => {
      setError({
        message: 'Ошибка при повторной инициализации.',
        details: err instanceof Error ? err.message : String(err),
        critical: true
      });
    });
  };

  // Если произошла ошибка, показываем сообщение
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Ошибка при запуске приложения
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">{error.message}</p>

        {error.details && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 max-w-md">
            {error.details}
          </p>
        )}

        {!error.critical && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Вы можете продолжить с ограниченной функциональностью или попробовать снова.
            </p>
            <div className="flex space-x-3">
              <button
                className="btn-secondary"
                onClick={() => setIsInitialized(true)}
              >
                Продолжить с ограничениями
              </button>
              <button
                className="btn-primary"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Повторная попытка...' : 'Повторить попытку'}
              </button>
            </div>
          </div>
        )}

        {error.critical && (
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
            disabled={isRetrying}
          >
            {isRetrying ? 'Перезагрузка...' : 'Перезагрузить страницу'}
          </button>
        )}
      </div>
    );
  }

  // Если БД еще не инициализирована, показываем индикатор загрузки
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Инициализация приложения...</p>
      </div>
    );
  }

  // Если БД инициализирована, рендерим дочерние компоненты с менеджером сессий
  return (
    <AuthSessionManager>
      {children}
    </AuthSessionManager>
  );
};

export default DbInitializer;