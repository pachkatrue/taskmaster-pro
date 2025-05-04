import { db, handleDexieError, AuthSession, WithDemoFlag } from './db';
import { Task } from '../../features/tasks/tasksSlice';
import { Project } from '../../features/projects/projectsSlice';
import { User } from '../../features/auth/authSlice';
import { Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

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
          const demoProjects: (Project & WithDemoFlag)[] = [
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
            },
          ];

          await db.projects.bulkAdd(demoProjects);

          // Создаем демо-задачи
          const demoTasks: (Task & WithDemoFlag)[] = [
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
              demoData: true, // Помечаем как демо-данные
              createdBy: '1'
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
            },
            demoData: true, // Помечаем как демо-данные
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
      const tables = ['tasks', 'projects', 'users', 'settings', 'syncQueue', 'authSessions'] as const;
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
  },

  /**
   * Создает новую сессию пользователя при входе
   * @param user Данные пользователя
   * @param token Токен авторизации
   * @param provider Провайдер авторизации
   * @returns Объект сессии
   */
  async createAuthSession(
    user: User,
    token: string,
    provider: 'email' | 'google' | 'facebook' | 'guest' | 'demo',
    refreshToken?: string
  ): Promise<AuthSession> {
    try {
      // Проверяем, существует ли пользователь в базе
      const existingUser = await db.users.get(user.id);

      // Если это демо-пользователь, создаем изолированное пространство данных
      const isDemo = provider === 'demo' || user.email === 'demo@taskmaster.pro';

      // Если пользователя нет в базе, добавляем его
      if (!existingUser) {
        await db.users.add(user);
      } else if (provider !== 'guest' && !isDemo) {
        // Обновляем данные пользователя, если это не гостевой вход и не демо
        await db.users.update(user.id, user);
      }

      // Генерируем уникальный deviceId, если он еще не создан
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem('device_id', deviceId);
      }

      // Срок действия токена (например, 30 дней)
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      // Создаем новую сессию
      const newSession: AuthSession = {
        id: uuidv4(),
        userId: user.id,
        token,
        refreshToken,
        provider: isDemo ? 'demo' : provider, // Явно помечаем демо-сессию
        deviceId,
        lastActive: Date.now(),
        expiresAt,
        metadata: {
          deviceInfo: navigator.userAgent,
          isDemo: isDemo, // Добавляем флаг демо-режима в метаданные
        }
      };

      // Сохраняем сессию в базе данных
      await db.authSessions.add(newSession);

      // Обновляем локальную информацию о текущей сессии
      localStorage.setItem('current_session_id', newSession.id);

      // Если это демо-режим, сохраняем флаг
      if (isDemo) {
        localStorage.setItem('demo_mode', 'true');
      } else {
        localStorage.removeItem('demo_mode');
      }

      return newSession;
    } catch (error) {
      return handleDexieError(error, 'Не удалось создать сессию авторизации');
    }
  },

  /**
   * Получает активную сессию пользователя
   * @returns Объект активной сессии или null
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const sessionId = localStorage.getItem('current_session_id');
      if (!sessionId) return null;

      const session = await db.authSessions.get(sessionId) ?? null;

      // Проверяем, не истекла ли сессия
      if (session && session.expiresAt && session.expiresAt < Date.now()) {
        // Если сессия истекла, удаляем её
        await db.authSessions.delete(sessionId);
        localStorage.removeItem('current_session_id');
        return null;
      }

      return session;
    } catch (error) {
      console.error('Ошибка при получении текущей сессии:', error);
      return null;
    }
  },

  /**
   * Обновляет время последней активности для сессии
   * @param sessionId ID сессии
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      await db.authSessions.update(sessionId, {
        lastActive: Date.now()
      });
    } catch (error) {
      console.error('Ошибка при обновлении активности сессии:', error);
    }
  },

  /**
   * Закрывает текущую сессию пользователя при выходе
   */
  async closeCurrentSession(): Promise<void> {
    try {
      const sessionId = localStorage.getItem('current_session_id');
      if (sessionId) {
        await db.authSessions.delete(sessionId);
        localStorage.removeItem('current_session_id');
        localStorage.removeItem('demo_mode');
      }
    } catch (error) {
      console.error('Ошибка при закрытии сессии:', error);
    }
  },

  /**
   * Получает все активные сессии пользователя
   * @param userId ID пользователя
   * @returns Массив активных сессий пользователя
   */
  async getUserSessions(userId: string): Promise<AuthSession[]> {
    try {
      // Получаем все сессии пользователя
      const sessions = await db.authSessions
      .where('userId').equals(userId)
      .toArray();

      // Фильтруем по активным (не истекшим) сессиям
      const currentTime = Date.now();
      return sessions.filter(session =>
        !session.expiresAt || session.expiresAt > currentTime
      );
    } catch (error) {
      console.error('Ошибка при получении сессий пользователя:', error);
      return [];
    }
  },

  /**
   * Создает гостевую сессию для неавторизованных пользователей
   * @returns Объект гостевой сессии
   */
  async createGuestSession(): Promise<AuthSession> {
    try {
      // Создаем временного гостевого пользователя
      const guestUser: User = {
        id: `guest_${uuidv4()}`,
        fullName: 'Гостевой пользователь',
        email: `guest_${Date.now()}@example.com`
      };

      // Добавляем пользователя в базу
      await db.users.add(guestUser);

      // Создаем гостевую сессию
      return await this.createAuthSession(
        guestUser,
        `guest_token_${uuidv4()}`,
        'guest'
      );
    } catch (error) {
      return handleDexieError(error, 'Не удалось создать гостевую сессию');
    }
  },

  /**
   * Миграция данных из гостевой сессии в авторизованную
   * @param guestUserId ID гостевого пользователя
   * @param authenticatedUserId ID авторизованного пользователя
   */
  async migrateGuestData(guestUserId: string, authenticatedUserId: string): Promise<void> {
    try {
      // Начинаем транзакцию для атомарности операции
      await db.runTransaction('readwrite', ['tasks', 'projects', 'users'], async () => {
        // Находим все задачи гостевого пользователя
        const guestTasks = await db.tasks
        .where('assigneeId')
        .equals(guestUserId)
        .toArray();

        // Обновляем assigneeId в задачах на ID авторизованного пользователя
        for (const task of guestTasks) {
          await db.tasks.update(task.id, { assigneeId: authenticatedUserId });
        }

        // Находим все проекты гостевого пользователя
        const guestProjects = await db.projects
        .filter(project =>
          project.teamMembers?.some(member => member.id === guestUserId)
        )
        .toArray();

        // Обновляем teamMembers в проектах
        for (const project of guestProjects) {
          const updatedTeamMembers = project.teamMembers?.map(member =>
            member.id === guestUserId ? { ...member, id: authenticatedUserId } : member
          );

          await db.projects.update(project.id, { teamMembers: updatedTeamMembers });
        }

        // Удаляем гостевого пользователя
        await db.users.delete(guestUserId);
      });

      console.log('Данные гостевой сессии успешно перенесены');
    } catch (error) {
      handleDexieError(error, 'Ошибка при миграции данных гостевой сессии');
    }
  },

  /**
   * Обработка сценария автоматического входа
   * @returns Объект пользователя, если автовход выполнен успешно
   */
  async tryAutoLogin(): Promise<User | null> {
    try {
      // Проверяем наличие активной сессии
      const currentSession = await this.getCurrentSession();

      if (currentSession) {
        // Обновляем время последней активности
        await this.updateSessionActivity(currentSession.id);

        // Получаем данные пользователя из базы
        const user = await db.users.get(currentSession.userId);

        if (user) {
          // Восстанавливаем демо-режим, если сессия демо
          if (currentSession.provider === 'demo' || currentSession.metadata?.isDemo) {
            localStorage.setItem('demo_mode', 'true');
          }

          return user;
        }
      }

      return null;
    } catch (error) {
      console.error('Ошибка при попытке автоматического входа:', error);
      return null;
    }
  },

  /**
   * Получает задачи для текущего пользователя с учетом демо-режима
   * @returns Массив задач пользователя
   */
  async getUserTasks(): Promise<Task[]> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return [];

      const isDemo = session.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      // Если это демо-режим, возвращаем только демо-задачи
      if (isDemo) {
        return await db.tasks
        .filter(task => task.demoData === true)
        .toArray();
      }

      // Иначе возвращаем задачи текущего пользователя
      return await db.tasks
      .filter(task => !task.demoData && (task.assigneeId === session.userId || task.createdBy === session.userId))
      .toArray();
    } catch (error) {
      console.error('Ошибка при получении задач пользователя:', error);
      return [];
    }
  },

  /**
   * Получает проекты для текущего пользователя с учетом демо-режима
   * @returns Массив проектов пользователя
   */
  async getUserProjects(): Promise<Project[]> {
    try {
      const session = await this.getCurrentSession();
      if (!session) return [];

      const isDemo = session.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      // Если это демо-режим, возвращаем только демо-проекты
      if (isDemo) {
        return await db.projects
        .filter(project => project.demoData === true)
        .toArray();
      }

      // Иначе возвращаем проекты, в которых участвует пользователь
      return await db.projects
      .filter(project =>
        !project.demoData &&
        (project.teamMembers?.some(member => member.id === session.userId) ||
          project.createdBy === session.userId)
      )
      .toArray();
    } catch (error) {
      console.error('Ошибка при получении проектов пользователя:', error);
      return [];
    }
  },

  /**
   * Создает новую задачу с учетом демо-режима
   * @param taskData Данные задачи
   * @returns Созданная задача
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const session = await this.getCurrentSession();
      if (!session) throw new Error('Пользователь не авторизован');

      const isDemo = session.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      // Создаем задачу с нужными метаданными
      const task: Task & WithDemoFlag = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: session.userId,
        demoData: isDemo, // Помечаем как демо-данные, если это демо-режим
      };

      // Добавляем задачу в базу данных
      await db.tasks.add(task);

      return task;
    } catch (error) {
      return handleDexieError(error, 'Ошибка при создании задачи');
    }
  },

  /**
   * Создает новый проект с учетом демо-режима
   * @param project Данные проекта
   * @returns Созданный проект
   */
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const session = await this.getCurrentSession();
      if (!session) throw new Error('Пользователь не авторизован');

      const isDemo = session.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      // Создаем проект с нужными метаданными
      const project: Project & WithDemoFlag = {
        ...projectData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: session.userId,
        demoData: isDemo, // Помечаем как демо-данные, если это демо-режим
      };

      // Добавляем проект в базу данных
      await db.projects.add(project);

      return project;
    } catch (error) {
      return handleDexieError(error, 'Ошибка при создании проекта');
    }
  }
};