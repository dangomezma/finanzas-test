import React, { useState } from 'react';
import type { MonthlyCashFlowPoint } from '../../core/accounting/analyticsEngine';
import { formatCOP } from '../../core/formatters/money';

interface BarComparisonChartProps {
  data: MonthlyCashFlowPoint[];
  height?: number;
}

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  height = 240,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-zinc-400">
        No hay datos suficientes para graficar.
      </div>
    );
  }

  // Encontrar el valor máximo para escalar las barras
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.incomeInCents, d.expenseInCents)),
    1000000 // mínimo para que no se divida por cero
  );

  const chartHeight = height - 40; // Espacio para las etiquetas del eje X

  return (
    <div className="w-full select-none">
      {/* Tooltip flotante o información del elemento seleccionado */}
      <div className="h-8 mb-2 flex items-center justify-between text-xs">
        {hoveredIndex !== null ? (
          <div className="flex items-center space-x-4 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 rounded-xl">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {data[hoveredIndex].label}:
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Ingresos: {formatCOP(data[hoveredIndex].incomeInCents)}
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              Gastos: {formatCOP(data[hoveredIndex].expenseInCents)}
            </span>
            <span className="text-zinc-500 font-medium">
              Ahorro: {formatCOP(data[hoveredIndex].savingsInCents)}
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-4 text-zinc-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
              <span>Ingresos</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block"></span>
              <span>Gastos</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              (Pasa el cursor sobre una barra para ver detalles)
            </span>
          </div>
        )}
      </div>

      {/* Contenedor del Gráfico SVG */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg className="w-full h-full overflow-visible">
          {/* Líneas guía de fondo */}
          <line
            x1="0"
            y1={chartHeight * 0.25}
            x2="100%"
            y2={chartHeight * 0.25}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={chartHeight * 0.5}
            x2="100%"
            y2={chartHeight * 0.5}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={chartHeight * 0.75}
            x2="100%"
            y2={chartHeight * 0.75}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
            strokeDasharray="4 4"
          />
          <line
            x1="0"
            y1={chartHeight}
            x2="100%"
            y2={chartHeight}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
          />
        </svg>

        {/* Barras HTML responsivas */}
        <div
          className="absolute inset-0 flex items-end justify-between px-2"
          style={{ height: `${chartHeight}px` }}
        >
          {data.map((point, idx) => {
            const incomeHeight = Math.max(4, (point.incomeInCents / maxVal) * chartHeight);
            const expenseHeight = Math.max(4, (point.expenseInCents / maxVal) * chartHeight);
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={point.monthKey}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex-1 flex flex-col items-center justify-end h-full px-1.5 cursor-pointer transition-opacity ${
                  hoveredIndex !== null && !isHovered ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div className="flex items-end space-x-1.5 w-full max-w-[48px] justify-center">
                  {/* Barra de Ingreso */}
                  <div
                    className="w-1/2 rounded-t-md bg-emerald-500 hover:bg-emerald-600 transition-all duration-300"
                    style={{ height: `${incomeHeight}px` }}
                  />
                  {/* Barra de Gasto */}
                  <div
                    className="w-1/2 rounded-t-md bg-rose-500 hover:bg-rose-600 transition-all duration-300"
                    style={{ height: `${expenseHeight}px` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Etiquetas del Eje X */}
        <div className="absolute bottom-0 left-0 right-0 h-7 flex items-center justify-between px-2 text-xs text-zinc-500 dark:text-zinc-400 capitalize">
          {data.map((point) => (
            <div key={point.monthKey} className="flex-1 text-center">
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
