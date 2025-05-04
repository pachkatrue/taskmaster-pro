import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dbService } from '../../services/storage/dbService';

/**
 * Компонент для управления сессиями авторизации
 * Обновляет время активности сессий и выполняет попытку автоматического входа
 */
const AuthSessionManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkSession, isAuthenticated } = useAuth();

  // При загрузке компонента пытаемся выполнить автоматический вход
  useEffect(() => {
    const tryLogin = async () => {
      await checkSession();
    };

    tryLogin();
  }, [checkSession]);

  // Периодически обновляем время активности текущей сессии
  useEffect(() => {
    // Обновляем активность только для авторизованных пользователей
    if (!isAuthenticated) return;

    const updateActivity = async () => {
      const sessionId = localStorage.getItem('current_session_id');
      if (sessionId) {
        await dbService.updateSessionActivity(sessionId);
      }
    };

    // Обновляем активность каждые 5 минут
    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    // Также обновляем при взаимодействии пользователя с приложением
    const handleUserActivity = () => {
      updateActivity();
    };

    // Добавляем слушатели событий
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default AuthSessionManager;