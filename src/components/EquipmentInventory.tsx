import React, { useState } from 'react';
import { Equipment, Gem } from '../types/game';
import { EquipmentCard } from './EquipmentCard';
import { Shield, Filter } from 'lucide-react';

interface EquipmentInventoryProps {
  equipments: Equipment[];
  onEquip: (equipment: Equipment) => void;
  onSocketGem: (equipmentId: string, socketIndex: number, gem: Gem) => void;
  onUnsocketGem: (equipmentId: string, socketIndex: number) => void;
  onRequestGemPicker: (equipmentId: string, socketIndex: number) => void;
  allGemsInBag: Gem[];
}

export const EquipmentInventory: React.FC<EquipmentInventoryProps> = ({
  equipments,
  onEquip,
  onSocketGem,
  onUnsocketGem,
  onRequestGemPicker,
  allGemsInBag,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredItems = equipments.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="flex flex-col bg-slate-900/95 border border-slate-800 rounded-xl p-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-1.5 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white tracking-wide">裝備庫存背包</h3>
          <span className="text-[10px] text-slate-400 font-mono">({equipments.length})</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-500 mr-0.5" />
          {[
            { id: 'all', label: '全部' },
            { id: 'weapon', label: '武器' },
            { id: 'armor', label: '防具' },
            { id: 'accessory', label: '飾品' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                filterType === tab.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Equipment Cards */}
      {filteredItems.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">
          庫存中無此類別裝備
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              isEquipped={false}
              onEquip={onEquip}
              onSocketGem={onSocketGem}
              onUnsocketGem={onUnsocketGem}
              onRequestGemPicker={onRequestGemPicker}
              allGemsInBag={allGemsInBag}
            />
          ))}
        </div>
      )}
    </div>
  );
};
