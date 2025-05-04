import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

/**
 * Компонент уведомления о демо-режиме
 */
const DemoNotification = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Сбрасываем состояние при изменении демо-режима
    const handleStorageChange = () => {
      if (localStorage.getItem('demo_mode') === 'true') {
        setIsDismissed(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isDismissed || localStorage.getItem('demo_mode') !== 'true') {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">
            Вы находитесь в демо-режиме. Все изменения будут доступны только в этой сессии.
            <a href="/auth/register" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
              Зарегистрируйтесь
            </a> для сохранения данных.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={() => setIsDismissed(true)}
              className="inline-flex bg-yellow-100 p-1.5 text-yellow-500 hover:bg-yellow-200 rounded-md"
            >
              <span className="sr-only">Закрыть</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Основной макет для авторизованных пользователей
 * Содержит боковую панель, заголовок и контент
 */
const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation(); // получаем текущий путь

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Боковая панель */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 w-full">
        <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        {/* Контент */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Уведомление о демо-режиме */}
          <DemoNotification />

          {/* Указываем key для принудительного размонтирования компонентов при смене пути */}
          <div key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;