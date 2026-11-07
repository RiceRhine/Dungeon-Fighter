import { Equipment, Gem, HeroCalculatedStats, ActiveSkillState } from '../types/game';

export const BASE_HERO_STATS = {
  atk: 25,
  def: 12,
  maxHp: 550,
  atkSpeed: 1.0, // 1 attack per second
  critRate: 0.05, // 5%
  critDamage: 1.5, // 150%
  lifesteal: 0,
  damageReduction: 0,
  regenPerSec: 0,
};

export function calculateHeroStats(
  equipped: {
    weapon: Equipment | null;
    armor: Equipment | null;
    accessory: Equipment | null;
  }
): HeroCalculatedStats {
  const stats: HeroCalculatedStats = {
    atk: BASE_HERO_STATS.atk,
    def: BASE_HERO_STATS.def,
    maxHp: BASE_HERO_STATS.maxHp,
    atkSpeed: BASE_HERO_STATS.atkSpeed,
    critRate: BASE_HERO_STATS.critRate,
    critDamage: BASE_HERO_STATS.critDamage,
    lifesteal: BASE_HERO_STATS.lifesteal,
    damageReduction: BASE_HERO_STATS.damageReduction,
    regenPerSec: BASE_HERO_STATS.regenPerSec,

    // 被動型：無冷卻，概率觸發
    passiveDoubleStrikeChance: 0,
    passiveVenomChance: 0,
    passiveGroundSlamChance: 0,
    passiveThornsChance: 0,
    passiveThornsPercent: 0,
    passiveFrostChance: 0,
    passiveLeechChance: 0,

    // 技能型：帶有冷卻，必定觸發
    activeSkills: [],
  };

  const equippedItems: Equipment[] = [
    equipped.weapon,
    equipped.armor,
    equipped.accessory,
  ].filter((item): item is Equipment => item !== null);

  for (const item of equippedItems) {
    // Equipment Base Stats
    stats.atk += item.baseStats.atk || 0;
    stats.def += item.baseStats.def || 0;
    stats.maxHp += item.baseStats.maxHp || 0;
    stats.atkSpeed += item.baseStats.atkSpeed || 0;
    stats.critRate += item.baseStats.critRate || 0;
    stats.lifesteal += item.baseStats.lifesteal || 0;

    // Sockets & Gem bonuses
    for (const gem of item.sockets) {
      if (!gem) continue;

      // 1. Stat bonuses from gem
      if (gem.statBonus.atk) stats.atk += gem.statBonus.atk;
      if (gem.statBonus.def) stats.def += gem.statBonus.def;
      if (gem.statBonus.maxHp) stats.maxHp += gem.statBonus.maxHp;
      if (gem.statBonus.critRate) stats.critRate += gem.statBonus.critRate;
      if (gem.statBonus.critDamage) stats.critDamage += gem.statBonus.critDamage;
      if (gem.statBonus.atkSpeed) stats.atkSpeed += gem.statBonus.atkSpeed;
      if (gem.statBonus.lifesteal) stats.lifesteal += gem.statBonus.lifesteal;
      if (gem.statBonus.damageReduction) stats.damageReduction += gem.statBonus.damageReduction;
      if (gem.statBonus.regenPerSec) stats.regenPerSec += gem.statBonus.regenPerSec;

      // 2. 被動型 (Passive: 無冷卻，概率觸發)
      if (gem.category === 'passive') {
        if (gem.id.includes('double')) {
          stats.passiveDoubleStrikeChance = Math.min(0.85, stats.passiveDoubleStrikeChance + (gem.specialEffect.procChance || 0.35));
        } else if (gem.id.includes('venom')) {
          stats.passiveVenomChance = Math.min(0.9, stats.passiveVenomChance + (gem.specialEffect.procChance || 0.4));
        } else if (gem.id.includes('slam')) {
          stats.passiveGroundSlamChance = Math.min(0.75, stats.passiveGroundSlamChance + (gem.specialEffect.procChance || 0.25));
        } else if (gem.id.includes('thorns')) {
          stats.passiveThornsChance = Math.min(0.95, stats.passiveThornsChance + (gem.specialEffect.procChance || 0.5));
          stats.passiveThornsPercent = Math.min(0.9, stats.passiveThornsPercent + gem.specialEffect.value);
        } else if (gem.id.includes('frost')) {
          stats.passiveFrostChance = Math.min(0.85, stats.passiveFrostChance + (gem.specialEffect.procChance || 0.35));
        } else if (gem.id.includes('leech')) {
          stats.passiveLeechChance = Math.min(0.8, stats.passiveLeechChance + (gem.specialEffect.procChance || 0.3));
        }
      }

      // 3. 技能型 (Skill: 帶冷卻，冷卻結束必定觸發)
      if (gem.category === 'skill' && gem.specialEffect.cooldown) {
        let effectType: ActiveSkillState['effectType'] = 'flame_burst';
        if (gem.id.includes('thunder')) effectType = 'thunder_strike';
        else if (gem.id.includes('time')) effectType = 'time_warp';
        else if (gem.id.includes('holy')) effectType = 'holy_judgment';
        else if (gem.id.includes('arcane')) effectType = 'arcane_nova';

        stats.activeSkills.push({
          gemId: gem.id,
          name: gem.specialEffect.name,
          icon: gem.icon,
          colorHex: gem.colorHex,
          cooldown: gem.specialEffect.cooldown,
          remainingCd: 0, // initially ready
          effectValue: gem.specialEffect.value,
          effectType,
        });
      }
    }
  }

  // Safety caps
  stats.critRate = Math.min(0.95, Math.max(0.01, stats.critRate));
  stats.atkSpeed = Math.min(3.5, Math.max(0.4, stats.atkSpeed));
  stats.damageReduction = Math.min(0.75, stats.damageReduction);
  stats.lifesteal = Math.min(0.65, stats.lifesteal);

  return stats;
}

export function getRarityBorder(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.25)] bg-gradient-to-b from-amber-950/40 to-slate-900/90';
    case 'epic':
      return 'border-purple-400/80 shadow-[0_0_8px_rgba(192,132,252,0.2)] bg-gradient-to-b from-purple-950/40 to-slate-900/90';
    case 'rare':
      return 'border-sky-400/80 shadow-[0_0_8px_rgba(56,189,248,0.2)] bg-gradient-to-b from-sky-950/40 to-slate-900/90';
    default:
      return 'border-slate-700/80 bg-slate-900/90';
  }
}

export function getRarityBadgeText(rarity: string): { label: string; color: string } {
  switch (rarity) {
    case 'legendary':
      return { label: '傳奇 (Legendary)', color: 'text-amber-400' };
    case 'epic':
      return { label: '史詩 (Epic)', color: 'text-purple-400' };
    case 'rare':
      return { label: '稀有 (Rare)', color: 'text-sky-400' };
    default:
      return { label: '普通 (Common)', color: 'text-slate-400' };
  }
}

export function getCategoryBadge(category: string): { label: string; color: string; border: string; bg: string; subDesc: string } {
  switch (category) {
    case 'stat':
      return {
        label: '數值型',
        color: 'text-amber-300',
        border: 'border-amber-500/50',
        bg: 'bg-amber-950/40',
        subDesc: '常態屬性加成',
      };
    case 'passive':
      return {
        label: '被動型',
        color: 'text-sky-300',
        border: 'border-sky-500/50',
        bg: 'bg-sky-950/40',
        subDesc: '無冷卻·概率觸發',
      };
    case 'skill':
      return {
        label: '技能型',
        color: 'text-purple-300',
        border: 'border-purple-500/50',
        bg: 'bg-purple-950/40',
        subDesc: '帶冷卻·必定觸發',
      };
    default:
      return {
        label: '普通',
        color: 'text-slate-300',
        border: 'border-slate-600',
        bg: 'bg-slate-800',
        subDesc: '',
      };
  }
}
