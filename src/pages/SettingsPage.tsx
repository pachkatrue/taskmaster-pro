import React, { useEffect, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import SessionsManager from '../components/common/SessionsManager';

const SettingsPage: React.FC = () => {
  const {
    theme,
    notifications,
    app,
    isLoading: settingsLoading,
    error,
    loadSettings,
    saveSettings,
    updateTheme,
    updateNotifications,
    updateAppSettings,
  } = useSettings();

  // Используем хук авторизации для получения данных пользователя
  const { user } = useAuth();

  // Состояние формы профиля, инициализируем данными пользователя
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'app' | 'security' | 'sessions'>('profile');
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем настройки и данные пользователя
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await loadSettings();

      // Инициализируем форму профиля данными пользователя
      if (user) {
        setProfileForm({
          fullName: user.fullName || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
        });
      }

      setIsLoading(false);
    };

    initialize();
  }, [loadSettings, user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateNotifications({ [name]: checked });
  };

  const handleAppSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;

    if (name === 'darkMode' || name === 'reducedMotion') {
      updateTheme({ [name]: value });
    } else {
      updateAppSettings({ [name]: value });
    }
  };

  const handleSaveAllSettings = () => {
    saveSettings({ theme, notifications, app });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Настройки</h1>

      {/* Tabs */}
      <div className="mb-6">
        {(['profile', 'notifications', 'app', 'security', 'sessions'] as const).map((tab) => (
          <button
            key={tab}
            className={`mr-4 px-4 py-2 border-b-2 ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {{
              profile: 'Профиль',
              notifications: 'Уведомления',
              app: 'Приложение',
              security: 'Безопасность',
              sessions: 'Сессии',
            }[tab]}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div>
          <h2 className="text-xl font-medium mb-4">Профиль</h2>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
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

            {/* Правая колонка - форма */}
            <div className="lg:col-span-2">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="form-label">Полное имя</label>
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
                    <label htmlFor="email" className="form-label">Email</label>
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
                  <label htmlFor="phone" className="form-label">Телефон</label>
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
                  <label htmlFor="bio" className="form-label">О себе</label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="form-input"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="btn-primary">
                    Сохранить профиль
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-xl font-medium mb-4">Уведомления</h2>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={notifications.emailNotifications}
              onChange={handleNotificationChange}
            />
            <span className="ml-2">Email-уведомления</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              name="pushNotifications"
              checked={notifications.pushNotifications}
              onChange={handleNotificationChange}
            />
            <span className="ml-2">Push-уведомления</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              name="taskReminders"
              checked={notifications.taskReminders}
              onChange={handleNotificationChange}
            />
            <span className="ml-2">Напоминания о задачах</span>
          </label>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="weeklyReports"
              checked={notifications.weeklyReports}
              onChange={handleNotificationChange}
            />
            <span className="ml-2">Еженедельные отчеты</span>
          </label>
          <button onClick={handleSaveAllSettings} className="btn-primary">
            Сохранить настройки
          </button>
        </div>
      )}

      {/* App tab */}
      {activeTab === 'app' && (
        <div>
          <h2 className="text-xl font-medium mb-4">Настройки приложения</h2>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              name="darkMode"
              checked={theme.darkMode}
              onChange={handleAppSettingsChange}
            />
            <span className="ml-2">Темная тема</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="checkbox"
              name="reducedMotion"
              checked={theme.reducedMotion}
              onChange={handleAppSettingsChange}
            />
            <span className="ml-2">Уменьшенное движение</span>
          </label>
          <label className="block mb-2">
            Язык:
            <select
              name="language"
              value={app.language}
              onChange={handleAppSettingsChange}
              className="form-input mt-1"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="flex items-center mb-4">
            <input
              type="checkbox"
              name="autoSave"
              checked={app.autoSave}
              onChange={handleAppSettingsChange}
            />
            <span className="ml-2">Автосохранение</span>
          </label>
          <button onClick={handleSaveAllSettings} className="btn-primary">
            Сохранить настройки
          </button>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div>
          <h2 className="text-xl font-medium mb-4">Безопасность</h2>
          <p>Здесь могут быть формы для смены пароля и выхода из всех сессий.</p>
        </div>
      )}

      {/* Sessions tab */}
      {activeTab === 'sessions' && (
        <div>
          <h2 className="text-xl font-medium mb-4">Управление сессиями</h2>
          <SessionsManager />
        </div>
      )}

      {/* Загрузка и ошибки */}
      {(isLoading || settingsLoading) && <p className="text-sm text-gray-500 mt-4">Загрузка...</p>}
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default SettingsPage;
