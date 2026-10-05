import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import {
  createRecurring,
  updateRecurring,
  deleteRecurring,
  executeRecurringPayment,
} from '../db/repositories/recurringRepository';
import { calculateUpcomingPayments } from '../core/accounting/recurringEngine';
import type { RecurringTransaction } from '../core/types/recurring.types';

export function useRecurring() {
  const recurringList = useLiveQuery(() => db.recurring.toArray(), []);
  const transactions = useLiveQuery(() => db.transactions.toArray(), []);
  const accounts = useLiveQuery(() => db.accounts.toArray(), []);
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  const upcomingStatus = useMemo(() => {
    if (!recurringList || !transactions || !accounts || !categories) {
      return {
        items: [],
        totalMonthlyObligationsInCents: 0,
        totalPaidThisMonthInCents: 0,
        totalPendingInCents: 0,
        nextPaymentDue: undefined,
      };
    }

    return calculateUpcomingPayments(
      recurringList,
      transactions,
      accounts,
      categories
    );
  }, [recurringList, transactions, accounts, categories]);

  return {
    recurringList: recurringList || [],
    upcomingStatus,
    isLoading: !recurringList,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurringPayment,
  };
}
