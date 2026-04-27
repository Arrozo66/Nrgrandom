import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SectionHeader } from '../ui/SectionHeader';
import { Input } from '../ui/Input';
import { StatBox } from '../ui/StatBox';
import { getHPColor, getAbilityModifier, formatModifier } from '../../lib/characterFactory';
import type { CharacterData, Weapon } from '../../types/character';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TabCombatProps {
  character: CharacterData;
  onChange: (updates: Partial<CharacterData>) => void;
}

// ─── Death Save Tracker ───────────────────────────────────────────────────────

function DeathSaveTracker({
  label,
  count,
  max,
  color,
  onChange,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(count === i + 1 ? i : i + 1)}
            className="h-5 w-5 rounded-full border-2 transition-colors"
            style={{
              borderColor: color,
              backgroundColor: i < count ? color : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Weapon Row ───────────────────────────────────────────────────────────────

function WeaponRow({
  weapon,
  onUpdate,
  onDelete,
}: {
  weapon: Weapon;
  onUpdate: (w: Weapon) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white transition">
          {expanded ? '▼' : '▶'}
        </button>
        <input
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder-slate-500"
          value={weapon.name}
          onChange={(e) => onUpdate({ ...weapon, name: e.target.value })}
          placeholder="Weapon Name"
        />
        <span className="rounded bg-indigo-900/50 px-2 py-0.5 text-xs font-mono text-indigo-300">
          {weapon.attackBonus >= 0 ? '+' : ''}{weapon.attackBonus} · {weapon.damage}
        </span>
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition text-sm">✕</button>
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-slate-700/40 pt-3">
          <Input
            label="Attack Bonus"
            type="number"
            value={weapon.attackBonus}
            onChange={(e) => onUpdate({ ...weapon, attackBonus: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Damage"
            value={weapon.damage}
            onChange={(e) => onUpdate({ ...weapon, damage: e.target.value })}
            placeholder="1d8"
          />
          <Input
            label="Damage Type"
            value={weapon.damageType}
            onChange={(e) => onUpdate({ ...weapon, damageType: e.target.value })}
            placeholder="Slashing"
          />
          <Input
            label="Range"
            value={weapon.range}
            onChange={(e) => onUpdate({ ...weapon, range: e.target.value })}
            placeholder="5ft"
          />
          <Input
            label="Properties"
            value={weapon.properties}
            onChange={(e) => onUpdate({ ...weapon, properties: e.target.value })}
            placeholder="Versatile"
            wrapperClassName="col-span-2"
          />
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabCombat({ character, onChange }: TabCombatProps) {
  const { combat } = character;
  const hpColor = getHPColor(combat.currentHitPoints, combat.maxHitPoints);
  const hpPct = combat.maxHitPoints > 0 ? Math.min(100, (combat.currentHitPoints / combat.maxHitPoints) * 100) : 0;
  const dexMod = getAbilityModifier(character.abilityScores.dexterity);

  function updateCombat(updates: Partial<typeof combat>) {
    onChange({ combat: { ...combat, ...updates } });
  }

  function addWeapon() {
    const newWeapon: Weapon = {
      id: uuidv4(),
      name: 'New Weapon',
      attackBonus: 0,
      damage: '1d6',
      damageType: 'Slashing',
      range: '5ft',
      properties: '',
    };
    onChange({ inventory: { ...character.inventory, weapons: [...character.inventory.weapons, newWeapon] } });
  }

  function updateWeapon(id: string, w: Weapon) {
    onChange({ inventory: { ...character.inventory, weapons: character.inventory.weapons.map((wep) => (wep.id === id ? w : wep)) } });
  }

  function deleteWeapon(id: string) {
    onChange({ inventory: { ...character.inventory, weapons: character.inventory.weapons.filter((w) => w.id !== id) } });
  }

  return (
    <div className="space-y-6">
      {/* ── Hit Points ── */}
      <section>
        <SectionHeader title="Hit Points" icon="❤️" />
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4">
          {/* HP Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">HP</span>
              <span className="text-sm font-bold" style={{ color: hpColor }}>
                {combat.currentHitPoints} / {combat.maxHitPoints}
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-700">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${hpPct}%`, backgroundColor: hpColor }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Input
              label="Current HP"
              type="number"
              value={combat.currentHitPoints}
              onChange={(e) => updateCombat({ currentHitPoints: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Max HP"
              type="number"
              min={1}
              value={combat.maxHitPoints}
              onChange={(e) => updateCombat({ maxHitPoints: parseInt(e.target.value) || 1 })}
            />
            <Input
              label="Temp HP"
              type="number"
              min={0}
              value={combat.temporaryHitPoints}
              onChange={(e) => updateCombat({ temporaryHitPoints: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Hit Dice"
              value={combat.hitDice}
              onChange={(e) => updateCombat({ hitDice: e.target.value })}
              placeholder="1d10"
            />
          </div>

          {/* Quick HP buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[-10, -5, -1, +1, +5, +10].map((delta) => (
              <button
                key={delta}
                onClick={() => updateCombat({ currentHitPoints: Math.max(0, Math.min(combat.maxHitPoints + combat.temporaryHitPoints, combat.currentHitPoints + delta)) })}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-indigo-500 hover:bg-indigo-900/40"
              >
                {delta > 0 ? '+' : ''}{delta}
              </button>
            ))}
            <button
              onClick={() => updateCombat({ currentHitPoints: combat.maxHitPoints })}
              className="rounded-lg border border-emerald-700/50 bg-emerald-900/30 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-900/60"
            >
              Full Heal
            </button>
          </div>
        </div>
      </section>

      {/* ── Combat Stats ── */}
      <section>
        <SectionHeader title="Combat Statistics" icon="⚔️" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
          <div className="col-span-1">
            <Input
              label="Armor Class"
              type="number"
              value={combat.armorClass}
              onChange={(e) => updateCombat({ armorClass: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="col-span-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-400">Initiative</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={combat.initiative}
                  onChange={(e) => updateCombat({ initiative: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => updateCombat({ initiative: dexMod })}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2 text-xs text-slate-400 hover:text-white transition"
                  title={`Set to DEX modifier (${formatModifier(dexMod)})`}
                >
                  DEX
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-1">
            <Input
              label="Speed (ft)"
              type="number"
              value={combat.speed}
              onChange={(e) => updateCombat({ speed: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </section>

      {/* ── Death Saves ── */}
      <section>
        <SectionHeader title="Death Saving Throws" icon="💀" />
        <div className="flex items-center gap-8 rounded-xl border border-slate-700/60 bg-slate-800/40 px-6 py-4">
          <DeathSaveTracker
            label="Successes"
            count={combat.deathSaveSuccesses}
            max={3}
            color="#22c55e"
            onChange={(n) => updateCombat({ deathSaveSuccesses: n })}
          />
          <DeathSaveTracker
            label="Failures"
            count={combat.deathSaveFailures}
            max={3}
            color="#ef4444"
            onChange={(n) => updateCombat({ deathSaveFailures: n })}
          />
          <button
            onClick={() => updateCombat({ deathSaveSuccesses: 0, deathSaveFailures: 0 })}
            className="ml-auto rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            Reset
          </button>
        </div>
      </section>

      {/* ── Weapons ── */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">🗡️</span>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Weapons & Attacks</h3>
          </div>
          <button
            onClick={addWeapon}
            className="rounded-lg bg-indigo-600/20 border border-indigo-600/40 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/40 transition"
          >
            + Add Weapon
          </button>
        </div>
        {character.inventory.weapons.length === 0 ? (
          <p className="text-center text-sm text-slate-600 py-4">No weapons added yet.</p>
        ) : (
          <div className="space-y-2">
            {character.inventory.weapons.map((w) => (
              <WeaponRow
                key={w.id}
                weapon={w}
                onUpdate={(updated) => updateWeapon(w.id, updated)}
                onDelete={() => deleteWeapon(w.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Combat Summary ── */}
      <section>
        <SectionHeader title="Combat Summary" icon="📊" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Armor Class" value={combat.armorClass} />
          <StatBox label="Initiative" value={formatModifier(combat.initiative)} />
          <StatBox label="Speed" value={`${combat.speed}ft`} />
          <StatBox label="Hit Dice" value={combat.hitDice} />
        </div>
      </section>
    </div>
  );
}
