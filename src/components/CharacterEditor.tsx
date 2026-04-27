import { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import { getClassColor, getHPColor, formatModifier, getAbilityModifier } from '../lib/characterFactory';
import type { CharacterData } from '../types/character';
import { TabOverview } from './editor/TabOverview';
import { TabCombat } from './editor/TabCombat';
import { TabInventory } from './editor/TabInventory';
import { TabSpells } from './editor/TabSpells';
import { TabFeatures } from './editor/TabFeatures';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'combat' | 'inventory' | 'spells' | 'features';

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { key: 'overview', label: 'Overview', icon: '👤' },
  { key: 'combat', label: 'Combat', icon: '⚔️' },
  { key: 'inventory', label: 'Inventory', icon: '🎒' },
  { key: 'spells', label: 'Spells', icon: '🔮' },
  { key: 'features', label: 'Features', icon: '⭐' },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function SaveIcon({ spinning }: { spinning?: boolean }) {
  if (spinning) {
    return (
      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CharacterEditorProps {
  character: CharacterData;
  saving: boolean;
  onSave: (character: CharacterData) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ─── Auto-save delay (ms) ─────────────────────────────────────────────────────

const AUTOSAVE_DELAY = 1500;

// ─── Component ────────────────────────────────────────────────────────────────

export function CharacterEditor({
  character: initialCharacter,
  saving,
  onSave,
  onDuplicate,
  onDelete,
}: CharacterEditorProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [character, setCharacter] = useState<CharacterData>(initialCharacter);
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when a different character is selected (from realtime or sidebar)
  useEffect(() => {
    setCharacter(initialCharacter);
    setIsDirty(false);
  }, [initialCharacter.id]);

  // Merge remote realtime updates if the user hasn't made local changes
  useEffect(() => {
    if (!isDirty) {
      setCharacter(initialCharacter);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCharacter]);

  // ── Auto-save ──────────────────────────────────────────────────────────────

  const scheduleAutoSave = useCallback(
    (updated: CharacterData) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await onSave(updated);
        setIsDirty(false);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }, AUTOSAVE_DELAY);
    },
    [onSave]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // ── Handle changes ────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (updates: Partial<CharacterData>) => {
      setCharacter((prev) => {
        const updated = { ...prev, ...updates };
        setIsDirty(true);
        scheduleAutoSave(updated);
        return updated;
      });
    },
    [scheduleAutoSave]
  );

  // ── Manual save ───────────────────────────────────────────────────────────

  const handleManualSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await onSave(character);
    setIsDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }, [character, onSave]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(async () => {
    await onDelete(character.id);
    setShowDeleteConfirm(false);
  }, [character.id, onDelete]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const classColor = getClassColor(character.class);
  const hpColor = getHPColor(character.combat.currentHitPoints, character.combat.maxHitPoints);
  const hpPct = character.combat.maxHitPoints > 0
    ? Math.min(100, (character.combat.currentHitPoints / character.combat.maxHitPoints) * 100)
    : 0;
  const dexMod = getAbilityModifier(character.abilityScores.dexterity);

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* ── Character Header ── */}
      <div
        className="relative flex-shrink-0 border-b border-slate-800 px-6 py-4"
        style={{ background: `linear-gradient(135deg, ${classColor}10 0%, transparent 50%)` }}
      >
        <div className="flex flex-wrap items-start gap-4">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-3xl shadow-lg"
            style={{ backgroundColor: `${classColor}20`, border: `2px solid ${classColor}50` }}
          >
            {character.avatar}
          </div>

          {/* Name & Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{character.name}</h2>
            <p className="text-sm text-slate-400">
              Level {character.level} &middot; {character.race} {character.class} &middot; {character.alignment}
            </p>
            {/* Mini stats */}
            <div className="mt-2 flex flex-wrap gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span className="text-red-400">❤️</span>
                <span style={{ color: hpColor }}>{character.combat.currentHitPoints}/{character.combat.maxHitPoints}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span>🛡️</span> AC {character.combat.armorClass}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span>⚡</span> Init {formatModifier(dexMod)}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span>👣</span> {character.combat.speed}ft
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <span>⭐</span> {character.experiencePoints.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* HP Bar (compact) */}
          <div className="hidden md:flex flex-col justify-center gap-1 w-32">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>HP</span>
              <span style={{ color: hpColor }}>{Math.round(hpPct)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${hpPct}%`, backgroundColor: hpColor }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Save indicator */}
            <div className="flex items-center gap-1.5 text-xs">
              {isDirty ? (
                <span className="text-amber-400">● Unsaved</span>
              ) : savedFlash ? (
                <span className="text-emerald-400 flex items-center gap-1"><SaveIcon /> Saved</span>
              ) : (
                <span className="text-slate-600">Synced</span>
              )}
            </div>

            <button
              onClick={handleManualSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-600/50 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-600/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SaveIcon spinning={saving} />
              Save
            </button>

            <button
              onClick={() => onDuplicate(character.id)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:opacity-50"
              title="Duplicate character"
            >
              <CopyIcon />
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-red-800 hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
              title="Delete character"
            >
              <TrashIcon />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 px-6">
        <nav className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition whitespace-nowrap',
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:border-slate-600 hover:text-slate-300'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <TabOverview character={character} onChange={handleChange} />
        )}
        {activeTab === 'combat' && (
          <TabCombat character={character} onChange={handleChange} />
        )}
        {activeTab === 'inventory' && (
          <TabInventory character={character} onChange={handleChange} />
        )}
        {activeTab === 'spells' && (
          <TabSpells character={character} onChange={handleChange} />
        )}
        {activeTab === 'features' && (
          <TabFeatures character={character} onChange={handleChange} />
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Character?</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-white">{character.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
