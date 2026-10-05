import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Check,
  Pause,
  Play,
} from 'lucide-react';
import type { RecurringTransaction, UpcomingPaymentItem } from '../../core/types/recurring.types';
import type { Account } from '../../core/types/account.types';
import type { Category } from '../../core/types/category.types';
import { MoneyBadge } from '../common/MoneyBadge';
import { formatDateShort } from '../../core/formatters/date';
import { formatCOP } from '../../core/formatters/money';
import { NewRecurringModal } from './NewRecurringModal';

interface RecurringViewProps {
  recurringList: RecurringTransaction[];
  upcomingStatus: {
    items: UpcomingPaymentItem[];
    totalMonthlyObligationsInCents: number;
    totalPaidThisMonthInCents: number;
    totalPendingInCents: number;
    nextPaymentDue?: UpcomingPaymentItem;
  };
  accounts: Account[];
  categories: Category[];
  onCreateRecurring: (item: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RecurringTransaction>;
  onUpdateRecurring: (id: string, updates: Partial<RecurringTransaction>) => Promise<void>;
  onDeleteRecurring: (id: string) => Promise<void>;
  onExecutePayment: (recurringId: string) => Promise<void>;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  recurringList,
  upcomingStatus,
  accounts,
  categories,
  onCreateRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onExecutePayment,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<RecurringTransaction | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const handlePayNow = async (id: string) => {
    try {
      setPayingId(id);
      await onExecutePayment(id);
    } finally {
      setPayingId(null);
    }
  };

  const handleToggleActive = async (item: RecurringTransaction) => {
    await onUpdateRecurring(item.id, { isActive: !item.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <CalendarClock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Gastos Recurrentes y Suscripciones</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Controla servicios periódicos (arriendo, servicios, Netflix, membresías) y anticipa tus pagos del mes.
          </p>
        </div>

        <button
          onClick={() => {
            setItemToEdit(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Pago Recurrente</span>
        </button>
      </div>

      {/* Tarjetas KPI de Obligaciones del Mes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Obligaciones del Mes
          </span>
          <MoneyBadge amountInCents={upcomingStatus.totalMonthlyObligationsInCents} size="lg" type="neutral" />
          <p className="text-[11px] text-zinc-400 mt-2">
            {recurringList.filter((r) => r.isActive).length} pagos periódicos activos
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Pagado este Mes
          </span>
          <MoneyBadge amountInCents={upcomingStatus.totalPaidThisMonthInCents} size="lg" type="income" />
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Ya registrado en contabilidad
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Pendiente por Pagar
          </span>
          <MoneyBadge amountInCents={upcomingStatus.totalPendingInCents} size="lg" type="expense" />
          <p className="text-[11px] text-zinc-400 mt-2">
            Compromisos por liquidar
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Próximo a Vencer
          </span>
          {upcomingStatus.nextPaymentDue ? (
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm block truncate">
                {upcomingStatus.nextPaymentDue.recurring.name}
              </span>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                {upcomingStatus.nextPaymentDue.daysRemaining === 0
                  ? 'Vence hoy'
                  : upcomingStatus.nextPaymentDue.daysRemaining > 0
                  ? `Vence en ${upcomingStatus.nextPaymentDue.daysRemaining} días`
                  : `Vencido hace ${Math.abs(upcomingStatus.nextPaymentDue.daysRemaining)} días`}
              </p>
            </div>
          ) : (
            <span className="text-xs text-emerald-600 font-medium mt-2 block">
              ¡Al día! Todo cubierto
            </span>
          )}
        </div>
      </div>

      {/* Próximos Pagos del Mes (Tarjetas interactivas con acción Pagar Ahora) */}
      <div className="space-y-3">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          Calendario de Vencimientos del Mes
        </h3>

        {upcomingStatus.items.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4">No tienes pagos periódicos registrados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingStatus.items.map((item) => {
              const isPaid = item.isPaidThisMonth;
              const isToday = item.daysRemaining === 0;
              const isOverdue = item.daysRemaining < 0;

              return (
                <div
                  key={item.recurring.id}
                  className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-colors ${
                    isPaid
                      ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/15 dark:bg-emerald-950/10'
                      : isOverdue
                      ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                      : isToday
                      ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {item.recurring.name}
                        </h4>
                        <span className="text-xs text-zinc-400 block mt-0.5">
                          Cuenta: {item.account?.name || 'N/A'}
                        </span>
                      </div>

                      {/* Badge de vencimiento */}
                      {isPaid ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          <Check className="w-3 h-3" />
                          <span>Pagado</span>
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                          <AlertCircle className="w-3 h-3" />
                          <span>Vencido ({Math.abs(item.daysRemaining)}d)</span>
                        </span>
                      ) : isToday ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Vence Hoy</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          <span>Vence en {item.daysRemaining} días</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-zinc-400 block font-medium">Monto</span>
                        <MoneyBadge amountInCents={item.recurring.amountInCents} size="lg" type="expense" />
                      </div>
                      <span className="text-xs text-zinc-400">
                        Fecha: <strong>{formatDateShort(item.dueDate)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 capitalize">
                      {item.category?.name || 'Gasto fijo'}
                    </span>

                    {!isPaid ? (
                      <button
                        onClick={() => handlePayNow(item.recurring.id)}
                        disabled={payingId === item.recurring.id}
                        className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {payingId === item.recurring.id ? 'Registrando...' : 'Pagar Ahora'}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cubierto</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Catálogo de Suscripciones y Pagos Fijos */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs space-y-4 p-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          Listado de Pagos Recurrentes ({recurringList.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Frecuencia</th>
                <th className="px-4 py-3">Día de Pago</th>
                <th className="px-4 py-3">Cuenta Débito</th>
                <th className="px-4 py-3 text-right">Monto (COP)</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
              {recurringList.map((item) => {
                const acc = accounts.find((a) => a.id === item.sourceAccountId);
                return (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                      {item.description && (
                        <span className="block text-[11px] text-zinc-400 font-normal">
                          {item.description}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-zinc-600 dark:text-zinc-400">
                      {item.frequency}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      Día {item.dueDay}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {acc?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      <MoneyBadge amountInCents={item.amountInCents} size="sm" type="expense" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                        title={item.isActive ? 'Pausar recordatorio' : 'Activar recordatorio'}
                      >
                        {item.isActive ? (
                          <>
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-2.5 h-2.5 fill-current" />
                            <span>Pausado</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => {
                            setItemToEdit(item);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRecurring(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <NewRecurringModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
        accounts={accounts}
        categories={categories}
        recurringToEdit={itemToEdit}
        onSubmit={async (item) => {
          await onCreateRecurring(item);
        }}
        onUpdate={onUpdateRecurring}
      />
    </div>
  );
};
