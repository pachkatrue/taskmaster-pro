import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../services/storage/db';

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

// Асинхронные экшены для настроек
export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settings = await db.settings.get('1');

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
      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Если меняется тема, сохраняем в localStorage
      if (settings.theme?.darkMode !== undefined) {
        localStorage.setItem('theme', settings.theme.darkMode ? 'dark' : 'light');
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
    // Обработка загрузки настроек
    builder
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