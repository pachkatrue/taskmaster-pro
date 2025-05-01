import { Link } from 'react-router-dom';

/**
 * Страница 404
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Страница не найдена
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Похоже, вы пытаетесь получить доступ к странице, которая была удалена или никогда не существовала.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;