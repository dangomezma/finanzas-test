import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  X,
  CreditCard,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import type { Account } from '../../core/types/account.types';
import type { Category } from '../../core/types/category.types';
import type { RecurringTransaction } from '../../core/types/recurring.types';
import { formatCOP } from '../../core/formatters/money';
import { QuickPresetBubbles, type QuickPreset } from './QuickPresetBubbles';
import { NewScheduledModal } from './NewScheduledModal';

interface CalendarViewProps {
  accounts: Account[];
  categories: Category[];
  recurringList: RecurringTransaction[];
  onCreateRecurring: (item: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<RecurringTransaction>;
  onDeleteRecurring: (id: string) => Promise<void>;
  onExecutePayment: (recurringId: string, paymentDate?: string) => Promise<unknown>;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const WEEKDAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  accounts,
  categories,
  recurringList,
  onCreateRecurring,
  onDeleteRecurring,
  onExecutePayment,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<QuickPreset | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RecurringTransaction | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Navegación de meses
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Cálculos del mes
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Día de la semana en que inicia el mes (0 domingo, 1 lunes... convertimos a 0 lunes)
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Mapear eventos a días
  const eventsByDay = useMemo(() => {
    const map = new Map<number, RecurringTransaction[]>();
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      map.set(day, []);
    }

    for (const item of recurringList) {
      if (!item.isActive) continue;
      // Primer día de cobro/pago
      const d1 = Math.min(item.dueDay, daysInCurrentMonth);
      map.get(d1)?.push(item);

      // Segundo día si es quincenal
      if (item.dueDay2) {
        const d2 = Math.min(item.dueDay2, daysInCurrentMonth);
        if (d2 !== d1) {
          map.get(d2)?.push(item);
        }
      }
    }
    return map;
  }, [recurringList, daysInCurrentMonth]);

  // Totales mensuales proyectados
  const { totalIncomeInCents, totalExpenseInCents } = useMemo(() => {
    let income = 0;
    let expense = 0;

    for (const item of recurringList) {
      if (!item.isActive) continue;
      const multiplier = item.dueDay2 ? 2 : 1;
      const amount = item.amountInCents * multiplier;
      if (item.type === 'income') {
        income += amount;
      } else {
        expense += amount;
      }
    }

    return { totalIncomeInCents: income, totalExpenseInCents: expense };
  }, [recurringList]);

  const netCashFlowInCents = totalIncomeInCents - totalExpenseInCents;

  const handleOpenPreset = (preset: QuickPreset) => {
    setActivePreset(preset);
    setIsModalOpen(true);
  };

  const handleOpenCustom = () => {
    setActivePreset(null);
    setIsModalOpen(true);
  };

  const handleMarkAsPaid = async (item: RecurringTransaction, day: number) => {
    try {
      const paymentDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      await onExecutePayment(item.id, paymentDate);
      setActionSuccess(`Pago de "${item.name}" registrado formalmente en la contabilidad.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Resumen de Navegación */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Calendario Financiero</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Control de días de pago, quincenas, vencimientos de servicios y compromisos fijos.
          </p>
        </div>

        {/* Selector de Mes */}
        <div className="flex items-center space-x-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl shadow-xs self-start md:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="px-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 min-w-36 text-center">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleGoToToday}
            className="ml-1 text-xs font-semibold px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl transition-colors cursor-pointer"
          >
            Hoy
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Burbujas de Creación Rápida */}
      <QuickPresetBubbles
        onSelectPreset={handleOpenPreset}
        onCustomClick={handleOpenCustom}
      />

      {/* Tarjetas de Proyección Mensual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span>Ingresos Programados (Quincenas/Sueldo)</span>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCOP(totalIncomeInCents)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
            <span>Gastos Fijos Programados</span>
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatCOP(totalExpenseInCents)}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Flujo Neto Estimado</span>
          </div>
          <div
            className={`text-xl font-bold ${
              netCashFlowInCents >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCOP(netCashFlowInCents)}
          </div>
        </div>
      </div>

      {/* Matriz del Calendario (7 Columnas) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xs overflow-hidden">
        {/* Cabecera de días de la semana */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-zinc-400 dark:text-zinc-500">
          {WEEKDAY_NAMES.map((w) => (
            <div key={w} className="py-1">
              {w}
            </div>
          ))}
        </div>

        {/* Celdas del Mes */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Espacios vacíos antes del día 1 */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-16 sm:min-h-24 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-transparent"
            />
          ))}

          {/* Días del 1 al N */}
          {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              dayNum === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();

            const dayEvents = eventsByDay.get(dayNum) || [];
            const hasIncome = dayEvents.some((e) => e.type === 'income');
            const hasExpense = dayEvents.some((e) => e.type === 'expense');

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(dayNum)}
                className={`min-h-16 sm:min-h-24 p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="hidden sm:inline-block text-[10px] text-zinc-400 font-medium">
                      {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  )}
                </div>

                {/* Etiquetas de Eventos */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const isInc = ev.type === 'income';
                    const isPaid = ev.lastGeneratedDate?.startsWith(monthPrefix);

                    return (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium flex items-center justify-between ${
                          isInc
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}
                        title={`${ev.name} - ${formatCOP(ev.amountInCents)}`}
                      >
                        <span className="truncate">{ev.name}</span>
                        {isPaid && <CheckCircle2 className="w-2.5 h-2.5 shrink-0 ml-1 text-emerald-600" />}
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <span className="text-[10px] font-semibold text-zinc-400 block text-right">
                      +{dayEvents.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista Completa de Compromisos Programados con opción de Eliminación */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
              Todos tus Compromisos Programados
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Aquí puedes ver, gestionar o eliminar cualquier compromiso (arriendo, pago de tarjeta, sueldos, etc.).
            </p>
          </div>

          <button
            onClick={handleOpenCustom}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Compromiso</span>
          </button>
        </div>

        {recurringList.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400 space-y-2">
            <CalendarIcon className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
            <p>No tienes ningún gasto fijo ni sueldo programado aún.</p>
            <p className="text-zinc-500">
              Usa las <strong>Burbujas de Creación Rápida</strong> de arriba para programar tu nómina o tus pagos con un solo clic.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recurringList.map((item) => {
              const isIncome = item.type === 'income';
              const account = accountMap.get(item.sourceAccountId);
              const category = item.categoryId ? categoryMap.get(item.categoryId) : undefined;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/50 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        {item.dueDay2
                          ? `Quincenal: Días ${item.dueDay} y ${item.dueDay2}`
                          : `Mensual: Día ${item.dueDay}`}
                      </span>
                    </div>

                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este compromiso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-400">
                      {account?.name || 'Cuenta no asignada'}
                    </span>
                    <span
                      className={`font-bold ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {formatCOP(item.amountInCents)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal / Popover de Detalle del Día Seleccionado */}
      {selectedDay !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Día {selectedDay} de {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <p className="text-xs text-zinc-400">
                  Movimientos programados para esta fecha
                </p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(!eventsByDay.get(selectedDay) || eventsByDay.get(selectedDay)?.length === 0) ? (
              <div className="py-8 text-center text-xs text-zinc-400 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <p>No tienes ningún cobro ni pago programado para este día.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsByDay.get(selectedDay)?.map((ev) => {
                  const isInc = ev.type === 'income';
                  const isPaid = ev.lastGeneratedDate?.startsWith(monthPrefix);

                  return (
                    <div
                      key={ev.id}
                      className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isInc ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                            {ev.name}
                          </span>
                        </div>
                        <span
                          className={`font-bold text-sm ${
                            isInc
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {formatCOP(ev.amountInCents)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-zinc-400">
                          {accountMap.get(ev.sourceAccountId)?.name || 'Cuenta'}
                        </span>

                        <div className="flex items-center space-x-2">
                          {isPaid ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Pagado</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleMarkAsPaid(ev, selectedDay)}
                              className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-xs"
                            >
                              Marcar {isInc ? 'Cobrado' : 'Pagado'} Hoy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(null);
                  handleOpenCustom();
                }}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                + Programar compromiso en este día
              </button>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Compromiso */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  ¿Eliminar compromiso?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  "{itemToDelete.name}"
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Este evento dejará de mostrarse en el calendario y en el cálculo de flujo futuro. Las transacciones que ya hayas registrado en el pasado se mantendrán intactas.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await onDeleteRecurring(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Compromiso */}
      <NewScheduledModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActivePreset(null);
        }}
        preset={activePreset}
        accounts={accounts}
        categories={categories}
        onSave={async (data) => {
          await onCreateRecurring(data);
        }}
      />
    </div>
  );
};
