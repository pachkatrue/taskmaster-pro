import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProjects } from '../../hooks/useProjects';

/**
 * Компонент для визуализации прогресса по проектам
 * Отображает диаграмму с прогрессом выполнения и оставшимися задачами
 */
const ProjectProgressChart: React.FC = () => {
  // Получаем данные о проектах
  const { projects, loadProjects } = useProjects();

  // Состояние для хранения данных диаграммы
  const [chartData, setChartData] = useState<Array<{ name: string; выполнено: number; осталось: number }>>([]);

  // Загружаем проекты при монтировании компонента
  useEffect(() => {
    const fetchProjects = async () => {
      if (projects.length === 0) {
        await loadProjects();
      }
    };

    fetchProjects();
  }, [loadProjects, projects.length]);

  // Подготавливаем данные для диаграммы
  useEffect(() => {
    const data = projects.map(project => ({
      name: project.title,
      выполнено: project.progress,
      осталось: 100 - project.progress
    }));

    setChartData(data);
  }, [projects]);

  // Кастомный тултип для диаграммы
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      name: string;
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">{label}</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Выполнено: {payload[0].value}%
          </p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Осталось: {payload[1].value}%
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Прогресс проектов
      </h2>

      {chartData.length > 0 ? (
        <div className="mt-4" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              barGap={0}
              barCategoryGap={10}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="выполнено"
                stackId="a"
                fill="#10B981"
                name="Выполнено"
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="осталось"
                stackId="a"
                fill="#F87171"
                name="Осталось"
                radius={[0, 4, 4, 0]}
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

export default ProjectProgressChart;