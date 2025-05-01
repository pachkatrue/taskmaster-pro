import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loginUser,
  registerUser,
  logoutUser,
  clearError
} from '../features/auth/authSlice';

/**
 * Хук для работы с авторизацией
 * Предоставляет интерфейс для входа, регистрации и выхода из системы
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Функция входа в систему
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
    clearAuthError
  };
};