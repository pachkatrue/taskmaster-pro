import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { googleAuthService } from '../services/auth/googleAuthService';

/**
 * Компонент для обработки обратного вызова OAuth от провайдеров авторизации
 * Получает код авторизации из URL, обменивает на токен и сохраняет данные пользователя
 */
const OAuthCallbackPage: React.FC = () => {
  // Состояние для отслеживания процесса авторизации и ошибок
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Хуки для навигации и получения параметров URL
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем метод для успешной авторизации
  const { loginSuccess } = useAuth();

  useEffect(() => {
    // Функция для обработки кода авторизации
    const handleOAuthCallback = async () => {
      try {
        // Получаем параметры из URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        // const state = params.get('state');
        const error = params.get('error');

        // Если пришла ошибка от провайдера
        if (error) {
          console.error('Ошибка авторизации:', error);
          setError(`Ошибка авторизации: ${error}`);
          setIsProcessing(false);
          return;
        }

        // Если код отсутствует
        if (!code) {
          console.error('Код авторизации отсутствует');
          setError('Не удалось получить код авторизации');
          setIsProcessing(false);
          return;
        }

        // Определяем провайдера по state (если используется)
        // или по другой логике, например по URL
        // Для демонстрации используем Google

        // Обрабатываем код авторизации
        const result = await googleAuthService.handleCallback(code);

        // Сохраняем данные пользователя и токен
        await loginSuccess(result.user, result.token);

        // Перенаправляем на дашборд
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Ошибка при обработке обратного вызова OAuth:', err);
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка при авторизации');
        setIsProcessing(false);
      }
    };

    // Вызываем функцию обработки
    handleOAuthCallback();
  }, [location, navigate, loginSuccess]);

  // Компонент загрузки или ошибки
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        {isProcessing ? (
          <div className="text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Завершаем авторизацию...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Ошибка авторизации
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => navigate('/auth/login')}
              className="btn-primary w-full"
            >
              Вернуться на страницу входа
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;