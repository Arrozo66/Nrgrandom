import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  wrapperClassName?: string;
}

export function Input({ label, className, wrapperClassName, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50',
          className
        )}
        {...props}
      />
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  className?: string;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, className, wrapperClassName, options, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
  wrapperClassName?: string;
}

export function Textarea({ label, className, wrapperClassName, id, ...props }: TextareaProps) {
  const taId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={cn('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label htmlFor={taId} className="text-xs font-medium text-slate-400">
          {label}
        </label>
      )}
      <textarea
        id={taId}
        className={cn(
          'w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50',
          className
        )}
        rows={3}
        {...props}
      />
    </div>
  );
}
