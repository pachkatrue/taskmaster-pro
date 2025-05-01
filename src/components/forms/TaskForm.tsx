import React, { useState, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { TaskPriority, TaskStatus } from '../../features/tasks/tasksSlice';

interface TaskFormProps {
  taskId?: string; // Если указан, значит это редактирование существующей задачи
  initialData?: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    projectId?: string;
    assigneeId?: string;
  };
  projectId?: string; // Если создаем задачу из проекта, этот ID будет заполнен
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Компонент формы для создания и редактирования задач
 * Используется как в модальном окне, так и на отдельной странице
 */
const TaskForm: React.FC<TaskFormProps> = ({
                                             taskId,
                                             initialData,
                                             projectId,
                                             onSubmit,
                                             onCancel
                                           }) => {
  // Получаем данные из хуков
  const { projects, loadProjects } = useProjects();
  const { addTask, editTask, getTaskById } = useTasks();

  // Состояние формы
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    projectId?: string;
    assigneeId?: string;
  }>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    projectId: projectId,
    assigneeId: '',
  });

  // Состояние ошибок валидации
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Загружаем данные при монтировании
  useEffect(() => {
    const loadInitialData = async () => {
      // Загружаем проекты, если их еще нет
      if (projects.length === 0) {
        await loadProjects();
      }

      // Если это редактирование, загружаем данные задачи
      if (taskId) {
        const task = getTaskById(taskId);
        if (task) {
          setFormData({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: new Date(task.dueDate).toISOString().split('T')[0],
            projectId: task.projectId || '',
            assigneeId: task.assigneeId || '',
          });
        }
      }
      // Если переданы начальные данные, используем их
      else if (initialData) {
        setFormData(initialData);
      }
    };

    loadInitialData();
  }, [taskId, initialData, projectId, loadProjects, projects.length, getTaskById]);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название задачи обязательно';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Дата выполнения обязательна';
    } else {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        newErrors.dueDate = 'Неверный формат даты';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверяем валидность
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (taskId) {
        // Редактирование существующей задачи
        await editTask({
          id: taskId,
          ...formData,
        });
      } else {
        // Создание новой задачи
        await addTask(formData);
      }

      // Вызываем колбэк успешного завершения
      onSubmit();
    } catch (error) {
      console.error('Ошибка при сохранении задачи:', error);
      setErrors({ submit: 'Произошла ошибка при сохранении задачи' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="form-label">
          Название задачи*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={`form-input ${errors.title ? 'border-red-500' : ''}`}
          value={formData.title}
          onChange={handleChange}
          placeholder="Введите название задачи"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="form-input"
          value={formData.description}
          onChange={handleChange}
          placeholder="Введите описание задачи"
          disabled={isLoading}
        ></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="form-label">
            Статус
          </label>
          <select
            id="status"
            name="status"
            className="form-input"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="todo">К выполнению</option>
            <option value="inProgress">В процессе</option>
            <option value="review">На проверке</option>
            <option value="done">Выполнено</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="form-label">
            Приоритет
          </label>
          <select
            id="priority"
            name="priority"
            className="form-input"
            value={formData.priority}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="form-label">
            Срок выполнения*
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            className={`form-input ${errors.dueDate ? 'border-red-500' : ''}`}
            value={formData.dueDate}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectId" className="form-label">
            Проект
          </label>
          <select
            id="projectId"
            name="projectId"
            className="form-input"
            value={formData.projectId}
            onChange={handleChange}
            disabled={isLoading || !!projectId} // Блокируем, если проект задан извне
          >
            <option value="">Без проекта</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Блок для выбора исполнителя задачи: в реальном проекте тут должен быть компонент выбора пользователя */}
      {/* <div>
        <label htmlFor="assigneeId" className="form-label">
          Исполнитель
        </label>
        <select
          id="assigneeId"
          name="assigneeId"
          className="form-input"
          value={formData.assigneeId}
          onChange={handleChange}
          disabled={isLoading}
        >
          <option value="">Не назначен</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </select>
      </div> */}

      {errors.submit && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {errors.submit}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Сохранение...
            </>
          ) : (
            taskId ? 'Сохранить изменения' : 'Создать задачу'
          )}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;