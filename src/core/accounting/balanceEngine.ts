import type { Account, AccountCalculatedSummary } from '../types/account.types';
import type { Transaction } from '../types/transaction.types';

/**
 * Calcula el balance actual determinista de una cuenta a partir de sus transacciones.
 * Respeta rigurosamente el modelo contable:
 * - Cuentas regulares (Activos: Banco, Ahorro, Efectivo, Nequi):
 *   Saldo = SaldoInicial + Ingresos - Gastos + TransferenciasEntrantes - TransferenciasSalientes - PagosTarjetaSalientes
 * 
 * - Tarjetas de Crédito (Pasivos):
 *   Deuda = SaldoInicialDeuda + GastosConTarjeta - PagosRecibidos
 *   CupoDisponible = CupoTotal - Deuda
 */
export function calculateAccountSummary(
  account: Account,
  transactions: Transaction[]
): AccountCalculatedSummary {
  let totalIncomes = 0;
  let totalExpenses = 0;
  let netTransfers = 0;
  let paymentsMade = 0;
  let ccExpenses = 0;
  let ccPaymentsReceived = 0;

  for (const tx of transactions) {
    if (account.type === 'credit_card') {
      // Movimientos de Tarjeta de Crédito
      if (tx.sourceAccountId === account.id && tx.type === 'expense') {
        ccExpenses += tx.amountInCents;
      } else if (tx.targetAccountId === account.id && tx.type === 'credit_card_payment') {
        ccPaymentsReceived += tx.amountInCents;
      }
    } else {
      // Cuentas de Activo (Bancos, Efectivo, Billeteras, Ahorros)
      if (tx.sourceAccountId === account.id) {
        if (tx.type === 'income') {
          totalIncomes += tx.amountInCents;
        } else if (tx.type === 'expense') {
          totalExpenses += tx.amountInCents;
        } else if (tx.type === 'transfer') {
          netTransfers -= tx.amountInCents;
        } else if (tx.type === 'credit_card_payment') {
          paymentsMade += tx.amountInCents;
        }
      } else if (tx.targetAccountId === account.id && tx.type === 'transfer') {
        netTransfers += tx.amountInCents;
      }
    }
  }

  if (account.type === 'credit_card') {
    const initialDebt = account.initialBalanceInCents;
    const currentDebtInCents = Math.max(0, initialDebt + ccExpenses - ccPaymentsReceived);
    const limit = account.creditLimitInCents || 0;
    const availableCreditInCents = Math.max(0, limit - currentDebtInCents);

    return {
      account,
      currentBalanceInCents: -currentDebtInCents, // Pasivo expresado como valor deudor
      totalIncomesInCents: 0,
      totalExpensesInCents: ccExpenses,
      currentDebtInCents,
      availableCreditInCents,
    };
  }

  const currentBalanceInCents =
    account.initialBalanceInCents +
    totalIncomes -
    totalExpenses +
    netTransfers -
    paymentsMade;

  return {
    account,
    currentBalanceInCents,
    totalIncomesInCents: totalIncomes,
    totalExpensesInCents: totalExpenses,
    currentDebtInCents: 0,
    availableCreditInCents: 0,
  };
}

/**
 * Calcula el Patrimonio Neto global: Activos - Pasivos.
 */
export function calculateNetWorth(summaries: AccountCalculatedSummary[]): {
  totalAssetsInCents: number;
  totalLiabilitiesInCents: number;
  netWorthInCents: number;
} {
  let totalAssetsInCents = 0;
  let totalLiabilitiesInCents = 0;

  for (const s of summaries) {
    if (!s.account.isActive) continue;

    if (s.account.type === 'credit_card') {
      totalLiabilitiesInCents += s.currentDebtInCents;
    } else {
      if (s.currentBalanceInCents >= 0) {
        totalAssetsInCents += s.currentBalanceInCents;
      } else {
        // En caso excepcional de sobregiro bancario
        totalLiabilitiesInCents += Math.abs(s.currentBalanceInCents);
      }
    }
  }

  const netWorthInCents = totalAssetsInCents - totalLiabilitiesInCents;

  return {
    totalAssetsInCents,
    totalLiabilitiesInCents,
    netWorthInCents,
  };
}

/**
 * Calcula el resumen de flujo de caja para un conjunto de transacciones en un rango temporal (ej: el mes actual).
 * Las transferencias y los pagos de tarjeta tienen impacto neto $0 en ingresos y gastos.
 */
export function calculateCashFlowSummary(transactions: Transaction[]): {
  totalIncomeInCents: number;
  totalExpenseInCents: number;
  netSavingsInCents: number;
  savingsRatePercentage: number;
} {
  let totalIncomeInCents = 0;
  let totalExpenseInCents = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncomeInCents += tx.amountInCents;
    } else if (tx.type === 'expense') {
      totalExpenseInCents += tx.amountInCents;
    }
    // Transferencias y pagos de tarjeta NO se suman como gastos ni ingresos
  }

  const netSavingsInCents = totalIncomeInCents - totalExpenseInCents;
  const savingsRatePercentage =
    totalIncomeInCents > 0
      ? Math.max(0, Math.round((netSavingsInCents / totalIncomeInCents) * 100))
      : 0;

  return {
    totalIncomeInCents,
    totalExpenseInCents,
    netSavingsInCents,
    savingsRatePercentage,
  };
}
