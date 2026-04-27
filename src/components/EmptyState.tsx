interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-slate-950 px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-800/60 border border-slate-700/50 text-5xl shadow-inner">
        ⚔️
      </div>
      <h2 className="mb-2 text-2xl font-bold text-white">Welcome to RPG Sheets</h2>
      <p className="mb-8 max-w-sm text-slate-400">
        Your digital D&amp;D character manager. Create and manage character sheets that sync in real-time across all
        devices and players.
      </p>

      <button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 active:scale-[0.97]"
      >
        <span className="text-lg">+</span>
        Create Your First Character
      </button>

      <div className="mt-12 grid grid-cols-3 gap-6 text-center">
        {[
          { icon: '🔄', title: 'Real-time Sync', desc: 'All changes sync instantly for everyone' },
          { icon: '☁️', title: 'Cloud Storage', desc: 'Powered by Supabase — never lose your data' },
          { icon: '👥', title: 'Multiplayer', desc: 'Multiple players can view at the same time' },
        ].map((f) => (
          <div key={f.title} className="flex flex-col items-center gap-2">
            <span className="text-2xl">{f.icon}</span>
            <p className="text-sm font-semibold text-slate-300">{f.title}</p>
            <p className="text-xs text-slate-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
