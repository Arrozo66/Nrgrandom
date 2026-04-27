// ─── Core Character Types ────────────────────────────────────────────────────

export type CharacterClass =
  | 'Warrior'
  | 'Mage'
  | 'Rogue'
  | 'Cleric'
  | 'Ranger'
  | 'Paladin'
  | 'Druid'
  | 'Bard'
  | 'Sorcerer'
  | 'Monk';

export type CharacterRace =
  | 'Human'
  | 'Elf'
  | 'Dwarf'
  | 'Halfling'
  | 'Orc'
  | 'Tiefling'
  | 'Dragonborn'
  | 'Gnome'
  | 'Half-Elf'
  | 'Half-Orc';

export type Alignment =
  | 'Lawful Good'
  | 'Neutral Good'
  | 'Chaotic Good'
  | 'Lawful Neutral'
  | 'True Neutral'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Neutral Evil'
  | 'Chaotic Evil';

// ─── Ability Scores ──────────────────────────────────────────────────────────

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// ─── Skills ──────────────────────────────────────────────────────────────────

export interface Skills {
  acrobatics: boolean;
  animalHandling: boolean;
  arcana: boolean;
  athletics: boolean;
  deception: boolean;
  history: boolean;
  insight: boolean;
  intimidation: boolean;
  investigation: boolean;
  medicine: boolean;
  nature: boolean;
  perception: boolean;
  performance: boolean;
  persuasion: boolean;
  religion: boolean;
  sleightOfHand: boolean;
  stealth: boolean;
  survival: boolean;
}

// ─── Saving Throws ───────────────────────────────────────────────────────────

export interface SavingThrows {
  strength: boolean;
  dexterity: boolean;
  constitution: boolean;
  intelligence: boolean;
  wisdom: boolean;
  charisma: boolean;
}

// ─── Combat Stats ────────────────────────────────────────────────────────────

export interface CombatStats {
  armorClass: number;
  initiative: number;
  speed: number;
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  hitDice: string;
  deathSaveSuccesses: number;
  deathSaveFailures: number;
}

// ─── Spell Slot ──────────────────────────────────────────────────────────────

export interface SpellSlot {
  total: number;
  used: number;
}

// ─── Spell ───────────────────────────────────────────────────────────────────

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
}

// ─── Spellcasting ────────────────────────────────────────────────────────────

export interface Spellcasting {
  spellcastingClass: string;
  spellcastingAbility: string;
  spellSaveDC: number;
  spellAttackBonus: number;
  slots: {
    level1: SpellSlot;
    level2: SpellSlot;
    level3: SpellSlot;
    level4: SpellSlot;
    level5: SpellSlot;
    level6: SpellSlot;
    level7: SpellSlot;
    level8: SpellSlot;
    level9: SpellSlot;
  };
  knownSpells: Spell[];
}

// ─── Equipment Item ──────────────────────────────────────────────────────────

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  description: string;
  equipped: boolean;
}

// ─── Weapon ──────────────────────────────────────────────────────────────────

export interface Weapon {
  id: string;
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  range: string;
  properties: string;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface Inventory {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
  items: EquipmentItem[];
  weapons: Weapon[];
  totalWeight: number;
  carryingCapacity: number;
}

// ─── Feature / Trait ─────────────────────────────────────────────────────────

export interface Feature {
  id: string;
  name: string;
  source: string;
  description: string;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export interface Notes {
  backstory: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
  allies: string;
  enemies: string;
  organizations: string;
  additionalNotes: string;
}

// ─── Full Character Data ──────────────────────────────────────────────────────

export interface CharacterData {
  id: string;
  name: string;
  class: CharacterClass | string;
  race: CharacterRace | string;
  level: number;
  background: string;
  alignment: Alignment | string;
  experiencePoints: number;
  proficiencyBonus: number;
  inspiration: boolean;
  abilityScores: AbilityScores;
  savingThrows: SavingThrows;
  skills: Skills;
  combat: CombatStats;
  spellcasting: Spellcasting;
  inventory: Inventory;
  features: Feature[];
  notes: Notes;
  avatar: string; // emoji or URL
  createdAt: string;
  updatedAt: string;
}

// ─── Supabase Row ─────────────────────────────────────────────────────────────

export interface CharacterRow {
  id: string;
  data: CharacterData;
  created_at: string;
}
