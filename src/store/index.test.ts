import { describe, expect, test } from 'vitest';
import { store } from './index';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';
import projectsReducer from '../features/projects/projectsSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import notificationsReducer from '../services/notifications/notificationService';

describe('Redux Store', () => {
  // Проверка, что хранилище содержит все нужные редьюсеры
  test('должен содержать все ключи редьюсеров', () => {
    const state = store.getState();

    expect(state).toHaveProperty('auth');         // Авторизация
    expect(state).toHaveProperty('tasks');        // Задачи
    expect(state).toHaveProperty('projects');     // Проекты
    expect(state).toHaveProperty('settings');     // Настройки
    expect(state).toHaveProperty('notifications');// Уведомления
  });

  // Проверка, что редьюсеры настроены корректно и возвращают начальное состояние
  test('должен использовать корректные редьюсеры', () => {
    const state = store.getState();

    expect(state.auth).toEqual(authReducer(undefined, { type: '@@INIT' }));
    expect(state.tasks).toEqual(tasksReducer(undefined, { type: '@@INIT' }));
    expect(state.projects).toEqual(projectsReducer(undefined, { type: '@@INIT' }));
    expect(state.settings).toEqual(settingsReducer(undefined, { type: '@@INIT' }));
    expect(state.notifications).toEqual(notificationsReducer(undefined, { type: '@@INIT' }));
  });
});
