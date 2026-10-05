import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { createTransaction, updateTransaction, deleteTransaction } from '../db/repositories/transactionRepository';
import { calculateCashFlowSummary } from '../core/accounting/balanceEngine';
import { getMonthRange } from '../core/formatters/date';
import type { Transaction, TransactionFilter } from '../core/types/transaction.types';

export function useTransactions() {
  const [filter, setFilter] = useState<TransactionFilter>({});

  const allTransactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), []);

  // Transacciones filtradas para vistas y tablas
  const filteredTransactions = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter((tx) => {
      if (filter.startDate && tx.date < filter.startDate) return false;
      if (filter.endDate && tx.date > filter.endDate) return false;
      if (filter.accountId && tx.sourceAccountId !== filter.accountId && tx.targetAccountId !== filter.accountId) return false;
      if (filter.categoryId && tx.categoryId !== filter.categoryId) return false;
      if (filter.type && filter.type !== 'all' && tx.type !== filter.type) return false;
      if (filter.selectedTag && (!tx.tags || !tx.tags.includes(filter.selectedTag))) return false;
      if (filter.minAmountInCents && tx.amountInCents < filter.minAmountInCents) return false;
      if (filter.maxAmountInCents && tx.amountInCents > filter.maxAmountInCents) return false;
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
        if (!matchesDesc && !matchesNotes) return false;
      }
      return true;
    });
  }, [allTransactions, filter]);

  // Resumen del mes en curso
  const currentMonthSummary = useMemo(() => {
    if (!allTransactions) return { totalIncomeInCents: 0, totalExpenseInCents: 0, netSavingsInCents: 0, savingsRatePercentage: 0 };
    const now = new Date();
    const { startDate, endDate } = getMonthRange(now.getFullYear(), now.getMonth() + 1);
    const monthTx = allTransactions.filter((tx) => tx.date >= startDate && tx.date <= endDate);
    return calculateCashFlowSummary(monthTx);
  }, [allTransactions]);

  return {
    transactions: allTransactions || [],
    filteredTransactions,
    currentMonthSummary,
    filter,
    setFilter,
    resetFilter: () => setFilter({}),
    isLoading: !allTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
