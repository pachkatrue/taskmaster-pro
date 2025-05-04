import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiService } from '../../services/api/apiService';
import { dbService } from '../../services/storage/dbService';
import { db } from '../../services/storage/db';

// Типы для состояний авторизации
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const savedAuth = localStorage.getItem('auth');
const initialState: AuthState = savedAuth
  ? JSON.parse(savedAuth)
  : {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

// Экшен для автоматического входа при запуске приложения
export const tryAutoLogin = createAsyncThunk(
  'auth/tryAutoLogin',
  async (_, { rejectWithValue }) => {
    try {
      // Пытаемся получить данные пользователя из активной сессии
      const user = await dbService.tryAutoLogin();

      if (user) {
        return user;
      }

      return rejectWithValue('Нет активной сессии');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка автоматического входа';
      return rejectWithValue(errorMessage);
    }
  }
);

// Экшен для гостевого входа
export const loginAsGuest = createAsyncThunk(
  'auth/loginAsGuest',
  async (_, { rejectWithValue }) => {
    try {
      // Создаем гостевую сессию
      const guestSession = await dbService.createGuestSession();

      // Получаем данные гостевого пользователя
      const guestUser = await db.users.get(guestSession.userId);

      if (guestUser) {
        return guestUser;
      }

      return rejectWithValue('Не удалось создать гостевую сессию');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка гостевого входа';
      return rejectWithValue(errorMessage);
    }
  }
);

// Асинхронные экшены для авторизации
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // В реальном приложении здесь будет обращение к API
      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Моковый ответ с данными пользователя
      return {
        id: '1',
        fullName: 'Павел Михайлов',
        email: 'pmihajlov14@gmail.com',
        avatar: './user.jpg',
      };
    } catch (err) {
      // Явное преобразование типа ошибки
      const errorMessage = err instanceof Error ? err.message : 'Ошибка авторизации. Проверьте почту и пароль.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Асинхронный экшен для авторизации через Google
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Вызываем метод API для авторизации через Google
      const response = await apiService.loginWithGoogle();
      return response.user;
    } catch (err) {
      // Обрабатываем ошибку и преобразуем её в формат для отображения пользователю
      const errorMessage = err instanceof Error
        ? err.message
        : 'Ошибка авторизации через Google. Попробуйте позже.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Асинхронный экшен для авторизации через Facebook
export const loginWithFacebook = createAsyncThunk(
  'auth/loginWithFacebook',
  async (_, { rejectWithValue }) => {
    try {
      // Вызываем метод API для авторизации через Facebook
      const response = await apiService.loginWithFacebook();
      return response.user;
    } catch (err) {
      // Обрабатываем ошибку и преобразуем её в формат для отображения пользователю
      const errorMessage = err instanceof Error
        ? err.message
        : 'Ошибка авторизации через Facebook. Попробуйте позже.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { fullName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Моковый ответ с данными пользователя
      return {
        id: '1',
        fullName: userData.fullName,
        email: userData.email,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.fullName),
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации. Попробуйте позже.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Закрываем текущую сессию в IndexedDB
      await dbService.closeCurrentSession();

      // Имитация запроса к API
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка при выходе. Попробуйте еще раз.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Создание среза
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Дополнительные редьюсеры, если потребуются
    clearError: (state) => {
      state.error = null;
    },
    // Редьюсер для прямой обработки успешной авторизации через OAuth
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;

      // Сохраняем в localStorage для персистентности
      localStorage.setItem('auth', JSON.stringify({
        user: action.payload,
        isAuthenticated: true,
      }));
    },
  },
  extraReducers: (builder) => {
    // Обработка состояний логина
    builder
    .addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;

      // сохраняем в localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: action.payload,
        isAuthenticated: true,
      }));
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Обработчики для Google авторизации
    .addCase(loginWithGoogle.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(loginWithGoogle.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;

      // Сохраняем состояние авторизации в localStorage для персистентности
      localStorage.setItem('auth', JSON.stringify({
        user: action.payload,
        isAuthenticated: true,
      }));
    })
    .addCase(loginWithGoogle.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Обработчики для Facebook авторизации
    .addCase(loginWithFacebook.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(loginWithFacebook.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;

      // Сохраняем состояние авторизации в localStorage для персистентности
      localStorage.setItem('auth', JSON.stringify({
        user: action.payload,
        isAuthenticated: true,
      }));
    })
    .addCase(loginWithFacebook.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Обработка состояний регистрации
    .addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Обработка состояний выхода
    .addCase(logoutUser.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(logoutUser.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;

      localStorage.removeItem('auth');
    })
    .addCase(logoutUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    })

    // Обработчики для автоматического входа
    .addCase(tryAutoLogin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(tryAutoLogin.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(tryAutoLogin.rejected, (state) => {
      state.isLoading = false;
      // Не устанавливаем ошибку, так как это нормальное поведение
    })

    // Обработчики для гостевого входа
    .addCase(loginAsGuest.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(loginAsGuest.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;

      // Отмечаем, что это гостевой вход
      localStorage.setItem('guest_mode', 'true');
    })
    .addCase(loginAsGuest.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, loginSuccess } = authSlice.actions;

export default authSlice.reducer;