import type { Budget, BudgetCalculatedStatus, FinancialGoal, GoalCalculatedStatus } from '../types/budget.types';
import type { Transaction } from '../types/transaction.types';
import type { Category } from '../types/category.types';

/**
 * Calcula el estado de ejecución de los presupuestos para un mes y año específicos.
 */
export function calculateBudgetsStatus(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  year: number,
  month: number
): {
  items: BudgetCalculatedStatus[];
  totalAllocatedInCents: number;
  totalSpentInCents: number;
  totalRemainingInCents: number;
  overallPercentageUsed: number;
} {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Filtrar transacciones de gasto de este mes
  const monthExpenses = transactions.filter(
    (tx) => tx.type === 'expense' && tx.date.startsWith(monthPrefix)
  );

  let totalAllocatedInCents = 0;
  let totalSpentInCents = 0;

  const items: BudgetCalculatedStatus[] = budgets.map((b) => {
    // Sumar gastos correspondientes a la categoría de este presupuesto
    let spent = 0;
    for (const tx of monthExpenses) {
      if (tx.categoryId === b.categoryId) {
        if (!b.subcategoryId || tx.subcategoryId === b.subcategoryId) {
          spent += tx.amountInCents;
        }
      }
    }

    const remaining = b.amountInCents - spent;
    const percentageUsed = b.amountInCents > 0 ? Math.round((spent / b.amountInCents) * 100) : 0;
    const isExceeded = spent > b.amountInCents;

    totalAllocatedInCents += b.amountInCents;
    totalSpentInCents += spent;

    return {
      budget: b,
      category: categoryMap.get(b.categoryId),
      allocatedInCents: b.amountInCents,
      spentInCents: spent,
      remainingInCents: remaining,
      percentageUsed,
      isExceeded,
    };
  });

  const totalRemainingInCents = totalAllocatedInCents - totalSpentInCents;
  const overallPercentageUsed =
    totalAllocatedInCents > 0
      ? Math.round((totalSpentInCents / totalAllocatedInCents) * 100)
      : 0;

  return {
    items: items.sort((a, b) => b.percentageUsed - a.percentageUsed),
    totalAllocatedInCents,
    totalSpentInCents,
    totalRemainingInCents,
    overallPercentageUsed,
  };
}

/**
 * Calcula el progreso y cuota de ahorro mensual sugerida de una meta financiera.
 */
export function calculateGoalStatus(goal: FinancialGoal): GoalCalculatedStatus {
  const target = goal.targetAmountInCents;
  const current = goal.currentAmountInCents;
  const remaining = Math.max(0, target - current);
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const isCompleted = current >= target;

  let monthsRemaining: number | undefined = undefined;
  let suggestedMonthlySavingsInCents: number | undefined = undefined;

  if (goal.targetDate && !isCompleted) {
    const now = new Date();
    const [targetYear, targetMonth, targetDay] = goal.targetDate.split('-').map(Number);
    const targetD = new Date(targetYear, targetMonth - 1, targetDay);

    const diffMonths =
      (targetD.getFullYear() - now.getFullYear()) * 12 +
      (targetD.getMonth() - now.getMonth());

    // Si la fecha es este mes o el próximo, al menos 1 mes
    monthsRemaining = Math.max(1, diffMonths);
    suggestedMonthlySavingsInCents = Math.round(remaining / monthsRemaining);
  }

  return {
    goal,
    percentage,
    remainingInCents: remaining,
    monthsRemaining,
    suggestedMonthlySavingsInCents,
    isCompleted,
  };
}
