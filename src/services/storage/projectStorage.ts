import { db, handleDexieError } from './db';
import {Project, ProjectStatus} from '../../features/projects/projectsSlice';
import { syncService } from './syncService';
import { generateId } from '../../utils';
import { taskStorage } from './taskStorage';

/**
 * Сервис для работы с проектами в локальном хранилище
 * Расширенная версия с полной поддержкой оффлайн-режима и синхронизации
 */
export const projectStorage = {
  /**
   * Получить все проекты
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      return await db.projects.toArray();
    } catch (error) {
      handleDexieError(error, 'Ошибка при получении проектов');
      return [];
    }
  },

  /**
   * Получить проект по ID с обработкой ошибок
   */
  async getProjectById(id: string): Promise<Project | undefined> {
    try {
      const project = await db.projects.get(id);
      return project;
    } catch (error) {
      handleDexieError(error, `Ошибка при получении проекта с ID ${id}`);
      return undefined;
    }
  },

  /**
   * Обновить статус проекта
   */
  async updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
    return this.updateProject({ id, status });
  },

  /**
   * Удалить участника из проекта
   */
  async removeTeamMember(projectId: string, memberId: string): Promise<Project> {
    return await this.updateProject({
      id: projectId,
      teamMembers: (await this.getProjectById(projectId))?.teamMembers.filter(m => m.id !== memberId)
    });
  },

  /**
   * Получить все активные проекты
   */
  async getActiveProjects(): Promise<Project[]> {
    try {
      return await db.projects
      .where('status')
      .equals('active')
      .toArray();
    } catch (error) {
      handleDexieError(error, 'Ошибка при получении активных проектов');
      return [];
    }
  },

  /**
   * Получить проекты по статусу
   */
  async getProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    try {
      return await db.projects
      .where('status')
      .equals(status)
      .toArray();
    } catch (error) {
      handleDexieError(error, `Ошибка при получении проектов со статусом "${status}"`);
      return [];
    }
  },

  /**
   * Добавить проект с транзакцией
   */
  async addProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const timestamp = new Date().toISOString();

      // Создаем новый проект
      const newProject: Project = {
        id: generateId(),
        ...projectData,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      // Используем транзакцию для обеспечения целостности
      await db.runTransaction('readwrite', ['projects'], async () => {
        // Сохраняем в локальную БД
        await db.projects.add(newProject);
      });

      // Добавляем операцию в очередь синхронизации
      if (navigator.onLine) {
        await syncService.addToSyncQueue('create', 'project', newProject);
      }

      return newProject;
    } catch (error) {
      handleDexieError(error, 'Ошибка при добавлении проекта');
      throw error;
    }
  },

  /**
   * Обновить проект с использованием транзакций
   */
  async updateProject(projectData: Partial<Project> & { id: string }): Promise<Project> {
    try {
      // Используем транзакцию для целостности данных
      return await db.runTransaction('readwrite', ['projects'], async () => {
        // Получаем текущий проект
        const existingProject = await db.projects.get(projectData.id);

        if (!existingProject) {
          throw new Error(`Проект с ID ${projectData.id} не найден`);
        }

        // Обработка teamMembers для предотвращения проблем с вложенными объектами
        let teamMembers = existingProject.teamMembers;
        if (projectData.teamMembers) {
          teamMembers = projectData.teamMembers;
        }

        // Объединяем данные и обновляем timestamp
        const updatedProject: Project = {
          ...existingProject,
          ...projectData,
          teamMembers,
          updatedAt: new Date().toISOString()
        };

        // Обновляем в локальной БД
        const { id: projectId, ...fieldsToUpdate } = updatedProject;
        await db.projects.update(projectId, fieldsToUpdate);

        // Добавляем операцию в очередь синхронизации
        if (navigator.onLine) {
          await syncService.addToSyncQueue('update', 'project', updatedProject);
        }

        return updatedProject;
      });
    } catch (error) {
      handleDexieError(error, `Ошибка при обновлении проекта с ID ${projectData.id}`);
      throw error;
    }
  },

  /**
   * Удалить проект с обработкой связанных задач в транзакции
   */
  async deleteProject(id: string): Promise<void> {
    try {
      // Используем транзакцию для согласованной обработки проекта и связанных задач
      await db.runTransaction('readwrite', ['projects', 'tasks'], async () => {
        // Сначала получаем проект для синхронизации
        const project = await db.projects.get(id);

        if (!project) {
          throw new Error(`Проект с ID ${id} не найден`);
        }

        // Получаем связанные задачи
        const projectTasks = await taskStorage.getTasksByProject(id);

        // Удаляем проект из локальной БД
        await db.projects.delete(id);

        // Добавляем операцию удаления проекта в очередь синхронизации
        if (navigator.onLine) {
          await syncService.addToSyncQueue('delete', 'project', { id });
        }

        // Обновляем связанные задачи - удаляем ссылку на проект
        for (const task of projectTasks) {
          await db.tasks.update(task.id, {
            projectId: undefined,
            updatedAt: new Date().toISOString()
          });

          // Добавляем операцию обновления задачи в очередь синхронизации
          if (navigator.onLine) {
            await syncService.addToSyncQueue('update', 'task', {
              ...task,
              projectId: undefined,
              updatedAt: new Date().toISOString()
            });
          }
        }
      });
    } catch (error) {
      handleDexieError(error, `Ошибка при удалении проекта с ID ${id}`);
      throw error;
    }
  },

  /**
   * Добавить участника в проект с безопасной обработкой массива
   */
  async addTeamMember(
    projectId: string,
    member: { id: string; name: string; avatar?: string }
  ): Promise<Project> {
    try {
      return await db.runTransaction('readwrite', ['projects'], async () => {
        const project = await db.projects.get(projectId);

        if (!project) {
          throw new Error(`Проект с ID ${projectId} не найден`);
        }

        // Проверяем, нет ли уже такого участника
        const isExistingMember = project.teamMembers.some(m => m.id === member.id);

        if (isExistingMember) {
          return project; // Участник уже существует, просто возвращаем проект
        }

        // Создаем новый массив участников, а не модифицируем существующий
        const updatedTeamMembers = [...project.teamMembers, member];

        // Обновляем проект
        const updatedProject: Project = {
          ...project,
          teamMembers: updatedTeamMembers,
          updatedAt: new Date().toISOString()
        };

        // Сохраняем в БД
        const { id, ...fieldsToUpdate } = updatedProject;
        await db.projects.update(id, fieldsToUpdate);

        // Добавляем в очередь синхронизации
        if (navigator.onLine) {
          await syncService.addToSyncQueue('update', 'project', updatedProject);
        }

        return updatedProject;
      });
    } catch (error) {
      handleDexieError(error, `Ошибка при добавлении участника в проект с ID ${projectId}`);
      throw error;
    }
  },

  /**
   * Поиск задач по тексту с оптимизированным алгоритмом
   */
  async searchProjects(query: string): Promise<Project[]> {
    try {
      const queryLower = query.toLowerCase().trim();
      const allProjects = await db.projects.toArray();

      return allProjects.filter(project =>
        project.title.toLowerCase().includes(queryLower) ||
        (project.description && project.description.toLowerCase().includes(queryLower))
      );
    } catch (error) {
      handleDexieError(error, `Ошибка при поиске проектов по запросу "${query}"`);
      return [];
    }
  },

  /**
   * Обновить прогресс проекта с опциональным автоматическим расчетом
   */
  async updateProjectProgress(id: string, progress?: number): Promise<Project> {
    try {
      // Используем транзакцию для согласованных операций
      return await db.runTransaction('readwrite', ['projects', 'tasks'], async () => {
        const project = await db.projects.get(id);

        if (!project) {
          throw new Error(`Проект с ID ${id} не найден`);
        }

        // Если прогресс не указан, рассчитываем на основе задач проекта
        if (progress === undefined) {
          const tasks = await taskStorage.getTasksByProject(id);

          if (tasks.length === 0) {
            progress = 0;
          } else {
            // Считаем завершенные задачи
            const completedTasks = tasks.filter(task => task.status === 'done').length;
            progress = Math.round((completedTasks / tasks.length) * 100);
          }
        }

        // Обновляем прогресс
        const updatedProject: Project = {
          ...project,
          progress,
          updatedAt: new Date().toISOString()
        };

        // Сохраняем в БД
        const { id: projectId, ...fieldsToUpdate } = updatedProject;
        await db.projects.update(projectId, fieldsToUpdate);

        // Добавляем в очередь синхронизации
        if (navigator.onLine) {
          await syncService.addToSyncQueue('update', 'project', updatedProject);
        }

        return updatedProject;
      });
    } catch (error) {
      handleDexieError(error, `Ошибка при обновлении прогресса проекта с ID ${id}`);
      throw error;
    }
  }
};