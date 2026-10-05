import type { Transaction } from '../types/transaction.types';
import type { Category } from '../types/category.types';
import type { Account } from '../types/account.types';

export interface MonthlyCashFlowPoint {
  monthKey: string;      // YYYY-MM
  label: string;         // "Ene 2026", "Feb 2026"
  incomeInCents: number;
  expenseInCents: number;
  savingsInCents: number;
}

export interface CategoryExpenseBreakdown {
  category: Category;
  amountInCents: number;
  percentage: number;
  transactionCount: number;
}

export interface NetWorthTimelinePoint {
  date: string;          // YYYY-MM-DD
  label: string;         // "15 Ene"
  netWorthInCents: number;
}

/**
 * Agrupa los últimos N meses en flujos de ingresos vs gastos.
 */
export function calculateMonthlyCashFlowHistory(
  transactions: Transaction[],
  monthsCount: number = 6
): MonthlyCashFlowPoint[] {
  const result: MonthlyCashFlowPoint[] = [];
  const now = new Date();

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' }).format(d);

    let incomeInCents = 0;
    let expenseInCents = 0;

    for (const tx of transactions) {
      if (tx.date.startsWith(monthKey)) {
        if (tx.type === 'income') incomeInCents += tx.amountInCents;
        else if (tx.type === 'expense') expenseInCents += tx.amountInCents;
      }
    }

    result.push({
      monthKey,
      label,
      incomeInCents,
      expenseInCents,
      savingsInCents: incomeInCents - expenseInCents,
    });
  }

  return result;
}

/**
 * Calcula el desglose detallado de gastos por categoría en un rango de fechas.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  startDate?: string,
  endDate?: string
): CategoryExpenseBreakdown[] {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const expenseMap = new Map<string, { amount: number; count: number }>();
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type !== 'expense' || !tx.categoryId) continue;
    if (startDate && tx.date < startDate) continue;
    if (endDate && tx.date > endDate) continue;

    totalExpense += tx.amountInCents;
    const current = expenseMap.get(tx.categoryId) || { amount: 0, count: 0 };
    expenseMap.set(tx.categoryId, {
      amount: current.amount + tx.amountInCents,
      count: current.count + 1,
    });
  }

  const breakdown: CategoryExpenseBreakdown[] = [];
  for (const [catId, data] of expenseMap.entries()) {
    const cat = catMap.get(catId);
    if (cat) {
      breakdown.push({
        category: cat,
        amountInCents: data.amount,
        percentage: totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0,
        transactionCount: data.count,
      });
    }
  }

  return breakdown.sort((a, b) => b.amountInCents - a.amountInCents);
}

/**
 * Calcula la evolución del patrimonio neto a lo largo del tiempo.
 */
export function calculateNetWorthTimeline(
  accounts: Account[],
  transactions: Transaction[],
  pointsCount: number = 10
): NetWorthTimelinePoint[] {
  if (transactions.length === 0) return [];

  // Ordenar transacciones ascendente por fecha
  const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  const earliestDate = sortedTx[0].date;
  const latestDate = sortedTx[sortedTx.length - 1].date;

  // Si todas las transacciones son del mismo día
  if (earliestDate === latestDate) {
    let initialAssets = accounts.reduce((sum, a) => sum + (a.type !== 'credit_card' ? a.initialBalanceInCents : 0), 0);
    let initialDebt = accounts.reduce((sum, a) => sum + (a.type === 'credit_card' ? a.initialBalanceInCents : 0), 0);
    let net = initialAssets - initialDebt;

    for (const tx of sortedTx) {
      if (tx.type === 'income') net += tx.amountInCents;
      if (tx.type === 'expense') net -= tx.amountInCents;
    }

    return [{
      date: latestDate,
      label: 'Actual',
      netWorthInCents: net,
    }];
  }

  // Generar puntos cronológicos
  const start = new Date(earliestDate).getTime();
  const end = new Date(latestDate).getTime();
  const step = (end - start) / Math.max(1, pointsCount - 1);

  const points: NetWorthTimelinePoint[] = [];

  for (let i = 0; i < pointsCount; i++) {
    const time = start + step * i;
    const dateStr = new Date(time).toISOString().split('T')[0];

    // Calcular patrimonio en este punto temporal
    let net = accounts.reduce(
      (sum, a) => sum + (a.type !== 'credit_card' ? a.initialBalanceInCents : -a.initialBalanceInCents),
      0
    );

    for (const tx of sortedTx) {
      if (tx.date <= dateStr) {
        if (tx.type === 'income') net += tx.amountInCents;
        else if (tx.type === 'expense') net -= tx.amountInCents;
      }
    }

    const d = new Date(dateStr);
    const label = `${d.getDate()} ${new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(d)}`;

    points.push({
      date: dateStr,
      label,
      netWorthInCents: net,
    });
  }

  return points;
}
