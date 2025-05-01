import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTasks } from '../../hooks/useTasks';

/**
 * Тип для периода аналитики
 */
type AnalyticsPeriod = 'week' | 'month' | 'quarter';

interface WeeklyActivityChartProps {
  period?: AnalyticsPeriod;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
  }>;
  label?: string;
}

/**
 * Компонент для визуализации активности по дням недели или другим временным периодам
 * Отображает созданные и завершенные задачи в виде столбчатой диаграммы
 */
const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ period = 'week' }) => {
  // Получаем данные о задачах
  const { tasks, loadTasks } = useTasks();

  // Состояние для хранения данных диаграммы
  const [chartData, setChartData] = useState<Array<{ name: string; созданные: number; завершенные: number }>>([]);

  // Заголовок в зависимости от выбранного периода
  const getChartTitle = () => {
    switch(period) {
      case 'week': return 'Активность за неделю';
      case 'month': return 'Активность за месяц';
      case 'quarter': return 'Активность за квартал';
      default: return 'Активность';
    }
  };

  // Загружаем задачи при монтировании компонента
  useEffect(() => {
    const fetchTasks = async () => {
      if (tasks.length === 0) {
        await loadTasks();
      }
    };

    fetchTasks();
  }, [loadTasks, tasks.length]);

  // Подготавливаем данные для диаграммы в зависимости от выбранного периода
  useEffect(() => {
    let data;

    switch(period) {
      case 'week':
        // Названия дней недели
        data = [
          { name: 'Пн', созданные: 5, завершенные: 3 },
          { name: 'Вт', созданные: 8, завершенные: 5 },
          { name: 'Ср', созданные: 6, завершенные: 6 },
          { name: 'Чт', созданные: 10, завершенные: 7 },
          { name: 'Пт', созданные: 7, завершенные: 4 },
          { name: 'Сб', созданные: 3, завершенные: 3 },
          { name: 'Вс', созданные: 2, завершенные: 1 },
        ];
        break;

      case 'month':
        // Данные по неделям месяца
        data = [
          { name: 'Неделя 1', созданные: 22, завершенные: 18 },
          { name: 'Неделя 2', созданные: 28, завершенные: 24 },
          { name: 'Неделя 3', созданные: 32, завершенные: 27 },
          { name: 'Неделя 4', созданные: 25, завершенные: 20 },
        ];
        break;

      case 'quarter':
        // Данные по месяцам квартала
        data = [
          { name: 'Январь', созданные: 85, завершенные: 75 },
          { name: 'Февраль', созданные: 95, завершенные: 85 },
          { name: 'Март', созданные: 120, завершенные: 100 },
          { name: 'Апрель', созданные: 105, завершенные: 95 },
          { name: 'Май', созданные: 88, завершенные: 82 },
          { name: 'Июнь', созданные: 93, завершенные: 87 },
        ];
        break;

      default:
        data = [
          { name: 'Пн', созданные: 5, завершенные: 3 },
          { name: 'Вт', созданные: 8, завершенные: 5 },
          { name: 'Ср', созданные: 6, завершенные: 6 },
          { name: 'Чт', созданные: 10, завершенные: 7 },
          { name: 'Пт', созданные: 7, завершенные: 4 },
          { name: 'Сб', созданные: 3, завершенные: 3 },
          { name: 'Вс', созданные: 2, завершенные: 1 },
        ];
    }

    // В реальном приложении здесь бы была логика анализа задач по датам
    setChartData(data);
  }, [tasks, period]);

  // Кастомный тултип для диаграммы
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Созданные: {payload[0].value}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Завершенные: {payload[1].value}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {getChartTitle()}
      </h2>

      {chartData.length > 0 ? (
        <div className="mt-4" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="созданные"
                name="Созданные"
                fill="#6366F1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="завершенные"
                name="Завершенные"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p>Нет данных для отображения</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyActivityChart;