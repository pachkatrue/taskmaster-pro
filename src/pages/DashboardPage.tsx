import React, { useState, useEffect } from "react";
import TaskModal from '../components/modals/TaskModal';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { Task } from '../features/tasks/tasksSlice';

/**
 * Главная страница дашборда
 * Показывает сводку по задачам, проектам и аналитике
 */
const DashboardPage: React.FC = () => {
  // Состояние для управления модальным окном создания задачи
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Получаем данные о задачах и проектах
  const { tasks, loadTasks, isLoading: tasksLoading } = useTasks();
  const { projects, loadProjects, isLoading: projectsLoading } = useProjects();

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadTasks(),
          loadProjects()
        ]);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadTasks, loadProjects]);

  // Обработчик после успешного создания задачи
  const handleTaskSuccess = () => {
    // Обновляем список задач
    loadTasks();
  };

  // Безопасно расчитываем статистику, проверяя наличие данных
  const activeTasks = tasks ? tasks.filter(task =>
    task.status === 'inProgress' || task.status === 'review').length : 0;

  const completedTasks = tasks ? tasks.filter(task =>
    task.status === 'done').length : 0;

  const activeProjects = projects ? projects.filter(project =>
    project.status === 'active').length : 0;

  // Задачи с ближайшими сроками
  const upcomingDeadlines = tasks
    ? tasks.filter(task => {
      // Проверяем, что задача существует и имеет корректную дату
      if (!task || !task.dueDate) return false;

      // Проверяем, что задача не выполнена и её срок не прошел
      const dueDate = new Date(task.dueDate);
      return task.status !== 'done' && dueDate > new Date();
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3).length
    : 0;

  // Последние задачи для таблицы (возьмем 3 последние созданные/обновленные задачи)
  const recentTasks = tasks
    ? tasks
    .filter(task => task && task.updatedAt) // Убедимся, что у задач есть дата обновления
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
    : [];

  // Получение имени проекта по ID
  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Без проекта';
    if (!projects) return 'Загрузка проектов...';

    const project = projects.find(p => p.id === projectId);
    return project ? project.title : 'Неизвестный проект';
  };

  // Получение статуса задачи для отображения
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'todo':
        return {
          text: 'К выполнению',
          className: 'text-blue-700 bg-blue-100 dark:bg-blue-700 dark:text-blue-100'
        };
      case 'inProgress':
        return {
          text: 'В процессе',
          className: 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100'
        };
      case 'review':
        return {
          text: 'На проверке',
          className: 'text-orange-700 bg-orange-100 dark:bg-orange-600 dark:text-orange-100'
        };
      case 'done':
        return {
          text: 'Выполнено',
          className: 'text-purple-700 bg-purple-100 dark:bg-purple-700 dark:text-purple-100'
        };
      default:
        return {
          text: 'Неизвестно',
          className: 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-100'
        };
    }
  };

  // Форматирование даты
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Некорректная дата';
      return date.toLocaleDateString('ru-RU');
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Ошибка даты';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Дашборд
        </h1>
        <div className="space-x-2">
          <button
            className="btn-primary"
            onClick={() => setIsTaskModalOpen(true)}
          >
            Создать задачу
          </button>
        </div>
      </div>

      {isLoading || tasksLoading || projectsLoading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
          {/* Статистические карточки */}
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Активные задачи
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {activeTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-5 h-5 text-green-500 dark:text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Завершенные задачи
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {completedTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-5 h-5 text-purple-500 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
                </svg>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Активные проекты
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {activeProjects}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 mr-4 bg-orange-100 dark:bg-orange-900 rounded-full">
                <svg className="w-5 h-5 text-orange-500 dark:text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ближайшие сроки
                </p>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                  {upcomingDeadlines}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Недавние задачи */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Недавние задачи
        </h2>
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3">Задача</th>
                <th className="px-4 py-3">Проект</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3">Статус</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {recentTasks && recentTasks.length > 0 ? (
                recentTasks.map((task: Task) => (
                  <tr key={task.id} className="text-gray-700 dark:text-gray-400">
                    <td className="px-4 py-3">
                      <div className="flex items-center text-sm">
                        <div>
                          <p className="font-semibold">{task.title}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {task.description && task.description.length > 50
                              ? `${task.description.substring(0, 50)}...`
                              : task.description || 'Нет описания'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getProjectName(task.projectId)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {task.dueDate ? formatDate(task.dueDate) : 'Не указан'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusDisplay(task.status).className}`}>
                          {getStatusDisplay(task.status).text}
                        </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    {isLoading ? 'Загрузка задач...' : 'Нет недавних задач'}
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальное окно создания задачи */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleTaskSuccess}
        />
      )}
    </div>
  );
};

export default DashboardPage;