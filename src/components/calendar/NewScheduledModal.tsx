import React, { useState } from 'react';
import { X, Calendar, DollarSign, Wallet, Tags, CheckCircle2 } from 'lucide-react';
import type { Account } from '../../core/types/account.types';
import type { Category } from '../../core/types/category.types';
import type { RecurringTransaction, RecurringFrequency } from '../../core/types/recurring.types';
import type { QuickPreset } from './QuickPresetBubbles';
import { parseCOPInput, formatCOP } from '../../core/formatters/money';

interface NewScheduledModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset: QuickPreset | null;
  accounts: Account[];
  categories: Category[];
  onSave: (data: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const NewScheduledModal: React.FC<NewScheduledModalProps> = ({
  isOpen,
  onClose,
  preset,
  accounts,
  categories,
  onSave,
}) => {
  const [type, setType] = useState<'expense' | 'income'>(preset?.type || 'expense');
  const [name, setName] = useState(preset?.name || '');
  const [amountRaw, setAmountRaw] = useState('');
  const [dueDay, setDueDay] = useState(preset?.defaultDay || 15);
  const [isQuincenal, setIsQuincenal] = useState(preset?.isBiweekly || false);
  const [dueDay2, setDueDay2] = useState(30);
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState(() => {
    if (preset?.categoryMatch) {
      const found = categories.find(
        (c) => c.id === preset.categoryMatch || c.name.toLowerCase().includes(preset.name.toLowerCase())
      );
      if (found) return found.id;
    }
    return categories[0]?.id || '';
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincronizar preset cuando cambie
  React.useEffect(() => {
    if (preset) {
      setType(preset.type);
      setName(preset.name);
      setDueDay(preset.defaultDay);
      setIsQuincenal(preset.isBiweekly || false);
      const foundCat = categories.find(
        (c) => c.id === preset.categoryMatch || c.type === preset.type
      );
      if (foundCat) setCategoryId(foundCat.id);
    }
  }, [preset, categories]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInCents = parseCOPInput(amountRaw);
    if (amountInCents <= 0) {
      setError('Por favor ingresa un monto válido mayor a cero.');
      return;
    }

    if (!name.trim()) {
      setError('Por favor indica un nombre para el compromiso.');
      return;
    }

    if (!sourceAccountId) {
      setError('Debes seleccionar una cuenta para debitar/acreditar.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const frequency: RecurringFrequency = isQuincenal ? 'biweekly' : 'monthly';

      await onSave({
        name: name.trim(),
        amountInCents,
        type,
        frequency,
        dueDay: Number(dueDay),
        dueDay2: isQuincenal ? Number(dueDay2) : undefined,
        sourceAccountId,
        categoryId: categoryId || undefined,
        isActive: true,
        icon: preset?.icon,
        description: isQuincenal
          ? `Pago quincenal los días ${dueDay} y ${dueDay2}`
          : `Pago mensual el día ${dueDay}`,
      });

      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al guardar el compromiso programado.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {type === 'income' ? 'Programar Ingreso / Quincena' : 'Programar Gasto Fijo'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Agrégalo al calendario para proyectar tus fechas de cobro y pago en el tiempo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Compromiso: Gasto vs Ingreso */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Gasto Fijo / Obligación
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Ingreso Fijo / Salario
            </button>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nombre del compromiso
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Arriendo Apartamento, Sueldo Nómina..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Monto estimado en COP */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Monto estimado en COP ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 font-semibold text-sm">
                $
              </span>
              <input
                type="text"
                required
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="1.200.000"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            {amountRaw && (
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Valor interpretado: {formatCOP(parseCOPInput(amountRaw))}
              </span>
            )}
          </div>

          {/* Fechas / Días del Mes */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Día del mes para el cobro / pago</span>
              </label>

              {type === 'income' && (
                <label className="inline-flex items-center space-x-1.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isQuincenal}
                    onChange={(e) => setIsQuincenal(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>¿Es quincenal (2 pagos/mes)?</span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-zinc-500 mb-1">
                  {isQuincenal ? 'Primera Quincena (Día)' : 'Día de vencimiento (1 al 31)'}
                </span>
                <select
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Día {d}
                    </option>
                  ))}
                </select>
              </div>

              {isQuincenal ? (
                <div>
                  <span className="block text-[11px] text-zinc-500 mb-1">
                    Segunda Quincena (Día)
                  </span>
                  <select
                    value={dueDay2}
                    onChange={(e) => setDueDay2(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Día {d}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center text-xs text-zinc-400 pt-5">
                  <span>Se repetirá cada mes en esta fecha.</span>
                </div>
              )}
            </div>
          </div>

          {/* Cuenta Bancaria */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Cuenta asociada (¿De dónde sale o entra el dinero?)
            </label>
            {accounts.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-900">
                No tienes cuentas creadas aún. Por favor crea una cuenta bancaria (Ahorros, Nequi, etc.) primero.
              </div>
            ) : (
              <select
                required
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type === 'credit_card' ? 'Tarjeta' : 'Cuenta'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || accounts.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar en Calendario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
