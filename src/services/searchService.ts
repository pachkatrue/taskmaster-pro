import { taskStorage } from './storage/taskStorage';
import { projectStorage } from './storage/projectStorage';
import { Task } from '../features/tasks/tasksSlice';
import { Project } from '../features/projects/projectsSlice';

/**
 * Интерфейсы для результатов поиска
 */
export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  type: 'task' | 'project';
  status: string;
  link: string;
  priority?: string;
  dueDate?: string;
  projectId?: string;
  projectTitle?: string;
}

export interface SearchResults {
  items: SearchResultItem[];
  totalCount: number;
  taskCount: number;
  projectCount: number;
}

/**
 * Сервис для глобального поиска по приложению
 */
export const searchService = {
  /**
   * Выполнить поиск по всему приложению
   * @param query Поисковый запрос
   * @param limit Максимальное количество результатов (по умолчанию 20)
   */
  async search(query: string, limit: number = 20): Promise<SearchResults> {
    try {
      if (!query.trim()) {
        return { items: [], totalCount: 0, taskCount: 0, projectCount: 0 };
      }

      // Получаем результаты поиска по задачам и проектам параллельно
      const [tasks, projects] = await Promise.all([
        taskStorage.searchTasks(query),
        projectStorage.searchProjects(query)
      ]);

      // Считаем общее количество результатов
      const totalCount = tasks.length + projects.length;

      // Преобразуем задачи в формат результатов поиска
      const taskResults = tasks.map((task: Task): SearchResultItem => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'task',
        status: task.status,
        // Обновляем ссылку на задачу, чтобы вести на страницу деталей
        link: `/tasks/${task.id}`,
        priority: task.priority,
        dueDate: task.dueDate,
        projectId: task.projectId,
        projectTitle: undefined // Заполним позже, если проект есть
      }));

      // Преобразуем проекты в формат результатов поиска
      const projectResults = projects.map((project: Project): SearchResultItem => ({
        id: project.id,
        title: project.title,
        description: project.description,
        type: 'project',
        status: project.status,
        link: `/projects/${project.id}`,
      }));

      // Если у задачи есть проект, добавляем название проекта
      for (const taskResult of taskResults) {
        if (taskResult.projectId) {
          const project = projects.find((p) => p.id === taskResult.projectId);
          if (project) {
            taskResult.projectTitle = project.title;
          } else {
            // Если проект не найден в результатах поиска, пробуем найти его отдельно
            const projectFromStorage = await projectStorage.getProjectById(taskResult.projectId);
            if (projectFromStorage) {
              taskResult.projectTitle = projectFromStorage.title;
            }
          }
        }
      }

      // Объединяем результаты с сортировкой по релевантности
      // В простейшем случае просто соединяем массивы, но можно реализовать более сложную логику
      // На практике задачи обычно важнее проектов, поэтому помещаем их первыми
      const allResults = [...taskResults, ...projectResults];

      // Сортируем по релевантности (упрощенно - по вхождению запроса в название)
      allResults.sort((a, b) => {
        const queryLower = query.toLowerCase();
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        // Если точное совпадение с началом строки, такие результаты показываем первыми
        const aStartsWithQuery = aTitle.startsWith(queryLower);
        const bStartsWithQuery = bTitle.startsWith(queryLower);

        if (aStartsWithQuery && !bStartsWithQuery) return -1;
        if (!aStartsWithQuery && bStartsWithQuery) return 1;

        // Затем сортируем по вхождению в любом месте названия
        const aContainsQuery = aTitle.includes(queryLower);
        const bContainsQuery = bTitle.includes(queryLower);

        if (aContainsQuery && !bContainsQuery) return -1;
        if (!aContainsQuery && bContainsQuery) return 1;

        // Если совпадение в обоих, сортируем по типу (сначала задачи)
        if (a.type === 'task' && b.type === 'project') return -1;
        if (a.type === 'project' && b.type === 'task') return 1;

        // Если тип одинаковый, сортируем по алфавиту
        return aTitle.localeCompare(bTitle);
      });

      // Ограничиваем количество результатов
      const limitedResults = allResults.slice(0, limit);

      return {
        items: limitedResults,
        totalCount,
        taskCount: tasks.length,
        projectCount: projects.length
      };
    } catch (error) {
      console.error('Ошибка при выполнении поиска:', error);
      return { items: [], totalCount: 0, taskCount: 0, projectCount: 0 };
    }
  },

  /**
   * Выполнить поиск только по задачам
   * @param query Поисковый запрос
   */
  async searchTasks(query: string): Promise<Task[]> {
    return taskStorage.searchTasks(query);
  },

  /**
   * Выполнить поиск только по проектам
   * @param query Поисковый запрос
   */
  async searchProjects(query: string): Promise<Project[]> {
    return projectStorage.searchProjects(query);
  },

  /**
   * Форматирует описание задачи или проекта для отображения
   * в результатах поиска (обрезает длинные описания)
   */
  formatDescription(description?: string, maxLength: number = 100): string {
    if (!description) return '';

    if (description.length <= maxLength) {
      return description;
    }

    return description.substring(0, maxLength) + '...';
  }
};

export default searchService;