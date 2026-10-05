import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  CreditCard,
  Calendar,
  X,
  Tag,
} from 'lucide-react';
import type { Transaction, TransactionFilter, TransactionType } from '../../core/types/transaction.types';
import type { Account } from '../../core/types/account.types';
import type { Category } from '../../core/types/category.types';
import { MoneyBadge } from '../common/MoneyBadge';
import { formatDateShort, getMonthRange } from '../../core/formatters/date';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  filter: TransactionFilter;
  onFilterChange: (newFilter: TransactionFilter) => void;
  onResetFilter: () => void;
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
}

type PeriodPreset = 'all' | 'this_month' | 'last_month' | 'last_30_days' | 'this_year' | 'custom';

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  filter,
  onFilterChange,
  onResetFilter,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('all');

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Recopilar todas las etiquetas únicas presentes
  const allUniqueTags = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      tx.tags?.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [transactions]);

  // Resumen financiero de la lista filtrada actual
  const filteredMetrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') income += tx.amountInCents;
      if (tx.type === 'expense') expense += tx.amountInCents;
    }
    return {
      count: transactions.length,
      income,
      expense,
      net: income - expense,
    };
  }, [transactions]);

  const handlePeriodChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const now = new Date();

    if (preset === 'all') {
      onFilterChange({ ...filter, startDate: undefined, endDate: undefined });
    } else if (preset === 'this_month') {
      const { startDate, endDate } = getMonthRange(now.getFullYear(), now.getMonth() + 1);
      onFilterChange({ ...filter, startDate, endDate });
    } else if (preset === 'last_month') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const { startDate, endDate } = getMonthRange(lastMonthDate.getFullYear(), lastMonthDate.getMonth() + 1);
      onFilterChange({ ...filter, startDate, endDate });
    } else if (preset === 'last_30_days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      const start = past.toISOString().split('T')[0];
      const end = now.toISOString().split('T')[0];
      onFilterChange({ ...filter, startDate: start, endDate: end });
    } else if (preset === 'this_year') {
      const start = `${now.getFullYear()}-01-01`;
      const end = `${now.getFullYear()}-12-31`;
      onFilterChange({ ...filter, startDate: start, endDate: end });
    }
  };

  const hasActiveFilters = Boolean(
    filter.type ||
      filter.accountId ||
      filter.categoryId ||
      filter.searchQuery ||
      filter.selectedTag ||
      filter.startDate ||
      filter.endDate
  );

  const handleDelete = async () => {
    if (!txToDelete) return;
    await onDeleteTransaction(txToDelete.id);
    setTxToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Libro de Transacciones
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Consulta, filtra y edita tus ingresos, gastos, transferencias y pagos de tarjeta.
          </p>
        </div>
        <button
          onClick={onOpenNewTransaction}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Movimiento</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Búsqueda por texto */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por concepto o notas..."
              value={filter.searchQuery || ''}
              onChange={(e) => onFilterChange({ ...filter, searchQuery: e.target.value })}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Filtro por Tipo */}
          <div>
            <select
              value={filter.type || 'all'}
              onChange={(e) => onFilterChange({ ...filter, type: e.target.value as TransactionType | 'all' })}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos los Tipos</option>
              <option value="expense">Solo Gastos</option>
              <option value="income">Solo Ingresos</option>
              <option value="transfer">Solo Transferencias</option>
              <option value="credit_card_payment">Solo Pagos de Tarjeta</option>
            </select>
          </div>

          {/* Filtro por Período Preset */}
          <div>
            <select
              value={periodPreset}
              onChange={(e) => handlePeriodChange(e.target.value as PeriodPreset)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todo el Historial</option>
              <option value="this_month">Este Mes</option>
              <option value="last_month">Mes Anterior</option>
              <option value="last_30_days">Últimos 30 días</option>
              <option value="this_year">Este Año</option>
              <option value="custom">Rango Personalizado...</option>
            </select>
          </div>
        </div>

        {/* Fila secundaria de filtros: Cuenta, Categoría y Fechas personalizadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Cuenta */}
          <div>
            <select
              value={filter.accountId || ''}
              onChange={(e) => onFilterChange({ ...filter, accountId: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas las Cuentas</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <select
              value={filter.categoryId || ''}
              onChange={(e) => onFilterChange({ ...filter, categoryId: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Rango Personalizado si está activo */}
          {periodPreset === 'custom' && (
            <>
              <div>
                <input
                  type="date"
                  placeholder="Desde"
                  value={filter.startDate || ''}
                  onChange={(e) => onFilterChange({ ...filter, startDate: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <input
                  type="date"
                  placeholder="Hasta"
                  value={filter.endDate || ''}
                  onChange={(e) => onFilterChange({ ...filter, endDate: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </>
          )}

          {hasActiveFilters && (
            <div className="flex items-center">
              <button
                onClick={() => {
                  setPeriodPreset('all');
                  onResetFilter();
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          )}
        </div>

        {/* Fila de Etiquetas Rápidas */}
        {allUniqueTags.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider mr-1">
              Etiquetas:
            </span>
            {allUniqueTags.map((tag) => {
              const isSelected = filter.selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() =>
                    onFilterChange({
                      ...filter,
                      selectedTag: isSelected ? undefined : tag,
                    })
                  }
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5" />
                  <span>#{tag}</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Barra de Resumen Financiero Filtrado */}
      <div className="bg-zinc-100/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 font-medium">
          <span>Mostrando:</span>
          <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{filteredMetrics.count} movimientos</strong>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <span className="text-zinc-400 mr-1.5">Ingresos:</span>
            <MoneyBadge amountInCents={filteredMetrics.income} type="income" size="sm" showSign />
          </div>

          <div>
            <span className="text-zinc-400 mr-1.5">Gastos:</span>
            <MoneyBadge amountInCents={filteredMetrics.expense} type="expense" size="sm" />
          </div>

          <div>
            <span className="text-zinc-400 mr-1.5">Balance Neto:</span>
            <MoneyBadge amountInCents={filteredMetrics.net} type="balance" size="sm" />
          </div>
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-zinc-500">
            <p className="text-sm font-medium">No se encontraron movimientos con los filtros aplicados.</p>
            <p className="text-xs text-zinc-400 mt-1">Prueba cambiando o limpiando los criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Descripción & Tags</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Cuenta(s)</th>
                  <th className="px-6 py-3.5 text-right">Monto (COP)</th>
                  <th className="px-6 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';
                  const isPayment = tx.type === 'credit_card_payment';

                  const sourceAcc = accountMap.get(tx.sourceAccountId);
                  const targetAcc = tx.targetAccountId ? accountMap.get(tx.targetAccountId) : undefined;
                  const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : undefined;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                        {formatDateShort(tx.date)}
                      </td>

                      {/* Concepto y Tags */}
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isIncome
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                : isExpense
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : isTransfer
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isIncome && <ArrowUpRight className="w-4 h-4" />}
                            {isExpense && <ArrowDownRight className="w-4 h-4" />}
                            {isTransfer && <ArrowLeftRight className="w-4 h-4" />}
                            {isPayment && <CreditCard className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                              {tx.description}
                            </div>
                            {tx.notes && (
                              <div className="text-xs text-zinc-400 line-clamp-1">{tx.notes}</div>
                            )}
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {tx.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cat ? (
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${cat.color}15`,
                              color: cat.color,
                            }}
                          >
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">
                            {isTransfer ? 'Transferencia' : isPayment ? 'Pago Tarjeta' : '—'}
                          </span>
                        )}
                      </td>

                      {/* Cuentas */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-600 dark:text-zinc-300">
                        {isTransfer || isPayment ? (
                          <div className="flex items-center space-x-1.5 font-medium">
                            <span>{sourceAcc?.name || 'Origen'}</span>
                            <span className="text-zinc-400">→</span>
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {targetAcc?.name || 'Destino'}
                            </span>
                          </div>
                        ) : (
                          <span>{sourceAcc?.name || 'Cuenta'}</span>
                        )}
                      </td>

                      {/* Monto */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <MoneyBadge
                          amountInCents={tx.amountInCents}
                          type={isIncome ? 'income' : isExpense ? 'expense' : 'neutral'}
                          showSign={isIncome}
                          size="md"
                        />
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Editar movimiento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTxToDelete(tx)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación de transacción */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
              ¿Eliminar movimiento?
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Se eliminará "{txToDelete.description}" por valor de{' '}
              <strong><MoneyBadge amountInCents={txToDelete.amountInCents} size="sm" type="neutral" /></strong>. El saldo de las cuentas se actualizará inmediatamente.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setTxToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
