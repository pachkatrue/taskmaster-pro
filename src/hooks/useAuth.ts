import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginUser,
  registerUser,
  logoutUser,
  loginWithFacebook,
  clearError,
  User
} from '../features/auth/authSlice';

/**
 * Хук для работы с авторизацией
 * Предоставляет интерфейс для входа, регистрации и выхода из системы,
 * включая методы авторизации через социальные сети
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Функция входа в систему через email/пароль
  const login = useCallback(
    (email: string, password: string) => {
      return dispatch(loginUser({ email, password }));
    },
    [dispatch]
  );

  // Функция регистрации
  const register = useCallback(
    (fullName: string, email: string, password: string) => {
      return dispatch(registerUser({ fullName, email, password }));
    },
    [dispatch]
  );

  // Функция входа через Google
  const loginWithGoogleAuth = useCallback(
    () => {
      // Вместо вызова асинхронного экшена используем прямую инициацию OAuth потока
      // через сервис, который выполнит редирект на страницу Google
      import('../services/auth/googleAuthService').then(module => {
        const { googleAuthService } = module;
        googleAuthService.signIn();
      });
      // Не возвращаем диспатч, так как происходит редирект
    },
    []
  );

  // Функция входа через Facebook
  const loginWithFacebookAuth = useCallback(
    () => {
      return dispatch(loginWithFacebook());
    },
    [dispatch]
  );

  // Функция обработки успешной авторизации через OAuth
  const loginSuccess = useCallback(
    (userData: User, token: string) => {
      // Здесь мы вручную устанавливаем состояние аутентификации
      // без использования асинхронного экшена

      // Сохраняем в localStorage
      localStorage.setItem('auth', JSON.stringify({
        user: userData,
        isAuthenticated: true,
      }));

      // Сохраняем токен
      localStorage.setItem('auth_token', token);

      // Обновляем состояние в Redux
      dispatch({
        type: 'auth/loginSuccess',
        payload: userData
      });
    },
    [dispatch]
  );

  // Функция выхода из системы
  const logout = useCallback(
    () => {
      return dispatch(logoutUser());
    },
    [dispatch]
  );

  // Функция очистки ошибок
  const clearAuthError = useCallback(
    () => {
      dispatch(clearError());
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loginWithGoogleAuth,
    loginWithFacebookAuth,
    loginSuccess,
    clearAuthError
  };
};