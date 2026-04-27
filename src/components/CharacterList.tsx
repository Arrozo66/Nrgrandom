import { cn } from '../utils/cn';
import type { CharacterData } from '../types/character';
import { getClassColor, getHPColor } from '../lib/characterFactory';

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── Character Card ───────────────────────────────────────────────────────────

interface CharacterCardProps {
  character: CharacterData;
  isSelected: boolean;
  onClick: () => void;
}

function CharacterCard({ character, isSelected, onClick }: CharacterCardProps) {
  const hpPct =
    character.combat.maxHitPoints > 0
      ? Math.min(100, (character.combat.currentHitPoints / character.combat.maxHitPoints) * 100)
      : 0;
  const hpColor = getHPColor(character.combat.currentHitPoints, character.combat.maxHitPoints);
  const classColor = getClassColor(character.class);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full rounded-xl border px-3 py-3 text-left transition-all duration-150',
        isSelected
          ? 'border-indigo-500/60 bg-indigo-950/60 shadow-lg shadow-indigo-900/20'
          : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/80'
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5">
        {/* Avatar */}
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: `${classColor}20`, border: `1px solid ${classColor}40` }}
        >
          {character.avatar}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{character.name}</p>
          <p className="truncate text-xs text-slate-400">
            Lv.{character.level} {character.race} {character.class}
          </p>
        </div>

        {/* Level badge */}
        <span
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `${classColor}25`, color: classColor }}
        >
          {character.level}
        </span>
      </div>

      {/* HP Bar */}
      <div className="mt-2.5">
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
          <span>HP</span>
          <span style={{ color: hpColor }}>
            {character.combat.currentHitPoints}/{character.combat.maxHitPoints}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-700/80">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${hpPct}%`, backgroundColor: hpColor }}
          />
        </div>
      </div>
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CharacterListProps {
  characters: CharacterData[];
  selectedId: string | null;
  loading: boolean;
  saving: boolean;
  isConnected: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CharacterList({
  characters,
  selectedId,
  loading,
  saving,
  isConnected,
  onSelect,
  onCreate,
}: CharacterListProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-slate-900 border-r border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚔️</span>
          <div>
            <h1 className="text-sm font-bold text-white">RPG Sheets</h1>
            <p className="text-[10px] text-slate-500">Character Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Realtime status */}
          <div className="flex items-center gap-1.5" title={isConnected ? 'Realtime connected' : 'Connecting...'}>
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              )}
            />
          </div>
          {saving && <LoadingSpinner />}
        </div>
      </div>

      {/* New character button */}
      <div className="px-3 py-3 border-b border-slate-800">
        <button
          onClick={onCreate}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon />
          New Character
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
            <LoadingSpinner />
            <p className="text-sm">Loading characters…</p>
          </div>
        ) : characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="text-4xl opacity-40">🗡️</span>
            <p className="text-sm text-slate-500">No characters yet.</p>
            <p className="text-xs text-slate-600">Click &quot;New Character&quot; to begin.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={character.id === selectedId}
                onClick={() => onSelect(character.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-3">
        <p className="text-center text-[10px] text-slate-600">
          {characters.length} character{characters.length !== 1 ? 's' : ''} · Powered by Supabase
        </p>
      </div>
    </aside>
  );
}
