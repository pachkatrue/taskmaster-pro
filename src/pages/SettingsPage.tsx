import { useState } from 'react';

/**
 * Страница настроек пользователя и приложения
 */
const SettingsPage: React.FC = () => {
  // Состояния для форм
  const [profileForm, setProfileForm] = useState({
    fullName: 'Павел Михайлов',
    email: 'pmihajlov14@gmail.com',
    phone: '+7 (968) 106-03-49',
    bio: 'Senior Frontend Developer',
    avatar: './user.jpg',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReports: true,
  });

  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    reducedMotion: false,
    language: 'ru',
    autoSave: true,
  });

  // Обработчики изменений
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleAppSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;

    setAppSettings(prev => ({ ...prev, [name]: value }));
  };

  // Вкладки настроек
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'app' | 'security'>('profile');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Настройки
      </h1>

      {/* Вкладки настроек */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'profile'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Профиль
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'notifications'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              Уведомления
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'app'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('app')}
            >
              Приложение
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'security'
                  ? 'text-primary border-primary'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Безопасность
            </button>
          </li>
        </ul>
      </div>

      {/* Содержимое вкладок */}
      <div className="card">
        {/* Профиль */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Профиль пользователя
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Левая колонка - аватар */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img
                    src={profileForm.avatar}
                    alt="Аватар пользователя"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
                  />
                  <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Рекомендуемый размер: 200x200px
                </p>
                <button className="text-primary hover:text-primary-dark text-sm font-medium">
                  Удалить фото
                </button>
              </div>

              {/* Правая колонка - форма профиля */}
              <div className="lg:col-span-2">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="form-label">
                        Полное имя
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        className="form-input"
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
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
                        value={profileForm.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="form-label">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-input"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="form-label">
                      О себе
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="form-input"
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                    ></textarea>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Сохранить изменения
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Уведомления */}
        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Настройки уведомлений
            </h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Основные уведомления
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email-уведомления
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Получать уведомления по электронной почте
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      className="sr-only peer"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Push-уведомления
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Получать push-уведомления в браузере
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      className="sr-only peer"
                      checked={notificationSettings.pushNotifications}
                      onChange={handleNotificationChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Типы уведомлений
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Напоминания о задачах
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Напоминания о приближающихся сроках задач
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="taskReminders"
                      className="sr-only peer"
                      checked={notificationSettings.taskReminders}
                      onChange={handleNotificationChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Еженедельные отчеты
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Получать еженедельные отчеты о прогрессе
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="weeklyReports"
                      className="sr-only peer"
                      checked={notificationSettings.weeklyReports}
                      onChange={handleNotificationChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary">
                  Сохранить настройки
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Настройки приложения */}
        {activeTab === 'app' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Настройки приложения
            </h2>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Интерфейс
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Темная тема
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Включить темный режим интерфейса
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="darkMode"
                      className="sr-only peer"
                      checked={appSettings.darkMode}
                      onChange={handleAppSettingsChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Уменьшенное движение
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Уменьшить или отключить анимации
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="reducedMotion"
                      className="sr-only peer"
                      checked={appSettings.reducedMotion}
                      onChange={handleAppSettingsChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Язык интерфейса
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Выберите язык интерфейса приложения
                    </p>
                  </div>
                  <select
                    name="language"
                    className="form-input"
                    value={appSettings.language}
                    onChange={handleAppSettingsChange}
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  Функциональность
                </h3>
                <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Автосохранение
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Автоматически сохранять изменения
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoSave"
                      className="sr-only peer"
                      checked={appSettings.autoSave}
                      onChange={handleAppSettingsChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary">
                  Сохранить настройки
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Безопасность */}
        {activeTab === 'security' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Безопасность
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  Изменение пароля
                </h3>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="form-label">
                      Текущий пароль
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="form-label">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="form-input"
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
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary">
                      Изменить пароль
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                  Сеансы
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Это список устройств, которые в данный момент имеют доступ к вашему аккаунту
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Macbook Pro (Текущее устройство)
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Москва, Россия · 30 апреля 2025, 14:32
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Активно
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-8 h-8 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          iPhone
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Москва, Россия · 29 апреля 2025, 10:15
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
                      Выйти
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
                    Выйти на всех устройствах
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-4">
                  Опасная зона
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Удаление аккаунта приведет к необратимому удалению всех ваших данных и доступов
                </p>
                <button className="btn-danger">
                  Удалить аккаунт
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;