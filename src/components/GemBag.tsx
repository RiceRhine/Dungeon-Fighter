import React, { useState } from 'react';
import { Gem, GemCategory } from '../types/game';
import { GemIcon } from './GemIcon';
import { Sparkles, Info } from 'lucide-react';
import { getCategoryBadge } from '../utils/calcStats';

interface GemBagProps {
  gems: Gem[];
  onSelectGem?: (gem: Gem) => void;
  selectedGemId?: string | null;
}

export const GemBag: React.FC<GemBagProps> = ({ gems, onSelectGem, selectedGemId }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [hoveredGem, setHoveredGem] = useState<Gem | null>(null);

  const filteredGems = gems.filter((gem) => {
    if (filterCategory === 'all') return true;
    return gem.category === filterCategory;
  });

  return (
    <div className="relative flex flex-col bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">寶石行囊</h3>
          <span className="text-xs text-slate-400 font-mono">({gems.length} 顆 · 拆卸均完整保留)</span>
        </div>
        <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>按住寶石拖曳至下方裝備孔位</span>
        </div>
      </div>

      {/* Filter Tabs: 數值型、被動型、技能型 */}
      <div className="flex items-center gap-1.5 pb-1 mb-2 text-xs">
        {[
          { id: 'all', label: '全部' },
          { id: 'stat', label: '數值型' },
          { id: 'passive', label: '被動型' },
          { id: 'skill', label: '技能型' },
        ].map((tab) => {
          const isSelected = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                isSelected
                  ? tab.id === 'stat'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold'
                    : tab.id === 'passive'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/60 font-bold'
                    : tab.id === 'skill'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60 font-bold'
                    : 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span className="text-[10px] ml-1 opacity-75">
                  ({gems.filter((g) => g.category === tab.id).length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Gem Grid: Spacious & Draggable */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-2 bg-slate-950/70 border border-slate-800/80 rounded-xl min-h-[100px] max-h-[160px] overflow-y-auto content-start">
        {filteredGems.length === 0 ? (
          <div className="col-span-full py-4 text-center text-[11px] text-slate-500">
            行囊中尚無此類別寶石
          </div>
        ) : (
          filteredGems.map((gem) => {
            const isSelected = selectedGemId === gem.id;
            const badge = getCategoryBadge(gem.category);

            return (
              <div
                key={gem.id}
                onMouseEnter={() => setHoveredGem(gem)}
                onMouseLeave={() => setHoveredGem(null)}
                onClick={() => onSelectGem && onSelectGem(gem)}
                className={`relative group flex flex-col items-center justify-center p-1 rounded-lg transition-all cursor-grab active:cursor-grabbing ${
                  isSelected
                    ? 'ring-2 ring-amber-400 bg-amber-950/40'
                    : 'hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <GemIcon gem={gem} size="md" draggable={true} />
                <span className="text-[9px] text-slate-300 font-medium truncate w-full text-center mt-0.5">
                  {gem.name}
                </span>
                <span className={`text-[8px] px-1 rounded ${badge.bg} ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* 詳細特效及數值收納：滑鼠懸浮時浮動顯示 Tooltip */}
      {hoveredGem && (
        <div className="absolute right-2 top-full mt-1 z-50 w-68 p-2.5 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl text-[11px] pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredGem.colorHex }} />
              <span className="font-bold text-white">{hoveredGem.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[9px] px-1 py-0.2 rounded border ${getCategoryBadge(hoveredGem.category).bg} ${getCategoryBadge(hoveredGem.category).color} ${getCategoryBadge(hoveredGem.category).border}`}>
                {getCategoryBadge(hoveredGem.category).label}
              </span>
              <span className="text-[10px] text-amber-400 font-mono">T{hoveredGem.tier}</span>
            </div>
          </div>

          <div className="text-amber-300 font-semibold mb-1">
            【{hoveredGem.specialEffect.name}】
          </div>
          <div className="text-slate-300 text-[10px] mb-2 leading-relaxed">
            {hoveredGem.specialEffect.description}
          </div>

          {/* Stat Bonuses */}
          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800">
            {hoveredGem.statBonus.atk && <span>+攻擊 {hoveredGem.statBonus.atk}</span>}
            {hoveredGem.statBonus.def && <span>+防禦 {hoveredGem.statBonus.def}</span>}
            {hoveredGem.statBonus.maxHp && <span>+生命 {hoveredGem.statBonus.maxHp}</span>}
            {hoveredGem.statBonus.atkSpeed && <span>+攻速 {(hoveredGem.statBonus.atkSpeed).toFixed(2)}/s</span>}
            {hoveredGem.statBonus.critRate && <span>+暴擊 {(hoveredGem.statBonus.critRate * 100).toFixed(0)}%</span>}
            {hoveredGem.statBonus.critDamage && <span>+爆傷 {(hoveredGem.statBonus.critDamage * 100).toFixed(0)}%</span>}
            {hoveredGem.statBonus.lifesteal && <span>+吸血 {(hoveredGem.statBonus.lifesteal * 100).toFixed(0)}%</span>}
            {hoveredGem.statBonus.damageReduction && <span>+免傷 {(hoveredGem.statBonus.damageReduction * 100).toFixed(0)}%</span>}
            {hoveredGem.statBonus.regenPerSec && <span>+秒回 {hoveredGem.statBonus.regenPerSec} HP</span>}
          </div>
        </div>
      )}
    </div>
  );
};
