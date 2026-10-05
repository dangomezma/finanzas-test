import { db } from '../schema';
import type { RecurringTransaction } from '../../core/types/recurring.types';
import type { Transaction } from '../../core/types/transaction.types';
import { INITIAL_RECURRING } from '../seedData';
import { getTodayDateString } from '../../core/formatters/date';

export async function initializeRecurringIfNeeded(): Promise<void> {
  const count = await db.recurring.count();
  if (count === 0) {
    await db.recurring.bulkAdd(INITIAL_RECURRING);
  }
}

export async function getAllRecurring(): Promise<RecurringTransaction[]> {
  await initializeRecurringIfNeeded();
  return db.recurring.toArray();
}

export async function createRecurring(
  item: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<RecurringTransaction> {
  const newRecurring: RecurringTransaction = {
    ...item,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.recurring.add(newRecurring);
  return newRecurring;
}

export async function updateRecurring(
  id: string,
  updates: Partial<RecurringTransaction>
): Promise<void> {
  await db.recurring.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteRecurring(id: string): Promise<void> {
  await db.recurring.delete(id);
}

/**
 * Registra formalmente el pago de un servicio o suscripción recurrente en el libro contable de transacciones.
 */
export async function executeRecurringPayment(
  recurringId: string,
  paymentDate: string = getTodayDateString()
): Promise<Transaction | null> {
  const recurring = await db.recurring.get(recurringId);
  if (!recurring) return null;

  const newTx: Transaction = {
    id: `tx-rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: recurring.type,
    amountInCents: recurring.amountInCents,
    currency: 'COP',
    date: paymentDate,
    sourceAccountId: recurring.sourceAccountId,
    categoryId: recurring.categoryId,
    subcategoryId: recurring.subcategoryId,
    description: `Pago ${recurring.name}`,
    notes: `Pago periódico registrado desde módulo de suscripciones`,
    tags: ['recurrente', 'suscripcion'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.transaction('rw', [db.transactions, db.recurring], async () => {
    await db.transactions.add(newTx);
    await db.recurring.update(recurringId, {
      lastGeneratedDate: paymentDate,
      updatedAt: new Date().toISOString(),
    });
  });

  return newTx;
}
