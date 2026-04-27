import { cn } from '../../utils/cn';

interface StatBoxProps {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export function StatBox({ label, value, sub, className, valueClassName, onClick }: StatBoxProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/50 p-3 text-center',
        onClick && 'cursor-pointer transition-colors hover:border-indigo-500/50 hover:bg-slate-700/50',
        className
      )}
      onClick={onClick}
    >
      <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <span className={cn('text-2xl font-bold text-white', valueClassName)}>{value}</span>
      {sub && <span className="mt-0.5 text-xs text-slate-500">{sub}</span>}
    </div>
  );
}
