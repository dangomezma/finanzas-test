import Dexie, { type Table } from 'dexie';
import type { Account } from '../core/types/account.types';
import type { Category } from '../core/types/category.types';
import type { Transaction } from '../core/types/transaction.types';
import type { Budget, FinancialGoal } from '../core/types/budget.types';
import type { RecurringTransaction } from '../core/types/recurring.types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
  INITIAL_RECURRING,
} from './seedData';

export class FinanceDatabase extends Dexie {
  accounts!: Table<Account, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  goals!: Table<FinancialGoal, string>;
  recurring!: Table<RecurringTransaction, string>;

  constructor() {
    super('PersonalFinanceLocalDB');

    this.version(1).stores({
      accounts: 'id, name, type, isActive, createdAt',
      categories: 'id, name, type, isSystemDefault',
      transactions: 'id, type, date, sourceAccountId, targetAccountId, categoryId, createdAt, [sourceAccountId+date], [categoryId+date]',
    });

    this.version(2).stores({
      budgets: 'id, categoryId, [year+month], [categoryId+year+month]',
      goals: 'id, status, createdAt',
    });

    this.version(3).stores({
      recurring: 'id, isActive, frequency, dueDay, sourceAccountId, categoryId, createdAt',
    });

    this.on('populate', () => {
      this.accounts.bulkAdd(INITIAL_ACCOUNTS);
      this.categories.bulkAdd(INITIAL_CATEGORIES);
      this.transactions.bulkAdd(INITIAL_TRANSACTIONS);
      this.budgets.bulkAdd(INITIAL_BUDGETS);
      this.goals.bulkAdd(INITIAL_GOALS);
      this.recurring.bulkAdd(INITIAL_RECURRING);
    });
  }
}

export const db = new FinanceDatabase();
