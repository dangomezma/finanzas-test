import type { RecurringTransaction, UpcomingPaymentItem } from '../types/recurring.types';
import type { Transaction } from '../types/transaction.types';
import type { Account } from '../types/account.types';
import type { Category } from '../types/category.types';

/**
 * Calcula los próximos pagos para el mes actual, determinando días faltantes y si ya fueron cubiertos.
 */
export function calculateUpcomingPayments(
  recurringList: RecurringTransaction[],
  transactions: Transaction[],
  accounts: Account[],
  categories: Category[],
  currentDate: Date = new Date()
): {
  items: UpcomingPaymentItem[];
  totalMonthlyObligationsInCents: number;
  totalPaidThisMonthInCents: number;
  totalPendingInCents: number;
  nextPaymentDue?: UpcomingPaymentItem;
} {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Transacciones ocurridas este mes
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(monthPrefix));

  let totalMonthlyObligationsInCents = 0;
  let totalPaidThisMonthInCents = 0;
  let totalPendingInCents = 0;

  const items: UpcomingPaymentItem[] = [];

  for (const item of recurringList) {
    if (!item.isActive) continue;

    // Calcular fecha exacta de vencimiento este mes
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const actualDueDay = Math.min(item.dueDay, daysInMonth);
    const dueDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(actualDueDay).padStart(2, '0')}`;

    // Calcular días restantes respecto a hoy
    const daysRemaining = actualDueDay - currentDay;

    // Determinar si ya fue pagado este mes:
    // 1. Si lastGeneratedDate es de este mes
    // 2. O si existe una transacción con descripción similar o vinculada
    const hasGeneratedRecord = Boolean(item.lastGeneratedDate && item.lastGeneratedDate.startsWith(monthPrefix));
    const hasMatchingTx = monthTransactions.some((tx) => {
      const isSameAccount = tx.sourceAccountId === item.sourceAccountId;
      const isSameCategory = item.categoryId ? tx.categoryId === item.categoryId : true;
      const descLower = tx.description.toLowerCase();
      const nameLower = item.name.toLowerCase();
      const isNameMatched = descLower.includes(nameLower) || nameLower.includes(descLower);
      return (isSameAccount && isNameMatched) || (isSameCategory && isNameMatched);
    });

    const isPaidThisMonth = hasGeneratedRecord || hasMatchingTx;

    totalMonthlyObligationsInCents += item.amountInCents;
    if (isPaidThisMonth) {
      totalPaidThisMonthInCents += item.amountInCents;
    } else {
      totalPendingInCents += item.amountInCents;
    }

    items.push({
      recurring: item,
      account: accountMap.get(item.sourceAccountId),
      category: item.categoryId ? categoryMap.get(item.categoryId) : undefined,
      dueDate,
      daysRemaining,
      isPaidThisMonth,
    });
  }

  // Ordenar: primero los pendientes (más próximos a vencer primero), luego los ya pagados
  items.sort((a, b) => {
    if (a.isPaidThisMonth !== b.isPaidThisMonth) {
      return a.isPaidThisMonth ? 1 : -1;
    }
    return a.daysRemaining - b.daysRemaining;
  });

  const nextPaymentDue = items.find((i) => !i.isPaidThisMonth);

  return {
    items,
    totalMonthlyObligationsInCents,
    totalPaidThisMonthInCents,
    totalPendingInCents,
    nextPaymentDue,
  };
}
