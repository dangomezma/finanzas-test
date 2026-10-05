import React, { useState, useEffect } from 'react';
import { X, PieChart } from 'lucide-react';
import type { Category } from '../../core/types/category.types';
import type { Budget } from '../../core/types/budget.types';
import { parseCOPInput, formatCOP, centsToCOP } from '../../core/formatters/money';

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  year: number;
  month: number;
  budgetToEdit?: Budget | null;
  onSubmit: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const NewBudgetModal: React.FC<NewBudgetModalProps> = ({
  isOpen,
  onClose,
  categories,
  year,
  month,
  budgetToEdit,
  onSubmit,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [categoryId, setCategoryId] = useState<string>(expenseCategories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setSubcategoryId(budgetToEdit.subcategoryId || '');
      setRawAmount(centsToCOP(budgetToEdit.amountInCents).toString());
    } else {
      setCategoryId(expenseCategories[0]?.id || '');
      setSubcategoryId('');
      setRawAmount('');
    }
    setError(null);
  }, [budgetToEdit, isOpen]);

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountInCents = parseCOPInput(rawAmount);
    if (amountInCents <= 0) {
      setError('Por favor indica un monto de presupuesto válido mayor a $0.');
      return;
    }

    if (!categoryId) {
      setError('Debes seleccionar una categoría de gasto.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        categoryId,
        subcategoryId: subcategoryId || undefined,
        amountInCents,
        year,
        month,
      });

      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al guardar el presupuesto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const monthName = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(new Date(year, month - 1, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              {budgetToEdit ? 'Editar Presupuesto' : 'Asignar Presupuesto Mensual'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300">
            Período: <strong className="capitalize">{monthName} de {year}</strong>
          </div>

          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Categoría de Gasto
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
              }}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Subcategoría (Opcional - dejar vacío para toda la categoría)
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Toda la categoría ({selectedCategoryObj.name})</option>
                {selectedCategoryObj.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Monto Presupuestado (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-lg">
                $
              </span>
              <input
                type="text"
                placeholder="Ej. 650.000"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                autoFocus
              />
            </div>
            {rawAmount && (
              <p className="mt-1 text-xs text-zinc-400">
                Presupuesto: {formatCOP(parseCOPInput(rawAmount))} COP / mes
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm text-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Asignar Presupuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
