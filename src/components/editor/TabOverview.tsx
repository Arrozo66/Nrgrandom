import { SectionHeader } from '../ui/SectionHeader';
import { Input, Select, Textarea } from '../ui/Input';
import { StatBox } from '../ui/StatBox';
import {
  ABILITY_NAMES,
  SKILL_LIST,
  CLASS_OPTIONS,
  RACE_OPTIONS,
  ALIGNMENT_OPTIONS,
  getAbilityModifier,
  formatModifier,
  getProficiencyBonus,
  getXPForNextLevel,
} from '../../lib/characterFactory';
import type { CharacterData, AbilityScores, Skills, SavingThrows } from '../../types/character';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TabOverviewProps {
  character: CharacterData;
  onChange: (updates: Partial<CharacterData>) => void;
}

// ─── Ability Score Block ──────────────────────────────────────────────────────

interface AbilityBlockProps {
  label: string;
  abilityKey: keyof AbilityScores;
  value: number;
  onChange: (key: keyof AbilityScores, value: number) => void;
}

function AbilityBlock({ label, abilityKey, value, onChange }: AbilityBlockProps) {
  const mod = getAbilityModifier(value);
  return (
    <div className="flex flex-col items-center rounded-xl border border-slate-700/60 bg-slate-800/60 py-3 px-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="mt-2 flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1">
        <span className="text-lg font-bold text-white">{formatModifier(mod)}</span>
      </div>
      <input
        type="number"
        min={1}
        max={30}
        value={value}
        onChange={(e) => onChange(abilityKey, parseInt(e.target.value) || 0)}
        className="mt-2 w-14 rounded-lg border border-slate-700 bg-slate-900 py-1 text-center text-sm text-white outline-none focus:border-indigo-500"
      />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabOverview({ character, onChange }: TabOverviewProps) {
  const classOptions = CLASS_OPTIONS.map((c) => ({ value: c, label: c }));
  const raceOptions = RACE_OPTIONS.map((r) => ({ value: r, label: r }));
  const alignmentOptions = ALIGNMENT_OPTIONS.map((a) => ({ value: a, label: a }));

  const profBonus = getProficiencyBonus(character.level);
  const nextLevelXP = getXPForNextLevel(character.level);

  function handleAbilityChange(key: keyof AbilityScores, value: number) {
    onChange({ abilityScores: { ...character.abilityScores, [key]: value } });
  }

  function handleSavingThrowToggle(key: keyof SavingThrows) {
    onChange({ savingThrows: { ...character.savingThrows, [key]: !character.savingThrows[key] } });
  }

  function handleSkillToggle(key: keyof Skills) {
    onChange({ skills: { ...character.skills, [key]: !character.skills[key] } });
  }

  return (
    <div className="space-y-6">
      {/* ── Identity ── */}
      <section>
        <SectionHeader title="Identity" icon="👤" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Input
            label="Character Name"
            value={character.name}
            onChange={(e) => onChange({ name: e.target.value })}
            wrapperClassName="col-span-2 sm:col-span-3 lg:col-span-2"
            placeholder="Unnamed Hero"
          />
          <Select
            label="Class"
            value={character.class}
            onChange={(e) => onChange({ class: e.target.value })}
            options={classOptions}
          />
          <Select
            label="Race"
            value={character.race}
            onChange={(e) => onChange({ race: e.target.value })}
            options={raceOptions}
          />
          <Input
            label="Level"
            type="number"
            min={1}
            max={20}
            value={character.level}
            onChange={(e) => onChange({ level: parseInt(e.target.value) || 1, proficiencyBonus: getProficiencyBonus(parseInt(e.target.value) || 1) })}
          />
          <Input
            label="Background"
            value={character.background}
            onChange={(e) => onChange({ background: e.target.value })}
          />
          <Select
            label="Alignment"
            value={character.alignment}
            onChange={(e) => onChange({ alignment: e.target.value })}
            options={alignmentOptions}
          />
          <Input
            label="Experience Points"
            type="number"
            min={0}
            value={character.experiencePoints}
            onChange={(e) => onChange({ experiencePoints: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Avatar (Emoji)"
            value={character.avatar}
            onChange={(e) => onChange({ avatar: e.target.value })}
            maxLength={4}
          />
        </div>
      </section>

      {/* ── Quick Stats ── */}
      <section>
        <SectionHeader title="Quick Stats" icon="📊" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <StatBox label="Proficiency" value={`+${profBonus}`} sub="Bonus" />
          <StatBox label="Inspiration" value={character.inspiration ? '✓' : '—'} sub="Active" onClick={() => onChange({ inspiration: !character.inspiration })} valueClassName={character.inspiration ? 'text-amber-400' : 'text-slate-500'} />
          <StatBox label="Armor Class" value={character.combat.armorClass} />
          <StatBox label="Initiative" value={formatModifier(character.combat.initiative)} />
          <StatBox label="Speed" value={`${character.combat.speed}ft`} />
          <StatBox label="Next Level" value={nextLevelXP === Infinity ? 'MAX' : nextLevelXP.toLocaleString()} sub="XP needed" />
        </div>
      </section>

      {/* ── Ability Scores ── */}
      <section>
        <SectionHeader title="Ability Scores" icon="💪" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ABILITY_NAMES.map(({ key, label }) => (
            <AbilityBlock
              key={key}
              label={label}
              abilityKey={key}
              value={character.abilityScores[key]}
              onChange={handleAbilityChange}
            />
          ))}
        </div>
      </section>

      {/* ── Saving Throws & Skills ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Saving Throws */}
        <section>
          <SectionHeader title="Saving Throws" icon="🛡️" />
          <div className="space-y-1.5">
            {ABILITY_NAMES.map(({ key, label }) => {
              const abilityKey = key as keyof SavingThrows;
              const isProficient = character.savingThrows[abilityKey];
              const abilityMod = getAbilityModifier(character.abilityScores[key]);
              const totalMod = isProficient ? abilityMod + profBonus : abilityMod;
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-800/60"
                >
                  <input
                    type="checkbox"
                    checked={isProficient}
                    onChange={() => handleSavingThrowToggle(abilityKey)}
                    className="h-3.5 w-3.5 accent-indigo-500"
                  />
                  <span className="w-24 text-sm font-medium text-slate-300">{label}</span>
                  <span className="ml-auto font-mono text-sm text-indigo-300">{formatModifier(totalMod)}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Skills */}
        <section>
          <SectionHeader title="Skills" icon="🎯" />
          <div className="space-y-1">
            {SKILL_LIST.map(({ key, label, ability }) => {
              const skillKey = key as keyof Skills;
              const isProficient = character.skills[skillKey];
              const abilityMod = getAbilityModifier(character.abilityScores[ability as keyof AbilityScores]);
              const totalMod = isProficient ? abilityMod + profBonus : abilityMod;
              return (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-800/60"
                >
                  <input
                    type="checkbox"
                    checked={isProficient}
                    onChange={() => handleSkillToggle(skillKey)}
                    className="h-3.5 w-3.5 accent-indigo-500"
                  />
                  <span className="flex-1 text-xs text-slate-300">{label}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{ability.slice(0, 3)}</span>
                  <span className="ml-1 w-7 text-right font-mono text-xs text-indigo-300">{formatModifier(totalMod)}</span>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Notes ── */}
      <section>
        <SectionHeader title="Personality & Notes" icon="📝" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Textarea label="Personality Traits" value={character.notes.personalityTraits} onChange={(e) => onChange({ notes: { ...character.notes, personalityTraits: e.target.value } })} rows={3} />
          <Textarea label="Ideals" value={character.notes.ideals} onChange={(e) => onChange({ notes: { ...character.notes, ideals: e.target.value } })} rows={3} />
          <Textarea label="Bonds" value={character.notes.bonds} onChange={(e) => onChange({ notes: { ...character.notes, bonds: e.target.value } })} rows={3} />
          <Textarea label="Flaws" value={character.notes.flaws} onChange={(e) => onChange({ notes: { ...character.notes, flaws: e.target.value } })} rows={3} />
          <Textarea label="Backstory" value={character.notes.backstory} onChange={(e) => onChange({ notes: { ...character.notes, backstory: e.target.value } })} rows={4} wrapperClassName="sm:col-span-2" />
        </div>
      </section>
    </div>
  );
}
