import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchSettings,
  updateSettings,
  setTheme,
  setNotifications,
  setAppSettings,
  resetSettings,
  ThemeSettings,
  NotificationSettings,
  AppSettings, SettingsState
} from '../features/settings/settingsSlice';

/**
 * Хук для работы с настройками
 * Предоставляет интерфейс для управления настройками приложения
 */
export const useSettings = () => {
  const dispatch = useAppDispatch();
  const { theme, notifications, app, isLoading, error } = useAppSelector(state => state.settings);

  // Загрузка настроек
  const loadSettings = useCallback(
    () => {
      return dispatch(fetchSettings());
    },
    [dispatch]
  );

  // Обновление всех настроек
  const saveSettings = useCallback(
    (settings: Partial<SettingsState>) => {
      return dispatch(updateSettings(settings));
    },
    [dispatch]
  );

  // Обновление настроек темы
  const updateTheme = useCallback(
    (themeSettings: Partial<ThemeSettings>) => {
      return dispatch(setTheme(themeSettings));
    },
    [dispatch]
  );

  // Обновление настроек уведомлений
  const updateNotifications = useCallback(
    (notificationSettings: Partial<NotificationSettings>) => {
      return dispatch(setNotifications(notificationSettings));
    },
    [dispatch]
  );

  // Обновление настроек приложения
  const updateAppSettings = useCallback(
    (appSettings: Partial<AppSettings>) => {
      return dispatch(setAppSettings(appSettings));
    },
    [dispatch]
  );

  // Сброс настроек
  const resetAllSettings = useCallback(
    () => {
      return dispatch(resetSettings());
    },
    [dispatch]
  );

  // Переключение темной темы
  const toggleDarkMode = useCallback(
    () => {
      return dispatch(setTheme({ darkMode: !theme.darkMode }));
    },
    [dispatch, theme.darkMode]
  );

  return {
    theme,
    notifications,
    app,
    isLoading,
    error,
    loadSettings,
    saveSettings,
    updateTheme,
    updateNotifications,
    updateAppSettings,
    resetAllSettings,
    toggleDarkMode
  };
};
