import React, { useState } from 'react';
import { Equipment, Gem, HeroCalculatedStats, EquipmentType } from '../types/game';
import { EquipmentCard } from './EquipmentCard';
import { Shield, Sword, Heart, Zap, Sparkles, Flame, Skull, Hourglass, Activity, ShieldAlert, ShieldCheck, RotateCcw, ArrowRightLeft } from 'lucide-react';
import { sounds } from '../services/sound';

interface HeroCharacterCardProps {
  equipped: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  };
  heroStats: HeroCalculatedStats;
  currentHp: number;
  onUnequip: (equipment: Equipment) => void;
  onChangeEquipment: (slotType: EquipmentType) => void;
  onSocketGem: (equipmentId: string, socketIndex: number, gem: Gem) => void;
  onUnsocketGem: (equipmentId: string, socketIndex: number) => void;
  onUnsocketAllGems?: (equipmentId: string) => void;
  onUnsocketAllEquippedGems?: () => void;
  onRequestGemPicker: (equipmentId: string, socketIndex: number) => void;
  allGemsInBag: Gem[];
}

export const HeroCharacterCard: React.FC<HeroCharacterCardProps> = ({
  equipped,
  heroStats,
  currentHp,
  onUnequip,
  onChangeEquipment,
  onSocketGem,
  onUnsocketGem,
  onUnsocketAllGems,
  onUnsocketAllEquippedGems,
  onRequestGemPicker,
  allGemsInBag,
}) => {
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const hpPercent = Math.max(0, Math.min(100, (currentHp / heroStats.maxHp) * 100));

  const totalSocketedGems = [equipped.weapon, equipped.armor, equipped.accessory]
    .filter((e): e is Equipment => Boolean(e))
    .reduce((acc, eq) => acc + eq.sockets.filter(Boolean).length, 0);

  return (
    <div className="flex flex-col gap-3.5 bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Top: Spacious Hero Stats Bar */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-amber-500/60 shadow-md">
            <img
              src="/src/assets/images/game_hero_knight_1794023187832.jpg"
              alt="英雄騎士"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">英雄騎士</h2>
              <span className="text-[10px] text-amber-400 font-mono">Lv.35</span>
            </div>
            {/* HP Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-emerald-400 transition-all duration-200"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums text-emerald-400">
                {Math.round(currentHp)}/{heroStats.maxHp}
              </span>
            </div>
          </div>
        </div>

        {/* 默認只顯示：攻擊、防禦、生命、攻速 4 大核心數值 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono tabular-nums bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
            <div className="px-2 py-0.5">
              <div className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5">
                <Sword className="w-2.5 h-2.5 text-amber-400" />
                <span>攻擊</span>
              </div>
              <div className="text-xs text-amber-300 font-bold">{heroStats.atk}</div>
            </div>

            <div className="px-2 py-0.5">
              <div className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5">
                <Shield className="w-2.5 h-2.5 text-sky-400" />
                <span>防禦</span>
              </div>
              <div className="text-xs text-sky-300 font-bold">{heroStats.def}</div>
            </div>

            <div className="px-2 py-0.5">
              <div className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5">
                <Heart className="w-2.5 h-2.5 text-emerald-400" />
                <span>生命</span>
              </div>
              <div className="text-xs text-emerald-300 font-bold">{heroStats.maxHp}</div>
            </div>

            <div className="px-2 py-0.5">
              <div className="text-[9px] text-slate-500 flex items-center justify-center gap-0.5">
                <Zap className="w-2.5 h-2.5 text-purple-400" />
                <span>攻速</span>
              </div>
              <div className="text-xs text-purple-300 font-bold">{heroStats.atkSpeed.toFixed(2)}/s</div>
            </div>
          </div>

          {/* 一鍵全拆保留快捷鍵 */}
          {totalSocketedGems > 0 && onUnsocketAllEquippedGems && (
            <button
              onClick={() => {
                onUnsocketAllEquippedGems();
                sounds.playUnsocket();
              }}
              className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 text-[10px] flex items-center gap-1 transition-colors"
              title="一鍵拆卸所有穿戴裝備上的寶石，全部安全保留回行囊"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">全拆保留</span>
            </button>
          )}

          {/* 詳細數值與特效收納 (Hover Popover) */}
          <div
            className="relative"
            onMouseEnter={() => setShowDetailedStats(true)}
            onMouseLeave={() => setShowDetailedStats(false)}
          >
            <button
              type="button"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 flex items-center gap-1 transition-colors"
              title="滑鼠懸浮查看被動型(無冷卻概率)與技能型(帶冷卻必定觸發)效果"
            >
              <Sparkles className="w-4 h-4" />
              {totalSocketedGems > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Hover Tooltip Popover */}
            {showDetailedStats && (
              <div className="absolute right-0 top-full mt-2 w-80 p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="font-bold text-white mb-2 pb-1.5 border-b border-slate-800 flex items-center justify-between">
                  <span>三類寶石特效總覽 (拆卸均保留)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">即時生效</span>
                </div>

                {/* 1. 數值型進階屬性 */}
                <div className="mb-2.5">
                  <div className="text-[10px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>【數值型】常態屬性加成</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <div className="flex justify-between text-slate-300 p-1 bg-slate-900 rounded">
                      <span>暴擊率</span>
                      <span className="text-amber-400 font-bold">{(heroStats.critRate * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300 p-1 bg-slate-900 rounded">
                      <span>暴擊傷害</span>
                      <span className="text-amber-400 font-bold">{(heroStats.critDamage * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300 p-1 bg-slate-900 rounded">
                      <span>吸血率</span>
                      <span className="text-rose-400 font-bold">{(heroStats.lifesteal * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300 p-1 bg-slate-900 rounded">
                      <span>傷害減免</span>
                      <span className="text-sky-400 font-bold">{(heroStats.damageReduction * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* 2. 被動型：無冷卻，概率觸發 */}
                <div className="mb-2.5 border-t border-slate-800/80 pt-1.5">
                  <div className="text-[10px] font-bold text-sky-300 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span>【被動型】無冷卻·概率觸發</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {heroStats.passiveDoubleStrikeChance > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-200">
                        <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>狂怒連擊: 攻擊時 {(heroStats.passiveDoubleStrikeChance * 100).toFixed(0)}% 概率連打 80% 額外傷</span>
                      </div>
                    )}
                    {heroStats.passiveVenomChance > 0 && (
                      <div className="flex items-center gap-1.5 text-emerald-200">
                        <Skull className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>滲透劇毒: 攻擊時 {(heroStats.passiveVenomChance * 100).toFixed(0)}% 概率注入真傷毒液</span>
                      </div>
                    )}
                    {heroStats.passiveGroundSlamChance > 0 && (
                      <div className="flex items-center gap-1.5 text-orange-200">
                        <Sword className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>震盪波: 攻擊時 {(heroStats.passiveGroundSlamChance * 100).toFixed(0)}% 概率爆發 120 點衝擊傷</span>
                      </div>
                    )}
                    {heroStats.passiveThornsChance > 0 && (
                      <div className="flex items-center gap-1.5 text-yellow-200">
                        <ShieldAlert className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                        <span>聖光反噬: 受擊時 {(heroStats.passiveThornsChance * 100).toFixed(0)}% 概率反彈 {(heroStats.passiveThornsPercent * 100).toFixed(0)}% 傷害</span>
                      </div>
                    )}
                    {heroStats.passiveFrostChance > 0 && (
                      <div className="flex items-center gap-1.5 text-sky-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>極寒霜晶: 受擊時 {(heroStats.passiveFrostChance * 100).toFixed(0)}% 概率減免 40% 傷並減速敵人 30%</span>
                      </div>
                    )}
                    {heroStats.passiveLeechChance > 0 && (
                      <div className="flex items-center gap-1.5 text-rose-200">
                        <Activity className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>靈魂掠奪: 攻擊時 {(heroStats.passiveLeechChance * 100).toFixed(0)}% 概率汲取 50% 傷害為生命</span>
                      </div>
                    )}
                    {heroStats.passiveDoubleStrikeChance === 0 &&
                      heroStats.passiveVenomChance === 0 &&
                      heroStats.passiveGroundSlamChance === 0 &&
                      heroStats.passiveThornsChance === 0 &&
                      heroStats.passiveFrostChance === 0 &&
                      heroStats.passiveLeechChance === 0 && (
                        <div className="text-slate-500 text-[10px]">未鑲嵌被動型寶珠</div>
                      )}
                  </div>
                </div>

                {/* 3. 技能型：帶有冷卻，必定觸發 */}
                <div className="border-t border-slate-800/80 pt-1.5">
                  <div className="text-[10px] font-bold text-purple-300 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>【技能型】帶有冷卻·必定觸發</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {heroStats.activeSkills.map((sk, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-purple-200">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>
                          {sk.name}: CD {sk.cooldown}秒（冷卻完畢下一次攻擊必定觸發）
                        </span>
                      </div>
                    ))}
                    {heroStats.activeSkills.length === 0 && (
                      <div className="text-slate-500 text-[10px]">未鑲嵌技能型寶珠</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Currently Equipped 3 Slots (Weapon, Armor, Accessory) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Weapon Slot */}
        {equipped.weapon ? (
          <EquipmentCard
            equipment={equipped.weapon}
            isEquipped={true}
            onUnequip={onUnequip}
            onChangeEquipment={onChangeEquipment}
            onSocketGem={onSocketGem}
            onUnsocketGem={onUnsocketGem}
            onUnsocketAllGems={onUnsocketAllGems}
            onRequestGemPicker={onRequestGemPicker}
            allGemsInBag={allGemsInBag}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Sword className="w-6 h-6 text-slate-600" />
            <span>武器槽空缺</span>
            <button
              onClick={() => onChangeEquipment('weapon')}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>變更/選擇武器</span>
            </button>
          </div>
        )}

        {/* Armor Slot */}
        {equipped.armor ? (
          <EquipmentCard
            equipment={equipped.armor}
            isEquipped={true}
            onUnequip={onUnequip}
            onChangeEquipment={onChangeEquipment}
            onSocketGem={onSocketGem}
            onUnsocketGem={onUnsocketGem}
            onUnsocketAllGems={onUnsocketAllGems}
            onRequestGemPicker={onRequestGemPicker}
            allGemsInBag={allGemsInBag}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-slate-600" />
            <span>防具槽空缺</span>
            <button
              onClick={() => onChangeEquipment('armor')}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>變更/選擇防具</span>
            </button>
          </div>
        )}

        {/* Accessory Slot */}
        {equipped.accessory ? (
          <EquipmentCard
            equipment={equipped.accessory}
            isEquipped={true}
            onUnequip={onUnequip}
            onChangeEquipment={onChangeEquipment}
            onSocketGem={onSocketGem}
            onUnsocketGem={onUnsocketGem}
            onUnsocketAllGems={onUnsocketAllGems}
            onRequestGemPicker={onRequestGemPicker}
            allGemsInBag={allGemsInBag}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-slate-600" />
            <span>飾品槽空缺</span>
            <button
              onClick={() => onChangeEquipment('accessory')}
              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>變更/選擇飾品</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
