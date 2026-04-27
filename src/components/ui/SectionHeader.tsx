import React from 'react';
import { cn } from '../../utils/cn';

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, icon, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center gap-2 border-b border-slate-700/60 pb-2', className)}>
      {icon && <span className="text-indigo-400">{icon}</span>}
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">{title}</h3>
    </div>
  );
}
