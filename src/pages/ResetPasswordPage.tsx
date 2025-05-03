import { useState } from 'react';
import { Link } from 'react-router-dom';
import { isValidEmail, required } from '../utils/validations';

/**
 * Страница сброса пароля
 */
const ResetPasswordPage: React.FC = () => {
  // Состояние формы
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);

  // Валидация email
  const validateEmail = () => {
    if (!required(email)) {
      setError('Email обязателен');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Введите корректный email');
      return false;
    }
    setError('');
    return true;
  };

  // Обработчик изменения поля
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (isSubmitted) {
      validateEmail();
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // В реальном приложении здесь был бы запрос к API
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch {
      setError('Не удалось отправить инструкции. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Проверьте почту
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Если аккаунт с указанным email существует, мы отправили инструкции по сбросу пароля.
        </p>
        <Link to="/auth/login" className="btn-primary inline-block">
          Вернуться к входу
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Сброс пароля
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Введите email для получения инструкций по сбросу пароля
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            className={`form-input ${error ? 'border-red-500' : ''}`}
            placeholder="email@example.com"
            value={email}
            onChange={handleChange}
            disabled={isLoading}
            aria-invalid={!!error}
          />
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Отправка...
            </>
          ) : (
            'Сбросить пароль'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Вспомнили пароль?{' '}
            <Link to="/auth/login" className="text-primary hover:text-primary-dark font-medium">
              Вернуться к входу
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;