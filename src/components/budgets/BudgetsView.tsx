import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import type { Budget, BudgetCalculatedStatus } from '../../core/types/budget.types';
import type { Category } from '../../core/types/category.types';
import { MoneyBadge } from '../common/MoneyBadge';
import { IconResolver } from '../common/IconResolver';
import { NewBudgetModal } from './NewBudgetModal';

interface BudgetsViewProps {
  status: {
    items: BudgetCalculatedStatus[];
    totalAllocatedInCents: number;
    totalSpentInCents: number;
    totalRemainingInCents: number;
    overallPercentageUsed: number;
  };
  categories: Category[];
  selectedYear: number;
  selectedMonth: number;
  onSelectYear: (year: number) => void;
  onSelectMonth: (month: number) => void;
  onCreateOrUpdateBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Budget>;
  onDeleteBudget: (id: string) => Promise<void>;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  status,
  categories,
  selectedYear,
  selectedMonth,
  onSelectYear,
  onSelectMonth,
  onCreateOrUpdateBudget,
  onDeleteBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);

  const monthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const monthName = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(monthDate);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onSelectMonth(12);
      onSelectYear(selectedYear - 1);
    } else {
      onSelectMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onSelectMonth(1);
      onSelectYear(selectedYear + 1);
    } else {
      onSelectMonth(selectedMonth + 1);
    }
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y Navegación de Mes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <PieChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Presupuestos Mensuales</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Establece límites de gasto por categoría para evitar sobrecostos y maximizar tu ahorro en COP.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Navegador de mes */}
          <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2 py-1 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-200 capitalize min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setBudgetToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Presupuesto</span>
          </button>
        </div>
      </div>

      {/* Resumen General de Ejecución Presupuestal */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Ejecución Presupuestal Global
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {status.overallPercentageUsed}%
              </span>
              <span className="text-xs text-zinc-500">del total asignado utilizado</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <div>
              <span className="text-zinc-400 block">Total Presupuestado</span>
              <MoneyBadge amountInCents={status.totalAllocatedInCents} size="md" type="neutral" />
            </div>
            <div>
              <span className="text-zinc-400 block">Total Gastado</span>
              <MoneyBadge amountInCents={status.totalSpentInCents} size="md" type="expense" />
            </div>
            <div>
              <span className="text-zinc-400 block">Disponible Total</span>
              <MoneyBadge amountInCents={status.totalRemainingInCents} size="md" type="balance" />
            </div>
          </div>
        </div>

        {/* Barra de progreso global */}
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              status.overallPercentageUsed >= 100
                ? 'bg-rose-500'
                : status.overallPercentageUsed >= 80
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, status.overallPercentageUsed)}%` }}
          />
        </div>
      </div>

      {/* Grid de Presupuestos por Categoría */}
      <div className="space-y-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          Límites por Categoría ({status.items.length})
        </h3>

        {status.items.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
            <p className="font-medium text-sm">No has configurado presupuestos para este mes.</p>
            <p className="text-xs text-zinc-400 mt-1">
              Haz clic en "Asignar Presupuesto" para fijar un límite de gasto en tus categorías.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {status.items.map((item) => {
              const cat = item.category;
              const isOver = item.isExceeded;
              const isWarning = item.percentageUsed >= 80 && !isOver;

              return (
                <div
                  key={item.budget.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors ${
                    isOver
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                      : isWarning
                      ? 'border-amber-300 dark:border-amber-900/60'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div>
                    {/* Header de tarjeta */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: cat?.color || '#10b981' }}
                        >
                          <IconResolver name={cat?.icon || 'Folder'} className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            {cat?.name || 'Categoría'}
                          </h4>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {item.percentageUsed}% utilizado
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(item.budget)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Editar presupuesto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBudget(item.budget.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Eliminar presupuesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Montos */}
                    <div className="mt-4 flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-zinc-400 block text-[11px]">Gastado</span>
                        <MoneyBadge amountInCents={item.spentInCents} size="md" type="expense" />
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-400 block text-[11px]">Presupuesto</span>
                        <MoneyBadge amountInCents={item.allocatedInCents} size="md" type="neutral" />
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-3 w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, item.percentageUsed)}%` }}
                      />
                    </div>
                  </div>

                  {/* Estado al pie de tarjeta */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                    {isOver ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Excedido por <MoneyBadge amountInCents={Math.abs(item.remainingInCents)} size="sm" type="neutral" /></span>
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Disponible: <MoneyBadge amountInCents={item.remainingInCents} size="sm" type="neutral" /></span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewBudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBudgetToEdit(null);
        }}
        categories={categories}
        year={selectedYear}
        month={selectedMonth}
        budgetToEdit={budgetToEdit}
        onSubmit={async (b) => {
          await onCreateOrUpdateBudget(b);
        }}
      />
    </div>
  );
};
