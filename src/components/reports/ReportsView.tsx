import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
} from 'lucide-react';
import type { Transaction } from '../../core/types/transaction.types';
import type { Category } from '../../core/types/category.types';
import type { Account } from '../../core/types/account.types';
import {
  calculateMonthlyCashFlowHistory,
  calculateCategoryBreakdown,
  calculateNetWorthTimeline,
} from '../../core/accounting/analyticsEngine';
import { BarComparisonChart } from '../charts/BarComparisonChart';
import { LineTrendChart } from '../charts/LineTrendChart';
import { CategoryDonutChart } from '../charts/CategoryDonutChart';
import { MoneyBadge } from '../common/MoneyBadge';
import { formatCOP } from '../../core/formatters/money';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
}

type ReportPeriod = '3_months' | '6_months' | '12_months';

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  categories,
  accounts,
}) => {
  const [period, setPeriod] = useState<ReportPeriod>('6_months');

  const monthsCount = period === '3_months' ? 3 : period === '6_months' ? 6 : 12;

  // 1. Datos para gráfico de Ingresos vs Gastos
  const monthlyFlow = useMemo(() => {
    return calculateMonthlyCashFlowHistory(transactions, monthsCount);
  }, [transactions, monthsCount]);

  // 2. Desglose de Gastos por Categoría
  const categoryBreakdown = useMemo(() => {
    const now = new Date();
    const pastDate = new Date(now.getFullYear(), now.getMonth() - monthsCount + 1, 1);
    const startDate = pastDate.toISOString().split('T')[0];
    return calculateCategoryBreakdown(transactions, categories, startDate);
  }, [transactions, categories, monthsCount]);

  // 3. Evolución del Patrimonio Neto
  const netWorthTimeline = useMemo(() => {
    return calculateNetWorthTimeline(accounts, transactions, 8);
  }, [accounts, transactions]);

  // Totales acumulados en el período seleccionado
  const periodTotals = useMemo(() => {
    const totalIncome = monthlyFlow.reduce((sum, m) => sum + m.incomeInCents, 0);
    const totalExpense = monthlyFlow.reduce((sum, m) => sum + m.expenseInCents, 0);
    const totalSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;
    const monthlyAverageExpense = totalExpense / monthsCount;
    const topCategory = categoryBreakdown[0];

    return {
      totalIncome,
      totalExpense,
      totalSavings,
      savingsRate,
      monthlyAverageExpense,
      topCategory,
    };
  }, [monthlyFlow, monthsCount, categoryBreakdown]);

  return (
    <div className="space-y-6">
      {/* Encabezado con selector de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Reportes y Análisis Financiero</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Compara tu evolución financiera, tendencias de ahorro y estructura de gastos en COP.
          </p>
        </div>

        {/* Selector de ventana temporal */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setPeriod('3_months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              period === '3_months'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Últimos 3 meses
          </button>
          <button
            onClick={() => setPeriod('6_months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              period === '6_months'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Últimos 6 meses
          </button>
          <button
            onClick={() => setPeriod('12_months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              period === '12_months'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Último año
          </button>
        </div>
      </div>

      {/* Tarjetas KPI del Período */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingresos */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Ingresos
          </span>
          <MoneyBadge amountInCents={periodTotals.totalIncome} size="lg" type="income" showSign />
          <p className="text-[11px] text-zinc-400 mt-2">En los últimos {monthsCount} meses</p>
        </div>

        {/* Total Gastos */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Gastos
          </span>
          <MoneyBadge amountInCents={periodTotals.totalExpense} size="lg" type="expense" />
          <p className="text-[11px] text-zinc-400 mt-2">
            Promedio mensual: {formatCOP(periodTotals.monthlyAverageExpense)}
          </p>
        </div>

        {/* Ahorro Acumulado */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Ahorro Acumulado
          </span>
          <MoneyBadge amountInCents={periodTotals.totalSavings} size="lg" type="balance" />
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
            Tasa de Ahorro: {periodTotals.savingsRate}%
          </p>
        </div>

        {/* Mayor Categoría de Gasto */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Mayor Categoría
          </span>
          {periodTotals.topCategory ? (
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base block truncate">
                {periodTotals.topCategory.category.name}
              </span>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-2">
                {formatCOP(periodTotals.topCategory.amountInCents)} ({periodTotals.topCategory.percentage}% del total)
              </p>
            </div>
          ) : (
            <span className="text-xs text-zinc-400">Sin gastos</span>
          )}
        </div>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Comparativa Mensual Ingresos vs Gastos */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              Ingresos vs Gastos por Mes
            </h3>
            <span className="text-xs text-zinc-400">COP</span>
          </div>

          <BarComparisonChart data={monthlyFlow} height={240} />
        </div>

        {/* Gráfico 2: Evolución del Patrimonio Neto */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              Evolución del Patrimonio Neto
            </h3>
            <span className="text-xs text-emerald-600 font-semibold">Activos - Pasivos</span>
          </div>

          <LineTrendChart data={netWorthTimeline} height={240} />
        </div>
      </div>

      {/* Distribución de Gastos por Categoría y Tabla Detallada */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-indigo-500" />
          <span>Estructura de Gastos por Categoría ({monthsCount} meses)</span>
        </h3>

        <CategoryDonutChart data={categoryBreakdown} size={220} />

        {/* Tabla Desglosada */}
        <div className="overflow-x-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-center">Movimientos</th>
                <th className="px-4 py-3 text-right">% del Gasto</th>
                <th className="px-4 py-3 text-right">Promedio / Movimiento</th>
                <th className="px-4 py-3 text-right">Total Gastado (COP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {categoryBreakdown.map((item) => {
                const avgPerTx = item.transactionCount > 0 ? item.amountInCents / item.transactionCount : 0;
                return (
                  <tr key={item.category.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 flex items-center space-x-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span>{item.category.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-500">{item.transactionCount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300">
                      {item.percentage}%
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 tabular-nums">
                      {formatCOP(avgPerTx)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatCOP(item.amountInCents)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
