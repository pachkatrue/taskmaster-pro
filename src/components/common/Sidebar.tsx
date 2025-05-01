import { NavLink } from 'react-router-dom';
import { useEffect, useRef } from 'react';

// Интерфейс для пропсов
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Компонент бокового меню
 * Содержит основную навигацию по приложению
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  // Реф для определения клика вне меню на мобильных
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Эффект для закрытия меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Стили для активной ссылки
  const activeClassname =
    'text-white bg-primary-dark';
  const inactiveClassname =
    'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700';

  // Общий класс для пунктов меню
  const linkClassName =
    'flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150';

  return (
    <>
      {/* Затемнение фона при открытом мобильном меню */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Основная панель */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 z-30 flex-shrink-0 w-64 overflow-y-auto bg-white dark:bg-gray-800 lg:static lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Лого и название */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <NavLink to="/dashboard" className="text-xl font-bold text-gray-800 dark:text-gray-200">
            TaskMaster Pro
          </NavLink>

          {/* Кнопка закрытия на мобильных */}
          <button
            className="rounded-md lg:hidden focus:outline-none focus:shadow-outline-primary"
            onClick={onClose}
            aria-label="Закрыть меню"
          >
            <svg
              className="w-6 h-6 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Навигация */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <NavLink
              to="/dashboard"
              className={({isActive}) =>
                `${linkClassName} ${isActive ? activeClassname : inactiveClassname}`
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              <span>Дашборд</span>
            </NavLink>

            <NavLink
              to="/projects"
              className={({isActive}) =>
                `${linkClassName} ${isActive ? activeClassname : inactiveClassname}`
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
              <span>Проекты</span>
            </NavLink>

            <NavLink
              to="/tasks"
              className={({isActive}) =>
                `${linkClassName} ${isActive ? activeClassname : inactiveClassname}`
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>Задачи</span>
            </NavLink>

            <NavLink
              to="/analytics"
              className={({isActive}) =>
                `${linkClassName} ${isActive ? activeClassname : inactiveClassname}`
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              <span>Аналитика</span>
            </NavLink>

            <NavLink
              to="/tests"
              className={({ isActive }) =>
                `${linkClassName} ${isActive ? activeClassname : inactiveClassname}`
              }
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h3l1-1h6l1 1h3a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                />
              </svg>
              <span>Тесты</span>
            </NavLink>

            <div className="mt-6 border-t dark:border-gray-700 pt-6">
              <NavLink
                to="/settings"
                className={({isActive}) =>
                  `${linkClassName} ${isActive ? activeClassname : inactiveClassname}`
                }
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                <span>Настройки</span>
              </NavLink>

              <button
                className={`${linkClassName} ${inactiveClassname} w-full text-left mt-2`}
              >
                <svg
                  className="w-5 h-5 mr-3 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;