import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, ArrowLeftRight, CreditCard, Tag } from 'lucide-react';
import type { Account } from '../../core/types/account.types';
import type { Category } from '../../core/types/category.types';
import type { Transaction, TransactionType } from '../../core/types/transaction.types';
import { getTodayDateString } from '../../core/formatters/date';
import { parseCOPInput, formatCOP, centsToCOP } from '../../core/formatters/money';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  transactionToEdit?: Transaction | null;
  onSubmit: (tx: {
    id?: string;
    type: TransactionType;
    amountInCents: number;
    currency: 'COP';
    date: string;
    sourceAccountId: string;
    targetAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
    description: string;
    notes?: string;
    tags?: string[];
  }) => Promise<void>;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  categories,
  transactionToEdit,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar o prellenar formulario
  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setRawAmount(centsToCOP(transactionToEdit.amountInCents).toString());
      setDate(transactionToEdit.date);
      setSourceAccountId(transactionToEdit.sourceAccountId);
      setTargetAccountId(transactionToEdit.targetAccountId || '');
      setCategoryId(transactionToEdit.categoryId || '');
      setSubcategoryId(transactionToEdit.subcategoryId || '');
      setDescription(transactionToEdit.description);
      setNotes(transactionToEdit.notes || '');
      setTags(transactionToEdit.tags || []);
    } else {
      setType('expense');
      setRawAmount('');
      setDate(getTodayDateString());
      setSourceAccountId(accounts[0]?.id || '');
      setTargetAccountId('');
      setCategoryId('');
      setSubcategoryId('');
      setDescription('');
      setNotes('');
      setTags([]);
    }
    setError(null);
  }, [transactionToEdit, isOpen, accounts]);

  // Filtrar categorías según tipo
  const relevantCategories = categories.filter((c) => {
    if (type === 'income') return c.type === 'income';
    if (type === 'expense') return c.type === 'expense';
    return false;
  });

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  // Auto-seleccionar primera categoría si no está seleccionada
  useEffect(() => {
    if ((type === 'income' || type === 'expense') && relevantCategories.length > 0) {
      if (!categoryId || !relevantCategories.some((c) => c.id === categoryId)) {
        setCategoryId(relevantCategories[0].id);
      }
    }
  }, [type, relevantCategories, categoryId]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const cleanTag = tagInput.trim().replace(/^#/, '');
    if (!cleanTag || tags.includes(cleanTag)) return;
    setTags([...tags, cleanTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountInCents = parseCOPInput(rawAmount);
    if (amountInCents <= 0) {
      setError('Por favor ingresa un monto válido mayor a $0.');
      return;
    }

    if (!sourceAccountId) {
      setError('Debes seleccionar una cuenta de origen.');
      return;
    }

    if ((type === 'transfer' || type === 'credit_card_payment') && !targetAccountId) {
      setError('Debes seleccionar una cuenta de destino para este movimiento.');
      return;
    }

    if ((type === 'transfer' || type === 'credit_card_payment') && sourceAccountId === targetAccountId) {
      setError('La cuenta de origen y destino no pueden ser iguales.');
      return;
    }

    if (!description.trim()) {
      setError('Por favor introduce una breve descripción del movimiento.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        id: transactionToEdit?.id,
        type,
        amountInCents,
        currency: 'COP',
        date,
        sourceAccountId,
        targetAccountId: type === 'transfer' || type === 'credit_card_payment' ? targetAccountId : undefined,
        categoryId: type === 'income' || type === 'expense' ? categoryId : undefined,
        subcategoryId: type === 'income' || type === 'expense' ? subcategoryId || undefined : undefined,
        description: description.trim(),
        notes: notes.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      onClose();
    } catch (err) {
      setError((err as Error).message || 'Error al guardar la transacción.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            {transactionToEdit ? 'Editar Movimiento' : 'Registrar Movimiento'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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

          {/* Selector de Tipo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Gasto</span>
            </button>

            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>

            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'transfer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transferencia</span>
            </button>

            <button
              type="button"
              onClick={() => setType('credit_card_payment')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                type === 'credit_card_payment'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pago TC</span>
            </button>
          </div>

          {/* Monto en Pesos */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Monto (COP)
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
                className="w-full pl-8 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xl font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                autoFocus
              />
            </div>
            {rawAmount && (
              <p className="mt-1 text-xs text-zinc-400">
                Registrado como: {formatCOP(parseCOPInput(rawAmount))} COP
              </p>
            )}
          </div>

          {/* Cuentas Origen / Destino */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {type === 'transfer' ? 'Desde (Cuenta Origen)' : type === 'credit_card_payment' ? 'Pagar desde (Banco)' : 'Cuenta'}
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {accounts
                  .filter((a) => (type === 'credit_card_payment' ? a.type !== 'credit_card' : true))
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
              </select>
            </div>

            {(type === 'transfer' || type === 'credit_card_payment') && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {type === 'credit_card_payment' ? 'Hacia (Tarjeta a abonar)' : 'Hacia (Cuenta Destino)'}
                </label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecciona cuenta destino...</option>
                  {accounts
                    .filter((a) => (type === 'credit_card_payment' ? a.type === 'credit_card' : a.id !== sourceAccountId))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Categoría y Subcategoría (solo para ingreso y gasto) */}
          {(type === 'income' || type === 'expense') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  {selectedCategoryObj?.subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Fecha y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Descripción
              </label>
              <input
                type="text"
                placeholder="Ej. Almuerzo, Uber, Salario quincenal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Etiquetas / Tags */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Etiquetas (Tags)
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej. vacaciones, trabajo, mercado-quincena"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
              >
                + Tag
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-emerald-400 hover:text-rose-500 cursor-pointer ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles adicionales del movimiento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Acciones */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-zinc-100 dark:border-zinc-800">
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
              {isSubmitting ? 'Guardando...' : transactionToEdit ? 'Actualizar Movimiento' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
