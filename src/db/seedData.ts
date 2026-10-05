import type { Account } from '../core/types/account.types';
import type { Category } from '../core/types/category.types';
import type { Transaction } from '../core/types/transaction.types';
import { getTodayDateString } from '../core/formatters/date';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-bancolombia',
    name: 'Bancolombia Ahorros',
    type: 'savings',
    currency: 'COP',
    initialBalanceInCents: 150000000, // $1.500.000 COP
    isActive: true,
    color: '#3b82f6',
    icon: 'Landmark',
    description: 'Cuenta principal para nómina y ahorros',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-nequi',
    name: 'Nequi',
    type: 'wallet',
    currency: 'COP',
    initialBalanceInCents: 35000000, // $350.000 COP
    isActive: true,
    color: '#a855f7',
    icon: 'Smartphone',
    description: 'Billetera digital para pagos diarios y transferencias rápidas',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-efectivo',
    name: 'Efectivo',
    type: 'cash',
    currency: 'COP',
    initialBalanceInCents: 12000000, // $120.000 COP
    isActive: true,
    color: '#10b981',
    icon: 'Banknote',
    description: 'Efectivo en billetera',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'acc-tc-visa',
    name: 'Tarjeta de Crédito Visa',
    type: 'credit_card',
    currency: 'COP',
    initialBalanceInCents: 0, // Sin deuda inicial
    creditLimitInCents: 350000000, // Cupo $3.500.000 COP
    statementClosingDay: 15, // Corte día 15
    paymentDueDay: 5, // Pago día 5
    isActive: true,
    color: '#f59e0b',
    icon: 'CreditCard',
    description: 'Tarjeta para compras y suscripciones',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Gastos
  {
    id: 'cat-alimentacion',
    name: 'Alimentación',
    type: 'expense',
    icon: 'UtensilsCrossed',
    color: '#f97316',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-mercado', name: 'Mercado / Supermercado' },
      { id: 'sub-restaurantes', name: 'Restaurantes' },
      { id: 'sub-domicilios', name: 'Domicilios (Rappi/iFood)' },
      { id: 'sub-cafes', name: 'Cafés y Panaderías' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-transporte',
    name: 'Transporte',
    type: 'expense',
    icon: 'Car',
    color: '#06b6d4',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-publico', name: 'TransMilenio / SITP / Metro' },
      { id: 'sub-gasolina', name: 'Gasolina' },
      { id: 'sub-taxi', name: 'Taxi / Uber / Didi' },
      { id: 'sub-mantenimiento', name: 'Mantenimiento / Parqueadero' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-vivienda',
    name: 'Vivienda',
    type: 'expense',
    icon: 'Home',
    color: '#6366f1',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-arriendo', name: 'Arriendo / Hipoteca' },
      { id: 'sub-servicios', name: 'Servicios Públicos (Agua/Luz/Gas)' },
      { id: 'sub-internet', name: 'Internet y Telefonía' },
      { id: 'sub-administracion', name: 'Administración' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-salud',
    name: 'Salud y Bienestar',
    type: 'expense',
    icon: 'HeartPulse',
    color: '#ec4899',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-eps', name: 'EPS / Medicina Prepagada' },
      { id: 'sub-farmacia', name: 'Farmacia y Medicamentos' },
      { id: 'sub-gym', name: 'Gimnasio y Deporte' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-entretenimiento',
    name: 'Entretenimiento',
    type: 'expense',
    icon: 'Film',
    color: '#8b5cf6',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-streaming', name: 'Streaming (Netflix, Spotify)' },
      { id: 'sub-salidas', name: 'Cine y Eventos' },
      { id: 'sub-viajes', name: 'Paseos y Viajes' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-compras',
    name: 'Compras y Tecnología',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#14b8a6',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-ropa', name: 'Ropa y Calzado' },
      { id: 'sub-tecnologia', name: 'Gadgets y Electrónica' },
      { id: 'sub-hogar', name: 'Artículos del Hogar' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Ingresos
  {
    id: 'cat-salario',
    name: 'Salario y Nómina',
    type: 'income',
    icon: 'Briefcase',
    color: '#10b981',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-sueldo', name: 'Sueldo Base' },
      { id: 'sub-prima', name: 'Primas y Cesantías' },
      { id: 'sub-bono', name: 'Bonificaciones' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-freelance',
    name: 'Freelance y Honorarios',
    type: 'income',
    icon: 'Laptop',
    color: '#3b82f6',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-proyectos', name: 'Desarrollo / Proyectos' },
      { id: 'sub-asesorias', name: 'Asesorías' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-inversiones',
    name: 'Rendimientos e Inversiones',
    type: 'income',
    icon: 'TrendingUp',
    color: '#eab308',
    isSystemDefault: true,
    subcategories: [
      { id: 'sub-intereses', name: 'Intereses Bancarios' },
      { id: 'sub-dividendos', name: 'Dividendos / CDT' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-seed-1',
    type: 'income',
    amountInCents: 420000000, // $4.200.000 COP
    currency: 'COP',
    date: getTodayDateString(),
    sourceAccountId: 'acc-bancolombia',
    categoryId: 'cat-salario',
    subcategoryId: 'sub-sueldo',
    description: 'Pago Nómina Quincenal / Mensual',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-seed-2',
    type: 'expense',
    amountInCents: 38000000, // $380.000 COP
    currency: 'COP',
    date: getTodayDateString(),
    sourceAccountId: 'acc-bancolombia',
    categoryId: 'cat-alimentacion',
    subcategoryId: 'sub-mercado',
    description: 'Mercado del mes Carulla / Éxito',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-seed-3',
    type: 'transfer',
    amountInCents: 20000000, // $200.000 COP
    currency: 'COP',
    date: getTodayDateString(),
    sourceAccountId: 'acc-bancolombia',
    targetAccountId: 'acc-nequi',
    description: 'Recarga Nequi para gastos menores',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tx-seed-4',
    type: 'expense',
    amountInCents: 4500000, // $45.000 COP
    currency: 'COP',
    date: getTodayDateString(),
    sourceAccountId: 'acc-tc-visa',
    categoryId: 'cat-entretenimiento',
    subcategoryId: 'sub-streaming',
    description: 'Suscripción mensual Netflix & Spotify',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_BUDGETS = [
  {
    id: 'b-alimentacion',
    categoryId: 'cat-alimentacion',
    amountInCents: 80000000, // $800.000 COP mensual
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b-transporte',
    categoryId: 'cat-transporte',
    amountInCents: 25000000, // $250.000 COP mensual
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b-entretenimiento',
    categoryId: 'cat-entretenimiento',
    amountInCents: 15000000, // $150.000 COP mensual
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_GOALS = [
  {
    id: 'goal-fondo-emergencia',
    name: 'Fondo de Emergencia',
    targetAmountInCents: 500000000, // $5.000.000 COP
    currentAmountInCents: 150000000, // $1.500.000 COP ahorrados
    targetDate: `${new Date().getFullYear()}-12-31`,
    description: 'Ahorro de respaldo equivalente a 3 meses de gastos fijos.',
    color: '#10b981',
    status: 'in_progress' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'goal-computador',
    name: 'Renovación de Computador Portátil',
    targetAmountInCents: 380000000, // $3.800.000 COP
    currentAmountInCents: 120000000, // $1.200.000 COP
    targetDate: `${new Date().getFullYear() + 1}-03-30`,
    description: 'Nuevo portátil para trabajo y desarrollo.',
    color: '#3b82f6',
    status: 'in_progress' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_RECURRING = [
  {
    id: 'rec-netflix',
    name: 'Suscripción Netflix Familiar',
    amountInCents: 4500000, // $45.000 COP
    type: 'expense' as const,
    frequency: 'monthly' as const,
    dueDay: 10,
    sourceAccountId: 'acc-tc-visa',
    categoryId: 'cat-entretenimiento',
    subcategoryId: 'sub-streaming',
    isActive: true,
    description: 'Plan 4 pantallas Netflix',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-internet',
    name: 'Internet Fibra Óptica Claro',
    amountInCents: 8990000, // $89.900 COP
    type: 'expense' as const,
    frequency: 'monthly' as const,
    dueDay: 18,
    sourceAccountId: 'acc-bancolombia',
    categoryId: 'cat-vivienda',
    subcategoryId: 'sub-servicios',
    isActive: true,
    description: 'Internet 300 Mbps hogar',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rec-gimnasio',
    name: 'Membresía SmartFit',
    amountInCents: 7990000, // $79.900 COP
    type: 'expense' as const,
    frequency: 'monthly' as const,
    dueDay: 25,
    sourceAccountId: 'acc-tc-visa',
    categoryId: 'cat-salud',
    subcategoryId: 'sub-deporte',
    isActive: true,
    description: 'Plan Black SmartFit',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];


