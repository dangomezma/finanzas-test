import { db } from '../schema';
import type { FinancialGoal } from '../../core/types/budget.types';
import { INITIAL_GOALS } from '../seedData';

export async function initializeGoalsIfNeeded(): Promise<void> {
  const count = await db.goals.count();
  if (count === 0) {
    await db.goals.bulkAdd(INITIAL_GOALS);
  }
}

export async function getAllGoals(): Promise<FinancialGoal[]> {
  await initializeGoalsIfNeeded();
  return db.goals.toArray();
}

export async function createGoal(
  goalData: Omit<FinancialGoal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FinancialGoal> {
  const newGoal: FinancialGoal = {
    ...goalData,
    id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.goals.add(newGoal);
  return newGoal;
}

export async function updateGoal(id: string, updates: Partial<FinancialGoal>): Promise<void> {
  await db.goals.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function addFundsToGoal(id: string, deltaAmountInCents: number): Promise<void> {
  const goal = await db.goals.get(id);
  if (!goal) return;

  const newCurrent = Math.max(0, goal.currentAmountInCents + deltaAmountInCents);
  const isCompleted = newCurrent >= goal.targetAmountInCents;

  await db.goals.update(id, {
    currentAmountInCents: newCurrent,
    status: isCompleted ? 'completed' : goal.status === 'completed' ? 'in_progress' : goal.status,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteGoal(id: string): Promise<void> {
  await db.goals.delete(id);
}
