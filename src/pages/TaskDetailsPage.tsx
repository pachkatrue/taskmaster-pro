import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { Task } from '../features/tasks/tasksSlice';
import TaskModal from '../components/modals/TaskModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatDate } from '../utils';

type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done';

/**
 * Страница для детального просмотра задачи
 */
const TaskDetailsPage: React.FC = () => {
  // Получаем ID задачи из URL
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Хуки для работы с задачами и проектами
  const { getTaskById, removeTask, changeTaskStatus } = useTasks();
  const { getProjectById } = useProjects();

  // Состояние для хранения данных задачи
  const [task, setTask] = useState<Task | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Состояние для модальных окон
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Загружаем данные задачи
  useEffect(() => {
    const loadTaskData = async () => {
      if (!taskId) {
        navigate('/tasks');
        return;
      }

      setIsLoading(true);
      try {
        // Получаем задачу по ID
        const taskData = await getTaskById(taskId);

        if (!taskData) {
          navigate('/tasks', { replace: true });
          return;
        }

        setTask(taskData);

        // Если есть связанный проект, получаем его название
        if (taskData.projectId) {
          const project = await getProjectById(taskData.projectId);
          setProjectName(project?.title || 'Неизвестный проект');
        }
      } catch (error) {
        console.error('Ошибка при загрузке задачи:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskData();
  }, [taskId, getTaskById, getProjectById, navigate]);

  // Обработчик изменения статуса задачи
  const handleStatusChange = async (newStatus: 'todo' | 'inProgress' | 'review' | 'done') => {
    if (!task) return;

    try {
      await changeTaskStatus(task.id, newStatus);

      // Обновляем локальное состояние
      setTask({ ...task, status: newStatus });
    } catch (error) {
      console.error('Ошибка при изменении статуса задачи:', error);
    }
  };

  // Обработчик удаления задачи
  const handleDelete = async () => {
    if (!task) return;

    setIsDeleting(true);
    try {
      await removeTask(task.id);
      navigate('/tasks', { replace: true });
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // Обработчик после редактирования задачи
  const handleTaskUpdated = async () => {
    if (!taskId) return;

    // Перезагружаем данные задачи
    const updatedTask = await getTaskById(taskId);
    if (updatedTask) {
      setTask(updatedTask);

      // Если изменился проект, обновляем название проекта
      if (updatedTask.projectId) {
        const project = await getProjectById(updatedTask.projectId);
        setProjectName(project?.title || 'Неизвестный проект');
      } else {
        setProjectName('');
      }
    }

    setIsEditModalOpen(false);
  };

  // Получение имени статуса для отображения
  const getStatusName = (status: string): string => {
    switch (status) {
      case 'todo': return 'К выполнению';
      case 'inProgress': return 'В процессе';
      case 'review': return 'На проверке';
      case 'done': return 'Выполнено';
      default: return status;
    }
  };

  // Получение класса цвета для статуса
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'inProgress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'review': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Получение имени приоритета для отображения
  const getPriorityName = (priority: string): string => {
    switch (priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      default: return priority;
    }
  };

  // Получение класса цвета для приоритета
  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Отображение загрузки
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // Если задача не найдена
  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
          Задача не найдена
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Запрошенная задача не существует или была удалена
        </p>
        <Link to="/tasks" className="btn-primary">
          Вернуться к списку задач
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {task.title}
            </h1>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(task.status)}`}>
              {getStatusName(task.status)}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityClass(task.priority)}`}>
              {getPriorityName(task.priority)}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span>Срок: {formatDate(task.dueDate)}</span>
            {projectName && (
              <span className="ml-3">
                Проект: <Link to={`/projects/${task.projectId}`} className="text-primary hover:underline">{projectName}</Link>
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <button
            className="btn-secondary"
            onClick={() => setIsEditModalOpen(true)}
          >
            Редактировать
          </button>
          <button
            className="btn-danger"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Удалить
          </button>
        </div>
      </div>

      {/* Информация о задаче */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Описание
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              {task.description ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  Описание отсутствует
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Информация
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Статус</p>
                <div className="flex space-x-2">
                  <select
                    className="form-input"
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  >
                    <option value="todo">К выполнению</option>
                    <option value="inProgress">В процессе</option>
                    <option value="review">На проверке</option>
                    <option value="done">Выполнено</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Исполнитель</p>
                <div className="flex items-center">
                  {task.assignee ? (
                    <>
                      {task.assignee.avatar ? (
                        <img
                          src={task.assignee.avatar}
                          alt={task.assignee.name}
                          className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold mr-2">
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-gray-800 dark:text-gray-200">
                        {task.assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400 italic">
                      Не назначен
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Создано</p>
                <p className="text-gray-800 dark:text-gray-200">
                  {formatDate(task.createdAt, 'medium')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Обновлено</p>
                <p className="text-gray-800 dark:text-gray-200">
                  {formatDate(task.updatedAt, 'medium')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Комментарии и активность (заглушка) */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Комментарии и активность
        </h2>
        <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
          Здесь будет отображаться активность по задаче и комментарии
        </p>
      </div>

      {/* Модальное окно редактирования задачи */}
      {isEditModalOpen && (
        <TaskModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          taskId={task.id}
          onSubmit={handleTaskUpdated}
        />
      )}

      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удаление задачи"
        message={`Вы уверены, что хотите удалить задачу "${task.title}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmButtonClass="btn-danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TaskDetailsPage;