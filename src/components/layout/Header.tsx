import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { formatDateFull, getTodayDateString } from '../../core/formatters/date';
import { MoneyBadge } from '../common/MoneyBadge';

interface HeaderProps {
  netWorthInCents: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  netWorthInCents,
  darkMode,
  onToggleDarkMode,
}) => {
  const todayStr = formatDateFull(getTodayDateString());

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
          Hoy
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 capitalize">
          {todayStr}
        </span>
      </div>

      <div className="flex items-center space-x-5">
        {/* Quick Net Worth Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Patrimonio Neto:</span>
          <MoneyBadge amountInCents={netWorthInCents} size="sm" type="balance" />
        </div>

        {/* Dark Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-600" />}
        </button>
      </div>
    </header>
  );
};
