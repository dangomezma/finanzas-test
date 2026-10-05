import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import {
  createOrUpdateBudget,
  deleteBudget,
} from '../db/repositories/budgetRepository';
import { calculateBudgetsStatus } from '../core/accounting/budgetEngine';
import type { Budget } from '../core/types/budget.types';

export function useBudgets() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);

  const budgets = useLiveQuery(() => db.budgets.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  const monthBudgets = useMemo(() => {
    if (!budgets) return [];
    return budgets.filter((b) => b.year === selectedYear && b.month === selectedMonth);
  }, [budgets, selectedYear, selectedMonth]);

  const status = useMemo(() => {
    if (!budgets || !transactions || !categories) {
      return {
        items: [],
        totalAllocatedInCents: 0,
        totalSpentInCents: 0,
        totalRemainingInCents: 0,
        overallPercentageUsed: 0,
      };
    }

    return calculateBudgetsStatus(
      monthBudgets,
      transactions,
      categories,
      selectedYear,
      selectedMonth
    );
  }, [monthBudgets, transactions, categories, selectedYear, selectedMonth]);

  return {
    budgets: monthBudgets,
    allBudgets: budgets || [],
    status,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    isLoading: !budgets,
    createOrUpdateBudget,
    deleteBudget,
  };
}
