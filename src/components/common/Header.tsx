import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import SearchDropdown from './SearchDropdown';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { searchService, SearchResultItem } from '../../services/searchService';
import { useDebounce } from '../../hooks/useDebounce';

// Интерфейс для пропсов
interface HeaderProps {
  onMenuToggle: () => void;
}

/**
 * Компонент заголовка приложения
 * Содержит кнопку переключения бокового меню, поиск и профиль пользователя
 */
const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  // Используем хуки для получения данных из стора
  const { theme, toggleDarkMode } = useSettings();
  const { user } = useAuth();
  const { notifications, readAllNotifications, getUnreadCount } = useNotifications();
  const navigate = useNavigate();

  // Состояние для открытия/закрытия дропдаунов
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [totalResultsCount, setTotalResultsCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  // Дебаунсим поисковый запрос, чтобы не делать запросы при каждом нажатии клавиши
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Получаем количество непрочитанных уведомлений
  const unreadCount = getUnreadCount();

  // Выполняем поиск при изменении дебаунсированного запроса
  useEffect(() => {
    const performSearch = async () => {
      // Если запрос пустой, очищаем результаты
      if (!debouncedSearchQuery.trim()) {
        setSearchResults([]);
        setTotalResultsCount(0);
        return;
      }

      try {
        setIsSearching(true);
        const { items, totalCount } = await searchService.search(debouncedSearchQuery, 5);
        setSearchResults(items);
        setTotalResultsCount(totalCount);
      } catch (error) {
        console.error('Ошибка при выполнении поиска:', error);
        setSearchResults([]);
        setTotalResultsCount(0);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearchQuery]);

  // Обработчик ввода в поле поиска
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Показываем дропдаун с результатами, если есть текст
    if (value.trim()) {
      setIsSearchOpen(true);
    }
  };

  // Обработчик фокуса на поле поиска
  const handleSearchFocus = () => {
    // Показываем дропдаун только если есть текст
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  // Обработчик отправки формы поиска
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Если есть текст для поиска, перенаправляем на страницу с результатами
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Отметить все уведомления как прочитанные
  const handleMarkAllAsRead = () => {
    readAllNotifications();
  };

  // Данные пользователя для дропдауна профиля
  const userData = {
    name: user?.fullName || 'Павел Михайлов',
    email: user?.email || 'pmihajlov14@gmail.com',
    avatar: user?.avatar || './user.jpg'
  };

  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-md">
      <div className="container flex items-center justify-between h-full px-6 mx-auto">
        {/* Кнопка гамбургер-меню (на мобильных) */}
        <button
          className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none focus:shadow-outline-purple"
          onClick={onMenuToggle}
          aria-label="Меню"
        >
          <svg
            className="w-6 h-6 text-gray-600 dark:text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Поиск */}
        <div className="flex justify-center flex-1 lg:mr-32 relative">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mr-6 focus-within:text-primary">
            <div className="absolute inset-y-0 flex items-center pl-2">
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <input
              className="w-full pl-8 pr-2 py-2 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-600 dark:placeholder-gray-400 bg-gray-100 dark:bg-gray-700 border-none rounded-md focus:outline-none focus:shadow-outline-primary focus:ring-1 focus:ring-primary"
              type="text"
              placeholder="Поиск задач, проектов..."
              aria-label="Поиск"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchFocus}
            />

            {/* Индикатор загрузки поиска */}
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </form>

          {/* Выпадающий список результатов поиска */}
          <SearchDropdown
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            results={searchResults}
            query={searchQuery}
            totalCount={totalResultsCount}
            isLoading={isSearching}
          />
        </div>

        {/* Правая часть: уведомления, переключатель темы, профиль */}
        <ul className="flex items-center flex-shrink-0 space-x-6">
          {/* Переключатель темы */}
          <li className="flex">
            <button
              className="rounded-md focus:outline-none focus:shadow-outline-primary"
              onClick={toggleDarkMode}
              aria-label="Переключить тему"
            >
              {theme.darkMode ? (
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                </svg>
              )}
            </button>
          </li>

          {/* Уведомления */}
          <li className="relative">
            <button
              className="relative align-middle rounded-md focus:outline-none focus:shadow-outline-primary"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false); // Закрываем другой дропдаун
                setIsSearchOpen(false); // Закрываем поиск
              }}
              aria-label="Уведомления"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                ></path>
              </svg>
              {/* Точка-индикатор если есть непрочитанные уведомления */}
              {unreadCount > 0 && (
                <span
                  className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-red-500 border-2 border-white dark:border-gray-800 rounded-full"
                  aria-hidden="true"
                ></span>
              )}
            </button>

            {/* Выпадающий список уведомлений */}
            <NotificationDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </li>

          {/* Профиль */}
          <li className="relative">
            <button
              className="align-middle rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false); // Закрываем другой дропдаун
                setIsSearchOpen(false); // Закрываем поиск
              }}
              aria-label="Профиль"
            >
              <img
                className="object-cover w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-700"
                src={userData.avatar}
                alt={userData.name}
                aria-hidden="true"
              />
            </button>

            {/* Выпадающее меню профиля */}
            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              userData={userData}
            />
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;