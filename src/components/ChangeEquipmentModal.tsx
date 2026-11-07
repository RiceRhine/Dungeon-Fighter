import React from 'react';
import { Equipment, EquipmentType } from '../types/game';
import { GemIcon } from './GemIcon';
import { getRarityBorder, getRarityBadgeText } from '../utils/calcStats';
import { X, Sword, Shield, Gem as GemLucide, Check, Plus, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { sounds } from '../services/sound';

interface ChangeEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotType: EquipmentType | null;
  currentEquipped: Equipment | null;
  inventoryEquipments: Equipment[];
  onSelectEquip: (equipment: Equipment) => void;
  onAddNewRandomEquipment: () => void;
}

export const ChangeEquipmentModal: React.FC<ChangeEquipmentModalProps> = ({
  isOpen,
  onClose,
  slotType,
  currentEquipped,
  inventoryEquipments,
  onSelectEquip,
  onAddNewRandomEquipment,
}) => {
  if (!isOpen || !slotType) return null;

  const slotTitle = slotType === 'weapon' ? '武器' : slotType === 'armor' ? '防具' : '飾品';

  // Filter available equipment matching this slot type
  const availableItems = inventoryEquipments.filter((item) => item.type === slotType);

  const handleEquipItem = (item: Equipment) => {
    onSelectEquip(item);
    sounds.playEquip();
    onClose();
  };

  const getSlotIcon = () => {
    switch (slotType) {
      case 'weapon':
        return <Sword className="w-5 h-5 text-amber-400" />;
      case 'armor':
        return <Shield className="w-5 h-5 text-sky-400" />;
      case 'accessory':
        return <GemLucide className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-xl w-full rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
              {getSlotIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                檢視與更換【{slotTitle}】部位裝備
              </h3>
              <p className="text-xs text-slate-400">
                可隨時替換，更換後原裝備及其鑲嵌寶石將完整保留回庫存
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Equipped Preview */}
        <div className="my-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0">
          <div className="text-[11px] text-amber-400 font-semibold mb-1.5 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>目前穿戴中裝備：</span>
          </div>

          {currentEquipped ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{currentEquipped.name}</span>
                  <span className={`text-xs font-semibold ${getRarityBadgeText(currentEquipped.rarity).color}`}>
                    {getRarityBadgeText(currentEquipped.rarity).label}
                  </span>
                </div>
                {/* 默認核心 4 數值 */}
                <div className="flex items-center gap-3 text-xs font-mono text-slate-300 mt-1">
                  {currentEquipped.baseStats.atk > 0 && <span>攻擊 +{currentEquipped.baseStats.atk}</span>}
                  {currentEquipped.baseStats.def > 0 && <span>防禦 +{currentEquipped.baseStats.def}</span>}
                  {currentEquipped.baseStats.maxHp > 0 && <span>生命 +{currentEquipped.baseStats.maxHp}</span>}
                  {currentEquipped.baseStats.atkSpeed > 0 && <span>攻速 {currentEquipped.baseStats.atkSpeed}/s</span>}
                </div>
              </div>

              {/* Sockets */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-500">鑲嵌孔：</span>
                {currentEquipped.sockets.map((gem, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded border border-slate-700 bg-slate-900 flex items-center justify-center cursor-help"
                    title={
                      gem
                        ? `💎 ${gem.name} [${gem.category === 'stat' ? '數值型' : gem.category === 'passive' ? '被動型' : '技能型'}]: 特效【${gem.specialEffect.name}】${gem.specialEffect.description}`
                        : '未鑲嵌寶石'
                    }
                  >
                    {gem ? <GemIcon gem={gem} size="sm" /> : <span className="text-[9px] text-slate-600">空</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">目前該部位未穿戴任何裝備</div>
          )}
        </div>

        {/* Available Equipment List */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>庫存中可替換的【{slotTitle}】({availableItems.length} 件)</span>
          </span>
          <button
            onClick={() => onAddNewRandomEquipment()}
            className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            title="隨機新增一件裝備至庫存以供測試"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+獲得新{slotTitle}</span>
          </button>
        </div>

        {availableItems.length === 0 ? (
          <div className="flex-1 py-12 flex flex-col items-center justify-center text-center text-slate-500 text-xs gap-3">
            <div>庫存中目前沒有其他可替換的【{slotTitle}】</div>
            <button
              onClick={() => onAddNewRandomEquipment()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>點此為庫存增加一件隨機裝備</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
            {availableItems.map((item) => {
              const borderCls = getRarityBorder(item.rarity);
              const rarity = getRarityBadgeText(item.rarity);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-500 ${borderCls}`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className={`text-[10px] font-semibold ${rarity.color}`}>
                        {rarity.label}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>

                    {/* 4 Core stats */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-slate-300 mt-1.5">
                      {item.baseStats.atk > 0 && (
                        <span className="text-amber-300 font-semibold">攻擊 +{item.baseStats.atk}</span>
                      )}
                      {item.baseStats.def > 0 && (
                        <span className="text-sky-300 font-semibold">防禦 +{item.baseStats.def}</span>
                      )}
                      {item.baseStats.maxHp > 0 && (
                        <span className="text-emerald-300 font-semibold">生命 +{item.baseStats.maxHp}</span>
                      )}
                      {item.baseStats.atkSpeed > 0 && (
                        <span className="text-purple-300 font-semibold">攻速 {item.baseStats.atkSpeed}/s</span>
                      )}
                    </div>

                    {/* Sockets count with gem effect tooltip */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400">
                        孔位 ({item.sockets.filter(Boolean).length}/{item.maxSockets})：
                      </span>
                      {item.sockets.map((gem, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded border border-slate-700 bg-slate-950 flex items-center justify-center cursor-help"
                          title={
                            gem
                              ? `💎 ${gem.name} [${gem.category === 'stat' ? '數值型' : gem.category === 'passive' ? '被動型' : '技能型'}]: 特效【${gem.specialEffect.name}】${gem.specialEffect.description}`
                              : '未鑲嵌寶石'
                          }
                        >
                          {gem ? <GemIcon gem={gem} size="sm" /> : <span className="text-[8px] text-slate-600">空</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Swap Equip Button */}
                  <button
                    onClick={() => handleEquipItem(item)}
                    className="py-2 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>更換穿戴此裝備</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
