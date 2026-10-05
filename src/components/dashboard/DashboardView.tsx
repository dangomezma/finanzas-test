import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import type { AccountCalculatedSummary } from '../../core/types/account.types';
import type { Transaction } from '../../core/types/transaction.types';
import type { Category } from '../../core/types/category.types';
import type { RecurringTransaction, UpcomingPaymentItem } from '../../core/types/recurring.types';
import { MoneyBadge } from '../common/MoneyBadge';
import { IconResolver } from '../common/IconResolver';
import { formatDateShort } from '../../core/formatters/date';
import { calculateMonthlyCashFlowHistory } from '../../core/accounting/analyticsEngine';
import { BarComparisonChart } from '../charts/BarComparisonChart';
import { MonthlyCategoryExpenseChart } from './MonthlyCategoryExpenseChart';
import { DashboardCalendarWidget } from './DashboardCalendarWidget';

interface DashboardViewProps {
  summaries: AccountCalculatedSummary[];
  netWorth: { totalAssetsInCents: number; totalLiabilitiesInCents: number; netWorthInCents: number };
  monthSummary: { totalIncomeInCents: number; totalExpenseInCents: number; netSavingsInCents: number; savingsRatePercentage: number };
  recentTransactions: Transaction[];
  categories: Category[];
  recurringList?: RecurringTransaction[];
  upcomingPayments?: UpcomingPaymentItem[];
  onOpenNewTransaction: () => void;
  onNavigateToAccounts: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToReports: () => void;
  onNavigateToRecurring?: () => void;
  onNavigateToCalendar?: () => void;
  onExecutePayment?: (id: string) => Promise<unknown>;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summaries,
  netWorth,
  monthSummary,
  recentTransactions,
  categories,
  recurringList = [],
  upcomingPayments = [],
  onOpenNewTransaction,
  onNavigateToAccounts,
  onNavigateToTransactions,
  onNavigateToReports,
  onNavigateToRecurring,
  onNavigateToCalendar,
  onExecutePayment,
}) => {
  // Dinero líquido disponible (Activos - Deuda tarjetas)
  const liquidCashInCents = netWorth.totalAssetsInCents - netWorth.totalLiabilitiesInCents;

  // Flujo de últimos 6 meses para el gráfico interactivo
  const monthlyFlow = useMemo(() => {
    return calculateMonthlyCashFlowHistory(recentTransactions, 6);
  }, [recentTransactions]);

  // Agrupar gastos del mes por categoría
  const categoryExpenses = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of recentTransactions) {
      if (tx.type === 'expense' && tx.categoryId) {
        map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + tx.amountInCents);
      }
    }
    const catMap = new Map(categories.map((c) => [c.id, c]));
    return Array.from(map.entries())
      .map(([catId, amountInCents]) => ({
        category: catMap.get(catId),
        amountInCents,
        percentage:
          monthSummary.totalExpenseInCents > 0
            ? Math.round((amountInCents / monthSummary.totalExpenseInCents) * 100)
            : 0,
      }))
      .filter((item) => item.category)
      .sort((a, b) => b.amountInCents - a.amountInCents);
  }, [recentTransactions, categories, monthSummary.totalExpenseInCents]);

  return (
    <div className="space-y-6">
      {/* Saludo y bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Resumen Financiero
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Control exacto y visual de tu patrimonio y flujo en pesos colombianos (COP).
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToReports}
            className="inline-flex items-center space-x-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 font-medium px-3.5 py-2.5 rounded-xl text-sm cursor-pointer transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span>Ver Reportes</span>
          </button>
          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Registrar Movimiento</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Principales de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Patrimonio Neto */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Patrimonio Neto</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <MoneyBadge amountInCents={netWorth.netWorthInCents} size="xl" type="balance" />
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Activos: <MoneyBadge amountInCents={netWorth.totalAssetsInCents} size="sm" type="neutral" /></span>
            <span>Pasivos: <MoneyBadge amountInCents={netWorth.totalLiabilitiesInCents} size="sm" type="neutral" /></span>
          </div>
        </div>

        {/* Dinero Disponible */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dinero Disponible</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <MoneyBadge amountInCents={liquidCashInCents} size="xl" type="balance" />
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Efectivo, cuentas y billeteras libres de deuda
          </p>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ingresos del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <MoneyBadge amountInCents={monthSummary.totalIncomeInCents} size="xl" type="income" showSign />
          </div>
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            Entradas netas registradas
          </p>
        </div>

        {/* Gastos del Mes */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gastos del Mes</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1">
            <MoneyBadge amountInCents={monthSummary.totalExpenseInCents} size="xl" type="expense" />
          </div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Ahorro: <strong>{monthSummary.savingsRatePercentage}%</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{Math.max(0, monthSummary.netSavingsInCents / 100).toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>

      {/* Widget de Calendario y Próximas Quincenas/Vencimientos */}
      {onNavigateToCalendar && (
        <DashboardCalendarWidget
          recurringList={recurringList}
          upcomingPayments={upcomingPayments}
          onNavigateToCalendar={onNavigateToCalendar}
          onExecutePayment={onExecutePayment}
        />
      )}

      {/* Gráfico Comparativo de Flujo Mensual */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              Comparativa de Flujo Mensual (Ingresos vs Gastos)
            </h3>
            <p className="text-xs text-zinc-400">Evolución de los últimos 6 meses</p>
          </div>
          <button
            onClick={onNavigateToReports}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Ver análisis completo →
          </button>
        </div>
        <BarComparisonChart data={monthlyFlow} height={200} />
      </div>

      {/* Grid de 2 Columnas: Cuentas y Distribución de Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Cuentas Resumen */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                Tus Cuentas
              </h3>
              <button
                onClick={onNavigateToAccounts}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Ver todas ({summaries.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summaries.slice(0, 4).map((s) => {
                const isCredit = s.account.type === 'credit_card';
                return (
                  <div
                    key={s.account.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: s.account.color || '#10b981' }}
                      >
                        <IconResolver name={s.account.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {s.account.name}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                          {isCredit ? 'Tarjeta de Crédito' : s.account.type}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isCredit ? (
                        <>
                          <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                            Deuda: <MoneyBadge amountInCents={s.currentDebtInCents} size="sm" type="neutral" />
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            Cupo: <MoneyBadge amountInCents={s.availableCreditInCents} size="sm" type="neutral" />
                          </div>
                        </>
                      ) : (
                        <MoneyBadge amountInCents={s.currentBalanceInCents} size="md" type="balance" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Últimos Movimientos */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                Últimos Movimientos
              </h3>
              <button
                onClick={onNavigateToTransactions}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Ver historial completo
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">
                No hay transacciones registradas.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {recentTransactions.slice(0, 5).map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isIncome
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                              : isExpense
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {isIncome && <ArrowUpRight className="w-5 h-5" />}
                          {isExpense && <ArrowDownRight className="w-5 h-5" />}
                          {isTransfer && <ArrowLeftRight className="w-5 h-5" />}
                          {tx.type === 'credit_card_payment' && <CreditCard className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {tx.description}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {formatDateShort(tx.date)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <MoneyBadge
                          amountInCents={tx.amountInCents}
                          type={isIncome ? 'income' : isExpense ? 'expense' : 'neutral'}
                          showSign={isIncome}
                          size="md"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Gastos por Categoría con Recharts */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              Distribución de Gastos
            </h3>
            <span className="text-xs text-zinc-400">Mes en curso</span>
          </div>

          <MonthlyCategoryExpenseChart data={categoryExpenses} />
        </div>

        {/* Próximos Pagos Recurrentes en Dashboard */}
        {upcomingPayments.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs h-fit space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
                Próximos Pagos
              </h3>
              {onNavigateToRecurring && (
                <button
                  onClick={onNavigateToRecurring}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Ver todos
                </button>
              )}
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {upcomingPayments.slice(0, 3).map((item) => (
                <div key={item.recurring.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                      {item.recurring.name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {item.isPaidThisMonth
                        ? 'Pagado este mes'
                        : item.daysRemaining === 0
                        ? 'Vence hoy'
                        : item.daysRemaining > 0
                        ? `Vence en ${item.daysRemaining} días`
                        : `Vencido`}
                    </span>
                  </div>
                  <MoneyBadge amountInCents={item.recurring.amountInCents} size="sm" type="expense" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
