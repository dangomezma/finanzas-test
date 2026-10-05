import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import {
  createGoal,
  updateGoal,
  addFundsToGoal,
  deleteGoal,
} from '../db/repositories/goalRepository';
import { calculateGoalStatus } from '../core/accounting/budgetEngine';
import type { FinancialGoal, GoalCalculatedStatus } from '../core/types/budget.types';

export function useGoals() {
  const goals = useLiveQuery(() => db.goals.toArray(), []);

  const goalsWithStatus: GoalCalculatedStatus[] = useMemo(() => {
    if (!goals) return [];
    return goals.map((g) => calculateGoalStatus(g));
  }, [goals]);

  const activeGoals = useMemo(
    () => goalsWithStatus.filter((g) => g.goal.status === 'in_progress'),
    [goalsWithStatus]
  );

  const completedGoals = useMemo(
    () => goalsWithStatus.filter((g) => g.goal.status === 'completed' || g.isCompleted),
    [goalsWithStatus]
  );

  const totalSavedInGoalsInCents = useMemo(() => {
    if (!goals) return 0;
    return goals.reduce((sum, g) => sum + g.currentAmountInCents, 0);
  }, [goals]);

  return {
    goals: goals || [],
    goalsWithStatus,
    activeGoals,
    completedGoals,
    totalSavedInGoalsInCents,
    isLoading: !goals,
    createGoal,
    updateGoal,
    addFundsToGoal,
    deleteGoal,
  };
}
