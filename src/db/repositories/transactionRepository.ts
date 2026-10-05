import { db } from '../schema';
import type { Transaction, TransactionFilter } from '../../core/types/transaction.types';
import { initializeDatabaseIfNeeded } from './accountRepository';

export async function getAllTransactions(): Promise<Transaction[]> {
  await initializeDatabaseIfNeeded();
  return db.transactions.orderBy('date').reverse().toArray();
}

export async function getTransactionsByFilter(filter: TransactionFilter): Promise<Transaction[]> {
  await initializeDatabaseIfNeeded();
  let collection = db.transactions.toCollection();

  const all = await collection.toArray();

  return all
    .filter((tx) => {
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
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function createTransaction(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.transactions.add(newTx);
  return newTx;
}

export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  await db.transactions.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}
