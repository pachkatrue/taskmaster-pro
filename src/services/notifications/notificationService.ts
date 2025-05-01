import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Тип уведомления
 */
export type NotificationType = 'task' | 'project' | 'system';

/**
 * Интерфейс уведомления
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  link?: string; // Опциональная ссылка для перехода при клике на уведомление
}

/**
 * Интерфейс состояния уведомлений
 */
interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Начальное состояние для уведомлений
 */
const initialState: NotificationsState = {
  notifications: [
    {
      id: '1',
      title: 'Новая задача назначена',
      message: 'Вам назначена задача "Создать дизайн-систему"',
      time: '5 минут назад',
      type: 'task',
      read: false,
      link: '/tasks/1'
    },
    {
      id: '2',
      title: 'Дедлайн проекта',
      message: 'Срок проекта "Редизайн веб-сайта" через 2 дня',
      time: '2 часа назад',
      type: 'project',
      read: false,
      link: '/projects/1'
    },
    {
      id: '3',
      title: 'Обновление системы',
      message: 'Плановое обновление системы завтра в 03:00',
      time: '1 день назад',
      type: 'system',
      read: true
    }
  ],
  isLoading: false,
  error: null
};

/**
 * Slice для управления уведомлениями
 */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Добавление нового уведомления
     */
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'time' | 'read'>>) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        time: 'Только что',
        read: false,
        ...action.payload
      };

      state.notifications.unshift(newNotification);
    },

    /**
     * Отметка уведомления как прочитанного
     */
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },

    /**
     * Отметка всех уведомлений как прочитанных
     */
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },

    /**
     * Удаление уведомления
     */
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    /**
     * Удаление всех уведомлений
     */
    clearAllNotifications: (state) => {
      state.notifications = [];
    }
  }
});

// Экспорт actions и reducer
export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

/**
 * Класс для работы с уведомлениями
 * Включает функции для создания типовых уведомлений и проверки прав на отправку
 */
class NotificationService {
  /**
   * Проверяет поддержку браузерных уведомлений
   */
  isBrowserNotificationsSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Запрашивает разрешение на отправку уведомлений
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isBrowserNotificationsSupported()) {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  /**
   * Проверяет, разрешены ли уведомления
   */
  async areNotificationsAllowed(): Promise<boolean> {
    if (!this.isBrowserNotificationsSupported()) {
      return false;
    }

    return (await this.requestPermission()) === 'granted';
  }

  /**
   * Показывает браузерное уведомление
   */
  async showBrowserNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (await this.areNotificationsAllowed()) {
      new Notification(title, options);
    }
  }

  /**
   * Создает уведомление о новой задаче
   */
  createTaskNotification(taskTitle: string, taskId: string): Omit<Notification, 'id' | 'time' | 'read'> {
    return {
      title: 'Новая задача назначена',
      message: `Вам назначена задача "${taskTitle}"`,
      type: 'task',
      link: `/tasks/${taskId}`
    };
  }

  /**
   * Создает уведомление о приближающемся дедлайне
   */
  createDeadlineNotification(
    entityType: 'task' | 'project',
    title: string,
    id: string,
    daysLeft: number
  ): Omit<Notification, 'id' | 'time' | 'read'> {
    const entityName = entityType === 'task' ? 'задачи' : 'проекта';
    const link = entityType === 'task' ? `/tasks/${id}` : `/projects/${id}`;

    let message = '';
    if (daysLeft === 0) {
      message = `Срок ${entityName} "${title}" истекает сегодня`;
    } else if (daysLeft === 1) {
      message = `Срок ${entityName} "${title}" истекает завтра`;
    } else {
      message = `Срок ${entityName} "${title}" истекает через ${daysLeft} дней`;
    }

    return {
      title: 'Приближается дедлайн',
      message,
      type: entityType,
      link
    };
  }

  /**
   * Создает уведомление о завершении задачи или проекта
   */
  createCompletionNotification(
    entityType: 'task' | 'project',
    title: string,
    id: string
  ): Omit<Notification, 'id' | 'time' | 'read'> {
    const entityName = entityType === 'task' ? 'Задача' : 'Проект';
    const link = entityType === 'task' ? `/tasks/${id}` : `/projects/${id}`;

    return {
      title: `${entityName} завершен`,
      message: `${entityName} "${title}" успешно завершен`,
      type: entityType,
      link
    };
  }

  /**
   * Создает уведомление о системном событии
   */
  createSystemNotification(title: string, message: string): Omit<Notification, 'id' | 'time' | 'read'> {
    return {
      title,
      message,
      type: 'system'
    };
  }
}

// Создаем и экспортируем экземпляр сервиса
export const notificationService = new NotificationService();