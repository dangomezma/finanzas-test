import type { Category } from './category.types';

export interface Budget {
  id: string;                      // UUID v4
  categoryId: string;             // FK a Category (gasto)
  subcategoryId?: string;         // FK opcional a Subcategory
  amountInCents: number;          // Monto presupuestado mensual en centavos
  year: number;                   // Ej: 2026
  month: number;                  // 1-12
  createdAt: string;              // ISO 8601
  updatedAt: string;
}

export interface BudgetCalculatedStatus {
  budget: Budget;
  category?: Category;
  allocatedInCents: number;       // Monto presupuestado
  spentInCents: number;           // Monto gastado real en el mes
  remainingInCents: number;       // Monto disponible (o negativo si se excedió)
  percentageUsed: number;         // 0 - 100%+
  isExceeded: boolean;            // true si gastó más de lo presupuestado
}

export type GoalStatus = 'in_progress' | 'completed' | 'paused';

export interface FinancialGoal {
  id: string;                      // UUID v4
  name: string;                    // Ej: "Fondo de Emergencia", "Comprar Computador"
  targetAmountInCents: number;     // Monto meta en centavos
  currentAmountInCents: number;    // Monto acumulado
  targetDate?: string;             // Fecha objetivo YYYY-MM-DD
  description?: string;
  color?: string;                  // Color identificador
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalCalculatedStatus {
  goal: FinancialGoal;
  percentage: number;
  remainingInCents: number;
  monthsRemaining?: number;
  suggestedMonthlySavingsInCents?: number;
  isCompleted: boolean;
}
