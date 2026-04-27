interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-red-800/60 bg-red-950/90 px-4 py-3 shadow-2xl backdrop-blur-sm">
      <span className="mt-0.5 text-base">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-300">Error</p>
        <p className="text-xs text-red-400 mt-0.5 break-words">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-red-500 hover:text-red-300 transition text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}
