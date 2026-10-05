import Dexie, { type Table } from 'dexie';
import type { Account } from '../core/types/account.types';
import type { Category } from '../core/types/category.types';
import type { Transaction } from '../core/types/transaction.types';
import type { Budget, FinancialGoal } from '../core/types/budget.types';
import type { RecurringTransaction } from '../core/types/recurring.types';
import { INITIAL_CATEGORIES } from './seedData';

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

    // En la primera inicialización de la base de datos, solo se cargan las categorías maestras del sistema.
    // Todas las cuentas, saldos, transacciones, presupuestos, metas y suscripciones comienzan en CERO.
    this.on('populate', () => {
      this.categories.bulkAdd(INITIAL_CATEGORIES);
    });
  }
}

export const db = new FinanceDatabase();

// Limpieza automática de datos de demostración antiguos si el navegador tenía la versión anterior en caché
db.on('ready', async () => {
  try {
    const demoTx = await db.transactions.get('tx-seed-1');
    const demoAcc = await db.accounts.get('acc-bancolombia');
    if (demoTx || demoAcc) {
      await db.transaction('rw', [db.accounts, db.transactions, db.budgets, db.goals, db.recurring], async () => {
        await db.accounts.clear();
        await db.transactions.clear();
        await db.budgets.clear();
        await db.goals.clear();
        await db.recurring.clear();
      });
    }
  } catch {
    // Silencioso en caso de inicialización normal
  }
});
