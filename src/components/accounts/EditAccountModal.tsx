import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import type { Account } from '../../core/types/account.types';
import { parseCOPInput, formatCOP, centsToCOP } from '../../core/formatters/money';

interface EditAccountModalProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Account>) => Promise<void>;
}

const COLORS = [
  '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#64748b',
];

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [rawCreditLimit, setRawCreditLimit] = useState('');
  const [statementClosingDay, setStatementClosingDay] = useState(15);
  const [paymentDueDay, setPaymentDueDay] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setColor(account.color || COLORS[0]);
      setDescription(account.description || '');
      setIsActive(account.isActive);
      if (account.type === 'credit_card') {
        setRawCreditLimit(account.creditLimitInCents ? centsToCOP(account.creditLimitInCents).toString() : '');
        setStatementClosingDay(account.statementClosingDay || 15);
        setPaymentDueDay(account.paymentDueDay || 5);
      }
    }
    setError(null);
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica un nombre para la cuenta.');
      return;
    }

    try {
      setIsSubmitting(true);
      const updates: Partial<Account> = {
        name: name.trim(),
        color,
        description: description.trim() || undefined,
        isActive,
      };

      if (account.type === 'credit_card') {
        updates.creditLimitInCents = parseCOPInput(rawCreditLimit);
        updates.statementClosingDay = statementClosingDay;
        updates.paymentDueDay = paymentDueDay;
      }

      await onSubmit(account.id, updates);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al actualizar la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Editar Cuenta: {account.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre de la Cuenta
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {account.type === 'credit_card' && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Ajustes de Tarjeta de Crédito</span>
              </span>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cupo Total (COP)
                </label>
                <input
                  type="text"
                  value={rawCreditLimit}
                  onChange={(e) => setRawCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Día de Corte (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={statementClosingDay}
                    onChange={(e) => setStatementClosingDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Día de Pago (1-31)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          )}

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
              Descripción Opcional
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Toggle de Estado Activo / Archivado */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                Cuenta Activa
              </span>
              <span className="text-[11px] text-zinc-400">
                Si la desactivas, se archivará sin borrar su historial de transacciones.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
