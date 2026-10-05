import React, { useState } from 'react';
import { X, Plus, Minus, PiggyBank } from 'lucide-react';
import type { FinancialGoal } from '../../core/types/budget.types';
import { parseCOPInput, formatCOP } from '../../core/formatters/money';

interface AddFundsGoalModalProps {
  goal: FinancialGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, deltaAmountInCents: number) => Promise<void>;
}

export const AddFundsGoalModal: React.FC<AddFundsGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [operation, setOperation] = useState<'add' | 'withdraw'>('add');
  const [rawAmount, setRawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountInCents = parseCOPInput(rawAmount);
    if (amountInCents <= 0) {
      setError('Por favor indica un monto válido mayor a $0.');
      return;
    }

    if (operation === 'withdraw' && amountInCents > goal.currentAmountInCents) {
      setError('No puedes retirar más dinero del que tienes acumulado en esta meta.');
      return;
    }

    const delta = operation === 'add' ? amountInCents : -amountInCents;

    try {
      setIsSubmitting(true);
      await onSubmit(goal.id, delta);
      setRawAmount('');
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al actualizar fondos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Ajustar Fondos de Meta
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-zinc-500">
            Meta: <strong className="text-zinc-900 dark:text-zinc-100">{goal.name}</strong>
            <span className="block mt-0.5">
              Acumulado actual: <strong>{formatCOP(goal.currentAmountInCents)}</strong>
            </span>
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOperation('add')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                operation === 'add'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Abonar Ahorro</span>
            </button>
            <button
              type="button"
              onClick={() => setOperation('withdraw')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                operation === 'withdraw'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Retirar Fondos</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Monto a {operation === 'add' ? 'Abonar' : 'Retirar'} (COP)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-lg">
                $
              </span>
              <input
                type="text"
                placeholder="0"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                autoFocus
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-500 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
