import React from 'react';
import Modal from '../ui/Modal';
import TaskForm from '../forms/TaskForm';
import { TaskPriority, TaskStatus } from '../../features/tasks/tasksSlice';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string; // Если указан, значит это редактирование
  projectId?: string; // Если указан, значит создаем задачу в рамках проекта
  onSubmit: () => void; // Коллбэк после успешного сохранения
  initialData?: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
    projectId?: string;
    assigneeId?: string;
  };
}

/**
 * Модальное окно для создания и редактирования задач
 * Инкапсулирует модальное окно и форму задачи
 */
const TaskModal: React.FC<TaskModalProps> = ({
                                               isOpen,
                                               onClose,
                                               taskId,
                                               projectId,
                                               onSubmit,
                                               initialData
                                             }) => {
  // Обработчик успешного сохранения
  const handleSubmitSuccess = () => {
    onSubmit();
    onClose();
  };

  // Определяем заголовок в зависимости от режима (создание или редактирование)
  const title = taskId ? 'Редактирование задачи' : 'Создание новой задачи';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <TaskForm
        taskId={taskId}
        initialData={initialData}
        projectId={projectId}
        onSubmit={handleSubmitSuccess}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default TaskModal;