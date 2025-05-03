import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  isValidEmail,
  minLength,
  required,
  isStrongPassword,
  passwordsMatch
} from '../utils/validations';

/**
 * Страница регистрации с расширенной валидацией форм
 * и улучшенным UX
 */
const RegisterPage: React.FC = () => {
  // Состояние формы
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // Состояние валидации и ошибок
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0, // От 0 до 4
    feedback: ''
  });

  // Получаем инструменты для навигации и авторизации
  const navigate = useNavigate();
  const { register, error: authError, clearAuthError } = useAuth();

  // Валидация отдельного поля
  const validateField = useCallback((fieldName: string, value: string | boolean): boolean => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'fullName':
        if (!required(value)) {
          newErrors.fullName = 'Имя обязательно';
          isValid = false;
        } else if (!minLength(value as string, 2)) {
          newErrors.fullName = 'Имя должно содержать минимум 2 символа';
          isValid = false;
        } else {
          delete newErrors.fullName;
        }
        break;
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
        } else if (!isStrongPassword(value as string)) {
          newErrors.password = 'Пароль должен содержать минимум 8 символов, включая цифру и спецсимвол';
          isValid = false;
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!required(value)) {
          newErrors.confirmPassword = 'Подтверждение пароля обязательно';
          isValid = false;
        } else if (!passwordsMatch(registerForm.password, value as string)) {
          newErrors.confirmPassword = 'Пароли не совпадают';
          isValid = false;
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'agreeTerms':
        if (!value) {
          newErrors.agreeTerms = 'Вы должны принять условия использования';
          isValid = false;
        } else {
          delete newErrors.agreeTerms;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return isValid;
  }, [errors, registerForm.password]);

  // Валидация всей формы
  const validateForm = useCallback((): boolean => {
    const nameValid = validateField('fullName', registerForm.fullName);
    const emailValid = validateField('email', registerForm.email);
    const passwordValid = validateField('password', registerForm.password);
    const confirmValid = validateField('confirmPassword', registerForm.confirmPassword);
    const termsValid = validateField('agreeTerms', registerForm.agreeTerms);

    return nameValid && emailValid && passwordValid && confirmValid && termsValid;
  }, [
    validateField,
    registerForm.fullName,
    registerForm.email,
    registerForm.password,
    registerForm.confirmPassword,
    registerForm.agreeTerms
  ]);

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
  }, [formSubmitted, validateForm]);

  // Проверяем силу пароля при его изменении
  useEffect(() => {
    if (registerForm.password) {
      evaluatePasswordStrength(registerForm.password);
    }
  }, [registerForm.password]);

  // Оценка силы пароля
  const evaluatePasswordStrength = (password: string) => {
    // Базовая оценка силы пароля
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Обратная связь на основе оценки
    if (score === 0) feedback = 'Очень слабый пароль';
    else if (score === 1) feedback = 'Слабый пароль';
    else if (score === 2) feedback = 'Средний пароль';
    else if (score === 3) feedback = 'Хороший пароль';
    else feedback = 'Надежный пароль';

    setPasswordStrength({ score, feedback });
  };

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm(prev => ({
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
      // Вызываем действие регистрации
      await register(
        registerForm.fullName,
        registerForm.email,
        registerForm.password
      );
      // Редиректим на дашборд
      navigate('/dashboard');
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      // Ошибки обрабатываются в authSlice
    } finally {
      setIsLoading(false);
    }
  };

  // Компонент индикатора силы пароля
  const PasswordStrengthIndicator = () => {
    if (!registerForm.password) return null;

    const scoreColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    const scoreWidth = ['w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full'];

    return (
      <div className="mt-1">
        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${scoreColors[passwordStrength.score]} transition-all duration-300 ease-in-out ${scoreWidth[passwordStrength.score]}`}
          />
        </div>
        <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
          {passwordStrength.feedback}
        </p>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Создание аккаунта
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Заполните форму для регистрации в TaskMaster Pro
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
          <label htmlFor="fullName" className="form-label">
            Полное имя
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
            placeholder="Иван Иванов"
            value={registerForm.fullName}
            onChange={handleChange}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>

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
            value={registerForm.email}
            onChange={handleChange}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-input ${errors.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            value={registerForm.password}
            onChange={handleChange}
            aria-invalid={!!errors.password}
          />
          <PasswordStrengthIndicator />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Подтверждение пароля
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            value={registerForm.confirmPassword}
            onChange={handleChange}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={registerForm.agreeTerms}
              onChange={handleChange}
              className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              aria-invalid={!!errors.agreeTerms}
            />
          </div>
          <div className="ml-2">
            <label htmlFor="agreeTerms" className="text-sm text-gray-700 dark:text-gray-300">
              Я согласен с <Link to="#" className="text-primary hover:text-primary-dark">условиями использования</Link> и <Link to="#" className="text-primary hover:text-primary-dark">политикой конфиденциальности</Link>
            </label>
            {errors.agreeTerms && (
              <p className="text-sm text-red-500">{errors.agreeTerms}</p>
            )}
          </div>
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
              Регистрация...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Уже есть аккаунт?{' '}
            <Link to="/auth/login" className="text-primary hover:text-primary-dark font-medium">
              Войти
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;