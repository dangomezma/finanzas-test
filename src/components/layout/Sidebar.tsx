import React from 'react';
import {
  LayoutDashboard,
  WalletCards,
  ArrowLeftRight,
  PieChart,
  Target,
  Calendar,
  CalendarClock,
  BarChart3,
  Tags,
  Database,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'accounts'
  | 'transactions'
  | 'calendar'
  | 'budgets'
  | 'goals'
  | 'recurring'
  | 'reports'
  | 'categories'
  | 'backup';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenNewTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  onOpenNewTransaction,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts' as NavView, label: 'Cuentas', icon: WalletCards },
    { id: 'transactions' as NavView, label: 'Transacciones', icon: ArrowLeftRight },
    { id: 'calendar' as NavView, label: 'Calendario', icon: Calendar },
    { id: 'budgets' as NavView, label: 'Presupuestos', icon: PieChart },
    { id: 'goals' as NavView, label: 'Metas de Ahorro', icon: Target },
    { id: 'recurring' as NavView, label: 'Pagos Recurrentes', icon: CalendarClock },
    { id: 'reports' as NavView, label: 'Reportes y Gráficos', icon: BarChart3 },
    { id: 'categories' as NavView, label: 'Categorías', icon: Tags },
    { id: 'backup' as NavView, label: 'Copia de Seguridad', icon: Database },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
              Finanzas COP
            </h1>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full inline-block mt-0.5">
              100% Local y Privado
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={onOpenNewTransaction}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Transacción</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <div className="flex items-center space-x-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>IndexedDB Activo</span>
        </div>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Tus datos no salen de tu computador.
        </p>
      </div>
    </aside>
  );
};
