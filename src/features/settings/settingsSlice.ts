import { createSlice, PayloadAction, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { db } from '../../services/storage/db';
import { dbService } from '../../services/storage/dbService';

// Типы для настроек
export interface ThemeSettings {
  darkMode: boolean;
  reducedMotion: boolean;
  accentColor?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  weeklyReports: boolean;
}

export interface AppSettings {
  language: string;
  autoSave: boolean;
  dateFormat: string;
  timeFormat: string;
}

export interface SettingsState {
  theme: ThemeSettings;
  notifications: NotificationSettings;
  app: AppSettings;
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние - устанавливаем темную тему по умолчанию
const initialState: SettingsState = {
  theme: {
    darkMode: true, // Устанавливаем темную тему по умолчанию
    reducedMotion: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    accentColor: '#3730a3', // primary color by default
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReports: true,
  },
  app: {
    language: 'ru',
    autoSave: true,
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
  },
  isLoading: false,
  error: null,
};

// Применяем тему к документу при инициализации
if (typeof document !== 'undefined') {
  if (initialState.theme.darkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

// Новые действия для загрузки настроек с учетом демо-режима
export const fetchSettingsStart = createAction('settings/fetchSettingsStart');
export const fetchSettingsSuccess = createAction<Omit<SettingsState, 'isLoading' | 'error'>>('settings/fetchSettingsSuccess');
export const fetchSettingsError = createAction<string>('settings/fetchSettingsError');

// Асинхронные экшены для настроек
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      // Проверяем текущую сессию для определения режима
      const session = await dbService.getCurrentSession();
      const isDemo = session?.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      let settings;

      if (isDemo) {
        // В демо-режиме получаем демо-настройки
        settings = await db.settings
        .filter(setting => setting.demoData === true)
        .first();
      } else {
        // В обычном режиме получаем настройки текущего пользователя
        settings = await db.settings
        .filter(setting =>
          !setting.demoData &&
          (setting.userId === session?.userId || setting.id === '1')
        )
        .first();
      }

      if (!settings) {
        throw new Error('Настройки не найдены в IndexedDB');
      }

      return settings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при загрузке настроек из IndexedDB';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settings: Partial<SettingsState>, { rejectWithValue }) => {
    try {
      // Получаем текущую сессию
      const session = await dbService.getCurrentSession();
      const isDemo = session?.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      // Если меняется тема, сохраняем в localStorage
      if (settings.theme?.darkMode !== undefined) {
        localStorage.setItem('theme', settings.theme.darkMode ? 'dark' : 'light');
      }

      // Если это демо-режим, обновляем демо-настройки
      if (isDemo) {
        // В демо-режиме обновляем настройки только в localStorage
        localStorage.setItem('demo_settings', JSON.stringify({
          ...settings,
          demoData: true
        }));
      } else if (session) {
        // В обычном режиме обновляем настройки в БД
        const settingId = '1'; // Или можно использовать ID пользователя

        // Проверяем, существуют ли настройки
        const existingSettings = await db.settings.get(settingId);

        if (existingSettings) {
          // Обновляем существующие настройки
          await db.settings.update(settingId, {
            ...existingSettings,
            ...settings,
            userId: session.userId,
            demoData: false
          });
        } else {
          // Создаем новые настройки
          await db.settings.add({
            id: settingId,
            ...initialState,
            ...settings,
            userId: session.userId,
            demoData: false
          });
        }
      }

      return settings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при обновлении настроек. Попробуйте еще раз.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Создание среза
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Обновление темы
    setTheme: (state, action: PayloadAction<Partial<ThemeSettings>>) => {
      state.theme = { ...state.theme, ...action.payload };

      // Обновляем DOM в соответствии с темой
      if (action.payload.darkMode !== undefined) {
        if (action.payload.darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
      }
    },

    // Обновление настроек уведомлений
    setNotifications: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },

    // Обновление настроек приложения
    setAppSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.app = { ...state.app, ...action.payload };
    },

    // Сброс к начальным настройкам
    resetSettings: (state) => {
      state.theme = initialState.theme;
      state.notifications = initialState.notifications;
      state.app = initialState.app;

      // Обновляем DOM в соответствии с темой
      if (initialState.theme.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      localStorage.setItem('theme', initialState.theme.darkMode ? 'dark' : 'light');
    },
  },
  extraReducers: (builder) => {
    // Обработка новых экшенов для оптимизированной загрузки
    builder
    .addCase(fetchSettingsStart, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchSettingsSuccess, (state, action) => {
      state.isLoading = false;
      state.theme = action.payload.theme;
      state.notifications = action.payload.notifications;
      state.app = action.payload.app;

      // Обновляем DOM в соответствии с темой
      if (action.payload.theme.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })
    .addCase(fetchSettingsError, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })

    // Обработка загрузки настроек
    .addCase(fetchSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchSettings.fulfilled, (state, action: PayloadAction<Omit<SettingsState, 'isLoading' | 'error'>>) => {
      state.isLoading = false;
      state.theme = action.payload.theme;
      state.notifications = action.payload.notifications;
      state.app = action.payload.app;

      // Обновляем DOM в соответствии с темой
      if (action.payload.theme.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })
    .addCase(fetchSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Обработка обновления настроек
    .addCase(updateSettings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(updateSettings.fulfilled, (state, action: PayloadAction<Partial<SettingsState>>) => {
      state.isLoading = false;

      if (action.payload.theme) {
        state.theme = { ...state.theme, ...action.payload.theme };

        // Обновляем DOM в соответствии с темой
        if (action.payload.theme.darkMode !== undefined) {
          if (action.payload.theme.darkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }

      if (action.payload.notifications) {
        state.notifications = { ...state.notifications, ...action.payload.notifications };
      }

      if (action.payload.app) {
        state.app = { ...state.app, ...action.payload.app };
      }
    })
    .addCase(updateSettings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setTheme, setNotifications, setAppSettings, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer;