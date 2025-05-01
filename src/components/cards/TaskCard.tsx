import React from 'react';
import { Link } from 'react-router-dom';
import { Task } from '../../features/tasks/tasksSlice'; // Импортируем тип Task
import type { TaskStatus } from '../../features/tasks/tasksSlice';

/**
 * Компонент карточки задачи для отображения в канбан-доске
 */
const TaskCard: React.FC<{
  task: Task; // Заменяем any на конкретный тип Task
  moveTask: (id: string, status: TaskStatus) => void;
}> = ({ task }) => {
  // Определяем цвет для приоритета
  const priorityColor = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }[task.priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

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
    <div className="card mb-3 cursor-move bg-white dark:bg-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          {task.title}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColor}`}
        >
          {task.priority === 'low' ? 'Низкий' : task.priority === 'medium' ? 'Средний' : 'Высокий'}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {task.description}
      </p>
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Срок: {task.dueDate ? formatDate(task.dueDate) : 'Не указан'}
        </div>
        <div className="flex items-center">
          {task.assignee && task.assignee.avatar && (
            <img
              className="w-6 h-6 rounded-full"
              src={task.assignee.avatar}
              alt={task.assignee.name || "Исполнитель"}
            />
          )}
          {task.assignee && task.assignee.name && (
            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
              {task.assignee.name}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
        <Link
          to={`/tasks/${task.id}`}
          className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          Подробнее
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;