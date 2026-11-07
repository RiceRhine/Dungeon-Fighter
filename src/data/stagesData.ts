import { StageConfig, Monster } from '../types/game';

interface StageTemplate {
  number: number;
  name: string;
  subTitle: string;
  description: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  minionAvatars: string[];
  midBoss: { name: string; avatar: string; title: string };
  finalBoss: { name: string; avatar: string; title: string };
}

const STAGE_TEMPLATES: StageTemplate[] = [
  {
    number: 1,
    name: '哥布林幽暗森林',
    subTitle: '綠皮部落的狂暴領地',
    description: '盤踞著大量兇悍哥布林斥候與弓手，深處隱匿著酋長與百夫長。',
    baseHp: 160,
    baseAtk: 12,
    baseDef: 3,
    minionAvatars: ['👺', '🗡️', '🏹', '🐾', '🪓'],
    midBoss: { name: '哥布林重裝百夫長', avatar: '👺', title: '森林前哨首領' },
    finalBoss: { name: '哥布林暴君大酋長', avatar: '👹', title: '第一關最終首領' },
  },
  {
    number: 2,
    name: '遺忘骷髏古墓窟',
    subTitle: '亡者復生的冰冷墓室',
    description: '沉睡千年的古代守衛被黑暗喚醒，骨刃閃爍著冰冷死光。',
    baseHp: 260,
    baseAtk: 18,
    baseDef: 6,
    minionAvatars: ['💀', '🦴', '⚔️', '🛡️', '🕯️'],
    midBoss: { name: '骸骨巨刃行刑官', avatar: '💀', title: '墓室中場首領' },
    finalBoss: { name: '不朽死靈巫妖王', avatar: '☠️', title: '第二關最終首領' },
  },
  {
    number: 3,
    name: '腐蝕劇毒洞窟',
    subTitle: '酸液噴濺的蛛卵巢穴',
    description: '空氣中瀰漫著濃烈的腐蝕毒素，步步驚心。',
    baseHp: 400,
    baseAtk: 26,
    baseDef: 10,
    minionAvatars: ['🕷️', '🕸️', '🦂', '🧪', '🐛'],
    midBoss: { name: '劇毒刺針母體', avatar: '🕷️', title: '酸液前哨首領' },
    finalBoss: { name: '萬毒腐蝕巨蛛后', avatar: '🦂', title: '第三關最終首領' },
  },
  {
    number: 4,
    name: '遠古符文泰坦殿',
    subTitle: '巨石傀儡的試煉之間',
    description: '由遠古符文能量驅動的巨石生命體，擁有堅不可摧的磐石防禦。',
    baseHp: 580,
    baseAtk: 36,
    baseDef: 16,
    minionAvatars: ['🗿', '🧱', '🔨', '⚙️', '🪨'],
    midBoss: { name: '符文石像先鋒', avatar: '🗿', title: '泰坦中場首領' },
    finalBoss: { name: '泰坦鋼鐵尊者', avatar: '🏛️', title: '第四關最終首領' },
  },
  {
    number: 5,
    name: '地獄熔岩大裂隙',
    subTitle: '奔騰沸騰的岩漿炎域',
    description: '赤紅地熱不斷噴發，炎魔將領率領熔岩爪牙誓死守衛核心。',
    baseHp: 800,
    baseAtk: 46,
    baseDef: 20,
    minionAvatars: ['🔥', '☄️', '🌋', '💥', '🧨'],
    midBoss: { name: '烈火爆炎魔將', avatar: '🔥', title: '熔爐中場首領' },
    finalBoss: { name: '深淵熔岩炎魔君王', avatar: '🌋', title: '第五關最終首領' },
  },
  {
    number: 6,
    name: '永凍霜峰雪原',
    subTitle: '千里冰封的極寒領地',
    description: '寒風呼嘯，敵人附帶刺骨冰霜遲緩，對進攻節奏是一大考驗。',
    baseHp: 1100,
    baseAtk: 58,
    baseDef: 24,
    minionAvatars: ['❄️', '🧊', '🌨️', '⛄', '🐺'],
    midBoss: { name: '極寒雪原巨怪', avatar: '❄️', title: '霜峰中場首領' },
    finalBoss: { name: '冰霜巨龍領主', avatar: '🧊', title: '第六關最終首領' },
  },
  {
    number: 7,
    name: '暗影幽暗虛空裂縫',
    subTitle: '無光深淵的暗影巢穴',
    description: '虛空中穿梭著不可捉摸的暗影刺客，伺機給予致命偷襲。',
    baseHp: 1500,
    baseAtk: 72,
    baseDef: 28,
    minionAvatars: ['🌑', '👥', '🗡️', '🦇', '🌘'],
    midBoss: { name: '影匿暗殺魔使', avatar: '👥', title: '虛空中場首領' },
    finalBoss: { name: '虛空吞噬領主', avatar: '🌑', title: '第七關最終首領' },
  },
  {
    number: 8,
    name: '雷霆怒濤風暴頂',
    subTitle: '萬道狂雷轟擊的絕巔',
    description: '暴烈的閃電在空氣中跳躍，每次交鋒皆伴隨震耳欲聾的雷暴。',
    baseHp: 2000,
    baseAtk: 88,
    baseDef: 32,
    minionAvatars: ['⚡', '🌩️', '🌪️', '🦅', '⛈️'],
    midBoss: { name: '狂雷風暴神將', avatar: '⚡', title: '風暴中場首領' },
    finalBoss: { name: '狂暴雷神巨像', avatar: '🌩️', title: '第八關最終首領' },
  },
  {
    number: 9,
    name: '亡靈骨海大深淵',
    subTitle: '冥河交匯的百戰死地',
    description: '萬千枯骨堆疊成山，墮落騎士守護著冥界審判者的王位。',
    baseHp: 2600,
    baseAtk: 104,
    baseDef: 36,
    minionAvatars: ['🤺', '👑', '💀', '🛡️', '🕯️'],
    midBoss: { name: '墮落深淵大騎士', avatar: '🤺', title: '骨海中場首領' },
    finalBoss: { name: '冥界審判死神', avatar: '👑', title: '第九關最終首領' },
  },
  {
    number: 10,
    name: '混沌星界神殿',
    subTitle: '奧術星辰的光輝聖所',
    description: '古代高等精靈留下的魔法神殿，充斥著純粹的奧術星辰之力。',
    baseHp: 3300,
    baseAtk: 122,
    baseDef: 40,
    minionAvatars: ['🔮', '✨', '🪐', '💫', '🌟'],
    midBoss: { name: '奧術星辰樞機', avatar: '🔮', title: '星界中場首領' },
    finalBoss: { name: '混沌支配天神', avatar: '✨', title: '第十關最終首領' },
  },
  {
    number: 11,
    name: '黑曜石煉獄龍巢',
    subTitle: '群龍盤旋的焦土之地',
    description: '滾燙黑曜石築成的龍巢，幼龍與成龍盤踞在此。',
    baseHp: 4100,
    baseAtk: 140,
    baseDef: 45,
    minionAvatars: ['🦎', '🐲', '🐉', '🔥', '🌋'],
    midBoss: { name: '赤紅熔火雛龍', avatar: '🦎', title: '龍巢中場首領' },
    finalBoss: { name: '黑曜石煉獄巨龍', avatar: '🐉', title: '第十一關最終首領' },
  },
  {
    number: 12,
    name: '奧茲迪恩滅世龍之王座',
    subTitle: '終焉決戰！傳說魔龍降臨',
    description: '整座地下城的終極核心，沉睡的滅世龍皇奧茲迪恩親自坐鎮！',
    baseHp: 5000,
    baseAtk: 160,
    baseDef: 50,
    minionAvatars: ['🐉', '🐲', '🦖', '👑', '💥'],
    midBoss: { name: '龍皇近衛天災巨獸', avatar: '🦖', title: '決戰前夕首領' },
    finalBoss: { name: '終極奧茲迪恩滅世龍皇', avatar: '🐲', title: '全遊戲終極首領' },
  },
];

// Helper to generate the exact 12 stages with 12 enemies each and 2 bosses
export function generateAllStages(): StageConfig[] {
  return STAGE_TEMPLATES.map((tmpl) => {
    const enemies: Monster[] = [];
    let minMinionHp = 999999;
    let maxMinionHp = 0;
    let midBossHp = 0;
    let finalBossHp = 0;

    for (let wave = 1; wave <= 12; wave++) {
      const isMidBoss = wave === 6; // 第 6 個敵人為中場首領
      const isFinalBoss = wave === 12; // 第 12 個敵人為關卡最終首領

      // Wave scaling multiplier
      const waveMult = 1 + (wave - 1) * 0.08;

      if (isMidBoss) {
        // 首領 1 (中場首領): ~2.3x 血量
        midBossHp = Math.round(tmpl.baseHp * waveMult * 2.3);
        enemies.push({
          id: `s${tmpl.number}_w${wave}_midboss`,
          name: `【首領】${tmpl.midBoss.name}`,
          title: `第 ${tmpl.number} 關 (${wave}/12) · ${tmpl.midBoss.title}`,
          avatar: tmpl.midBoss.avatar,
          hp: midBossHp,
          maxHp: midBossHp,
          atk: Math.round(tmpl.baseAtk * waveMult * 1.25),
          def: Math.round(tmpl.baseDef * 1.2),
          atkSpeed: 0.95,
          isBoss: true,
          bossTier: 'mid',
          statusEffects: [],
          goldReward: tmpl.number * 40 + 60,
          expReward: tmpl.number * 30 + 50,
          dropLoot: { equipmentChance: 0.85, gemChance: 0.9 },
        });
      } else if (isFinalBoss) {
        // 首領 2 (最終關底首領): ~3.4x 血量
        finalBossHp = Math.round(tmpl.baseHp * waveMult * 3.4);
        enemies.push({
          id: `s${tmpl.number}_w${wave}_finalboss`,
          name: `【大首領】${tmpl.finalBoss.name}`,
          title: `第 ${tmpl.number} 關 (${wave}/12) · ${tmpl.finalBoss.title}`,
          avatar: tmpl.finalBoss.avatar,
          hp: finalBossHp,
          maxHp: finalBossHp,
          atk: Math.round(tmpl.baseAtk * waveMult * 1.45),
          def: Math.round(tmpl.baseDef * 1.35),
          atkSpeed: 1.05,
          isBoss: true,
          bossTier: 'final',
          statusEffects: [],
          goldReward: tmpl.number * 70 + 120,
          expReward: tmpl.number * 50 + 100,
          dropLoot: { equipmentChance: 1.0, gemChance: 1.0 },
        });
      } else {
        // 普通小兵 (1~5, 7~11)
        const avatar = tmpl.minionAvatars[(wave - 1) % tmpl.minionAvatars.length];
        const normalHp = Math.round(tmpl.baseHp * waveMult);
        if (normalHp < minMinionHp) minMinionHp = normalHp;
        if (normalHp > maxMinionHp) maxMinionHp = normalHp;

        enemies.push({
          id: `s${tmpl.number}_w${wave}`,
          name: `${tmpl.name} 爪牙 (第${wave}波)`,
          title: `第 ${tmpl.number} 關 (${wave}/12)`,
          avatar,
          hp: normalHp,
          maxHp: normalHp,
          atk: Math.round(tmpl.baseAtk * waveMult),
          def: Math.round(tmpl.baseDef),
          atkSpeed: 0.85 + ((wave % 3) * 0.08),
          statusEffects: [],
          goldReward: tmpl.number * 15 + wave * 4,
          expReward: tmpl.number * 10 + wave * 3,
          dropLoot: { equipmentChance: 0.25, gemChance: 0.35 },
        });
      }
    }

    return {
      stageNumber: tmpl.number,
      name: tmpl.name,
      subTitle: tmpl.subTitle,
      description: tmpl.description,
      recommendedAtk: Math.round(tmpl.baseAtk * 1.25),
      unlocked: tmpl.number === 1,
      cleared: false,
      minionHpRange: { min: minMinionHp, max: maxMinionHp },
      bossHpRange: { mid: midBossHp, final: finalBossHp },
      enemies,
    };
  });
}
