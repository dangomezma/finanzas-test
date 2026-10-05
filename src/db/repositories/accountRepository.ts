import { db } from '../schema';
import type { Account } from '../../core/types/account.types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../seedData';

let initPromise: Promise<void> | null = null;

export async function initializeDatabaseIfNeeded(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      await db.open();
      const accountCount = await db.accounts.count();
      if (accountCount === 0) {
        await db.transaction('rw', [db.accounts, db.categories, db.transactions], async () => {
          const count = await db.accounts.count();
          if (count === 0) {
            await db.accounts.bulkAdd(INITIAL_ACCOUNTS);
            await db.categories.bulkAdd(INITIAL_CATEGORIES);
            await db.transactions.bulkAdd(INITIAL_TRANSACTIONS);
          }
        });
      }
    } catch (err) {
      console.warn('Database initialization completed or already initialized:', err);
    }
  })();

  return initPromise;
}

export async function getAllAccounts(): Promise<Account[]> {
  await initializeDatabaseIfNeeded();
  return db.accounts.toArray();
}

export async function getAccountById(id: string): Promise<Account | undefined> {
  return db.accounts.get(id);
}

export async function createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
  const newAccount: Account = {
    ...account,
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.accounts.add(newAccount);
  return newAccount;
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<void> {
  await db.accounts.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteAccount(id: string): Promise<void> {
  await db.transaction('rw', [db.accounts, db.transactions], async () => {
    await db.accounts.delete(id);
    await db.transactions.where('sourceAccountId').equals(id).delete();
    await db.transactions.where('targetAccountId').equals(id).delete();
  });
}
