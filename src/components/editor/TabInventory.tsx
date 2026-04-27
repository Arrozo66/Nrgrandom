import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SectionHeader } from '../ui/SectionHeader';
import { Input } from '../ui/Input';
import type { CharacterData, EquipmentItem } from '../../types/character';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TabInventoryProps {
  character: CharacterData;
  onChange: (updates: Partial<CharacterData>) => void;
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: EquipmentItem;
  onUpdate: (i: EquipmentItem) => void;
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
          value={item.name}
          onChange={(e) => onUpdate({ ...item, name: e.target.value })}
          placeholder="Item Name"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">×</span>
          <input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onUpdate({ ...item, quantity: parseInt(e.target.value) || 1 })}
            className="w-12 rounded bg-slate-700 px-1 py-0.5 text-center text-xs text-white outline-none focus:bg-slate-600"
          />
          <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={item.equipped}
              onChange={(e) => onUpdate({ ...item, equipped: e.target.checked })}
              className="accent-indigo-500 h-3 w-3"
            />
            Equipped
          </label>
        </div>
        <button onClick={onDelete} className="text-slate-600 hover:text-red-400 transition text-sm">✕</button>
      </div>
      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-700/40 pt-3">
          <Input
            label="Weight (lbs)"
            type="number"
            min={0}
            step={0.1}
            value={item.weight}
            onChange={(e) => onUpdate({ ...item, weight: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Quantity"
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) => onUpdate({ ...item, quantity: parseInt(e.target.value) || 1 })}
          />
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-400">Description</label>
            <textarea
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              rows={2}
              value={item.description}
              onChange={(e) => onUpdate({ ...item, description: e.target.value })}
              placeholder="Item description..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TabInventory({ character, onChange }: TabInventoryProps) {
  const { inventory } = character;

  function updateInventory(updates: Partial<typeof inventory>) {
    onChange({ inventory: { ...inventory, ...updates } });
  }

  function addItem() {
    const newItem: EquipmentItem = {
      id: uuidv4(),
      name: 'New Item',
      quantity: 1,
      weight: 0,
      description: '',
      equipped: false,
    };
    updateInventory({ items: [...inventory.items, newItem] });
  }

  function updateItem(id: string, item: EquipmentItem) {
    updateInventory({ items: inventory.items.map((i) => (i.id === id ? item : i)) });
  }

  function deleteItem(id: string) {
    updateInventory({ items: inventory.items.filter((i) => i.id !== id) });
  }

  const totalWeight = inventory.items.reduce((sum, i) => sum + i.weight * i.quantity, 0);
  const weightPct = inventory.carryingCapacity > 0 ? Math.min(100, (totalWeight / inventory.carryingCapacity) * 100) : 0;
  const weightColor = weightPct > 80 ? '#ef4444' : weightPct > 50 ? '#f59e0b' : '#22c55e';

  return (
    <div className="space-y-6">
      {/* ── Currency ── */}
      <section>
        <SectionHeader title="Currency" icon="💰" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { key: 'copper' as const, label: 'Copper', color: '#cd7f32' },
            { key: 'silver' as const, label: 'Silver', color: '#a0a0a0' },
            { key: 'electrum' as const, label: 'Electrum', color: '#6dbecc' },
            { key: 'gold' as const, label: 'Gold', color: '#ffd700' },
            { key: 'platinum' as const, label: 'Platinum', color: '#e5e4e2' },
          ].map(({ key, label, color }) => (
            <div key={key} className="flex flex-col items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 py-3 px-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
              <span className="text-2xl" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>🪙</span>
              <input
                type="number"
                min={0}
                value={inventory[key]}
                onChange={(e) => updateInventory({ [key]: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 text-center text-sm font-bold text-white outline-none focus:border-indigo-500"
                style={{ color }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Carrying Capacity ── */}
      <section>
        <SectionHeader title="Carrying Capacity" icon="⚖️" />
        <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-400">Weight Carried</span>
            <span className="text-sm font-bold" style={{ color: weightColor }}>
              {totalWeight.toFixed(1)} / {inventory.carryingCapacity} lbs
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-700">
            <div
              className="h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${weightPct}%`, backgroundColor: weightColor }}
            />
          </div>
          <div className="mt-3">
            <Input
              label="Max Carrying Capacity (lbs)"
              type="number"
              min={1}
              value={inventory.carryingCapacity}
              onChange={(e) => updateInventory({ carryingCapacity: parseInt(e.target.value) || 150 })}
            />
          </div>
        </div>
      </section>

      {/* ── Items ── */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-slate-700/60 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400">🎒</span>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">Equipment & Items</h3>
          </div>
          <button
            onClick={addItem}
            className="rounded-lg bg-indigo-600/20 border border-indigo-600/40 px-3 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/40 transition"
          >
            + Add Item
          </button>
        </div>

        {inventory.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <span className="text-3xl opacity-30">🎒</span>
            <p className="text-sm text-slate-600">No items in inventory.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {inventory.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onUpdate={(updated) => updateItem(item.id, updated)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
