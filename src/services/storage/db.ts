import Dexie, { Table } from 'dexie';
import { Task } from '../../features/tasks/tasksSlice';
import { Project } from '../../features/projects/projectsSlice';
import { User } from '../../features/auth/authSlice';
import type { SyncQueueItem } from './syncService';

// Интерфейс для настроек
interface AppSettings {
  id: string;
  theme: {
    darkMode: boolean;
    reducedMotion: boolean;
    accentColor?: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    taskReminders: boolean;
    weeklyReports: boolean;
  };
  app: {
    language: string;
    autoSave: boolean;
    dateFormat: string;
    timeFormat: string;
  };
}

/**
 * Определение класса для базы данных Dexie
 * Устанавливаем схему и определяем таблицы с поддержкой версионирования
 */
class TaskMasterDatabase extends Dexie {
  // Типизированные таблицы
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  users!: Table<User, string>;
  settings!: Table<AppSettings, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('taskMasterPro');

    // Определяем схему версии 1
    this.version(1).stores({
      tasks: 'id, status, priority, projectId, assigneeId, dueDate, createdAt',
      projects: 'id, status, progress, startDate, endDate, createdAt',
      users: 'id, email',
      settings: 'id',
      syncQueue: 'id, entity, operation, timestamp',
    });

    // Готовим для будущих миграций, например, версия 2
    // this.version(2).stores({
    //   tasks: 'id, status, priority, projectId, assigneeId, dueDate, createdAt, tags', // Добавлено поле tags
    // }).upgrade(tx => {
    //   // Миграция данных - добавляем пустой массив тегов для всех задач
    //   return tx.tasks.toCollection().modify(task => {
    //     task.tags = [];
    //   });
    // });

    // Обработчик ошибок открытия БД
    this.on('blocked', () => console.warn('База данных заблокирована другой вкладкой'));
    this.on('versionchange', event => {
      console.warn(`Версия базы данных изменена в другой вкладке: ${event.oldVersion} -> ${event.newVersion}`);
      // Перезагрузить страницу для применения новой версии
      if (!event.newVersion) {
        // База данных удалена, закрываем соединение
        db.close();
      }
    });
  }

  /**
   * Обёртка для транзакций с более удобным API
   * @param mode режим транзакции
   * @param tables таблицы, которые будут затронуты транзакцией
   * @param callback колбэк, выполняемый в транзакции
   */
  async runTransaction<T>(
    mode: 'readonly' | 'readwrite',
    tables: string[],
    callback: () => Promise<T>
  ): Promise<T> {
    return super.transaction(mode, tables, async () => {
      try {
        return await callback();
      } catch (error) {
        console.error('Ошибка в транзакции:', error);
        throw error;
      }
    });
  }
}

// Создаем и экспортируем экземпляр базы данных
export const db = new TaskMasterDatabase();

// Вспомогательная функция для обработки ошибок Dexie
export const handleDexieError = (error: unknown, customMessage: string): never => {
  if (error instanceof Dexie.ConstraintError) {
    console.error(`${customMessage}: Нарушение уникальности ключа`);
    throw new Error(`${customMessage}: Элемент с таким идентификатором уже существует`);
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name: string }).name === 'QuotaExceededError'
  ) {
    console.error(`${customMessage}: Превышен лимит хранилища`);
    throw new Error(`${customMessage}: Превышен лимит локального хранилища. Очистите кэш и попробуйте снова.`);
  } else {
    console.error(`${customMessage}:`, error);
    throw new Error(`${customMessage}: ${(error as Error).message || 'Неизвестная ошибка'}`);
  }
};