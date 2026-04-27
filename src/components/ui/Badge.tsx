import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'bg-slate-700 text-slate-200',
  success: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50',
  warning: 'bg-amber-900/50 text-amber-300 border border-amber-700/50',
  danger: 'bg-red-900/50 text-red-300 border border-red-700/50',
  info: 'bg-indigo-900/50 text-indigo-300 border border-indigo-700/50',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
