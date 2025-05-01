import { Middleware } from '@reduxjs/toolkit';
import { db } from '../../services/storage/db';
import {
  setTheme,
  setNotifications,
  setAppSettings,
  updateSettings,
  resetSettings,
} from './settingsSlice';

export const settingsPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  // Безопасная проверка типа
  if (
    typeof action === 'object' &&
    action !== null &&
    'type' in action &&
    typeof action.type === 'string'
  ) {
    const typesToPersist = [
      setTheme.type,
      setNotifications.type,
      setAppSettings.type,
      updateSettings.fulfilled.type,
      resetSettings.type,
    ];

    if (typesToPersist.includes(action.type)) {
      const state = store.getState().settings;

      db.settings
      .put({
        id: '1',
        theme: state.theme,
        notifications: state.notifications,
        app: state.app,
      })
      .catch((error) => {
        console.error('[Dexie] Не удалось сохранить настройки:', error);
      });
    }
  }

  return result;
};
