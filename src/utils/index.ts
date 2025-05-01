/**
 * Основной файл утилит для приложения
 */

/**
 * Форматирование даты в локальный формат
 * @param dateString Строка с датой в формате ISO
 * @param format Формат даты (short, medium, long)
 * @returns Отформатированная дата
 */
export const formatDate = (
  dateString: string,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale: string = 'ru-RU'
): string => {
  try {
    const date = new Date(dateString);

    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      return 'Неверная дата';
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'short' ? '2-digit' : format === 'medium' ? 'short' : 'long',
      day: '2-digit',
    };

    return date.toLocaleDateString(locale, options);
  } catch (error) {
    console.error('Ошибка форматирования даты:', error);
    return dateString;
  }
};

/**
 * Форматирование времени в локальный формат
 * @param dateString Строка с датой в формате ISO
 * @param is24h Использовать 24-часовой формат
 * @returns Отформатированное время
 */
export const formatTime = (
  dateString: string,
  is24h: boolean = true,
  locale: string = 'ru-RU'
): string => {
  try {
    const date = new Date(dateString);

    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      return 'Неверное время';
    }

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: !is24h,
    };

    return date.toLocaleTimeString(locale, options);
  } catch (error) {
    console.error('Ошибка форматирования времени:', error);
    return dateString;
  }
};

/**
 * Форматирование даты и времени в одну строку
 * @param dateString Строка с датой в формате ISO
 * @param dateFormat Формат даты
 * @param is24h Использовать 24-часовой формат времени
 * @returns Отформатированная дата и время
 */
export const formatDateTime = (
  dateString: string,
  dateFormat: 'short' | 'medium' | 'long' = 'medium',
  is24h: boolean = true,
  locale: string = 'ru-RU'
): string => {
  return `${formatDate(dateString, dateFormat, locale)} ${formatTime(dateString, is24h, locale)}`;
};

/**
 * Расчет количества дней до дедлайна
 * @param dueDate Строка с датой дедлайна в формате ISO
 * @returns Количество дней или сообщение об ошибке
 */
export const getDaysUntilDue = (dueDate: string): number | string => {
  try {
    const due = new Date(dueDate);
    const now = new Date();

    // Сбрасываем время для корректного расчета дней
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (error) {
    console.error('Ошибка расчета дней до дедлайна:', error);
    return 'Ошибка';
  }
};

/**
 * Форматирование строки для отображения дней до дедлайна
 * @param dueDate Строка с датой дедлайна в формате ISO
 * @returns Отформатированная строка с количеством дней
 */
export const formatDaysUntilDue = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate);

  if (typeof days !== 'number') {
    return 'Неверная дата';
  }

  if (days < 0) {
    return `Просрочено на ${Math.abs(days)} ${pluralizeDays(Math.abs(days))}`;
  } else if (days === 0) {
    return 'Сегодня';
  } else if (days === 1) {
    return 'Завтра';
  } else {
    return `${days} ${pluralizeDays(days)}`;
  }
};

/**
 * Множественное число для слова "день"
 * @param count Количество дней
 * @returns Правильная форма слова "день"
 */
export const pluralizeDays = (count: number): string => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'день';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'дня';
  } else {
    return 'дней';
  }
};

/**
 * Генерация уникального ID
 * @returns Уникальный ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Сокращение длинного текста с добавлением многоточия
 * @param text Исходный текст
 * @param maxLength Максимальная длина
 * @returns Сокращенный текст
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength) + '...';
};

/**
 * Форматирование имени пользователя (первые буквы имени и фамилии)
 * @param fullName Полное имя пользователя
 * @returns Инициалы
 */
export const formatInitials = (fullName: string): string => {
  if (!fullName) return '';

  const parts = fullName.split(' ');

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Проверка, является ли устройство мобильным
 * @returns true, если устройство мобильное
 */
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.innerWidth < 768;
};

/**
 * Вычисление процента выполнения
 * @param completed Количество выполненных элементов
 * @param total Общее количество элементов
 * @returns Процент выполнения
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;

  return Math.round((completed / total) * 100);
};

/**
 * Получение цвета в зависимости от прогресса
 * @param progress Процент выполнения (0-100)
 * @returns Класс цвета для Tailwind CSS
 */
export const getProgressColor = (progress: number): string => {
  if (progress < 25) {
    return 'bg-red-500';
  } else if (progress < 50) {
    return 'bg-orange-500';
  } else if (progress < 75) {
    return 'bg-yellow-500';
  } else {
    return 'bg-green-500';
  }
};

/**
 * Получение цвета в зависимости от приоритета
 * @param priority Приоритет задачи
 * @returns Классы для Tailwind CSS
 */
export const getPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  switch (priority) {
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

/**
 * Получение цвета в зависимости от статуса задачи
 * @param status Статус задачи
 * @returns Классы для Tailwind CSS
 */
export const getTaskStatusColor = (status: 'todo' | 'inProgress' | 'review' | 'done'): string => {
  switch (status) {
    case 'todo':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'inProgress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'review':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'done':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

/**
 * Сортировка массива задач по приоритету
 * @param tasks Массив задач
 * @returns Отсортированный массив
 */
export const sortTasksByPriority = <T extends { priority: 'low' | 'medium' | 'high' }>(tasks: T[]): T[] => {
  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
};

/**
 * Сортировка массива задач по дате
 * @param tasks Массив задач
 * @param field Поле с датой
 * @param direction Направление сортировки
 * @returns Отсортированный массив
 */
type TaskWithDateField = { [key: string]: string | Date };

export const sortTasksByDate = <T extends TaskWithDateField>(
  tasks: T[],
  field: string = 'dueDate',
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a[field]).getTime();
    const dateB = new Date(b[field]).getTime();

    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Группировка задач по полю
 * @param tasks Массив задач
 * @param field Поле для группировки
 * @returns Объект с сгруппированными задачами
 */
export const groupTasksByField = <T extends Record<string, unknown>>(
  tasks: T[],
  field: keyof T
): Record<string, T[]> => {
  return tasks.reduce((groups, task) => {
    const key = task[field]?.toString() || 'undefined';

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(task);

    return groups;
  }, {} as Record<string, T[]>);
};

/**
 * Фильтрация задач по строке поиска
 * @param tasks Массив задач
 * @param searchQuery Строка поиска
 * @param fields Поля для поиска
 * @returns Отфильтрованный массив
 */
export const filterTasksBySearchQuery = <T extends Record<string, unknown>>(
  tasks: T[],
  searchQuery: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchQuery.trim()) {
    return tasks;
  }

  const query = searchQuery.toLowerCase().trim();

  return tasks.filter(task => {
    return fields.some(field => {
      const value = task[field];

      if (!value) {
        return false;
      }

      return value.toString().toLowerCase().includes(query);
    });
  });
};