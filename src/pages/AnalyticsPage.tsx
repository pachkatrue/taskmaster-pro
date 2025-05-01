import { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import ProjectProgressChart from '../features/analytics/ProjectProgressChart';
import TaskStatusChart from '../features/analytics/TaskStatusChart';
import WeeklyActivityChart from '../features/analytics/WeeklyActivityChart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/**
 * Типы для периодов аналитики
 */
type AnalyticsPeriod = 'week' | 'month' | 'quarter';

interface PerformanceData {
  name: string;
  производительность: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
}

/**
 * Страница аналитики с различными графиками и диаграммами
 */
const AnalyticsPage: React.FC = () => {
  // Временной диапазон для отображения аналитики
  const [timeRange, setTimeRange] = useState<AnalyticsPeriod>('month');
  const [isLoading, setIsLoading] = useState(true);

  // Заготовки данных для разных периодов
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [summary, setSummary] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalProjects: 0,
    activeProjects: 0,
    teamMembers: 5 // Моковое значение
  });

  // Получаем данные из хуков
  const { projects, loadProjects } = useProjects();
  const { tasks, loadTasks } = useTasks();

  // Загружаем данные при монтировании
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Параллельно загружаем проекты и задачи
        await Promise.all([
          loadProjects(),
          loadTasks()
        ]);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [loadProjects, loadTasks]);

  // Обновляем данные при изменении временного диапазона или загрузке новых данных
  useEffect(() => {
    if (isLoading) return;

    // Обновляем сводные данные
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => project.status === 'active').length;

    setSummary({
      totalTasks,
      completedTasks,
      totalProjects,
      activeProjects,
      teamMembers: 5 // Моковое значение
    });

    // Генерируем данные для графика производительности в зависимости от выбранного периода
    generatePerformanceData(timeRange);

  }, [timeRange, tasks, projects, isLoading]);

  /**
   * Генерирует данные для графика производительности команды
   * в зависимости от выбранного периода времени
   */
  const generatePerformanceData = (period: AnalyticsPeriod) => {
    let data = [];

    switch(period) {
      case 'week':
        data = [
          { name: 'Понедельник', производительность: 75 },
          { name: 'Вторник', производительность: 82 },
          { name: 'Среда', производительность: 68 },
          { name: 'Четверг', производительность: 79 },
          { name: 'Пятница', производительность: 85 },
          { name: 'Суббота', производительность: 50 },
          { name: 'Воскресенье', производительность: 40 },
        ];
        break;

      case 'month':
        data = [
          { name: 'Неделя 1', производительность: 65 },
          { name: 'Неделя 2', производительность: 75 },
          { name: 'Неделя 3', производительность: 70 },
          { name: 'Неделя 4', производительность: 85 },
        ];
        break;

      case 'quarter':
        data = [
          { name: 'Январь', производительность: 65 },
          { name: 'Февраль', производительность: 72 },
          { name: 'Март', производительность: 78 },
          { name: 'Апрель', производительность: 69 },
          { name: 'Май', производительность: 85 },
          { name: 'Июнь', производительность: 80 },
        ];
        break;
    }

    setPerformanceData(data);
  };

  // Кастомный тултип для графика производительности
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{label}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Производительность: {payload[0].value}%
          </p>
        </div>
      );
    }

    return null;
  };

  // Получение заголовка периода
  const getPeriodTitle = (period: AnalyticsPeriod) => {
    switch(period) {
      case 'week': return 'за неделю';
      case 'month': return 'за месяц';
      case 'quarter': return 'за квартал';
      default: return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Аналитика {getPeriodTitle(timeRange)}
        </h1>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded-md ${timeRange === 'week'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setTimeRange('week')}
          >
            Неделя
          </button>
          <button
            className={`px-3 py-1 rounded-md ${timeRange === 'month'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setTimeRange('month')}
          >
            Месяц
          </button>
          <button
            className={`px-3 py-1 rounded-md ${timeRange === 'quarter'
              ? 'bg-primary text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            onClick={() => setTimeRange('quarter')}
          >
            Квартал
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Сводная карточка - общая статистика */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Общая статистика {getPeriodTitle(timeRange)}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                  <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{summary.totalTasks}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Всего задач</span>
                </div>
                <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.completedTasks}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Выполнено</span>
                </div>
                <div className="flex flex-col items-center bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{summary.totalProjects}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Проектов</span>
                </div>
                <div className="flex flex-col items-center bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.teamMembers}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Участников</span>
                </div>
              </div>
            </div>

            {/* Диаграмма распределения задач по статусам */}
            <TaskStatusChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* График активности за выбранный период */}
            <WeeklyActivityChart period={timeRange} />

            {/* График производительности команды */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Производительность команды {getPeriodTitle(timeRange)}
              </h2>
              <div className="mt-4" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="производительность"
                      name="Производительность"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Статус проектов */}
          <div className="mb-6">
            <ProjectProgressChart />
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;