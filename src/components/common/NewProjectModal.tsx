import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { useProjects } from '../../hooks/useProjects';
import { ProjectStatus } from '../../features/projects/projectsSlice';
import { dbService } from '../../services/storage/dbService';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Компонент модального окна для создания нового проекта
 */
const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject } = useProjects();

  // Моковые данные для команды проекта
  const teamMembers = [
    {
      id: '1',
      name: 'Иван Иванов',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
    },
    {
      id: '2',
      name: 'Екатерина Смирнова',
      avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    },
    {
      id: '3',
      name: 'Михаил Петров',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80',
    },
    {
      id: '4',
      name: 'Анна Козлова',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=100&h=100&q=80',
    },
  ];

  // Начальное состояние формы
  const initialState = {
    title: '',
    description: '',
    status: 'planning' as ProjectStatus,
    progress: 0,
    startDate: new Date().toISOString().split('T')[0], // Сегодня
    endDate: new Date(
      new Date().setMonth(new Date().getMonth() + 1)
    ).toISOString().split('T')[0], // Через месяц
    selectedTeamMembers: [] as string[], // ID выбранных участников
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

  // Обработчик выбора участников команды
  const handleTeamMemberToggle = (memberId: string) => {
    setFormData(prev => {
      const isSelected = prev.selectedTeamMembers.includes(memberId);

      if (isSelected) {
        // Удаляем участника из выбранных
        return {
          ...prev,
          selectedTeamMembers: prev.selectedTeamMembers.filter(id => id !== memberId)
        };
      } else {
        // Добавляем участника в выбранные
        return {
          ...prev,
          selectedTeamMembers: [...prev.selectedTeamMembers, memberId]
        };
      }
    });
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название проекта обязательно';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Дата начала обязательна';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Дата окончания обязательна';
    }

    // Проверка, что дата окончания не раньше даты начала
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      if (end < start) {
        newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
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

      // Подготавливаем данные для создания проекта
      const selectedMembers = teamMembers.filter(member =>
        formData.selectedTeamMembers.includes(member.id)
      );

      // Создаем новый проект
      await addProject({
        title: formData.title,
        description: formData.description,
        status: formData.status,
        progress: Number(formData.progress),
        startDate: formData.startDate,
        endDate: formData.endDate,
        teamMembers: selectedMembers,
        demoData: isDemo, // Добавляем флаг демо-данных
        createdBy: session?.userId || 'unknown' // Добавляем создателя
      });

      // Закрываем модальное окно и сбрасываем форму
      resetForm();
      onClose();
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
      setErrors({ submit: 'Произошла ошибка при создании проекта' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создание нового проекта"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="form-label">
            Название проекта*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className={`form-input ${errors.title ? 'border-red-500' : ''}`}
            value={formData.title}
            onChange={handleChange}
            placeholder="Введите название проекта"
            disabled={isLoading}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Описание проекта
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="form-input"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите описание проекта"
            disabled={isLoading}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="form-label">
              Статус проекта
            </label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={formData.status}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="planning">Планирование</option>
              <option value="active">Активный</option>
              <option value="onHold">На паузе</option>
              <option value="completed">Завершен</option>
            </select>
          </div>

          <div>
            <label htmlFor="progress" className="form-label">
              Прогресс (%)
            </label>
            <input
              type="number"
              id="progress"
              name="progress"
              min="0"
              max="100"
              className="form-input"
              value={formData.progress}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="startDate" className="form-label">
              Дата начала*
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className={`form-input ${errors.startDate ? 'border-red-500' : ''}`}
              value={formData.startDate}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="form-label">
              Дата окончания*
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className={`form-input ${errors.endDate ? 'border-red-500' : ''}`}
              value={formData.endDate}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="form-label">
            Участники проекта
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {teamMembers.map(member => (
              <div
                key={member.id}
                className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.selectedTeamMembers.includes(member.id)
                    ? 'border-primary bg-primary-light/10 dark:bg-primary-dark/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => handleTeamMemberToggle(member.id)}
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover mb-2"
                />
                <span className="text-sm font-medium text-center">{member.name}</span>
              </div>
            ))}
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
              'Создать проект'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NewProjectModal;