import { useState, useEffect } from 'react';
import { useCharacters } from './hooks/useCharacters';
import { CharacterList } from './components/CharacterList';
import { CharacterEditor } from './components/CharacterEditor';
import { EmptyState } from './components/EmptyState';
import { ErrorBanner } from './components/ErrorBanner';
import { SetupBanner } from './components/SetupBanner';

// ─── Check if Supabase is configured ─────────────────────────────────────────

const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_KEY
);

// ─── Mobile menu icon ─────────────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const {
    characters,
    selectedId,
    selectedCharacter,
    loading,
    saving,
    error,
    isConnected,
    selectCharacter,
    createCharacter,
    duplicateCharacter,
    saveCharacter,
    removeCharacter,
    clearError,
  } = useCharacters();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auto-close sidebar on md+ screens when character selected
  useEffect(() => {
    if (selectedId) setSidebarOpen(false);
  }, [selectedId]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-950 text-white">
      {/* Setup warning */}
      <SetupBanner show={!isSupabaseConfigured} />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar (Desktop) ── */}
        <div className="hidden md:flex md:w-72 lg:w-80 flex-shrink-0">
          <CharacterList
            characters={characters}
            selectedId={selectedId}
            loading={loading}
            saving={saving}
            isConnected={isConnected}
            onSelect={(id) => {
              selectCharacter(id);
            }}
            onCreate={createCharacter}
          />
        </div>

        {/* ── Mobile Sidebar Overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 z-50 w-72 flex flex-col">
              <CharacterList
                characters={characters}
                selectedId={selectedId}
                loading={loading}
                saving={saving}
                isConnected={isConnected}
                onSelect={(id) => {
                  selectCharacter(id);
                  setSidebarOpen(false);
                }}
                onCreate={() => {
                  createCharacter();
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 md:hidden flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300 transition hover:text-white"
            >
              <MenuIcon />
            </button>
            <span className="font-semibold text-white">
              {selectedCharacter ? selectedCharacter.name : '⚔️ RPG Sheets'}
            </span>
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden">
            {selectedCharacter ? (
              <CharacterEditor
                key={selectedCharacter.id}
                character={selectedCharacter}
                saving={saving}
                onSave={saveCharacter}
                onDuplicate={duplicateCharacter}
                onDelete={removeCharacter}
              />
            ) : (
              <EmptyState onCreate={createCharacter} />
            )}
          </div>
        </main>
      </div>

      {/* Error Toast */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}
    </div>
  );
}
