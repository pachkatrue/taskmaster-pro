import { useState, useEffect } from 'react';

/**
 * Хук для дебаунса значений
 * Позволяет отложить обновление значения на заданное время
 *
 * @param value Значение, которое нужно "дебаунсить"
 * @param delay Задержка в миллисекундах
 * @returns Дебаунсированное значение, которое обновляется только после истечения задержки
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Состояние для хранения дебаунсированного значения
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем таймер для обновления значения
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при изменении value или unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Хук для дебаунса функций
 * Позволяет отложить выполнение функции на заданное время
 *
 * @param callback Функция для дебаунса
 * @param delay Задержка в миллисекундах
 * @returns Дебаунсированная функция
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (...args: Parameters<T>) => {
    // Очищаем предыдущий таймер
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Устанавливаем новый таймер
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

export default useDebounce;