import React, { useState } from 'react';
import { X, Landmark, Smartphone, Banknote, CreditCard, TrendingUp, Folder } from 'lucide-react';
import type { AccountType, Account } from '../../core/types/account.types';
import { parseCOPInput, formatCOP } from '../../core/formatters/money';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

const ACCOUNT_TYPES: { type: AccountType; label: string; icon: string }[] = [
  { type: 'savings', label: 'Cuenta de Ahorros', icon: 'Landmark' },
  { type: 'bank', label: 'Cuenta Corriente', icon: 'Landmark' },
  { type: 'wallet', label: 'Billetera Digital (Nequi/Daviplata)', icon: 'Smartphone' },
  { type: 'cash', label: 'Efectivo', icon: 'Banknote' },
  { type: 'credit_card', label: 'Tarjeta de Crédito', icon: 'CreditCard' },
  { type: 'investment', label: 'Inversión / CDT', icon: 'TrendingUp' },
  { type: 'other', label: 'Otro Activo', icon: 'Folder' },
];

const COLORS = [
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#a855f7', // Púrpura
  '#f59e0b', // Ámbar
  '#ef4444', // Rojo
  '#06b6d4', // Cyan
  '#ec4899', // Rosa
  '#64748b', // Pizarra
];

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('savings');
  const [rawInitialBalance, setRawInitialBalance] = useState('');
  const [rawCreditLimit, setRawCreditLimit] = useState('');
  const [statementClosingDay, setStatementClosingDay] = useState<number>(15);
  const [paymentDueDay, setPaymentDueDay] = useState<number>(5);
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Por favor indica un nombre para la cuenta.');
      return;
    }

    const initialBalanceInCents = parseCOPInput(rawInitialBalance);
    const creditLimitInCents = type === 'credit_card' ? parseCOPInput(rawCreditLimit) : undefined;

    const selectedTypeObj = ACCOUNT_TYPES.find((t) => t.type === type);

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        type,
        currency: 'COP',
        initialBalanceInCents,
        isActive: true,
        color,
        icon: selectedTypeObj?.icon || 'Landmark',
        description: description.trim() || undefined,
        creditLimitInCents,
        statementClosingDay: type === 'credit_card' ? statementClosingDay : undefined,
        paymentDueDay: type === 'credit_card' ? paymentDueDay : undefined,
      });

      // Limpiar y cerrar
      setName('');
      setRawInitialBalance('');
      setRawCreditLimit('');
      setDescription('');
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            Nueva Cuenta Financiera
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
              placeholder="Ej: Bancolombia Principal, Nequi, Caja Fuerte..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tipo de Cuenta
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {type === 'credit_card' ? 'Deuda Inicial (COP)' : 'Saldo Inicial (COP)'}
              </label>
              <input
                type="text"
                placeholder="0"
                value={rawInitialBalance}
                onChange={(e) => setRawInitialBalance(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
            </div>
          </div>

          {/* Campos exclusivos para Tarjeta de Crédito */}
          {type === 'credit_card' && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Configuración de Tarjeta de Crédito</span>
              </span>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cupo Total Otorgado (COP)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3.500.000"
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
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
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
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Selector de Color */}
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
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
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
              placeholder="Detalles sobre el uso de esta cuenta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm text-sm cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creando...' : 'Crear Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
