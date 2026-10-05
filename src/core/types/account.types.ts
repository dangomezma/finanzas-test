export type AccountType = 
  | 'bank'         // Cuenta bancaria corriente / nómina
  | 'savings'      // Cuenta de ahorros
  | 'cash'         // Efectivo
  | 'wallet'       // Billetera digital (Nequi, Daviplata, Dale)
  | 'credit_card'  // Tarjeta de crédito (Pasivo)
  | 'investment'   // Inversión (Fiducuenta, CDT, Acciones)
  | 'other';

export interface Account {
  id: string;                      // Identificador UUID v4
  name: string;                    // Nombre de la cuenta (ej. "Bancolombia Ahorros", "Nequi")
  type: AccountType;
  currency: 'COP';                 // Peso colombiano
  initialBalanceInCents: number;   // Saldo inicial en centavos (ej: 50000000 = $500.000 COP)
  isActive: boolean;               // Estado activo/inactivo (archivado)
  color: string;                   // Color distintivo hexadecimal o tailwind
  icon: string;                    // Nombre del icono de Lucide
  description?: string;
  
  // Atributos específicos para 'credit_card':
  creditLimitInCents?: number;     // Cupo total en centavos (ej: 500000000 = $5.000.000 COP)
  statementClosingDay?: number;    // Día del mes de corte (1-31)
  paymentDueDay?: number;          // Día del mes límite de pago (1-31)

  createdAt: string;               // ISO 8601
  updatedAt: string;
}

// Estructura calculada dinámicamente por el motor contable
export interface AccountCalculatedSummary {
  account: Account;
  currentBalanceInCents: number;   // Saldo real actual
  totalIncomesInCents: number;
  totalExpensesInCents: number;
  // Específico para tarjeta de crédito:
  currentDebtInCents: number;      // Saldo adeudado
  availableCreditInCents: number;  // Cupo disponible
}
