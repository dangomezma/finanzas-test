import React, { useState } from 'react';
import type { NetWorthTimelinePoint } from '../../core/accounting/analyticsEngine';
import { formatCOP } from '../../core/formatters/money';

interface LineTrendChartProps {
  data: NetWorthTimelinePoint[];
  height?: number;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data,
  height = 220,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<NetWorthTimelinePoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-zinc-400">
        No hay datos suficientes para graficar la evolución.
      </div>
    );
  }

  const values = data.map((d) => d.netWorthInCents);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const paddingX = 40;
  const paddingY = 25;
  const width = 600;
  const chartHeight = height;

  // Mapear puntos a coordenadas SVG
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * (width - paddingX * 2);
    const normalizedY = (d.netWorthInCents - minVal) / range;
    const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  // Generar path SVG suave
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Generar área cerrada para el degradado
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="w-full select-none">
      {/* Indicador de detalle al pasar el cursor */}
      <div className="h-7 mb-2 flex items-center justify-between text-xs">
        {hoveredPoint ? (
          <div className="flex items-center space-x-2">
            <span className="text-zinc-500 font-medium">{hoveredPoint.label}:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCOP(hoveredPoint.netWorthInCents)}
            </span>
          </div>
        ) : (
          <div className="text-zinc-400 text-xs">
            Pasa el cursor por los puntos de la curva para ver el patrimonio
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden" style={{ height: `${chartHeight}px` }}>
        <svg
          viewBox={`0 0 ${width} ${chartHeight}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Área sombreada */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Línea principal */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos interactivos */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === p.data ? '6' : '3.5'}
              className="fill-emerald-500 stroke-white dark:stroke-zinc-900 stroke-2 cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(p.data)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      {/* Etiquetas inferior y superior */}
      <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
        <span>Inicio del período: {data[0]?.label}</span>
        <span>Actual: {data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
};
