import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

// Типы для состояний авторизации
export interface User {
  id: string;
  fullName: string;
  email: string;
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
    });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;