/**
 * Сервис для работы с авторизацией через Google
 * Предоставляет функциональность для OAuth аутентификации с использованием Google API
 */

import { User } from '../../features/auth/authSlice';

class GoogleAuthService {
  /**
   * Инициализация Google OAuth API
   * Загружает необходимые скрипты и настраивает конфигурацию клиента
   */
  init() {
    // В реальном приложении здесь будет загрузка скрипта Google OAuth API
    // и инициализация с clientId и другими параметрами
    console.log('Инициализация Google Auth API');
  }

  /**
   * Аутентификация через Google OAuth
   * Выполняет перенаправление на страницу Google для авторизации
   */
  signIn(): void {
    // Параметры для OAuth запроса
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/callback`,
      response_type: 'code',
      scope: 'email profile',
      prompt: 'select_account', // заставляет Google всегда показывать выбор аккаунта
      access_type: 'offline'
    });

    // Выполняем редирект на страницу Google для авторизации
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Обработка ответа от Google после авторизации
   * @param code Авторизационный код от Google
   * @returns Данные пользователя и токен доступа
   */
  async handleCallback(code: string): Promise<{ user: User; token: string }> {
    // В реальном приложении здесь будет обмен кода на токен через бэкенд
    // так как обмен должен происходить с секретом клиента
    console.log('Получен код авторизации:', code);

    // Для демонстрации возвращаем мок данных пользователя
    // В реальном приложении здесь будет запрос к бэкенду
    const user = {
      id: 'google-' + Math.random().toString(36).substring(2, 10),
      fullName: 'Пользователь Google',
      email: 'user@gmail.com',
      avatar: 'https://lh3.googleusercontent.com/photo.jpg',
    };

    const token = 'google-auth-token-' + Math.random().toString(36).substring(2, 15);

    return { user, token };
  }

  /**
   * Метод для отладки - имитирует успешную авторизацию без редиректа
   * @returns Мок данных пользователя и токена
   * @deprecated Использовать только для разработки
   */
  async mockSignIn(): Promise<{
    user: {
      id: string;
      fullName: string;
      email: string;
      avatar: string
    };
    token: string;
  }> {
    console.log('Запуск мок-процесса входа через Google (только для разработки)');

    // Имитация задержки сети
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = {
          id: 'google-' + Math.random().toString(36).substring(2, 10),
          fullName: 'Тестовый Пользователь Google',
          email: 'test@gmail.com',
          avatar: 'https://lh3.googleusercontent.com/mock-photo.jpg',
        };

        const token = 'mock-google-auth-token-' + Math.random().toString(36).substring(2, 15);

        resolve({ user, token });
      }, 1500);
    });
  }
}

// Создаем и экспортируем экземпляр сервиса для использования во всем приложении
export const googleAuthService = new GoogleAuthService();