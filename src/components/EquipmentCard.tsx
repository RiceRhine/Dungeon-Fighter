import React, { useState } from 'react';
import { Equipment, Gem, EquipmentType } from '../types/game';
import { GemIcon } from './GemIcon';
import { getRarityBorder, getRarityBadgeText, getCategoryBadge } from '../utils/calcStats';
import { Sword, Swords, Shield, Gem as GemLucide, Axe, Shirt, Crown, Plus, X, Info, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { sounds } from '../services/sound';

interface EquipmentCardProps {
  equipment: Equipment;
  isEquipped?: boolean;
  onEquip?: (equipment: Equipment) => void;
  onUnequip?: (equipment: Equipment) => void;
  onChangeEquipment?: (slotType: EquipmentType) => void;
  onSocketGem: (equipmentId: string, socketIndex: number, gem: Gem) => void;
  onUnsocketGem: (equipmentId: string, socketIndex: number) => void;
  onUnsocketAllGems?: (equipmentId: string) => void;
  onRequestGemPicker?: (equipmentId: string, socketIndex: number) => void;
  allGemsInBag?: Gem[];
  compact?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  isEquipped = false,
  onEquip,
  onUnequip,
  onChangeEquipment,
  onSocketGem,
  onUnsocketGem,
  onUnsocketAllGems,
  onRequestGemPicker,
  allGemsInBag = [],
}) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const rarityInfo = getRarityBadgeText(equipment.rarity);
  const borderClasses = getRarityBorder(equipment.rarity);

  const getEquipmentIcon = () => {
    switch (equipment.iconName) {
      case 'Sword':
        return <Sword className="w-4 h-4 text-amber-300" />;
      case 'Swords':
        return <Swords className="w-4 h-4 text-purple-300" />;
      case 'Axe':
        return <Axe className="w-4 h-4 text-red-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-sky-300" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4 text-emerald-300" />;
      case 'Crown':
        return <Crown className="w-4 h-4 text-amber-300" />;
      default:
        return <GemLucide className="w-4 h-4 text-indigo-300" />;
    }
  };

  const showPreserveFeedback = (gemName: string) => {
    setFeedbackMsg(`已拆卸「${gemName}」並保留至行囊！`);
    setTimeout(() => setFeedbackMsg(null), 1800);
  };

  const handleDragOver = (e: React.DragEvent, socketIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== socketIdx) {
      setDragOverIndex(socketIdx);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, socketIdx: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const dataString = e.dataTransfer.getData('application/json');
    if (!dataString) return;

    try {
      const data = JSON.parse(dataString);
      if (data.type === 'GEM' && data.gemId) {
        const foundGem = allGemsInBag.find((g) => g.id === data.gemId);
        if (foundGem) {
          onSocketGem(equipment.id, socketIdx, foundGem);
          sounds.playSocket();
        }
      }
    } catch (err) {
      console.error('Failed to parse dropped gem data', err);
    }
  };

  const socketedCount = equipment.sockets.filter(Boolean).length;
  const hasExtraDetails =
    equipment.baseStats.critRate > 0 ||
    equipment.baseStats.lifesteal > 0 ||
    equipment.description.length > 0 ||
    socketedCount > 0;

  return (
    <div
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative rounded-2xl border p-3.5 transition-all duration-150 flex flex-col justify-between shadow-md ${borderClasses}`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60 shrink-0">
              {getEquipmentIcon()}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{equipment.name}</h4>
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`font-semibold ${rarityInfo.color}`}>
                  {equipment.rarity === 'legendary' ? '傳奇' : equipment.rarity === 'epic' ? '史詩' : '稀有'}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  {equipment.type === 'weapon' ? '武器' : equipment.type === 'armor' ? '防具' : '飾品'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isEquipped && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-md">
                穿戴中
              </span>
            )}
            {hasExtraDetails && (
              <span className="text-slate-500 hover:text-amber-300 cursor-help" title="懸浮查看詳細特效">
                <Info className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>

        {/* 默認只顯示：攻擊、防禦、生命、攻速 4 大核心數值 (寬敞清晰) */}
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs font-mono tabular-nums mb-3 text-center">
          <div>
            <div className="text-[10px] text-slate-500 font-sans">攻擊</div>
            <div className="text-amber-300 font-bold text-xs">
              {equipment.baseStats.atk > 0 ? `+${equipment.baseStats.atk}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-sans">防禦</div>
            <div className="text-sky-300 font-bold text-xs">
              {equipment.baseStats.def > 0 ? `+${equipment.baseStats.def}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-sans">生命</div>
            <div className="text-emerald-300 font-bold text-xs">
              {equipment.baseStats.maxHp > 0 ? `+${equipment.baseStats.maxHp}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-sans">攻速</div>
            <div className="text-purple-300 font-bold text-xs">
              {equipment.baseStats.atkSpeed > 0 ? `${equipment.baseStats.atkSpeed}/s` : '—'}
            </div>
          </div>
        </div>

        {/* 寶石鑲嵌槽 (支援拖曳放開與安全拆卸保留) */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <span>鑲嵌槽 ({socketedCount}/{equipment.maxSockets})</span>
            </span>
            <div className="flex items-center gap-1.5">
              {socketedCount > 0 && onUnsocketAllGems && (
                <button
                  type="button"
                  onClick={() => {
                    onUnsocketAllGems(equipment.id);
                    sounds.playUnsocket();
                    setFeedbackMsg('已將此裝備所有寶石拆卸並完整保留！');
                    setTimeout(() => setFeedbackMsg(null), 1800);
                  }}
                  className="text-[9px] text-slate-400 hover:text-amber-300 flex items-center gap-0.5 transition-colors"
                  title="拆卸此裝備所有寶石並保留回行囊"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>全拆保留</span>
                </button>
              )}
              <span className="text-amber-400 text-[10px]">可拖曳寶石進孔</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {equipment.sockets.map((socketedGem, idx) => {
              const isDragOver = dragOverIndex === idx;

              if (socketedGem) {
                const badge = getCategoryBadge(socketedGem.category);

                return (
                  <div
                    key={idx}
                    className="flex-1 h-9 px-2 rounded-lg bg-slate-950 border border-slate-700/90 flex items-center justify-between gap-1 group/socket hover:border-amber-400/60 transition-colors shadow-inner"
                    title={`孔位 #${idx + 1} 已鑲嵌寶石（滑鼠懸停裝備可查看詳細特效；點擊 ✕ 拆卸並保留）`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {/* 鑲嵌槽常態僅顯示寶石圖示與元素流光，不顯示文字名稱 */}
                      <GemIcon gem={socketedGem} size="sm" />
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.bg}`} />
                    </div>

                    {/* 拆卸按鈕：點擊100%保留返還背包 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showPreserveFeedback(socketedGem.name);
                        onUnsocketGem(equipment.id, idx);
                        sounds.playUnsocket();
                      }}
                      className="p-1 rounded hover:bg-red-950/70 text-slate-500 hover:text-red-300 transition-colors"
                      title="拆卸此寶石（100% 完整保留回行囊）"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              }

              // Empty Socket Slot
              return (
                <div
                  key={idx}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={() => onRequestGemPicker && onRequestGemPicker(equipment.id, idx)}
                  className={`flex-1 h-9 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-1 cursor-pointer select-none text-xs ${
                    isDragOver
                      ? 'border-amber-400 bg-amber-950/60 text-amber-200 scale-105 shadow-[0_0_8px_#f59e0b]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-amber-400/60 hover:text-slate-300'
                  }`}
                  title="未鑲嵌孔位：可將上方行囊寶石拖曳至此處放開"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-medium">{isDragOver ? '放開' : `孔${idx + 1}`}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 拆卸保留即時通知 */}
        {feedbackMsg && (
          <div className="text-[9px] text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded text-center mb-1.5 animate-in fade-in duration-100">
            ✓ {feedbackMsg}
          </div>
        )}
      </div>

      {/* Action Buttons: 裝備欄新增【變更裝備】按鈕 */}
      <div className="pt-1.5 border-t border-slate-800/80">
        {isEquipped ? (
          <div className="flex items-center gap-2">
            {/* 核心新增功能：按下【變更裝備】檢視與更換當前部位擁有的其餘裝備 */}
            <button
              onClick={() => onChangeEquipment && onChangeEquipment(equipment.type)}
              className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              title="檢視與更換此部位庫存裝備"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>變更裝備</span>
            </button>

            <button
              onClick={() => onUnequip && onUnequip(equipment)}
              className="py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="卸下此裝備回庫存"
            >
              卸下
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEquip && onEquip(equipment)}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
          >
            穿戴裝備
          </button>
        )}
      </div>

      {/* 詳細數值與特效收納：滑鼠懸浮時浮動顯示 Tooltip (包含已鑲嵌寶石特效) */}
      {showTooltip && (
        <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 z-50 w-76 sm:w-84 p-3 rounded-xl bg-slate-950/98 border border-amber-500/50 shadow-[0_10px_35px_rgba(0,0,0,0.95)] text-[11px] pointer-events-none animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
          {/* Header */}
          <div className="font-bold text-white mb-1 flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center gap-1.5 truncate">
              {getEquipmentIcon()}
              <span className="truncate">{equipment.name}</span>
            </div>
            <span className={`text-[10px] font-semibold shrink-0 ${rarityInfo.color}`}>
              {rarityInfo.label} · {equipment.type === 'weapon' ? '武器' : equipment.type === 'armor' ? '防具' : '飾品'}
            </span>
          </div>

          <p className="text-slate-400 text-[10px] mb-2 leading-relaxed">
            {equipment.description}
          </p>

          {/* Secondary Stats */}
          {(equipment.baseStats.critRate > 0 || equipment.baseStats.lifesteal > 0) && (
            <div className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-[10px] space-y-0.5 mb-2.5">
              {equipment.baseStats.critRate > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>🎯 暴擊率加成</span>
                  <span className="font-bold">+{(equipment.baseStats.critRate * 100).toFixed(0)}%</span>
                </div>
              )}
              {equipment.baseStats.lifesteal > 0 && (
                <div className="flex justify-between text-rose-300">
                  <span>🩸 吸血率加成</span>
                  <span className="font-bold">+{(equipment.baseStats.lifesteal * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          )}

          {/* 💎 核心需求：滑鼠懸停裝備時顯示寶石效果 */}
          <div className="border-t border-slate-800/90 pt-2 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span className="flex items-center gap-1">
                <span>💎 鑲嵌寶石效果</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  ({socketedCount}/{equipment.maxSockets} 孔)
                </span>
              </span>
              <span className="text-[9px] font-normal text-emerald-400">拆卸100%保留</span>
            </div>

            {socketedCount === 0 ? (
              <div className="p-2 rounded-lg bg-slate-900/80 border border-dashed border-slate-800 text-[10px] text-slate-400 space-y-1 text-center">
                <div className="text-slate-300">此裝備尚未鑲嵌任何寶石</div>
                <div className="text-amber-400 text-[9px]">
                  可拖曳上方行囊中的寶石進入孔位，即可賦予裝備強大特效！
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                {equipment.sockets.map((gem, idx) => {
                  if (!gem) return null;
                  const badge = getCategoryBadge(gem.category);

                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-900/95 border border-slate-700/80 space-y-1 shadow-sm"
                    >
                      {/* Gem Name & Category Tag */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: gem.colorHex }}
                          />
                          <span className="font-bold text-white truncate text-[11px]">
                            {gem.name}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${badge.bg} ${badge.color} border border-current/20 shrink-0`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Stat Buff from Gem */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-mono text-emerald-300">
                        {gem.statBonus?.atk && <span>⚔️ 攻擊 +{gem.statBonus.atk}</span>}
                        {gem.statBonus?.def && <span>🛡️ 防禦 +{gem.statBonus.def}</span>}
                        {gem.statBonus?.maxHp && <span>❤️ 生命 +{gem.statBonus.maxHp}</span>}
                        {gem.statBonus?.atkSpeed && <span>⚡ 攻速 +{gem.statBonus.atkSpeed}</span>}
                        {gem.statBonus?.critRate && <span>🎯 暴擊 +{(gem.statBonus.critRate * 100).toFixed(0)}%</span>}
                        {gem.statBonus?.critDamage && <span>💥 暴傷 +{(gem.statBonus.critDamage * 100).toFixed(0)}%</span>}
                        {gem.statBonus?.lifesteal && <span>🩸 吸血 +{(gem.statBonus.lifesteal * 100).toFixed(0)}%</span>}
                        {gem.statBonus?.damageReduction && <span>🔰 減傷 +{(gem.statBonus.damageReduction * 100).toFixed(0)}%</span>}
                      </div>

                      {/* Special Effect Name & Description */}
                      <div className="text-[10px] text-slate-300 leading-tight">
                        <span className="font-semibold text-amber-300">
                          【{gem.specialEffect.name}】
                        </span>
                        <span>{gem.specialEffect.description}</span>
                      </div>

                      {/* Trigger Mechanics Note */}
                      <div className="text-[9px] font-mono pt-0.5 border-t border-slate-800/80 flex items-center justify-between">
                        {gem.category === 'skill' ? (
                          <span className="text-purple-300 font-bold">
                            ⏳ 冷卻 {gem.specialEffect.cooldown}秒 · 冷卻完下次普攻必定 100% 觸發
                          </span>
                        ) : gem.category === 'passive' ? (
                          <span className="text-sky-300 font-bold">
                            🎲 觸發機率 {(gem.specialEffect.procChance || 0.4) * 100}% · 無冷卻機率生效
                          </span>
                        ) : (
                          <span className="text-amber-300 font-bold">
                            ✨ 數值特化 · 永久常態屬性加成
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
