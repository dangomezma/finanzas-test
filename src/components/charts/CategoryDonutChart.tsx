import React, { useState } from 'react';
import type { CategoryExpenseBreakdown } from '../../core/accounting/analyticsEngine';
import { formatCOP } from '../../core/formatters/money';

interface CategoryDonutChartProps {
  data: CategoryExpenseBreakdown[];
  size?: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  size = 200,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryExpenseBreakdown | null>(null);

  const totalExpense = data.reduce((sum, item) => sum + item.amountInCents, 0);

  if (totalExpense === 0 || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-zinc-400">
        No hay gastos registrados en este período.
      </div>
    );
  }

  const radius = 70;
  const strokeWidth = 26;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {data.map((item) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;

            const isHovered = hoveredCategory?.category.id === item.category.id;

            return (
              <circle
                key={item.category.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.category.color || '#10b981'}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredCategory(item)}
                onMouseLeave={() => setHoveredCategory(null)}
              />
            );
          })}
        </svg>

        {/* Centro del Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
          <span className="text-[10px] uppercase font-semibold text-zinc-400">
            {hoveredCategory ? hoveredCategory.category.name : 'Total Gastado'}
          </span>
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {hoveredCategory
              ? formatCOP(hoveredCategory.amountInCents)
              : formatCOP(totalExpense)}
          </span>
          {hoveredCategory && (
            <span className="text-[11px] font-semibold text-zinc-500">
              {hoveredCategory.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Leyenda lateral */}
      <div className="flex-1 w-full max-w-xs space-y-2">
        {data.slice(0, 5).map((item) => {
          const isHovered = hoveredCategory?.category.id === item.category.id;
          return (
            <div
              key={item.category.id}
              onMouseEnter={() => setHoveredCategory(item)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                isHovered ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {item.category.name}
                </span>
              </div>
              <div className="text-right tabular-nums">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                  {formatCOP(item.amountInCents)}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {item.percentage}% ({item.transactionCount} mov.)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
