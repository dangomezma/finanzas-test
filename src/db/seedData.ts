import type { Account } from '../core/types/account.types';
import type { Category } from '../core/types/category.types';
import type { Transaction } from '../core/types/transaction.types';
import type { Budget, FinancialGoal } from '../core/types/budget.types';
import type { RecurringTransaction } from '../core/types/recurring.types';

/**
 * Inicialización limpia: Cero cuentas iniciales por defecto.
 * El usuario crea sus propias cuentas bancarias, billeteras o tarjetas desde cero.
 */
export const INITIAL_ACCOUNTS: Account[] = [];

/**
 * Categorías predeterminadas del sistema para Gastos e Ingresos.
 * Permiten que el usuario pueda empezar a registrar gastos inmediatamente
 * sin tener que configurar toda la taxonomía desde cero.
 */
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

/**
 * Cero transacciones iniciales. Historial limpio desde el comienzo.
 */
export const INITIAL_TRANSACTIONS: Transaction[] = [];

/**
 * Cero presupuestos iniciales.
 */
export const INITIAL_BUDGETS: Budget[] = [];

/**
 * Cero metas iniciales.
 */
export const INITIAL_GOALS: FinancialGoal[] = [];

/**
 * Cero pagos recurrentes iniciales.
 */
export const INITIAL_RECURRING: RecurringTransaction[] = [];
