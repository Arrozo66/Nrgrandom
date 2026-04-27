import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SectionHeader } from '../ui/SectionHeader';
import { Input, Textarea } from '../ui/Input';
import type { CharacterData, Feature } from '../../types/character';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TabFeaturesProps {
  character: CharacterData;
  onChange: (updates: Partial<CharacterData>) => void;
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  onUpdate,
  onDelete,
}: {
  feature: Feature;
  onUpdate: (f: Feature) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white transition text-xs">
          {expanded ? '▼' : '▶'}
        </button>
        <input
          className="flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder-slate-500"
          value={feature.name}
          onChange={(e) => onUpdate({ ...feature, name: e.target.value })}
          placeholder="Feature Name"
        />
        {feature.source && (
          <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] text-slate-400">
            {feature.source}
          </span>
        )}
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition text-sm">✕</button>
      </div>
      {expanded ? (
        <div className="mt-3 space-y-2 border-t border-slate-700/40 pt-3">
          <Input
            label="Source (Class / Race / Background)"
            value={feature.source}
            onChange={(e) => onUpdate({ ...feature, source: e.target.value })}
            placeholder="Fighter (Level 1)"
          />
          <Textarea
            label="Description"
            value={feature.description}
            onChange={(e) => onUpdate({ ...feature, description: e.target.value })}
            rows={4}
            placeholder="Describe what this feature does..."
          />
        </div>
      ) : (
        feature.description && (
          <p className="mt-2 line-clamp-2 text-xs text-slate-500">{feature.description}</p>
        )
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabFeatures({ character, onChange }: TabFeaturesProps) {
  function addFeature() {
    const newFeature: Feature = {
      id: uuidv4(),
      name: 'New Feature',
      source: '',
      description: '',
    };
    onChange({ features: [...character.features, newFeature] });
  }

  function updateFeature(id: string, f: Feature) {
    onChange({ features: character.features.map((feat) => (feat.id === id ? f : feat)) });
  }

  function deleteFeature(id: string) {
    onChange({ features: character.features.filter((f) => f.id !== id) });
  }

  return (
    <div className="space-y-6">
      {/* ── Features & Traits ── */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">⭐</span>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Features & Traits ({character.features.length})
            </h3>
          </div>
          <button
            onClick={addFeature}
            className="rounded-lg bg-indigo-600/20 border border-indigo-600/40 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/40 transition"
          >
            + Add Feature
          </button>
        </div>

        {character.features.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="text-3xl opacity-30">⭐</span>
            <p className="text-sm text-slate-600">No features or traits added yet.</p>
            <p className="text-xs text-slate-600">Add racial traits, class features, feats, etc.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {character.features.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onUpdate={(updated) => updateFeature(feature.id, updated)}
                onDelete={() => deleteFeature(feature.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Appearance & Background ── */}
      <section>
        <SectionHeader title="Appearance & Story" icon="📜" />
        <div className="space-y-3">
          <Textarea
            label="Physical Appearance"
            value={character.notes.appearance}
            onChange={(e) => onChange({ notes: { ...character.notes, appearance: e.target.value } })}
            rows={3}
            placeholder="Describe your character's physical appearance..."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Textarea
              label="Allies & Organizations"
              value={character.notes.allies}
              onChange={(e) => onChange({ notes: { ...character.notes, allies: e.target.value } })}
              rows={3}
              placeholder="Friends, allies, and organizations..."
            />
            <Textarea
              label="Enemies"
              value={character.notes.enemies}
              onChange={(e) => onChange({ notes: { ...character.notes, enemies: e.target.value } })}
              rows={3}
              placeholder="Rivals and enemies..."
            />
          </div>
          <Textarea
            label="Organizations & Affiliations"
            value={character.notes.organizations}
            onChange={(e) => onChange({ notes: { ...character.notes, organizations: e.target.value } })}
            rows={2}
            placeholder="Guilds, factions, religious orders..."
          />
          <Textarea
            label="Additional Notes"
            value={character.notes.additionalNotes}
            onChange={(e) => onChange({ notes: { ...character.notes, additionalNotes: e.target.value } })}
            rows={4}
            placeholder="Anything else you want to track..."
          />
        </div>
      </section>
    </div>
  );
}
