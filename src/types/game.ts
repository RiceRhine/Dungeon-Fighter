export type EquipmentType = 'weapon' | 'armor' | 'accessory';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// 寶石三大分類：數值型、被動型（無冷卻概率觸發）、技能型（帶冷卻必定觸發）
export type GemCategory = 'stat' | 'passive' | 'skill';

export interface GemStatBonus {
  atk?: number;
  def?: number;
  maxHp?: number;
  critRate?: number; // e.g. 0.08 = +8%
  critDamage?: number; // e.g. 0.3 = +30%
  atkSpeed?: number; // e.g. 0.2 = +0.2 attack/s
  lifesteal?: number; // e.g. 0.05 = +5%
  damageReduction?: number; // e.g. 0.06 = +6%
  regenPerSec?: number; // e.g. 15 = 15 hp/s
}

export interface GemSpecialEffect {
  name: string;
  description: string;
  category: GemCategory;
  // 被動型：無冷卻，概率觸發
  procChance?: number;
  triggerEvent?: 'on_attack' | 'on_hit_taken';
  // 技能型：帶有冷卻 (秒)，冷卻完成必定觸發 (100%)
  cooldown?: number;
  value: number;
}

export interface Gem {
  id: string;
  name: string;
  category: GemCategory;
  tier: number; // 1 to 3
  colorHex: string;
  bgGlow: string;
  borderColor: string;
  icon: string;
  statBonus: GemStatBonus;
  specialEffect: GemSpecialEffect;
  description: string;
}

export interface EquipmentStats {
  atk: number;
  def: number;
  maxHp: number;
  atkSpeed: number; // attacks per second
  critRate: number; // 0 to 1
  lifesteal: number; // 0 to 1
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  rarity: ItemRarity;
  iconName: string;
  baseStats: EquipmentStats;
  sockets: (Gem | null)[];
  maxSockets: number;
  description: string;
  levelReq?: number;
}

export interface ActiveSkillState {
  gemId: string;
  name: string;
  icon: string;
  colorHex: string;
  cooldown: number; // total cooldown in seconds
  remainingCd: number; // current remaining cooldown
  effectValue: number;
  effectType: 'flame_burst' | 'thunder_strike' | 'time_warp' | 'holy_judgment' | 'arcane_nova';
}

export interface HeroCalculatedStats {
  atk: number;
  def: number;
  maxHp: number;
  atkSpeed: number;
  critRate: number;
  critDamage: number;
  lifesteal: number;
  damageReduction: number;
  regenPerSec: number;

  // 被動型特技：無冷卻，概率觸發
  passiveDoubleStrikeChance: number;
  passiveVenomChance: number;
  passiveGroundSlamChance: number;
  passiveThornsChance: number;
  passiveThornsPercent: number;
  passiveFrostChance: number;
  passiveLeechChance: number;

  // 技能型特技：帶有冷卻，冷卻完畢必定觸發
  activeSkills: ActiveSkillState[];
}

export interface StatusEffect {
  id: string;
  type: 'burn' | 'poison' | 'freeze' | 'shield';
  duration: number; // in seconds
  value: number; // damage per second or slow multiplier
  stacks?: number;
}

export interface Monster {
  id: string;
  name: string;
  title?: string;
  avatar: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  atkSpeed: number;
  isBoss?: boolean;
  bossTier?: 'mid' | 'final'; // 每個關卡含 2 個首領：第 6 位(mid) 與 第 12 位(final)
  statusEffects: StatusEffect[];
  goldReward: number;
  expReward: number;
  dropLoot?: {
    equipmentChance: number;
    gemChance: number;
  };
}

// 關卡配置結構：一共 12 關卡，每關卡 12 敵人（含 2 首領）
export interface StageConfig {
  stageNumber: number; // 1 to 12
  name: string;
  subTitle: string;
  description: string;
  recommendedAtk: number;
  unlocked: boolean;
  cleared: boolean;
  minionHpRange: { min: number; max: number };
  bossHpRange: { mid: number; final: number };
  enemies: Monster[]; // 長度固定為 12 隻，index 5 (第6隻) 為中場首領，index 11 (第12隻) 為關底首領
}

export interface BattleLogEntry {
  id: string;
  time: string;
  text: string;
  type: 'hero' | 'monster' | 'crit' | 'gem_effect' | 'heal' | 'defeat' | 'loot' | 'system';
}

export interface FloatingNumber {
  id: string;
  text: string;
  type: 'damage' | 'crit' | 'heal' | 'burn' | 'poison' | 'lightning' | 'block';
  x: number;
  y: number;
}

// 關卡結算與傷害來源統計結構
export type DamageSourceCategory = 'basic' | 'skill' | 'passive' | 'dot' | 'reflect';

export interface DamageSourceBreakdown {
  id: string;
  name: string;
  category: DamageSourceCategory;
  categoryLabel: string;
  icon: string;
  colorHex: string;
  barColor: string; // Tailwind class
  totalDamage: number;
  hitCount: number;
  maxHit: number;
  percentage: number; // 0 - 100
}

export interface StageSettlementData {
  stageNumber: number; // 1 to 12
  stageName: string;
  stageSubTitle?: string;
  bossName: string;
  totalWaves: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  battleDurationSeconds: number;
  dps: number;
  critCount: number;
  totalAttacks: number;
  damageSources: DamageSourceBreakdown[];
  rewards: {
    gold: number;
    exp: number;
    gem?: Gem;
    equipment?: Equipment;
  };
}
