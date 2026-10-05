import {
  centsToCOP,
  copToCents,
  parseCOPInput,
  formatCOP,
} from '../formatters/money';
import {
  calculateAccountSummary,
  calculateNetWorth,
  calculateCashFlowSummary,
} from '../accounting/balanceEngine';
import {
  calculateBudgetsStatus,
  calculateGoalStatus,
} from '../accounting/budgetEngine';
import { calculateUpcomingPayments } from '../accounting/recurringEngine';
import type { Account, AccountCalculatedSummary } from '../types/account.types';
import type { Transaction } from '../types/transaction.types';
import type { Budget, FinancialGoal } from '../types/budget.types';
import type { RecurringTransaction } from '../types/recurring.types';

export interface AuditTestResult {
  category: 'Moneda' | 'Contabilidad' | 'Presupuestos' | 'Metas' | 'Recurrentes';
  testName: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runAccountingAudit(): {
  allPassed: boolean;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  results: AuditTestResult[];
} {
  const results: AuditTestResult[] = [];

  // --- 1. PRUEBAS DE ARITMÉTICA DE CENTAVOS Y FORMATO COP ---
  {
    // Test 1.1: Conversión exacta COP a centavos y viceversa
    const amountCOP = 1500000;
    const cents = copToCents(amountCOP);
    const backToCOP = centsToCOP(cents);
    results.push({
      category: 'Moneda',
      testName: 'Aritmética entera de centavos sin redondeo de coma flotante',
      passed: cents === 150000000 && backToCOP === 1500000,
      expected: '150.000.000 centavos = $1.500.000 COP',
      actual: `${cents} centavos = $${backToCOP} COP`,
    });

    // Test 1.2: Parseo de entradas con puntos, comas o símbolos de moneda
    const parsed = parseCOPInput('$ 2.450.000,00');
    results.push({
      category: 'Moneda',
      testName: 'Parseo robusto de texto con símbolos "$ 2.450.000,00"',
      passed: parsed === 245000000,
      expected: '245.000.000 centavos',
      actual: `${parsed} centavos`,
    });

    // Test 1.3: Formato COP estándar
    const formatted = formatCOP(123456700);
    const hasCOP = formatted.includes('1.234.567');
    results.push({
      category: 'Moneda',
      testName: 'Formateo estándar colombiano de moneda',
      passed: hasCOP,
      expected: 'Contiene 1.234.567',
      actual: formatted,
    });
  }

  // --- 2. PRUEBAS DEL MOTOR CONTABLE Y PATRIMONIO NETO ---
  {
    const bankAccount: Account = {
      id: 'test-bank',
      name: 'Banco de Prueba',
      type: 'savings',
      currency: 'COP',
      initialBalanceInCents: 100000000, // $1.000.000
      isActive: true,
      color: '#3b82f6',
      icon: 'Landmark',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const creditCard: Account = {
      id: 'test-tc',
      name: 'TC Prueba',
      type: 'credit_card',
      currency: 'COP',
      initialBalanceInCents: 0,
      creditLimitInCents: 200000000, // $2.000.000
      isActive: true,
      color: '#f59e0b',
      icon: 'CreditCard',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const txs: Transaction[] = [
      // 1. Ingreso de $500.000 al banco
      {
        id: 't-1',
        type: 'income',
        amountInCents: 50000000,
        currency: 'COP',
        date: '2026-10-01',
        sourceAccountId: 'test-bank',
        description: 'Nómina',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      // 2. Gasto de $200.000 desde el banco
      {
        id: 't-2',
        type: 'expense',
        amountInCents: 20000000,
        currency: 'COP',
        date: '2026-10-02',
        sourceAccountId: 'test-bank',
        categoryId: 'cat-alimentacion',
        description: 'Mercado',
        createdAt: '2026-10-02T00:00:00Z',
        updatedAt: '2026-10-02T00:00:00Z',
      },
      // 3. Compra con tarjeta de crédito de $300.000 (aumenta deuda)
      {
        id: 't-3',
        type: 'expense',
        amountInCents: 30000000,
        currency: 'COP',
        date: '2026-10-03',
        sourceAccountId: 'test-tc',
        categoryId: 'cat-tecnologia',
        description: 'Compra teclado',
        createdAt: '2026-10-03T00:00:00Z',
        updatedAt: '2026-10-03T00:00:00Z',
      },
      // 4. Pago parcial a la tarjeta de crédito de $100.000 desde el banco
      {
        id: 't-4',
        type: 'credit_card_payment',
        amountInCents: 10000000,
        currency: 'COP',
        date: '2026-10-04',
        sourceAccountId: 'test-bank',
        targetAccountId: 'test-tc',
        description: 'Abono TC',
        createdAt: '2026-10-04T00:00:00Z',
        updatedAt: '2026-10-04T00:00:00Z',
      },
    ];

    const bankSummary = calculateAccountSummary(bankAccount, txs);
    const tcSummary = calculateAccountSummary(creditCard, txs);
    const netWorth = calculateNetWorth([bankSummary, tcSummary]);

    // Banco: 1.000.000 inicial + 500.000 ingreso - 200.000 gasto - 100.000 pago TC = 1.200.000 ($120.000.000 centavos)
    const bankExpected = 120000000;
    results.push({
      category: 'Contabilidad',
      testName: 'Saldo de cuenta bancaria tras ingresos, gastos y pagos de TC',
      passed: bankSummary.currentBalanceInCents === bankExpected,
      expected: `$1.200.000 COP (${bankExpected} centavos)`,
      actual: `$${centsToCOP(bankSummary.currentBalanceInCents)} COP (${bankSummary.currentBalanceInCents} centavos)`,
    });

    // Tarjeta: Deuda inicial 0 + 300.000 compra - 100.000 abono = 200.000 ($20.000.000 centavos)
    const tcDebtExpected = 20000000;
    results.push({
      category: 'Contabilidad',
      testName: 'Deuda de tarjeta de crédito tras compras y abonos sin duplicidad',
      passed: tcSummary.currentDebtInCents === tcDebtExpected,
      expected: `$200.000 COP (${tcDebtExpected} centavos)`,
      actual: `$${centsToCOP(tcSummary.currentDebtInCents)} COP (${tcSummary.currentDebtInCents} centavos)`,
    });

    // Cupo disponible: 2.000.000 cupo - 200.000 deuda = 1.800.000
    const tcAvailExpected = 180000000;
    results.push({
      category: 'Contabilidad',
      testName: 'Cupo disponible de tarjeta de crédito',
      passed: tcSummary.availableCreditInCents === tcAvailExpected,
      expected: `$1.800.000 COP (${tcAvailExpected} centavos)`,
      actual: `$${centsToCOP(tcSummary.availableCreditInCents)} COP (${tcSummary.availableCreditInCents} centavos)`,
    });

    // Patrimonio neto: Activos (1.200.000) - Pasivos (200.000) = 1.000.000 ($100.000.000 centavos)
    const netExpected = 100000000;
    results.push({
      category: 'Contabilidad',
      testName: 'Identidad contable: Patrimonio Neto = Activos - Pasivos',
      passed: netWorth.netWorthInCents === netExpected,
      expected: `$1.000.000 COP (${netExpected} centavos)`,
      actual: `$${centsToCOP(netWorth.netWorthInCents)} COP (${netWorth.netWorthInCents} centavos)`,
    });
  }

  // --- 3. PRUEBAS DEL MOTOR DE PRESUPUESTOS ---
  {
    const budgets: Budget[] = [
      {
        id: 'b-1',
        categoryId: 'cat-test',
        amountInCents: 50000000, // $500.000
        year: 2026,
        month: 10,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    const budgetTxs: Transaction[] = [
      {
        id: 't-b1',
        type: 'expense',
        amountInCents: 35000000, // $350.000 gastados (70%)
        currency: 'COP',
        date: '2026-10-15',
        sourceAccountId: 'test-bank',
        categoryId: 'cat-test',
        description: 'Gasto presupuestado',
        createdAt: '2026-10-15',
        updatedAt: '2026-10-15',
      },
    ];

    const bStatus = calculateBudgetsStatus(
      budgets,
      budgetTxs,
      [{ id: 'cat-test', name: 'Test', type: 'expense', color: '#10b981', icon: 'Folder', subcategories: [], isSystemDefault: false, createdAt: '', updatedAt: '' }],
      2026,
      10
    );

    const item = bStatus.items[0];
    results.push({
      category: 'Presupuestos',
      testName: 'Cálculo de ejecución de presupuesto mensual (70% utilizado)',
      passed: item && item.spentInCents === 35000000 && item.remainingInCents === 15000000 && item.percentageUsed === 70 && !item.isExceeded,
      expected: 'Gastado: $350.000 COP, Disponible: $150.000 COP (70%)',
      actual: item ? `Gastado: $${centsToCOP(item.spentInCents)} COP, Disponible: $${centsToCOP(item.remainingInCents)} COP (${item.percentageUsed}%)` : 'No encontrado',
    });
  }

  // --- 4. PRUEBAS DEL MOTOR DE METAS ---
  {
    const goal: FinancialGoal = {
      id: 'g-test',
      name: 'Meta Test',
      targetAmountInCents: 100000000, // $1.000.000
      currentAmountInCents: 40000000,  // $400.000 (40%)
      targetDate: '2026-12-31',
      status: 'in_progress',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const gStatus = calculateGoalStatus(goal);
    results.push({
      category: 'Metas',
      testName: 'Cálculo de avance porcentual y saldo restante en meta',
      passed: gStatus.percentage === 40 && gStatus.remainingInCents === 60000000,
      expected: 'Progreso: 40%, Restante: $600.000 COP',
      actual: `Progreso: ${gStatus.percentage}%, Restante: $${centsToCOP(gStatus.remainingInCents)} COP`,
    });
  }

  // --- 5. PRUEBAS DE VENCIMIENTO RECURRENTE ---
  {
    const recurringItem: RecurringTransaction = {
      id: 'r-1',
      name: 'Internet Test',
      amountInCents: 8000000,
      type: 'expense',
      frequency: 'monthly',
      dueDay: 20,
      sourceAccountId: 'acc-1',
      isActive: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const upcoming = calculateUpcomingPayments(
      [recurringItem],
      [],
      [],
      [],
      new Date(2026, 9, 15) // 15 de Octubre 2026 (día 15, vence el 20 -> faltan 5 días)
    );

    const first = upcoming.items[0];
    results.push({
      category: 'Recurrentes',
      testName: 'Cálculo de días restantes de vencimiento recurrente',
      passed: first && first.daysRemaining === 5 && !first.isPaidThisMonth,
      expected: 'Vence en 5 días (pendiente)',
      actual: first ? `Vence en ${first.daysRemaining} días (${first.isPaidThisMonth ? 'pagado' : 'pendiente'})` : 'No encontrado',
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    allPassed: failedCount === 0,
    totalTests: results.length,
    passedCount,
    failedCount,
    results,
  };
}
