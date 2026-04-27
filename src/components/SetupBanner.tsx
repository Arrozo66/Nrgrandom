interface SetupBannerProps {
  show: boolean;
}

export function SetupBanner({ show }: SetupBannerProps) {
  if (!show) return null;

  return (
    <div className="flex-shrink-0 border-b border-amber-800/40 bg-amber-950/50 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <span className="text-base">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-300">Supabase Not Configured</p>
          <p className="text-xs text-amber-400/80">
            Create a{' '}
            <code className="rounded bg-amber-900/50 px-1 font-mono text-amber-300">.env</code> file
            with{' '}
            <code className="rounded bg-amber-900/50 px-1 font-mono text-amber-300">VITE_SUPABASE_URL</code> and{' '}
            <code className="rounded bg-amber-900/50 px-1 font-mono text-amber-300">VITE_SUPABASE_KEY</code> to enable data persistence.
            Data will not be saved without these.
          </p>
        </div>
      </div>
    </div>
  );
}
