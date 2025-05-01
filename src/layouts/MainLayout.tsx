import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

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

        {/* Указываем key для принудительного размонтирования компонентов при смене пути */}
        <main key={location.pathname} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
