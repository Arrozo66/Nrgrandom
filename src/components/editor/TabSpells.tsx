import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SectionHeader } from '../ui/SectionHeader';
import { Input } from '../ui/Input';
import type { CharacterData, Spell, SpellSlot } from '../../types/character';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TabSpellsProps {
  character: CharacterData;
  onChange: (updates: Partial<CharacterData>) => void;
}

// ─── Spell Slot Track ─────────────────────────────────────────────────────────

function SpellSlotTracker({
  level,
  slot,
  onUpdate,
}: {
  level: number;
  slot: SpellSlot;
  onUpdate: (s: SpellSlot) => void;
}) {
  if (slot.total === 0 && level > 5) return null;

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-800/40 p-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lv {level}</span>
      <div className="flex gap-1">
        {Array.from({ length: Math.max(slot.total, 1) }).map((_, i) => (
          <button
            key={i}
            onClick={() => onUpdate({ ...slot, used: slot.used === i + 1 ? i : i + 1 })}
            disabled={i >= slot.total}
            className="h-4 w-4 rounded-full border-2 border-indigo-600/60 transition-colors disabled:border-slate-700 disabled:cursor-not-allowed"
            style={{ backgroundColor: i < slot.used ? '#4f46e5' : i < slot.total ? 'transparent' : '#1e293b' }}
          />
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        <input
          type="number"
          min={0}
          max={9}
          value={slot.total}
          onChange={(e) => onUpdate({ ...slot, total: parseInt(e.target.value) || 0, used: Math.min(slot.used, parseInt(e.target.value) || 0) })}
          className="w-10 rounded bg-slate-700 py-0.5 text-center text-xs text-slate-300 outline-none focus:bg-slate-600"
          title={`Level ${level} total slots`}
        />
        <span className="text-[10px] text-slate-600">/{slot.used}</span>
      </div>
    </div>
  );
}

// ─── Spell Card ───────────────────────────────────────────────────────────────

function SpellCard({
  spell,
  onUpdate,
  onDelete,
}: {
  spell: Spell;
  onUpdate: (s: Spell) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const levelColors = ['#94a3b8', '#6366f1', '#3b82f6', '#8b5cf6', '#d946ef', '#f59e0b', '#ef4444', '#14b8a6', '#10b981', '#f97316'];

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white transition text-xs">
          {expanded ? '▼' : '▶'}
        </button>
        <span
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `${levelColors[spell.level]}25`, color: levelColors[spell.level] }}
        >
          {spell.level === 0 ? 'CANTRIP' : `LV ${spell.level}`}
        </span>
        <input
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder-slate-500"
          value={spell.name}
          onChange={(e) => onUpdate({ ...spell, name: e.target.value })}
          placeholder="Spell Name"
        />
        <label className="flex cursor-pointer items-center gap-1 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={spell.prepared}
            onChange={(e) => onUpdate({ ...spell, prepared: e.target.checked })}
            className="accent-indigo-500 h-3 w-3"
          />
          Prepared
        </label>
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition text-sm">✕</button>
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-700/40 pt-3 sm:grid-cols-3">
          <Input
            label="Level (0=Cantrip)"
            type="number"
            min={0}
            max={9}
            value={spell.level}
            onChange={(e) => onUpdate({ ...spell, level: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="School"
            value={spell.school}
            onChange={(e) => onUpdate({ ...spell, school: e.target.value })}
            placeholder="Evocation"
          />
          <Input
            label="Casting Time"
            value={spell.castingTime}
            onChange={(e) => onUpdate({ ...spell, castingTime: e.target.value })}
            placeholder="1 Action"
          />
          <Input
            label="Range"
            value={spell.range}
            onChange={(e) => onUpdate({ ...spell, range: e.target.value })}
            placeholder="60ft"
          />
          <Input
            label="Components"
            value={spell.components}
            onChange={(e) => onUpdate({ ...spell, components: e.target.value })}
            placeholder="V, S, M"
          />
          <Input
            label="Duration"
            value={spell.duration}
            onChange={(e) => onUpdate({ ...spell, duration: e.target.value })}
            placeholder="Instantaneous"
          />
          <div className="col-span-2 flex flex-col gap-1 sm:col-span-3">
            <label className="text-xs font-medium text-slate-400">Description</label>
            <textarea
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              rows={3}
              value={spell.description}
              onChange={(e) => onUpdate({ ...spell, description: e.target.value })}
              placeholder="Spell description and effects..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabSpells({ character, onChange }: TabSpellsProps) {
  const { spellcasting } = character;
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');

  function updateSpellcasting(updates: Partial<typeof spellcasting>) {
    onChange({ spellcasting: { ...spellcasting, ...updates } });
  }

  function updateSlot(level: keyof typeof spellcasting.slots, slot: SpellSlot) {
    updateSpellcasting({ slots: { ...spellcasting.slots, [level]: slot } });
  }

  function addSpell() {
    const newSpell: Spell = {
      id: uuidv4(),
      name: 'New Spell',
      level: 1,
      school: '',
      castingTime: '1 Action',
      range: '60ft',
      components: 'V, S',
      duration: 'Instantaneous',
      description: '',
      prepared: false,
    };
    updateSpellcasting({ knownSpells: [...spellcasting.knownSpells, newSpell] });
  }

  function updateSpell(id: string, spell: Spell) {
    updateSpellcasting({ knownSpells: spellcasting.knownSpells.map((s) => (s.id === id ? spell : s)) });
  }

  function deleteSpell(id: string) {
    updateSpellcasting({ knownSpells: spellcasting.knownSpells.filter((s) => s.id !== id) });
  }

  const slotLevels = [
    { key: 'level1' as const, num: 1 },
    { key: 'level2' as const, num: 2 },
    { key: 'level3' as const, num: 3 },
    { key: 'level4' as const, num: 4 },
    { key: 'level5' as const, num: 5 },
    { key: 'level6' as const, num: 6 },
    { key: 'level7' as const, num: 7 },
    { key: 'level8' as const, num: 8 },
    { key: 'level9' as const, num: 9 },
  ];

  const filteredSpells = filterLevel === 'all'
    ? spellcasting.knownSpells
    : spellcasting.knownSpells.filter((s) => s.level === filterLevel);

  const abilityOptions = [
    { value: 'Intelligence', label: 'Intelligence' },
    { value: 'Wisdom', label: 'Wisdom' },
    { value: 'Charisma', label: 'Charisma' },
  ];

  return (
    <div className="space-y-6">
      {/* ── Spellcasting Info ── */}
      <section>
        <SectionHeader title="Spellcasting" icon="🔮" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input
            label="Spellcasting Class"
            value={spellcasting.spellcastingClass}
            onChange={(e) => updateSpellcasting({ spellcastingClass: e.target.value })}
            placeholder="Wizard"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Spellcasting Ability</label>
            <select
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              value={spellcasting.spellcastingAbility}
              onChange={(e) => updateSpellcasting({ spellcastingAbility: e.target.value })}
            >
              {abilityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Spell Save DC"
            type="number"
            value={spellcasting.spellSaveDC}
            onChange={(e) => updateSpellcasting({ spellSaveDC: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Spell Attack Bonus"
            type="number"
            value={spellcasting.spellAttackBonus}
            onChange={(e) => updateSpellcasting({ spellAttackBonus: parseInt(e.target.value) || 0 })}
          />
        </div>
      </section>

      {/* ── Spell Slots ── */}
      <section>
        <SectionHeader title="Spell Slots" icon="💎" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {slotLevels.map(({ key, num }) => (
            <SpellSlotTracker
              key={key}
              level={num}
              slot={spellcasting.slots[key]}
              onUpdate={(s) => updateSlot(key, s)}
            />
          ))}
        </div>
        <button
          onClick={() => {
            const resetSlots = Object.fromEntries(
              slotLevels.map(({ key }) => [key, { ...spellcasting.slots[key], used: 0 }])
            ) as typeof spellcasting.slots;
            updateSpellcasting({ slots: resetSlots });
          }}
          className="mt-3 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          Reset All Slots (Long Rest)
        </button>
      </section>

      {/* ── Known Spells ── */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">📖</span>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Spellbook ({spellcasting.knownSpells.length})
            </h3>
          </div>
          <button
            onClick={addSpell}
            className="rounded-lg bg-indigo-600/20 border border-indigo-600/40 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/40 transition"
          >
            + Add Spell
          </button>
        </div>

        {/* Filter */}
        {spellcasting.knownSpells.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterLevel('all')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filterLevel === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
            >
              All
            </button>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${filterLevel === l ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
              >
                {l === 0 ? 'Cantrip' : `Lv ${l}`}
              </button>
            ))}
          </div>
        )}

        {filteredSpells.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-3xl opacity-30">🔮</span>
            <p className="text-sm text-slate-600">
              {spellcasting.knownSpells.length === 0 ? 'No spells learned yet.' : 'No spells match this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSpells.map((spell) => (
              <SpellCard
                key={spell.id}
                spell={spell}
                onUpdate={(updated) => updateSpell(spell.id, updated)}
                onDelete={() => deleteSpell(spell.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
