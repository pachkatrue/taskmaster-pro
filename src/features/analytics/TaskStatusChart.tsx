import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTasks } from '../../hooks/useTasks';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    percent: number;
  }>;
}

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

/**
 * Компонент для визуализации задач по статусам
 * Отображает круговую диаграмму распределения задач
 */
const TaskStatusChart: React.FC = () => {
  // Получаем данные о задачах
  const { tasks, loadTasks } = useTasks();

  // Состояние для хранения данных диаграммы
  const [chartData, setChartData] = useState<Array<{ name: string; value: number; color: string }>>([]);

  // Загружаем задачи при монтировании компонента
  useEffect(() => {
    const fetchTasks = async () => {
      if (tasks.length === 0) {
        await loadTasks();
      }
    };

    fetchTasks();
  }, [loadTasks, tasks.length]);

  // Подготавливаем данные для диаграммы при изменении задач
  useEffect(() => {
    // Цвета для статусов задач
    const statusColors = {
      todo: '#6366F1', // Синий
      inProgress: '#F97316', // Оранжевый
      review: '#8B5CF6', // Фиолетовый
      done: '#10B981', // Зеленый
    };

    // Названия статусов
    const statusNames = {
      todo: 'К выполнению',
      inProgress: 'В процессе',
      review: 'На проверке',
      done: 'Выполнено',
    };

    // Подсчитываем количество задач по статусам
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Формируем данные для диаграммы
    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusNames[status as keyof typeof statusNames],
      value: count,
      color: statusColors[status as keyof typeof statusColors],
    }));

    setChartData(data);
  }, [tasks]);

  // Кастомный тултип для диаграммы
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-800 dark:text-gray-200">{payload[0].name}</p>
          <p className="text-sm">
            <span className="font-semibold">{payload[0].value}</span>
            <span className="text-gray-600 dark:text-gray-400"> задач ({Math.round(payload[0].percent * 100)}%)</span>
          </p>
        </div>
      );
    }

    return null;
  };

  // Кастомная метка для сегментов диаграммы
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Отображаем метку только если процент больше 5%
    return percent * 100 >= 5 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Распределение задач по статусам
      </h2>

      {chartData.length > 0 ? (
        <div className="mt-4" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => <span className="text-gray-800 dark:text-gray-200">{value}</span>}
              />
            </PieChart>
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

export default TaskStatusChart;