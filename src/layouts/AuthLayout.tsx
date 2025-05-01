import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';

/**
 * Макет для страниц авторизации
 * Простой и минималистичный дизайн
 */
const AuthLayout = () => {
  // Случайный фоновый градиент
  const [gradient, setGradient] = useState('');

  // Генерируем случайный градиент при монтировании
  useEffect(() => {
    const gradients = [
      'from-blue-600 to-violet-600',
      'from-purple-600 to-pink-600',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-600 to-purple-600',
    ];

    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    setGradient(randomGradient);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Левая часть - градиентный фон с иллюстрацией */}
      <div className={`hidden lg:flex lg:w-1/2 bg-gradient-to-r ${gradient} items-center justify-center`}>
        <div className="max-w-md text-center text-white p-6">
          <h1 className="text-4xl font-bold mb-4">TaskMaster Pro</h1>
          <p className="text-xl">
            Продвинутое приложение для управления задачами и проектами
          </p>
        </div>
      </div>

      {/* Правая часть - форма авторизации */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;