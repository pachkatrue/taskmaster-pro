import React, { useEffect, useState } from 'react';
import { dbService } from '../../services/storage/dbService';
import { useAuth } from '../../hooks/useAuth';
import { AuthSession } from '../../services/storage/db';
import { db } from '../../services/storage/db';

/**
 * Компонент для отображения и управления активными сессиями пользователя
 */
const SessionsManager: React.FC = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Загружаем сессии при монтировании компонента
  useEffect(() => {
    const fetchSessions = async () => {
      if (user) {
        setLoading(true);
        try {
          const userSessions = await dbService.getUserSessions(user.id);
          setSessions(userSessions);

          // Получаем ID текущей сессии
          const sessionId = localStorage.getItem('current_session_id');
          setCurrentSessionId(sessionId);
        } catch (error) {
          console.error('Ошибка при получении сессий:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSessions();
  }, [user]);

  // Функция для завершения сессии
  const terminateSession = async (sessionId: string) => {
    try {
      // Если это текущая сессия, не разрешаем её завершить
      if (sessionId === currentSessionId) {
        alert('Невозможно завершить текущую сессию. Используйте кнопку "Выйти".');
        return;
      }

      // Удаляем сессию из базы данных
      await db.authSessions.delete(sessionId);

      // Обновляем список сессий
      setSessions(sessions.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Ошибка при завершении сессии:', error);
    }
  };

  // Функция для выхода из всех сессий
  const logoutAllSessions = async () => {
    try {
      // Удаляем все сессии пользователя
      if (user) {
        await db.authSessions
        .where('userId')
        .equals(user.id)
        .delete();
      }

      // Выходим из текущей сессии
      await logout();
    } catch (error) {
      console.error('Ошибка при выходе из всех сессий:', error);
    }
  };

  // Форматирование даты для отображения
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Получение названия устройства из User-Agent
  const getDeviceName = (userAgent: string | undefined) => {
    if (!userAgent) return 'Неизвестное устройство';

    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';

    return 'Другое устройство';
  };

  // Получение иконки для провайдера авторизации
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return '🔵';
      case 'facebook':
        return '🔷';
      case 'email':
        return '📧';
      case 'guest':
        return '👤';
      case 'demo':
        return '🎮';
      default:
        return '🔑';
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка сессий...</div>;
  }

  // Если это демо-режим, показываем соответствующее сообщение
  if (localStorage.getItem('demo_mode') === 'true') {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="p-3 mr-4 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <svg className="w-6 h-6 text-yellow-500 dark:text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Демо-режим активен
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          В демо-режиме вы не можете управлять сессиями. Для доступа к этой функции необходимо зарегистрироваться или войти в систему.
        </p>
        <div className="mt-4">
          <button
            onClick={() => logout()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v8a1 1 0 102 0V6zm-6 0a1 1 0 10-2 0v8a1 1 0 102 0V6z" clipRule="evenodd" />
            </svg>
            Выйти из демо-режима
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Активные сессии
      </h3>

      {sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          Нет активных сессий.
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`border rounded-md p-3 flex justify-between items-center ${
                session.id === currentSessionId
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center">
                  <span className="mr-2">{getProviderIcon(session.provider)}</span>
                  <span className="font-medium">
                    {getDeviceName(session.metadata?.deviceInfo)}
                    {session.id === currentSessionId && ' (Текущая сессия)'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Провайдер: {session.provider}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Последняя активность: {formatDate(session.lastActive)}
                </div>
                {session.expiresAt && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Истекает: {formatDate(session.expiresAt)}
                  </div>
                )}
              </div>

              {session.id !== currentSessionId && (
                <button
                  onClick={() => terminateSession(session.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Завершить
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={logoutAllSessions}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 3a1 1 0 10-2 0v8a1 1 0 102 0V6zm-6 0a1 1 0 10-2 0v8a1 1 0 102 0V6z" clipRule="evenodd" />
          </svg>
          Выйти из всех сессий
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Выход из системы завершит все активные сессии. Если вы хотите завершить только одну сессию, используйте кнопку "Завершить" рядом с ней.</p>
      </div>
    </div>
  );
};

export default SessionsManager;