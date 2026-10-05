import React, { useState, useEffect } from 'react';
import { X, CalendarClock } from 'lucide-react';
import type { RecurringTransaction, RecurringFrequency } from '../../core/types/recurring.types';
import type { Account } from '../../core/types/account.types';
import type { Category } from '../../core/types/category.types';
import { parseCOPInput, formatCOP, centsToCOP } from '../../core/formatters/money';

interface NewRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  recurringToEdit?: RecurringTransaction | null;
  onSubmit: (item: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
}

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'bimonthly', label: 'Bimestral' },
  { value: 'annual', label: 'Anual' },
];

export const NewRecurringModal: React.FC<NewRecurringModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  recurringToEdit,
  onSubmit,
  onUpdate,
}) => {
  const [name, setName] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [dueDay, setDueDay] = useState<number>(10);
  const [sourceAccountId, setSourceAccountId] = useState<string>(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  useEffect(() => {
    if (recurringToEdit) {
      setName(recurringToEdit.name);
      setRawAmount(centsToCOP(recurringToEdit.amountInCents).toString());
      setFrequency(recurringToEdit.frequency);
      setDueDay(recurringToEdit.dueDay);
      setSourceAccountId(recurringToEdit.sourceAccountId);
      setCategoryId(recurringToEdit.categoryId || '');
      setSubcategoryId(recurringToEdit.subcategoryId || '');
      setDescription(recurringToEdit.description || '');
    } else {
      setName('');
      setRawAmount('');
      setFrequency('monthly');
      setDueDay(10);
      setSourceAccountId(accounts[0]?.id || '');
      setCategoryId(expenseCategories[0]?.id || '');
      setSubcategoryId('');
      setDescription('');
    }
    setError(null);
  }, [recurringToEdit, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor indica un nombre para el servicio o suscripción.');
      return;
    }

    const amountInCents = parseCOPInput(rawAmount);
    if (amountInCents <= 0) {
      setError('Por favor ingresa un monto válido mayor a $0.');
      return;
    }

    if (!sourceAccountId) {
      setError('Debes seleccionar la cuenta desde donde se pagará.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (recurringToEdit && onUpdate) {
        await onUpdate(recurringToEdit.id, {
          name: name.trim(),
          amountInCents,
          type: 'expense',
          frequency,
          dueDay,
          sourceAccountId,
          categoryId: categoryId || undefined,
          subcategoryId: subcategoryId || undefined,
          description: description.trim() || undefined,
        });
      } else {
        await onSubmit({
          name: name.trim(),
          amountInCents,
          type: 'expense',
          frequency,
          dueDay,
          sourceAccountId,
          categoryId: categoryId || undefined,
          subcategoryId: subcategoryId || undefined,
          isActive: true,
          description: description.trim() || undefined,
        });
      }

      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al guardar el pago recurrente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarClock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
              {recurringToEdit ? 'Editar Pago Recurrente' : 'Nuevo Pago Recurrente / Suscripción'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer">
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
              Nombre de la Suscripción o Servicio
            </label>
            <input
              type="text"
              placeholder="Ej. Netflix, Arriendo, Internet, Gimnasio..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Monto Estimado (COP)
              </label>
              <input
                type="text"
                placeholder="0"
                value={rawAmount}
                onChange={(e) => setRawAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Día de Pago (1 - 31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Cuenta de Pago
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Categoría
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
                Subcategoría (Opcional)
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Ninguna</option>
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
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles sobre este pago..."
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
              {isSubmitting ? 'Guardando...' : recurringToEdit ? 'Actualizar' : 'Guardar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
