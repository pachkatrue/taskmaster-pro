import {useState, useEffect, useRef} from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useTasks } from '../hooks/useTasks';
import TaskModal from '../components/modals/TaskModal';
import TaskCard from '../components/cards/TaskCard';
import { Task, TaskStatus } from '../features/tasks/tasksSlice';

// Типы для DnD
const ItemTypes = {
  TASK: 'task',
};

// Интерфейс для перетаскиваемого элемента
interface DragItem {
  id: string;
  status: TaskStatus;
}

/**
 * Обертка для TaskCard с функциональностью перетаскивания
 */
const DraggableTaskCard: React.FC<{
  task: Task;
  moveTask: (id: string, status: TaskStatus) => void;
}> = ({ task, moveTask }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, status: task.status } as DragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref);

  return (
    <div
      ref={ref}
      className={`${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <TaskCard task={task} moveTask={moveTask} />
    </div>
  );
};

/**
 * Компонент колонки для задач определенного статуса
 */
const TaskColumn: React.FC<{
  status: TaskStatus;
  title: string;
  tasks: Task[];
  moveTask: (id: string, status: TaskStatus) => void;
}> = ({ status, title, tasks, moveTask }) => {
  // Настройка области для приема перетаскиваемых элементов
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: DragItem) => {
      // Если статус разный, перемещаем задачу
      if (item.status !== status) {
        moveTask(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Фильтруем задачи для этой колонки
  const columnTasks = tasks.filter((task) => task.status === status);

  drop(ref);

  return (
    <div
      ref={ref}
      className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[500px] ${
        isOver ? 'bg-gray-200 dark:bg-gray-700' : ''
      }`}
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        {title}
        <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-1 px-2 rounded-full">
          {columnTasks.length}
        </span>
      </h2>
      <div className="space-y-3">
        {columnTasks.map((task) => (
          <div key={task.id} className={isOver ? 'transform scale-105 transition-transform' : ''}>
            <DraggableTaskCard task={task} moveTask={moveTask} />
          </div>
        ))}
        {columnTasks.length === 0 && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-24 flex items-center justify-center">
            Перетащите задачу сюда
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Главная страница задач с канбан-доской
 */
const TasksPage: React.FC = () => {
  // Используем хук для работы с задачами
  const { tasks: reduxTasks, loadTasks, changeTaskStatus } = useTasks();

  // Состояние для управления модальным окном создания задачи
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Состояние для поисковой строки и фильтров
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем задачи при монтировании компонента
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        await loadTasks();
      } catch (error) {
        console.error('Ошибка при загрузке задач:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [loadTasks]);

  // Защитная проверка на существование задач
  const safeTasks = Array.isArray(reduxTasks) ? reduxTasks : [];

  // Фильтрация задач - добавляем проверки на null/undefined
  const filteredTasks = safeTasks.filter(task => {
    // Фильтр по поисковой строке
    if (searchQuery && task.title && task.description &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Фильтр по проекту
    if (projectFilter && task.projectId !== projectFilter) {
      return false;
    }

    // Фильтр по приоритету
    if (priorityFilter && task.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  // Обработчик перемещения задачи
  const moveTask = (id: string, newStatus: TaskStatus) => {
    // Обновляем статус задачи в Redux
    changeTaskStatus(id, newStatus);
  };

  // Обработчик после успешного создания/редактирования задачи
  const handleTaskSuccess = () => {
    // Обновляем список задач после успешного создания или редактирования
    loadTasks();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Задачи
        </h1>
        <div className="space-x-2">
          <button
            className="btn-primary"
            onClick={() => setIsTaskModalOpen(true)}
          >
            Новая задача
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
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <select
            className="form-input w-40"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          >
            <option value="">Все проекты</option>
            <option value="1">Веб-сайт</option>
            <option value="2">Мобильное приложение</option>
            <option value="3">Внутренний инструмент</option>
          </select>
          <select
            className="form-input w-40"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
      </div>

      {/* Индикатор загрузки */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        /* Канбан-доска */
        <DndProvider backend={HTML5Backend}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <TaskColumn
              status="todo"
              title="К выполнению"
              tasks={filteredTasks}
              moveTask={moveTask}
            />
            <TaskColumn
              status="inProgress"
              title="В процессе"
              tasks={filteredTasks}
              moveTask={moveTask}
            />
            <TaskColumn
              status="review"
              title="На проверке"
              tasks={filteredTasks}
              moveTask={moveTask}
            />
            <TaskColumn
              status="done"
              title="Выполнено"
              tasks={filteredTasks}
              moveTask={moveTask}
            />
          </div>
        </DndProvider>
      )}

      {/* Модальное окно создания/редактирования задачи */}
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

export default TasksPage;