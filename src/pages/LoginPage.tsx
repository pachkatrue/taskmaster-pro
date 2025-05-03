import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isValidEmail, required } from '../utils/validations';

/**
 * Страница авторизации с расширенной валидацией форм
 * и улучшенным UX
 */
const LoginPage: React.FC = () => {
  // Состояние формы
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Состояние валидации и ошибок
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Получаем инструменты для навигации и авторизации
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error: authError, clearAuthError } = useAuth();

  // Определяем, куда редиректить после успешного входа
  const from = location.state?.from?.pathname || '/dashboard';

  // Валидация отдельного поля
  const validateField = useCallback((fieldName: string, value: string | boolean): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'email':
        if (!required(value)) {
          newErrors.email = 'Email обязателен';
          isValid = false;
        } else if (!isValidEmail(value as string)) {
          newErrors.email = 'Введите корректный email';
          isValid = false;
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!required(value)) {
          newErrors.password = 'Пароль обязателен';
          isValid = false;
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  }, [errors]);

  // Валидация всей формы
  const validateForm = useCallback((): boolean => {
    const emailValid = validateField('email', loginForm.email);
    const passwordValid = validateField('password', loginForm.password);

    return emailValid && passwordValid;
  }, [validateField, loginForm.email, loginForm.password]);

  // Очищаем ошибки авторизации при размонтировании компонента
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  // Валидируем поля при изменении, если форма уже была отправлена
  useEffect(() => {
    if (formSubmitted) {
      validateForm();
    }
  }, [loginForm, formSubmitted, validateForm]);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Если есть ошибка в этом поле и форма уже была отправлена, делаем валидацию
    if (errors[name] && formSubmitted) {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Проверяем валидность формы
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Вызываем действие входа
      await login(loginForm.email, loginForm.password);
      // Редиректим на предыдущую страницу или дашборд
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Ошибка входа:', error);
      // Ошибки обрабатываются в authSlice
    } finally {
      setIsLoading(false);
    }
  };

  // Демо-вход
  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await login('demo@taskmaster.pro', 'demo1234');
      navigate('/dashboard');
    } catch (error) {
      console.error('Ошибка входа как демо:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Вход в систему
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Введите свои данные для входа в TaskMaster Pro
        </p>
      </div>

      {/* Отображение ошибки авторизации */}
      {authError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {authError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-input ${errors.email ? 'border-red-500' : ''}`}
            placeholder="email@example.com"
            value={loginForm.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <Link to="/auth/reset-password" className="text-sm text-primary hover:text-primary-dark">
              Забыли пароль?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-input ${errors.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            value={loginForm.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={loginForm.rememberMe}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Запомнить меня
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Вход...
            </>
          ) : (
            'Войти'
          )}
        </button>

        <button
          type="button"
          onClick={handleDemoLogin}
          className="btn-secondary w-full"
          disabled={isLoading}
        >
          Войти как демо-пользователь
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Еще нет аккаунта?{' '}
            <Link to="/auth/register" className="text-primary hover:text-primary-dark font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <div className="relative flex items-center justify-center mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Или продолжить с
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center py-2 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"/>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"/>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"/>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center py-2 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z"/>
            </svg>
            Facebook
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;