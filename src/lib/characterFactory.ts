import { v4 as uuidv4 } from 'uuid';
import type { CharacterData } from '../types/character';

// ─── Default Character Factory ────────────────────────────────────────────────

export function createDefaultCharacter(overrides?: Partial<CharacterData>): CharacterData {
  const now = new Date().toISOString();

  return {
    id: uuidv4(),
    name: 'Unnamed Hero',
    class: 'Warrior',
    race: 'Human',
    level: 1,
    background: 'Folk Hero',
    alignment: 'True Neutral',
    experiencePoints: 0,
    proficiencyBonus: 2,
    inspiration: false,

    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },

    savingThrows: {
      strength: false,
      dexterity: false,
      constitution: false,
      intelligence: false,
      wisdom: false,
      charisma: false,
    },

    skills: {
      acrobatics: false,
      animalHandling: false,
      arcana: false,
      athletics: false,
      deception: false,
      history: false,
      insight: false,
      intimidation: false,
      investigation: false,
      medicine: false,
      nature: false,
      perception: false,
      performance: false,
      persuasion: false,
      religion: false,
      sleightOfHand: false,
      stealth: false,
      survival: false,
    },

    combat: {
      armorClass: 10,
      initiative: 0,
      speed: 30,
      maxHitPoints: 10,
      currentHitPoints: 10,
      temporaryHitPoints: 0,
      hitDice: '1d10',
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
    },

    spellcasting: {
      spellcastingClass: '',
      spellcastingAbility: 'Intelligence',
      spellSaveDC: 8,
      spellAttackBonus: 0,
      slots: {
        level1: { total: 0, used: 0 },
        level2: { total: 0, used: 0 },
        level3: { total: 0, used: 0 },
        level4: { total: 0, used: 0 },
        level5: { total: 0, used: 0 },
        level6: { total: 0, used: 0 },
        level7: { total: 0, used: 0 },
        level8: { total: 0, used: 0 },
        level9: { total: 0, used: 0 },
      },
      knownSpells: [],
    },

    inventory: {
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
      items: [],
      weapons: [],
      totalWeight: 0,
      carryingCapacity: 150,
    },

    features: [],

    notes: {
      backstory: '',
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      appearance: '',
      allies: '',
      enemies: '',
      organizations: '',
      additionalNotes: '',
    },

    avatar: getRandomAvatar(),
    createdAt: now,
    updatedAt: now,

    ...overrides,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATARS = ['⚔️', '🧙', '🏹', '🛡️', '🗡️', '🔮', '🐉', '💀', '🌟', '🦄', '🧝', '🧛', '🧟', '🧜', '🪄'];

export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(level: number): number {
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  return 6;
}

export function getXPForNextLevel(level: number): number {
  const xpTable: Record<number, number> = {
    1: 300,
    2: 900,
    3: 2700,
    4: 6500,
    5: 14000,
    6: 23000,
    7: 34000,
    8: 48000,
    9: 64000,
    10: 85000,
    11: 100000,
    12: 120000,
    13: 140000,
    14: 165000,
    15: 195000,
    16: 225000,
    17: 265000,
    18: 305000,
    19: 355000,
    20: Infinity,
  };
  return xpTable[level] ?? Infinity;
}

export function getClassColor(cls: string): string {
  const colors: Record<string, string> = {
    Warrior: '#ef4444',
    Mage: '#8b5cf6',
    Rogue: '#6b7280',
    Cleric: '#f59e0b',
    Ranger: '#22c55e',
    Paladin: '#f97316',
    Druid: '#84cc16',
    Bard: '#ec4899',
    Sorcerer: '#a855f7',
    Monk: '#14b8a6',
  };
  return colors[cls] || '#6366f1';
}

export function getHPColor(current: number, max: number): string {
  const pct = max > 0 ? current / max : 0;
  if (pct > 0.6) return '#22c55e';
  if (pct > 0.3) return '#f59e0b';
  return '#ef4444';
}

export const CLASS_OPTIONS = [
  'Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger',
  'Paladin', 'Druid', 'Bard', 'Sorcerer', 'Monk',
];

export const RACE_OPTIONS = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Orc',
  'Tiefling', 'Dragonborn', 'Gnome', 'Half-Elf', 'Half-Orc',
];

export const ALIGNMENT_OPTIONS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const ABILITY_NAMES = [
  { key: 'strength', label: 'STR' },
  { key: 'dexterity', label: 'DEX' },
  { key: 'constitution', label: 'CON' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'WIS' },
  { key: 'charisma', label: 'CHA' },
] as const;

export const SKILL_LIST = [
  { key: 'acrobatics', label: 'Acrobatics', ability: 'dexterity' },
  { key: 'animalHandling', label: 'Animal Handling', ability: 'wisdom' },
  { key: 'arcana', label: 'Arcana', ability: 'intelligence' },
  { key: 'athletics', label: 'Athletics', ability: 'strength' },
  { key: 'deception', label: 'Deception', ability: 'charisma' },
  { key: 'history', label: 'History', ability: 'intelligence' },
  { key: 'insight', label: 'Insight', ability: 'wisdom' },
  { key: 'intimidation', label: 'Intimidation', ability: 'charisma' },
  { key: 'investigation', label: 'Investigation', ability: 'intelligence' },
  { key: 'medicine', label: 'Medicine', ability: 'wisdom' },
  { key: 'nature', label: 'Nature', ability: 'intelligence' },
  { key: 'perception', label: 'Perception', ability: 'wisdom' },
  { key: 'performance', label: 'Performance', ability: 'charisma' },
  { key: 'persuasion', label: 'Persuasion', ability: 'charisma' },
  { key: 'religion', label: 'Religion', ability: 'intelligence' },
  { key: 'sleightOfHand', label: 'Sleight of Hand', ability: 'dexterity' },
  { key: 'stealth', label: 'Stealth', ability: 'dexterity' },
  { key: 'survival', label: 'Survival', ability: 'wisdom' },
] as const;
