import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { Category } from '../../core/types/category.types';
import { formatCOP } from '../../core/formatters/money';

interface CategoryExpenseItem {
  category?: Category;
  amountInCents: number;
  percentage: number;
}

interface MonthlyCategoryExpenseChartProps {
  data: CategoryExpenseItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      value: number;
      amountInCents: number;
      percentage: number;
      color: string;
    };
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 shadow-lg text-xs z-50">
        <div className="flex items-center space-x-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {item.name}
          </span>
        </div>
        <p className="font-semibold text-rose-600 dark:text-rose-400">
          {formatCOP(item.amountInCents)}
        </p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          {item.percentage}% del total del mes
        </p>
      </div>
    );
  }
  return null;
};

export const MonthlyCategoryExpenseChart: React.FC<MonthlyCategoryExpenseChartProps> = ({
  data,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
        Sin gastos registrados este mes.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category?.name || 'General',
    value: item.amountInCents,
    amountInCents: item.amountInCents,
    percentage: item.percentage,
    color: item.category?.color || '#10b981',
  }));

  const totalExpense = data.reduce((sum, item) => sum + item.amountInCents, 0);

  return (
    <div className="space-y-4">
      {/* Gráfico Donut de Recharts */}
      <div className="relative w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="transparent"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Resumen en el centro del Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
            Total Mes
          </span>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {formatCOP(totalExpense)}
          </span>
        </div>
      </div>

      {/* Lista detallada con barras de porcentaje */}
      <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        {data.map((item) => (
          <div key={item.category?.id || item.amountInCents} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{ backgroundColor: item.category?.color || '#10b981' }}
                />
                <span className="truncate">{item.category?.name || 'General'}</span>
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 font-semibold tabular-nums shrink-0 ml-2">
                {formatCOP(item.amountInCents)} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, item.percentage)}%`,
                  backgroundColor: item.category?.color || '#10b981',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
