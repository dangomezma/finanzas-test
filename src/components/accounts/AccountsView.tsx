import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Landmark, CreditCard, ArrowRight, AlertTriangle, Archive, CheckCircle } from 'lucide-react';
import type { AccountCalculatedSummary, Account } from '../../core/types/account.types';
import { MoneyBadge } from '../common/MoneyBadge';
import { IconResolver } from '../common/IconResolver';

interface AccountsViewProps {
  summaries: AccountCalculatedSummary[];
  onOpenNewAccount: () => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => Promise<void>;
  onViewAccountTransactions: (accountId: string) => void;
  onPayCreditCard?: (cardAccount: Account, debtInCents: number) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  summaries,
  onOpenNewAccount,
  onEditAccount,
  onDeleteAccount,
  onViewAccountTransactions,
  onPayCreditCard,
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  const displayedSummaries = summaries.filter((s) => (showArchived ? !s.account.isActive : s.account.isActive));
  const bankAccounts = displayedSummaries.filter((s) => s.account.type !== 'credit_card');
  const creditCards = displayedSummaries.filter((s) => s.account.type === 'credit_card');

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    await onDeleteAccount(accountToDelete.id);
    setAccountToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Cuentas Financieras
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Administra tus cuentas bancarias, billeteras, efectivo y tarjetas de crédito.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              showArchived
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Ver Activas' : 'Ver Archivadas'}</span>
          </button>

          <button
            onClick={onOpenNewAccount}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </div>

      {/* Sección 1: Cuentas de Activo (Bancos, Billeteras, Efectivo) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Cuentas de Ahorros, Efectivo y Billeteras ({bankAccounts.length})</span>
        </h3>

        {bankAccounts.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4">No hay cuentas en esta sección.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((s) => (
              <div
                key={s.account.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: s.account.color || '#10b981' }}
                      >
                        <IconResolver name={s.account.icon} className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-snug">
                          {s.account.name}
                        </h4>
                        <span className="text-xs text-zinc-400 capitalize">
                          {s.account.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditAccount(s.account)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar cuenta"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAccountToDelete(s.account)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Eliminar cuenta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className="text-xs text-zinc-400 block font-medium">Saldo Actual</span>
                    <div className="mt-1">
                      <MoneyBadge amountInCents={s.currentBalanceInCents} size="xl" type="balance" />
                    </div>
                  </div>

                  {s.account.description && (
                    <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {s.account.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    Inicial: {Math.round(s.account.initialBalanceInCents / 100).toLocaleString('es-CO')}
                  </span>
                  <button
                    onClick={() => onViewAccountTransactions(s.account.id)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Movimientos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 2: Tarjetas de Crédito */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-amber-500" />
          <span>Tarjetas de Crédito ({creditCards.length})</span>
        </h3>

        {creditCards.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4">No hay tarjetas de crédito registradas.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {creditCards.map((s) => {
              const limit = s.account.creditLimitInCents || 0;
              const usedPercent = limit > 0 ? Math.min(100, Math.round((s.currentDebtInCents / limit) * 100)) : 0;

              return (
                <div
                  key={s.account.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs"
                          style={{ backgroundColor: s.account.color || '#f59e0b' }}
                        >
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-snug">
                            {s.account.name}
                          </h4>
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            Obligación Financiera
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEditAccount(s.account)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Editar tarjeta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setAccountToDelete(s.account)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Eliminar tarjeta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-1">
                      <span className="text-xs text-zinc-400 block font-medium">Deuda Actual a Pagar</span>
                      <MoneyBadge amountInCents={s.currentDebtInCents} size="xl" type="expense" />
                    </div>

                    {/* Barra de utilización de cupo */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Cupo Disponible:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          <MoneyBadge amountInCents={s.availableCreditInCents} size="sm" type="neutral" />
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            usedPercent > 80 ? 'bg-rose-500' : usedPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usedPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Utilizado: {usedPercent}%</span>
                        <span>Total: <MoneyBadge amountInCents={limit} size="sm" type="neutral" /></span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span>Corte: Día {s.account.statementClosingDay || 'N/A'}</span>
                    <div className="flex items-center space-x-2">
                      {onPayCreditCard && s.currentDebtInCents > 0 && (
                        <button
                          onClick={() => onPayCreditCard(s.account, s.currentDebtInCents)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Pagar Tarjeta
                        </button>
                      )}
                      <button
                        onClick={() => onViewAccountTransactions(s.account.id)}
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Movimientos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
              ¿Eliminar cuenta?
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Se eliminará <strong>{accountToDelete.name}</strong> y sus movimientos asociados para preservar la consistencia de los saldos. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setAccountToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer transition-colors"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
