export type TransactionType = 
  | 'income'                // Ingreso de dinero (aumenta activo)
  | 'expense'               // Gasto (reduce activo o aumenta pasivo)
  | 'transfer'              // Transferencia entre cuentas propias (impacto neto en ingresos/gastos = 0)
  | 'credit_card_payment';  // Pago de tarjeta de crédito desde cuenta bancaria (sin duplicar gasto)

export interface Transaction {
  id: string;                      // Identificador UUID v4
  type: TransactionType;
  amountInCents: number;           // Monto siempre positivo en centavos (ej: 125000000 = $1.250.000 COP)
  currency: 'COP';
  date: string;                    // Fecha en formato YYYY-MM-DD
  
  sourceAccountId: string;         // Cuenta origen
  targetAccountId?: string;        // Cuenta destino (en transfer o credit_card_payment)
  
  categoryId?: string;             // Obligatorio en income y expense
  subcategoryId?: string;          // Opcional
  
  description: string;             // Descripción obligatoria
  notes?: string;                  // Notas opcionales
  tags?: string[];                 // Etiquetas
  
  createdAt: string;               // ISO 8601
  updatedAt: string;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  accountId?: string;
  categoryId?: string;
  type?: TransactionType | 'all';
  searchQuery?: string;
  selectedTag?: string;
  minAmountInCents?: number;
  maxAmountInCents?: number;
}
