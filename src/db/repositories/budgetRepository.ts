import { db } from '../schema';
import type { Budget } from '../../core/types/budget.types';
import { INITIAL_BUDGETS } from '../seedData';

export async function initializeBudgetsIfNeeded(): Promise<void> {
  const count = await db.budgets.count();
  if (count === 0) {
    await db.budgets.bulkAdd(INITIAL_BUDGETS);
  }
}

export async function getAllBudgets(): Promise<Budget[]> {
  await initializeBudgetsIfNeeded();
  return db.budgets.toArray();
}

export async function getBudgetsForMonth(year: number, month: number): Promise<Budget[]> {
  await initializeBudgetsIfNeeded();
  return db.budgets.where({ year, month }).toArray();
}

export async function createOrUpdateBudget(
  budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Budget> {
  // Buscar si ya existe presupuesto para esta categoría en este mes
  const existing = await db.budgets
    .filter(
      (b) =>
        b.categoryId === budgetData.categoryId &&
        b.year === budgetData.year &&
        b.month === budgetData.month &&
        b.subcategoryId === budgetData.subcategoryId
    )
    .first();

  if (existing) {
    const updated: Budget = {
      ...existing,
      amountInCents: budgetData.amountInCents,
      updatedAt: new Date().toISOString(),
    };
    await db.budgets.put(updated);
    return updated;
  }

  const newBudget: Budget = {
    ...budgetData,
    id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.budgets.add(newBudget);
  return newBudget;
}

export async function deleteBudget(id: string): Promise<void> {
  await db.budgets.delete(id);
}
