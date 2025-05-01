import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { Project } from '../features/projects/projectsSlice';

/**
 * Детальная страница проекта
 * Показывает информацию о проекте и список задач
 */
const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { tasks, loadTasks, isLoading, removeTask } = useTasks();
  const { loadProject } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    setIsProjectLoading(true);
    loadProject(projectId)
    .unwrap()
    .then(setProject)
    .catch(() => navigate('/projects'))
    .finally(() => setIsProjectLoading(false));

    return () => {
      setProject(null);
    };
  }, [projectId, loadProject, navigate]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!location.pathname.startsWith('/projects/')) {
      setProject(null);
    }
  }, [location.pathname]);

  const projectTasks = useMemo(() => {
    if (!projectId) return [];
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks, projectId]);

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Удалить задачу?')) {
      await removeTask(taskId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return 'text-blue-700 bg-blue-100 dark:bg-blue-700 dark:text-blue-100';
      case 'inProgress':
        return 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100';
      case 'review':
        return 'text-orange-700 bg-orange-100 dark:bg-orange-600 dark:text-orange-100';
      case 'done':
        return 'text-purple-700 bg-purple-100 dark:bg-purple-700 dark:text-purple-100';
      default:
        return 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  if (isProjectLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Загрузка проекта...</p>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-2">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {project.title}
          </h1>
          <span className="px-2 py-1 text-xs font-semibold leading-tight rounded-full text-white"
                style={{ backgroundColor: project.status === 'active' ? '#22c55e' : project.status === 'planning' ? '#eab308' : project.status === 'onHold' ? '#f97316' : '#3b82f6' }}>
            {project.status === 'active' ? 'Активный' :
              project.status === 'planning' ? 'Планирование' :
                project.status === 'onHold' ? 'На паузе' :
                  'Завершен'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {project.description} ID: {project.id}
        </p>
      </div>

      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Информация о проекте */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Информация о проекте
          </h2>
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Дата начала</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {new Date(project.startDate).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Дедлайн</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {new Date(project.endDate).toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Статус</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {project.status === 'active' ? 'Активный' :
                project.status === 'planning' ? 'Планирование' :
                  project.status === 'onHold' ? 'На паузе' :
                    'Завершен'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Команда</p>
            <div className="flex">
              <div className="flex -space-x-2">
                {project.teamMembers.map((member) => (
                  <img
                    key={member.id}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                    src={member.avatar || 'https://via.placeholder.com/40'}
                    alt={member.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Прогресс */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Прогресс
          </h2>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 dark:text-gray-300">Общий прогресс</span>
              <span className="text-gray-700 dark:text-gray-300">{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Задачи проекта */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Задачи проекта
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : projectTasks.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Задачи не найдены для этого проекта.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
              <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
                <th className="px-4 py-3">Задача</th>
                <th className="px-4 py-3">Описание</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Срок</th>
                <th className="px-4 py-3 text-right">Действия</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
              {projectTasks.map(task => (
                <tr key={task.id} className="text-gray-700 dark:text-gray-400">
                  <td className="px-4 py-3 font-medium">{task.title}</td>
                  <td className="px-4 py-3 text-sm">{task.description || 'Нет описания'}</td>
                  <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('ru-RU') : 'Не указан'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      className="btn-icon btn-sm text-blue-500 hover:text-blue-700"
                      title="Просмотр"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      className="btn-icon btn-sm text-red-500 hover:text-red-700"
                      title="Удалить"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
