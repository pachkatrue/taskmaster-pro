import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';
import { TaskPriority, TaskStatus } from '../../features/tasks/tasksSlice';
import { dbService } from '../../services/storage/dbService';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

/**
 * Компонент модального окна для создания новой задачи
 */
const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, projectId }) => {
  const { projects } = useProjects();
  const { addTask } = useTasks();

  // Начальное состояние формы
  const initialState = {
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: new Date(
      new Date().setDate(new Date().getDate() + 7)
    ).toISOString().split('T')[0], // Дефолтный срок - через неделю
    projectId: projectId || '',
    assigneeId: '',
  };

  // Состояние формы
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  // Сброс формы
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
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
      // Проверяем, находимся ли мы в демо-режиме
      const session = await dbService.getCurrentSession();
      const isDemo = session?.provider === 'demo' || localStorage.getItem('demo_mode') === 'true';

      // Получаем данные об исполнителе, если он выбран
      const assignee = undefined;
      if (formData.assigneeId) {
        // Здесь можно добавить логику для получения данных об исполнителе
        // Например, через API или из Redux-состояния
      }

      // Создаем новую задачу
      await addTask({
        ...formData,
        assignee,
        demoData: isDemo, // Добавляем флаг демо-данных
        createdBy: session?.userId || 'unknown' // Добавляем создателя
      });

      // Закрываем модальное окно и сбрасываем форму
      resetForm();
      onClose();
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      setErrors({ submit: 'Произошла ошибка при создании задачи' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создание новой задачи"
      size="lg"
    >
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

        {errors.submit && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              resetForm();
              onClose();
            }}
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
                Создание...
              </>
            ) : (
              'Создать задачу'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewTaskModal;