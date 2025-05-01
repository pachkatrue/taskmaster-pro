import { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Страница регистрации
 */
const RegisterPage: React.FC = () => {
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Имитация отправки запроса
    setTimeout(() => {
      setIsLoading(false);
      // В реальном проекте здесь будет редирект после успешной регистрации
    }, 1500);
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="form-label">
            Полное имя
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-input"
            placeholder="Иван Иванов"
            value={registerForm.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            placeholder="email@example.com"
            value={registerForm.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Пароль
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            placeholder="••••••••"
            value={registerForm.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Подтверждение пароля
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input"
            placeholder="••••••••"
            value={registerForm.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={registerForm.agreeTerms}
            onChange={handleChange}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Я согласен с <Link to="#" className="text-primary hover:text-primary-dark">условиями использования</Link> и <Link to="#" className="text-primary hover:text-primary-dark">политикой конфиденциальности</Link>
          </label>
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