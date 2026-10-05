import React from 'react';
import {
  Home,
  Car,
  Zap,
  Wifi,
  CreditCard,
  ShoppingCart,
  Briefcase,
  Plus,
} from 'lucide-react';

export interface QuickPreset {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
  defaultDay: number;
  categoryMatch: string; // id o nombre de categoría aproximada
  isBiweekly?: boolean;
}

export const PRESET_BUBBLES: QuickPreset[] = [
  {
    id: 'preset-pago',
    name: 'Día de Pago / Salario',
    type: 'income',
    icon: 'Briefcase',
    color: '#10b981',
    defaultDay: 15,
    categoryMatch: 'cat-salario',
    isBiweekly: true,
  },
  {
    id: 'preset-arriendo',
    name: 'Arriendo / Hipoteca',
    type: 'expense',
    icon: 'Home',
    color: '#6366f1',
    defaultDay: 5,
    categoryMatch: 'cat-vivienda',
  },
  {
    id: 'preset-servicios',
    name: 'Servicios Públicos',
    type: 'expense',
    icon: 'Zap',
    color: '#f59e0b',
    defaultDay: 12,
    categoryMatch: 'cat-vivienda',
  },
  {
    id: 'preset-internet',
    name: 'Internet y Telefonía',
    type: 'expense',
    icon: 'Wifi',
    color: '#06b6d4',
    defaultDay: 18,
    categoryMatch: 'cat-vivienda',
  },
  {
    id: 'preset-transporte',
    name: 'Transporte / Gasolina',
    type: 'expense',
    icon: 'Car',
    color: '#3b82f6',
    defaultDay: 1,
    categoryMatch: 'cat-transporte',
  },
  {
    id: 'preset-tarjeta',
    name: 'Pago de Tarjeta / Cuota',
    type: 'expense',
    icon: 'CreditCard',
    color: '#e11d48',
    defaultDay: 15,
    categoryMatch: 'cat-pago-tarjeta',
  },
  {
    id: 'preset-mercado',
    name: 'Mercado Mensual',
    type: 'expense',
    icon: 'ShoppingCart',
    color: '#f97316',
    defaultDay: 16,
    categoryMatch: 'cat-alimentacion',
  },
];

interface QuickPresetBubblesProps {
  onSelectPreset: (preset: QuickPreset) => void;
  onCustomClick: () => void;
}

export const QuickPresetBubbles: React.FC<QuickPresetBubblesProps> = ({
  onSelectPreset,
  onCustomClick,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base flex items-center space-x-2">
            <span>Burbujas de Creación Rápida</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Toca una burbuja para programar ingresos fijos (quincenas) o gastos recurrentes (arriendo, servicios, tarjetas).
          </p>
        </div>
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full self-start sm:self-auto">
          1 toque para programar
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
        {PRESET_BUBBLES.map((preset) => {
          const isIncome = preset.type === 'income';
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`shrink-0 inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs active:scale-95 ${
                isIncome
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700/80'
              }`}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: preset.color }}
              >
                {preset.icon === 'Briefcase' && <Briefcase className="w-3 h-3" />}
                {preset.icon === 'Home' && <Home className="w-3 h-3" />}
                {preset.icon === 'Zap' && <Zap className="w-3 h-3" />}
                {preset.icon === 'Wifi' && <Wifi className="w-3 h-3" />}
                {preset.icon === 'Car' && <Car className="w-3 h-3" />}
                {preset.icon === 'CreditCard' && <CreditCard className="w-3 h-3" />}
                {preset.icon === 'ShoppingCart' && <ShoppingCart className="w-3 h-3" />}
              </div>
              <span className="whitespace-nowrap">{preset.name}</span>
            </button>
          );
        })}

        <button
          onClick={onCustomClick}
          className="shrink-0 inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-dashed border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">Personalizado</span>
        </button>
      </div>
    </div>
  );
};
