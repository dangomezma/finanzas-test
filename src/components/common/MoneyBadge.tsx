import React from 'react';
import { formatCOP } from '../../core/formatters/money';

interface MoneyBadgeProps {
  amountInCents: number;
  type?: 'income' | 'expense' | 'neutral' | 'balance';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  className?: string;
}

export const MoneyBadge: React.FC<MoneyBadgeProps> = ({
  amountInCents,
  type = 'neutral',
  size = 'md',
  showSign = false,
  className = '',
}) => {
  let colorClass = 'text-zinc-900 dark:text-zinc-100';

  if (type === 'income') {
    colorClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
  } else if (type === 'expense') {
    colorClass = 'text-rose-600 dark:text-rose-400 font-semibold';
  } else if (type === 'balance') {
    colorClass =
      amountInCents >= 0
        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
        : 'text-rose-600 dark:text-rose-400 font-bold';
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl font-bold',
    xl: 'text-3xl font-extrabold tracking-tight',
  }[size];

  return (
    <span className={`tabular-nums ${sizeClasses} ${colorClass} ${className}`}>
      {formatCOP(amountInCents, { showSign })}
    </span>
  );
};
