import React, { useState } from 'react';
import { Equipment, Gem } from '../types/game';
import { GemIcon } from './GemIcon';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { getCategoryBadge } from '../utils/calcStats';
import { sounds } from '../services/sound';

interface SocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  socketIndex: number | null;
  gemsInBag: Gem[];
  onSelectGem: (equipmentId: string, socketIndex: number, gem: Gem) => void;
}

export const SocketModal: React.FC<SocketModalProps> = ({
  isOpen,
  onClose,
  equipment,
  socketIndex,
  gemsInBag,
  onSelectGem,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  if (!isOpen || !equipment || socketIndex === null) return null;

  const currentGem = equipment.sockets[socketIndex];

  const filteredGems = gemsInBag.filter((gem) => {
    if (categoryFilter === 'all') return true;
    return gem.category === categoryFilter;
  });

  const handlePick = (gem: Gem) => {
    onSelectGem(equipment.id, socketIndex, gem);
    sounds.playSocket();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-white">
                選擇寶石鑲嵌至「{equipment.name}」
              </h3>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>槽位第 {socketIndex + 1} 孔</span>
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>拆卸更換均 100% 保留舊寶石</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Socketed Gem info */}
        {currentGem && (
          <div className="mb-3 p-2 rounded-lg bg-amber-950/30 border border-amber-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <GemIcon gem={currentGem} size="sm" />
              <div>
                <span className="text-slate-300">此孔已有：</span>
                <span className="font-bold text-white ml-1">{currentGem.name}</span>
                <span className="text-amber-300 ml-1 text-[10px]">({currentGem.specialEffect.name})</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">更換將自動拆卸保留回行囊</span>
          </div>
        )}

        {/* Category Tabs: 數值型、被動型、技能型 */}
        <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800/80 mb-2.5 text-xs">
          {[
            { id: 'all', label: '全部' },
            { id: 'stat', label: '數值型' },
            { id: 'passive', label: '被動型' },
            { id: 'skill', label: '技能型' },
          ].map((tab) => {
            const isSelected = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
                {tab.id !== 'all' && (
                  <span className="text-[10px] ml-1 opacity-70">
                    ({gemsInBag.filter((g) => g.category === tab.id).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Gems List */}
        {filteredGems.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            行囊中此分類暫無可用寶石
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {filteredGems.map((gem) => {
              const badge = getCategoryBadge(gem.category);

              return (
                <div
                  key={gem.id}
                  onClick={() => handlePick(gem)}
                  className="group p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/80 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <GemIcon gem={gem} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{gem.name}</span>
                        <span className={`text-[9px] px-1 rounded ${badge.bg} ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">T{gem.tier}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5 truncate">
                        <span className="text-amber-300">{gem.specialEffect.name}：</span>
                        {gem.specialEffect.description}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 group-hover:bg-amber-400 text-slate-950 transition-colors shrink-0 shadow-sm"
                  >
                    鑲嵌
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
