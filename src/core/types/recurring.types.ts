import type { Category } from './category.types';
import type { Account } from './account.types';

export type RecurringFrequency =
  | 'monthly'     // Mensual (más común: Netflix, arriendo, servicios)
  | 'biweekly'    // Quincenal
  | 'weekly'      // Semanal
  | 'bimonthly'   // Bimestral
  | 'annual';     // Anual (seguros, impuestos, suscripciones anuales)

export interface RecurringTransaction {
  id: string;                      // UUID v4
  name: string;                    // Ej: "Arriendo Apto", "Netflix", "Internet Claro"
  amountInCents: number;           // Monto estimado en centavos
  type: 'expense' | 'income';      // Gasto o Ingreso recurrente
  frequency: RecurringFrequency;
  dueDay: number;                  // Día del mes (1 a 31) en que vence
  dueDay2?: number;                 // Segundo día para pagos quincenales (ej. 30)
  icon?: string;                    // Nombre del icono opcional
  sourceAccountId: string;         // FK Account (de dónde se debita o acredita)
  categoryId?: string;             // FK Category
  subcategoryId?: string;
  isActive: boolean;               // Activo o pausado
  autoGenerate?: boolean;          // Recordatorio o generación automática
  lastGeneratedDate?: string;      // Última fecha en que se registró pago (YYYY-MM-DD)
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpcomingPaymentItem {
  recurring: RecurringTransaction;
  account?: Account;
  category?: Category;
  dueDate: string;                 // YYYY-MM-DD del vencimiento este mes
  daysRemaining: number;           // < 0 vencido, 0 hoy, > 0 faltan días
  isPaidThisMonth: boolean;        // Si ya se registró el pago en el mes actual
}
