/**
 * Валидации для форм
 */

/**
 * Проверка email
 * @param email Адрес электронной почты
 * @returns true, если email корректный
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Проверка на минимальную длину
 * @param value Значение для проверки
 * @param minLength Минимальная длина
 * @returns true, если длина не меньше minLength
 */
export const minLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Проверка на максимальную длину
 * @param value Значение для проверки
 * @param maxLength Максимальная длина
 * @returns true, если длина не больше maxLength
 */
export const maxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Проверка на обязательное поле
 * @param value Значение для проверки
 * @returns true, если поле не пустое
 */
export const required = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.trim() !== '';
  }

  return value !== null && value !== undefined;
};

/**
 * Проверка на корректность даты
 * @param date Строка с датой
 * @returns true, если дата корректная
 */
export const isValidDate = (date: string): boolean => {
  const d = new Date(date);
  return !isNaN(d.getTime());
};

/**
 * Проверка, что дата не в прошлом
 * @param date Строка с датой
 * @returns true, если дата не в прошлом
 */
export const isNotPastDate = (date: string): boolean => {
  if (!isValidDate(date)) {
    return false;
  }

  const d = new Date(date);
  const today = new Date();

  // Сбрасываем время для корректного сравнения
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return d >= today;
};

/**
 * Валидация пароля на сложность
 * @param password Пароль
 * @returns true, если пароль достаточно сложный
 */
export const isStrongPassword = (password: string): boolean => {
  // Минимум 8 символов, минимум 1 буква, 1 цифра и 1 специальный символ
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
};

/**
 * Проверка, совпадают ли пароли
 * @param password Пароль
 * @param confirmPassword Подтверждение пароля
 * @returns true, если пароли совпадают
 */
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Проверка, входит ли значение в заданный диапазон
 * @param value Числовое значение
 * @param min Минимальное значение
 * @param max Максимальное значение
 * @returns true, если значение в диапазоне
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Проверка на корректность URL
 * @param url URL для проверки
 * @returns true, если URL корректный
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};