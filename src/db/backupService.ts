import { db } from './schema';
import type { Account } from '../core/types/account.types';
import type { Category } from '../core/types/category.types';
import type { Transaction } from '../core/types/transaction.types';
import type { Budget, FinancialGoal } from '../core/types/budget.types';
import type { RecurringTransaction } from '../core/types/recurring.types';

export interface DatabaseBackup {
  version: number;
  appName: string;
  exportedAt: string;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets?: Budget[];
  goals?: FinancialGoal[];
  recurring?: RecurringTransaction[];
}

/**
 * Exporta toda la base de datos local en un archivo JSON descargable.
 */
export async function exportDatabaseBackup(): Promise<void> {
  const accounts = await db.accounts.toArray();
  const categories = await db.categories.toArray();
  const transactions = await db.transactions.toArray();
  const budgets = await db.budgets.toArray();
  const goals = await db.goals.toArray();
  const recurring = await db.recurring.toArray();

  const backup: DatabaseBackup = {
    version: 3,
    appName: 'FinanzasPersonalesLocalCOP',
    exportedAt: new Date().toISOString(),
    accounts,
    categories,
    transactions,
    budgets,
    goals,
    recurring,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `finanzas_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Restaura la base de datos local a partir de un archivo JSON exportado previamente.
 */
export async function importDatabaseBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString) as DatabaseBackup;
    if (!data.accounts || !data.categories || !data.transactions) {
      return { success: false, message: 'El archivo de respaldo no tiene el formato válido requerido.' };
    }

    await db.transaction('rw', [db.accounts, db.categories, db.transactions, db.budgets, db.goals, db.recurring], async () => {
      await db.accounts.clear();
      await db.categories.clear();
      await db.transactions.clear();
      await db.budgets.clear();
      await db.goals.clear();
      await db.recurring.clear();

      await db.accounts.bulkAdd(data.accounts);
      await db.categories.bulkAdd(data.categories);
      await db.transactions.bulkAdd(data.transactions);
      if (data.budgets && data.budgets.length > 0) {
        await db.budgets.bulkAdd(data.budgets);
      }
      if (data.goals && data.goals.length > 0) {
        await db.goals.bulkAdd(data.goals);
      }
      if (data.recurring && data.recurring.length > 0) {
        await db.recurring.bulkAdd(data.recurring);
      }
    });

    return { success: true, message: 'Base de datos restaurada con éxito.' };
  } catch (error) {
    return { success: false, message: `Error al procesar el archivo: ${(error as Error).message}` };
  }
}
