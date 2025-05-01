import {db, handleDexieError} from './db';
import { Task } from '../../features/tasks/tasksSlice';
import { Project } from '../../features/projects/projectsSlice';
import { User } from '../../features/auth/authSlice';
import { Table } from 'dexie';

/**
 * Сервис для инициализации базы данных
 * Отвечает за первичное заполнение БД и миграции
 */
export const dbService = {
  /**
   * Инициализация базы данных с правильной обработкой ошибок
   * Вызывается при запуске приложения
   */
  async initDatabase(): Promise<boolean> {
    try {
      // Проверяем, инициализирована ли уже база данных
      const isInitialized = localStorage.getItem('db_initialized');

      // Проверяем доступность IndexedDB
      if (!window.indexedDB) {
        throw new Error('Ваш браузер не поддерживает IndexedDB. Функциональность приложения ограничена.');
      }

      if (!isInitialized) {
        console.log('Инициализация базы данных...');

        // Проверяем, есть ли уже данные в БД
        const userCount = await db.users.count();

        // Если база не содержит данных, заполняем её
        if (userCount === 0) {
          await this.seedDatabase();
        }

        // Отмечаем, что БД инициализирована
        localStorage.setItem('db_initialized', 'true');
      }

      return true;
    } catch (error) {
      console.error('Ошибка при инициализации базы данных:', error);

      // Если ошибка связана с доступом к хранилищу, предлагаем решение
      if (error instanceof DOMException &&
        (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.error('Превышен лимит хранилища. Попробуйте очистить кэш браузера.');
      }

      // Если это проблема с приватным режимом браузера
      if (error instanceof DOMException && error.name === 'SecurityError') {
        console.error('Отказано в доступе к хранилищу. Возможно, вы в приватном режиме браузера.');
      }

      return false;
    }
  },

  /**
   * Заполнение базы данных демо-данными с использованием транзакций
   * для обеспечения целостности данных
   */
  async seedDatabase(): Promise<void> {
    try {
      console.log('Заполнение базы данных демо-данными...');

      // Используем транзакцию для обеспечения целостности данных
      await db.runTransaction('readwrite',
        ['users', 'projects', 'tasks', 'settings'],
        async () => {
          // Создаем демо-пользователя
          const demoUser: User = {
            id: '1',
            fullName: 'Павел Михайлов',
            email: 'pmihajlov14@gmail.com',
            avatar: './user.jpg',
          };

          await db.users.add(demoUser);

          // Создаем демо-проекты
          const demoProjects: Project[] = [
            {
              id: '1',
              title: 'Редизайн веб-сайта',
              description: 'Полное обновление дизайна корпоративного сайта и адаптация для мобильных устройств.',
              status: 'active',
              progress: 68,
              startDate: '2025-04-01',
              endDate: '2025-05-30',
              teamMembers: [
                {
                  id: '1',
                  name: 'Иван',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
                },
                {
                  id: '2',
                  name: 'Екатерина',
                  avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
                },
                {
                  id: '3',
                  name: 'Михаил',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
                },
              ],
              createdAt: '2025-03-25T10:00:00Z',
              updatedAt: '2025-04-15T14:30:00Z',
            },
            {
              id: '2',
              title: 'Мобильное приложение',
              description: 'Разработка кроссплатформенного мобильного приложения для клиентов компании.',
              status: 'active',
              progress: 42,
              startDate: '2025-03-15',
              endDate: '2025-06-15',
              teamMembers: [
                {
                  id: '3',
                  name: 'Михаил',
                  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
                },
                {
                  id: '4',
                  name: 'Анна',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
                },
              ],
              createdAt: '2025-03-10T09:15:00Z',
              updatedAt: '2025-04-12T11:20:00Z',
            },
            {
              id: '3',
              title: 'Внутренний инструмент',
              description: 'Создание внутреннего инструмента для автоматизации рабочих процессов команды.',
              status: 'planning',
              progress: 15,
              startDate: '2025-04-05',
              endDate: '2025-06-30',
              teamMembers: [
                {
                  id: '1',
                  name: 'Иван',
                  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
                },
                {
                  id: '4',
                  name: 'Анна',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
                },
              ],
              createdAt: '2025-04-01T13:45:00Z',
              updatedAt: '2025-04-10T15:00:00Z',
            },
          ];

          await db.projects.bulkAdd(demoProjects);

          // Создаем демо-задачи
          const demoTasks: Task[] = [
            {
              id: '1',
              title: 'Создать дизайн-систему',
              description: 'Разработать компоненты UI для всего приложения',
              status: 'done',
              priority: 'high',
              dueDate: '2025-04-10',
              projectId: '1',
              assigneeId: '2',
              assignee: {
                id: '2',
                name: 'Екатерина',
                avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
              },
              createdAt: '2025-03-20T10:00:00Z',
              updatedAt: '2025-04-05T15:30:00Z',
            },
            {
              id: '2',
              title: 'Разработка главной страницы',
              description: 'Верстка и логика главной страницы сайта',
              status: 'inProgress',
              priority: 'medium',
              dueDate: '2025-05-15',
              projectId: '1',
              assigneeId: '3',
              assignee: {
                id: '3',
                name: 'Михаил',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
              },
              createdAt: '2025-04-01T09:15:00Z',
              updatedAt: '2025-04-10T11:20:00Z',
            },
            {
              id: '3',
              title: 'Создать анимации перехода',
              description: 'Реализовать плавные анимации при переходе между страницами',
              status: 'todo',
              priority: 'low',
              dueDate: '2025-05-20',
              projectId: '1',
              assigneeId: '4',
              assignee: {
                id: '4',
                name: 'Анна',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
              },
              createdAt: '2025-04-05T13:45:00Z',
              updatedAt: '2025-04-05T13:45:00Z',
            },
            {
              id: '4',
              title: 'Настроить авторизацию',
              description: 'Реализовать систему авторизации и защиту маршрутов',
              status: 'inProgress',
              priority: 'high',
              dueDate: '2025-05-05',
              projectId: '2',
              assigneeId: '5',
              assignee: {
                id: '5',
                name: 'Дмитрий',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
              },
              createdAt: '2025-03-25T09:30:00Z',
              updatedAt: '2025-04-12T14:00:00Z',
            },
            {
              id: '5',
              title: 'Оптимизировать производительность',
              description: 'Провести аудит и оптимизировать скорость загрузки',
              status: 'review',
              priority: 'medium',
              dueDate: '2025-05-18',
              projectId: '2',
              assigneeId: '3',
              assignee: {
                id: '3',
                name: 'Михаил',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
              },
              createdAt: '2025-04-02T11:20:00Z',
              updatedAt: '2025-04-15T10:45:00Z',
            },
            {
              id: '6',
              title: 'Настроить деплой',
              description: 'Настроить CI/CD для автоматического деплоя',
              status: 'todo',
              priority: 'low',
              dueDate: '2025-05-25',
              projectId: '3',
              assigneeId: '5',
              assignee: {
                id: '5',
                name: 'Дмитрий',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
              },
              createdAt: '2025-04-10T15:00:00Z',
              updatedAt: '2025-04-10T15:00:00Z',
            },
          ];

          await db.tasks.bulkAdd(demoTasks);

          // Создаем демо-настройки
          const demoSettings = {
            id: '1',
            theme: {
              darkMode: true,
              reducedMotion: false,
              accentColor: '#3730a3',
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
            }
          };

          await db.settings.add(demoSettings);

          console.log('Демо-данные успешно добавлены');
      });
    } catch (error) {
      handleDexieError(error, 'Ошибка при заполнении базы данных');
    }
  },

  /**
   * Сброс базы данных с обработкой ошибок
   * Для отладки и тестирования
   */
  async resetDatabase(): Promise<void> {
    try {
      await db.delete();
      localStorage.removeItem('db_initialized');
      console.log('База данных сброшена');

      // Пересоздаем базу данных
      await db.open();
      await this.initDatabase();
    } catch (error) {
      handleDexieError(error, 'Ошибка при сбросе базы данных');
    }
  },

  /**
   * Проверка здоровья базы данных
   * Возвращает информацию о состоянии таблиц и количестве записей
   */
  async checkDatabaseHealth(): Promise<{
    isOpen: boolean;
    version: number;
    tables: string[];
    counts: Record<string, number>;
    estimatedSize?: number;
  }> {
    try {
      const tables = ['tasks', 'projects', 'users', 'settings', 'syncQueue'] as const;
      const counts: Record<string, number> = {};

      // Проверяем, открыта ли база данных
      const isOpen = db.isOpen();

      // Получаем текущую версию
      const version = db.verno;

      for (const table of tables) {
        try {
          const tableRef = db[table as keyof typeof db];
          if (typeof (tableRef as Table<unknown, string>).count === 'function') {
            counts[table] = await (tableRef as Table<unknown, string>).count();
          }
        } catch (error) {
          console.warn(`Не удалось получить количество записей в таблице "${table}":`, error);
          counts[table] = -1; // Ошибка при получении количества
        }
      }

      // Пытаемся оценить размер БД (работает не во всех браузерах)
      let estimatedSize: number | undefined;
      try {
        const storageEstimate = await navigator.storage?.estimate();
        if (storageEstimate?.usage) {
          estimatedSize = storageEstimate.usage;
        }
      } catch (e) {
        console.warn('Не удалось оценить размер базы данных:', e);
      }

      return { isOpen, version, tables: [...tables], counts, estimatedSize };
    } catch (error) {
      console.error('Ошибка при проверке здоровья базы данных:', error);
      return {
        isOpen: false,
        version: -1,
        tables: [],
        counts: {}
      };
    }
  },

  /**
   * Оптимизация базы данных
   * Очистка устаревших данных, дефрагментация и т.д.
   */
  async optimizeDatabase(): Promise<boolean> {
    try {
      // Удаление старых записей из очереди синхронизации (например, старше 30 дней)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

      await db.syncQueue
      .where('timestamp')
      .below(thirtyDaysAgo)
      .and(item => item.operation === 'delete') // Удаляем только записи удаления
      .delete();

      // Другие операции по оптимизации...

      return true;
    } catch (error) {
      console.error('Ошибка при оптимизации базы данных:', error);
      return false;
    }
  }
};