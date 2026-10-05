import React, { useState, useEffect } from 'react';
import { X, Target, Calendar } from 'lucide-react';
import type { FinancialGoal, GoalStatus } from '../../core/types/budget.types';
import { parseCOPInput, formatCOP, centsToCOP } from '../../core/formatters/money';

interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: FinancialGoal | null;
  onSubmit: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
}

const COLORS = [
  '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1',
];

export const NewGoalModal: React.FC<NewGoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  onSubmit,
  onUpdate,
}) => {
  const [name, setName] = useState('');
  const [rawTargetAmount, setRawTargetAmount] = useState('');
  const [rawCurrentAmount, setRawCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [status, setStatus] = useState<GoalStatus>('in_progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setRawTargetAmount(centsToCOP(goalToEdit.targetAmountInCents).toString());
      setRawCurrentAmount(centsToCOP(goalToEdit.currentAmountInCents).toString());
      setTargetDate(goalToEdit.targetDate || '');
      setDescription(goalToEdit.description || '');
      setColor(goalToEdit.color || COLORS[0]);
      setStatus(goalToEdit.status);
    } else {
      setName('');
      setRawTargetAmount('');
      setRawCurrentAmount('');
      setTargetDate('');
      setDescription('');
      setColor(COLORS[0]);
      setStatus('in_progress');
    }
    setError(null);
  }, [goalToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor indica un nombre para tu objetivo financiero.');
      return;
    }

    const targetAmountInCents = parseCOPInput(rawTargetAmount);
    if (targetAmountInCents <= 0) {
      setError('El monto objetivo debe ser mayor a $0.');
      return;
    }

    const currentAmountInCents = parseCOPInput(rawCurrentAmount);

    try {
      setIsSubmitting(true);
      if (goalToEdit && onUpdate) {
        await onUpdate(goalToEdit.id, {
          name: name.trim(),
          targetAmountInCents,
          currentAmountInCents,
          targetDate: targetDate || undefined,
          description: description.trim() || undefined,
          color,
          status,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          targetAmountInCents,
          currentAmountInCents,
          targetDate: targetDate || undefined,
          description: description.trim() || undefined,
          color,
          status,
        });
      }

      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al guardar la meta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              {goalToEdit ? 'Editar Meta de Ahorro' : 'Nueva Meta Financiera'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre del Objetivo
            </label>
            <input
              type="text"
              placeholder="Ej. Fondo de Emergencia, Vacaciones, Computador..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Monto Meta (COP)
              </label>
              <input
                type="text"
                placeholder="0"
                value={rawTargetAmount}
                onChange={(e) => setRawTargetAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Ahorrado Inicial (COP)
              </label>
              <input
                type="text"
                placeholder="0"
                value={rawCurrentAmount}
                onChange={(e) => setRawCurrentAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Fecha Objetivo (Opcional - para calcular cuota mensual)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Color Distintivo
            </label>
            <div className="flex items-center space-x-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                    color === c ? 'scale-115 ring-2 ring-zinc-900 dark:ring-white ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Descripción o Motivo
            </label>
            <input
              type="text"
              placeholder="Detalles de este objetivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
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
              {isSubmitting ? 'Guardando...' : goalToEdit ? 'Actualizar Meta' : 'Crear Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
