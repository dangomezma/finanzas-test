import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import type { FinancialGoal, GoalCalculatedStatus } from '../../core/types/budget.types';
import { MoneyBadge } from '../common/MoneyBadge';
import { formatCOP } from '../../core/formatters/money';
import { formatDateShort } from '../../core/formatters/date';
import { NewGoalModal } from './NewGoalModal';
import { AddFundsGoalModal } from './AddFundsGoalModal';

interface GoalsViewProps {
  goalsWithStatus: GoalCalculatedStatus[];
  totalSavedInGoalsInCents: number;
  onCreateGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FinancialGoal>;
  onUpdateGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
  onAddFunds: (id: string, deltaAmountInCents: number) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goalsWithStatus,
  totalSavedInGoalsInCents,
  onCreateGoal,
  onUpdateGoal,
  onAddFunds,
  onDeleteGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'in_progress' | 'completed'>('in_progress');
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);
  const [fundGoal, setFundGoal] = useState<FinancialGoal | null>(null);

  const displayedGoals = goalsWithStatus.filter((g) => {
    if (activeTab === 'in_progress') return g.goal.status === 'in_progress' && !g.isCompleted;
    return g.goal.status === 'completed' || g.isCompleted;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Metas Financieras y Ahorro</span>
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Define tus objetivos de corto, mediano y largo plazo y monitorea tu progreso en pesos colombianos.
          </p>
        </div>

        <button
          onClick={() => {
            setGoalToEdit(null);
            setIsNewGoalOpen(true);
          }}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Meta</span>
        </button>
      </div>

      {/* KPI de Ahorro en Metas */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Total Asignado a Metas de Ahorro
          </span>
          <div className="mt-1">
            <MoneyBadge amountInCents={totalSavedInGoalsInCents} size="xl" type="balance" />
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Fondos reservados para tus proyectos personales y fondo de emergencia.
          </p>
        </div>

        {/* Pestañas de estado */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'in_progress'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            En Progreso ({goalsWithStatus.filter((g) => !g.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Cumplidas ({goalsWithStatus.filter((g) => g.isCompleted).length})
          </button>
        </div>
      </div>

      {/* Grid de Metas */}
      {displayedGoals.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
          <Target className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="font-semibold text-sm">
            {activeTab === 'in_progress'
              ? 'No tienes metas activas en este momento.'
              : 'Aún no has completado ninguna meta.'}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            Crea tu primera meta financiera para comenzar a reservar fondos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedGoals.map((item) => {
            const { goal, percentage, remainingInCents, suggestedMonthlySavingsInCents, isCompleted } = item;

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div>
                  {/* Encabezado de meta */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: goal.color || '#10b981' }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-snug">
                          {goal.name}
                        </h4>
                        {goal.targetDate && (
                          <span className="text-[11px] text-zinc-400 flex items-center space-x-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>Meta: {formatDateShort(goal.targetDate)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setGoalToEdit(goal);
                          setIsNewGoalOpen(true);
                        }}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar meta"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Eliminar meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progreso visual y montos */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-zinc-400 block font-medium">Ahorrado</span>
                        <MoneyBadge amountInCents={goal.currentAmountInCents} size="md" type="balance" />
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-zinc-400 block font-medium">Objetivo</span>
                        <MoneyBadge amountInCents={goal.targetAmountInCents} size="md" type="neutral" />
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: goal.color || '#10b981',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                      <span>Progreso: {percentage}%</span>
                      {isCompleted ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>¡Meta Lograda!</span>
                        </span>
                      ) : (
                        <span>Falta: {formatCOP(remainingInCents)}</span>
                      )}
                    </div>
                  </div>

                  {/* Cuota de ahorro sugerida */}
                  {suggestedMonthlySavingsInCents && !isCompleted && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Ahorro mensual sugerido: <strong>{formatCOP(suggestedMonthlySavingsInCents)}/mes</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones al pie */}
                <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400 capitalize">
                    {goal.status === 'in_progress' ? 'En marcha' : 'Completada'}
                  </span>

                  <button
                    onClick={() => setFundGoal(goal)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>Ajustar Fondos</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <NewGoalModal
        isOpen={isNewGoalOpen}
        onClose={() => {
          setIsNewGoalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
        onSubmit={async (g) => {
          await onCreateGoal(g);
        }}
        onUpdate={onUpdateGoal}
      />

      <AddFundsGoalModal
        goal={fundGoal}
        isOpen={Boolean(fundGoal)}
        onClose={() => setFundGoal(null)}
        onSubmit={async (id, delta) => {
          await onAddFunds(id, delta);
        }}
      />
    </div>
  );
};
