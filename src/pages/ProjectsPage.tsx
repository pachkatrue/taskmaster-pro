import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import NewProjectModal from '../components/common/NewProjectModal';
import { motion } from 'framer-motion';

/**
 * Страница со списком проектов
 */
const ProjectsPage: React.FC = () => {
  // Используем хук для работы с проектами
  const { projects, loadProjects } = useProjects();

  // Состояние для модального окна создания проекта
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Состояние для поисковой строки и фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем проекты при монтировании компонента
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      await loadProjects();
      setIsLoading(false);
    };

    fetchProjects();
  }, [loadProjects]);

  // Фильтрация проектов
  const filteredProjects = projects.filter(project => {
    // Фильтр по поисковой строке
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !project.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по статусу
    if (statusFilter && project.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Анимация для карточек проектов
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Проекты
        </h1>
        <div className="space-x-2">
          <button
            className="btn-primary"
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            Новый проект
          </button>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="search"
              className="form-input pl-10"
              placeholder="Поиск проектов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="form-input w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Все статусы</option>
            <option value="planning">Планирование</option>
            <option value="active">Активный</option>
            <option value="onHold">На паузе</option>
            <option value="completed">Завершен</option>
          </select>
        </div>
      </div>

      {/* Список проектов */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredProjects.length > 0 ? (
        <motion.div
          className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProjects.map(project => (
            <motion.div
              key={project.id}
              className="card hover:shadow-lg transition-shadow"
              variants={itemVariants}
            >
              <div className="flex justify-between mb-4">
                <div className="text-sm font-medium">
                  <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${
                    project.status === 'planning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' :
                      project.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100' :
                        project.status === 'onHold' ? 'bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100'
                  }`}>
                    {project.status === 'planning' ? 'Планирование' :
                      project.status === 'active' ? 'Активный' :
                        project.status === 'onHold' ? 'На паузе' :
                          'Завершен'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Создан: {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {project.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Прогресс: </span>
                  <span>{project.progress}%</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Дедлайн: </span>
                  <span>{new Date(project.endDate).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-4">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.teamMembers.slice(0, 3).map((member) => (
                    <img
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      src={member.avatar}
                      alt={member.name}
                    />
                  ))}
                  {project.teamMembers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      +{project.teamMembers.length - 3}
                    </div>
                  )}
                </div>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  Подробнее
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Проекты не найдены
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter ?
              'Попробуйте изменить параметры поиска' :
              'Создайте новый проект, чтобы начать работу'}
          </p>
          <button
            className="btn-primary"
            onClick={() => setIsNewProjectModalOpen(true)}
          >
            Создать проект
          </button>
        </div>
      )}

      {/* Модальное окно создания проекта */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};

export default ProjectsPage;