import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import type { RecurringTransaction, UpcomingPaymentItem } from '../../core/types/recurring.types';
import { formatCOP } from '../../core/formatters/money';

interface DashboardCalendarWidgetProps {
  recurringList: RecurringTransaction[];
  upcomingPayments: UpcomingPaymentItem[];
  onNavigateToCalendar: () => void;
  onExecutePayment?: (recurringId: string) => Promise<unknown>;
}

export const DashboardCalendarWidget: React.FC<DashboardCalendarWidgetProps> = ({
  recurringList,
  upcomingPayments,
  onNavigateToCalendar,
  onExecutePayment,
}) => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Buscar el próximo día de pago (ingreso/salario/quincena)
  const incomeItems = recurringList.filter((item) => item.type === 'income' && item.isActive);

  let nextPaydayInfo: { name: string; day: number; daysLeft: number; amountInCents: number } | null = null;

  if (incomeItems.length > 0) {
    let minDaysLeft = Infinity;

    for (const item of incomeItems) {
      // Evaluar día 1
      const d1 = Math.min(item.dueDay, daysInMonth);
      let diff1 = d1 - currentDay;
      if (diff1 < 0) {
        // Pasa al próximo mes
        diff1 += daysInMonth;
      }
      if (diff1 < minDaysLeft) {
        minDaysLeft = diff1;
        nextPaydayInfo = { name: item.name, day: d1, daysLeft: diff1, amountInCents: item.amountInCents };
      }

      // Evaluar día 2 si es quincenal
      if (item.dueDay2) {
        const d2 = Math.min(item.dueDay2, daysInMonth);
        let diff2 = d2 - currentDay;
        if (diff2 < 0) {
          diff2 += daysInMonth;
        }
        if (diff2 < minDaysLeft) {
          minDaysLeft = diff2;
          nextPaydayInfo = { name: item.name, day: d2, daysLeft: diff2, amountInCents: item.amountInCents };
        }
      }
    }
  }

  // Filtrar los próximos 4 pagos pendientes ordenados
  const nextPendingPayments = upcomingPayments
    .filter((p) => !p.isPaidThisMonth && p.recurring.type === 'expense')
    .slice(0, 3);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              Agenda Financiera y Quincenas
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Control de fechas clave, ingresos y vencimientos cercanos
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToCalendar}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
        >
          <span>Ver Calendario</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta de Próximo Día de Pago / Quincena */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                  Próximo Ingreso / Salario
                </span>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {nextPaydayInfo ? nextPaydayInfo.name : 'Sin salario programado'}
                </h4>
              </div>
            </div>

            {nextPaydayInfo && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                {nextPaydayInfo.daysLeft === 0
                  ? '¡HOY!'
                  : nextPaydayInfo.daysLeft === 1
                  ? 'Mañana'
                  : `En ${nextPaydayInfo.daysLeft} días`}
              </span>
            )}
          </div>

          {nextPaydayInfo ? (
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Fecha: Día {nextPaydayInfo.day} del mes
              </span>
              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                +{formatCOP(nextPaydayInfo.amountInCents)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Programa tu nómina quincenal o mensual en el calendario para proyectar tus flujos.
            </p>
          )}
        </div>

        {/* Próximos Pagos / Vencimientos Pendientes */}
        <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-2">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Próximos Vencimientos Inmediatos
          </span>

          {nextPendingPayments.length === 0 ? (
            <div className="py-2 text-center text-xs text-zinc-400 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No tienes pagos pendientes próximos por vencer.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {nextPendingPayments.map((p) => (
                <div
                  key={p.recurring.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-zinc-200/60 dark:border-zinc-700/60 last:border-0"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        p.daysRemaining <= 0
                          ? 'bg-rose-500'
                          : p.daysRemaining <= 3
                          ? 'bg-amber-500'
                          : 'bg-zinc-400'
                      }`}
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {p.recurring.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0">
                      ({p.daysRemaining <= 0 ? 'Hoy/Vence' : `en ${p.daysRemaining}d`})
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCOP(p.recurring.amountInCents)}
                    </span>
                    {onExecutePayment && (
                      <button
                        onClick={() => onExecutePayment(p.recurring.id)}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-200 dark:bg-zinc-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors cursor-pointer"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
