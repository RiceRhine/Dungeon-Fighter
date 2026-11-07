import React, { useState, useEffect, useRef } from 'react';
import { HeroCalculatedStats, Monster, BattleLogEntry, FloatingNumber, Equipment, Gem, StageConfig } from '../types/game';
import { PRESET_GEMS, INITIAL_EQUIPMENTS } from '../data/initialData';
import { Play, Pause, FastForward, RotateCcw, ChevronRight, Trophy, Skull, Zap, Flame, Map, Sparkles } from 'lucide-react';
import { sounds } from '../services/sound';

interface BattleArenaProps {
  heroStats: HeroCalculatedStats;
  currentHp: number;
  setCurrentHp: React.Dispatch<React.SetStateAction<number>>;
  stages: StageConfig[];
  currentStageIndex: number;
  currentWaveIndex: number;
  onWaveAdvance: (nextWaveIndex: number) => void;
  onStageClear: (clearedStageIndex: number) => void;
  onOpenStageSelect: () => void;
  onRewardReceived: (loot: { equipment?: Equipment; gem?: Gem; gold: number; exp: number }) => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  heroStats,
  currentHp,
  setCurrentHp,
  stages,
  currentStageIndex,
  currentWaveIndex,
  onWaveAdvance,
  onStageClear,
  onOpenStageSelect,
  onRewardReceived,
}) => {
  const currentStage = stages[currentStageIndex] || stages[0];
  const [monster, setMonster] = useState<Monster>(() => {
    const initMonster = currentStage.enemies[currentWaveIndex] || currentStage.enemies[0];
    return { ...initMonster, hp: initMonster.maxHp, statusEffects: [] };
  });

  const [isFighting, setIsFighting] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2>(1);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Turn meters (0 to 100)
  const [heroMeter, setHeroMeter] = useState(0);
  const [monsterMeter, setMonsterMeter] = useState(0);

  // 技能型冷卻狀態 (gemId -> remaining CD in seconds)
  const [skillCdMap, setSkillCdMap] = useState<Record<string, number>>({});

  // Animation states
  const [heroAttacking, setHeroAttacking] = useState(false);
  const [monsterAttacking, setMonsterAttacking] = useState(false);
  const [monsterHurt, setMonsterHurt] = useState(false);
  const [heroHurt, setHeroHurt] = useState(false);

  // Floating text
  const [floatingTexts, setFloatingTexts] = useState<FloatingNumber[]>([]);
  // Combat log
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([
    {
      id: 'init_log',
      time: '00:00',
      text: '⚔️ 踏入地下城！全12關卡，每關12名敵人（含2名首領）。',
      type: 'system',
    },
  ]);

  // Modals
  const [victoryModalOpen, setVictoryModalOpen] = useState(false);
  const [defeatModalOpen, setDefeatModalOpen] = useState(false);
  const [lastDrops, setLastDrops] = useState<{ equipment?: Equipment; gem?: Gem; gold: number; exp: number } | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sync current monster when stage or wave changes
  useEffect(() => {
    const stage = stages[currentStageIndex];
    if (stage) {
      const mon = stage.enemies[currentWaveIndex] || stage.enemies[0];
      setMonster({ ...mon, hp: mon.maxHp, statusEffects: [] });
      setHeroMeter(0);
      setMonsterMeter(0);

      const isMid = currentWaveIndex === 5;
      const isFinal = currentWaveIndex === 11;
      const prefix = isFinal ? '🔥【關底大首領】' : isMid ? '👹【中場首領】' : '👉';
      addLog(`${prefix} 第 ${currentStageIndex + 1} 關 (${currentWaveIndex + 1}/12): ${mon.name} 出現！`, 'system');
    }
  }, [currentStageIndex, currentWaveIndex, stages]);

  // Keep logs scrolled to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  const addLog = (text: string, type: BattleLogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setBattleLogs((prev) => [
      ...prev.slice(-25),
      { id: Math.random().toString(), time: timeStr, text, type },
    ]);
  };

  const addFloatingText = (text: string, type: FloatingNumber['type'], target: 'hero' | 'monster') => {
    const id = Math.random().toString();
    const x = target === 'hero' ? 25 + Math.random() * 15 : 65 + Math.random() * 15;
    const y = 30 + Math.random() * 20;

    setFloatingTexts((prev) => [...prev, { id, text, type, x, y }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1000);
  };

  // Main Battle Loop
  useEffect(() => {
    if (!isFighting || victoryModalOpen || defeatModalOpen) return;

    const intervalTime = 60; // 60ms tick
    const timer = setInterval(() => {
      const deltaSec = (intervalTime / 1000) * battleSpeed;

      // 1. 更新技能型寶珠冷卻計時器
      setSkillCdMap((prev) => {
        const next: Record<string, number> = { ...prev };
        for (const skill of heroStats.activeSkills) {
          const current = next[skill.gemId] !== undefined ? next[skill.gemId] : 0;
          next[skill.gemId] = Math.max(0, current - deltaSec);
        }
        return next;
      });

      // 2. 處理怪物身上的中毒與灼燒 DoT
      setMonster((prevMon) => {
        if (!prevMon || prevMon.hp <= 0) return prevMon;

        let dotDmg = 0;
        let updatedEffects = prevMon.statusEffects
          .map((eff) => ({ ...eff, duration: eff.duration - deltaSec }))
          .filter((eff) => eff.duration > 0);

        // Burn DoT
        const burnEffect = prevMon.statusEffects.find((e) => e.type === 'burn');
        if (burnEffect && Math.random() < 0.25) {
          const burnTick = Math.max(3, Math.round(burnEffect.value * 0.35));
          dotDmg += burnTick;
          addFloatingText(`-${burnTick} 灼燒`, 'burn', 'monster');
        }

        // Poison DoT
        const poisonEffect = prevMon.statusEffects.find((e) => e.type === 'poison');
        if (poisonEffect && Math.random() < 0.25) {
          const poisonTick = Math.max(3, Math.round(poisonEffect.value * 0.4));
          dotDmg += poisonTick;
          addFloatingText(`-${poisonTick} 劇毒`, 'poison', 'monster');
        }

        const newHp = Math.max(0, prevMon.hp - dotDmg);
        return {
          ...prevMon,
          hp: newHp,
          statusEffects: updatedEffects,
        };
      });

      // 3. 英雄攻擊進度累積
      setHeroMeter((prev) => {
        const next = prev + heroStats.atkSpeed * 100 * deltaSec;
        if (next >= 100) {
          triggerHeroAttack();
          return 0;
        }
        return next;
      });

      // 4. 怪物攻擊進度累積
      setMonsterMeter((prev) => {
        const isFrozen = monster.statusEffects.some((e) => e.type === 'freeze');
        const effectiveSpeed = isFrozen ? monster.atkSpeed * 0.7 : monster.atkSpeed;
        const next = prev + effectiveSpeed * 100 * deltaSec;
        if (next >= 100) {
          triggerMonsterAttack();
          return 0;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isFighting, heroStats, currentHp, monster, battleSpeed, victoryModalOpen, defeatModalOpen]);

  // Check victory / defeat conditions
  useEffect(() => {
    if (monster.hp <= 0 && isFighting && !victoryModalOpen) {
      handleWaveVictory();
    }
  }, [monster.hp, isFighting]);

  useEffect(() => {
    if (currentHp <= 0 && isFighting && !defeatModalOpen) {
      handleDefeat();
    }
  }, [currentHp, isFighting]);

  // Hero Attack Action
  const triggerHeroAttack = () => {
    setHeroAttacking(true);
    setTimeout(() => setHeroAttacking(false), 200);

    setMonsterHurt(true);
    setTimeout(() => setMonsterHurt(false), 200);

    const baseDmg = Math.max(5, heroStats.atk - monster.def * 0.4);
    const isCrit = Math.random() < heroStats.critRate;
    let finalDmg = Math.round(baseDmg * (isCrit ? heroStats.critDamage : 1));

    if (isCrit) {
      sounds.playCrit();
      addFloatingText(`暴擊! -${finalDmg}`, 'crit', 'monster');
      addLog(`💥 暴擊！英雄對 ${monster.name} 造成 ${finalDmg} 傷害！`, 'crit');
    } else {
      sounds.playHeroHit();
      addFloatingText(`-${finalDmg}`, 'damage', 'monster');
      addLog(`🗡️ 英雄揮擊造成 ${finalDmg} 點傷害。`, 'hero');
    }

    // 技能型寶珠 —— 帶有冷卻，必定觸發
    for (const skill of heroStats.activeSkills) {
      const remaining = skillCdMap[skill.gemId] || 0;
      if (remaining <= 0) {
        if (skill.effectType === 'flame_burst') {
          sounds.playBurn();
          finalDmg += skill.effectValue;
          setMonster((prev) => ({
            ...prev,
            statusEffects: [
              ...prev.statusEffects.filter((e) => e.type !== 'burn'),
              { id: Math.random().toString(), type: 'burn', duration: 4, value: skill.effectValue * 0.3 },
            ],
          }));
          addFloatingText(`🔥烈焰天劫!`, 'burn', 'monster');
          addLog(`🔥【烈焰天劫】冷卻完畢必定觸發！造成爆轟火傷並附加灼燒！`, 'gem_effect');
        } else if (skill.effectType === 'thunder_strike') {
          sounds.playLightning();
          const zapDmg = Math.round(heroStats.atk * skill.effectValue);
          finalDmg += zapDmg;
          addFloatingText(`⚡神雷 +${zapDmg}`, 'lightning', 'monster');
          addLog(`⚡【毀滅神雷】冷卻完畢必定觸發！轟落九天玄雷重創目標！`, 'gem_effect');
        } else if (skill.effectType === 'time_warp') {
          setMonsterMeter(0);
          addFloatingText(`⏳時空凍結!`, 'block', 'monster');
          addLog(`⏳【時空裂隙】冷卻完畢必定觸發！強行截斷清空敵方蓄力條！`, 'gem_effect');
        } else if (skill.effectType === 'holy_judgment') {
          finalDmg += skill.effectValue;
          setCurrentHp((prev) => Math.min(heroStats.maxHp, prev + 200));
          addFloatingText(`✨神裁 -${skill.effectValue}`, 'heal', 'monster');
          addFloatingText(`+200 自癒`, 'heal', 'hero');
          addLog(`✨【神聖制裁】冷卻完畢必定觸發！造成真實穿透傷並自癒 200 HP！`, 'gem_effect');
        } else if (skill.effectType === 'arcane_nova') {
          finalDmg += skill.effectValue;
          addFloatingText(`🔮星爆 +${skill.effectValue}`, 'crit', 'monster');
          addLog(`🔮【奧術星爆】冷卻完畢必定觸發！星光貫穿目標防禦造成 ${skill.effectValue} 穿透傷！`, 'gem_effect');
        }

        setSkillCdMap((prev) => ({ ...prev, [skill.gemId]: skill.cooldown }));
      }
    }

    // 被動型寶珠 —— 無冷卻、概率觸發
    if (heroStats.passiveDoubleStrikeChance > 0 && Math.random() < heroStats.passiveDoubleStrikeChance) {
      const extraHit = Math.round(finalDmg * 0.8);
      finalDmg += extraHit;
      addFloatingText(`⚔️連擊 +${extraHit}`, 'damage', 'monster');
      addLog(`⚔️【狂怒連擊】無冷卻概率觸發！追擊造成額外 ${extraHit} 傷害！`, 'gem_effect');
    }

    if (heroStats.passiveVenomChance > 0 && Math.random() < heroStats.passiveVenomChance) {
      setMonster((prev) => ({
        ...prev,
        statusEffects: [
          ...prev.statusEffects.filter((e) => e.type !== 'poison'),
          { id: Math.random().toString(), type: 'poison', duration: 4, value: 30 },
        ],
      }));
      addFloatingText(`☠️劇毒滲透`, 'poison', 'monster');
    }

    if (heroStats.passiveGroundSlamChance > 0 && Math.random() < heroStats.passiveGroundSlamChance) {
      finalDmg += 120;
      addFloatingText(`💥震盪 +120`, 'crit', 'monster');
    }

    if (heroStats.passiveLeechChance > 0 && Math.random() < heroStats.passiveLeechChance) {
      const soulHeal = Math.round(finalDmg * 0.5);
      if (soulHeal > 0) {
        setCurrentHp((prev) => Math.min(heroStats.maxHp, prev + soulHeal));
        addFloatingText(`+${soulHeal} 掠奪`, 'heal', 'hero');
      }
    }

    if (heroStats.lifesteal > 0) {
      const baseHeal = Math.round(finalDmg * heroStats.lifesteal);
      if (baseHeal > 0) {
        setCurrentHp((prev) => Math.min(heroStats.maxHp, prev + baseHeal));
        addFloatingText(`+${baseHeal}`, 'heal', 'hero');
      }
    }

    setMonster((prev) => ({
      ...prev,
      hp: Math.max(0, prev.hp - finalDmg),
    }));
  };

  // Monster Attack Action
  const triggerMonsterAttack = () => {
    setMonsterAttacking(true);
    setTimeout(() => setMonsterAttacking(false), 200);

    setHeroHurt(true);
    setTimeout(() => setHeroHurt(false), 200);

    const baseMonsterDmg = Math.max(2, monster.atk - heroStats.def * 0.45);
    let reducedDmg = Math.max(1, Math.round(baseMonsterDmg * (1 - heroStats.damageReduction)));

    // 被動型：寒冰護體 (無冷卻，35% 概率觸發)
    if (heroStats.passiveFrostChance > 0 && Math.random() < heroStats.passiveFrostChance) {
      reducedDmg = Math.max(1, Math.round(reducedDmg * 0.6));
      setMonster((prev) => ({
        ...prev,
        statusEffects: [
          ...prev.statusEffects.filter((e) => e.type !== 'freeze'),
          { id: Math.random().toString(), type: 'freeze', duration: 2.5, value: 0.3 },
        ],
      }));
      addFloatingText(`❄️霜甲吸收`, 'block', 'hero');
      addLog(`❄️【寒冰護體】無冷卻概率觸發！減免 40% 傷害並減速對手 30%！`, 'gem_effect');
    }

    sounds.playMonsterHit();
    addFloatingText(`-${reducedDmg}`, 'damage', 'hero');
    addLog(`👹 ${monster.name} 反擊造成 ${reducedDmg} 傷害！`, 'monster');

    // 被動型：聖光荊棘 (無冷卻，50% 概率觸發)
    if (heroStats.passiveThornsChance > 0 && Math.random() < heroStats.passiveThornsChance) {
      const reflected = Math.round(reducedDmg * heroStats.passiveThornsPercent);
      if (reflected > 0) {
        setMonster((prev) => ({ ...prev, hp: Math.max(0, prev.hp - reflected) }));
        addFloatingText(`反噬 -${reflected}`, 'lightning', 'monster');
        addLog(`🛡️【聖光荊棘】無冷卻概率觸發！反彈 ${reflected} 點反噬傷害！`, 'gem_effect');
      }
    }

    setCurrentHp((prev) => Math.max(0, prev - reducedDmg));
  };

  // 擊敗單波敵人或通關結算
  const handleWaveVictory = () => {
    const isStageFinalBoss = currentWaveIndex === 11;
    const isMidBoss = currentWaveIndex === 5;

    sounds.playVictory();

    // 掉落獎勵計算
    const randomGem = PRESET_GEMS[Math.floor(Math.random() * PRESET_GEMS.length)];
    const randomEq = INITIAL_EQUIPMENTS[Math.floor(Math.random() * INITIAL_EQUIPMENTS.length)];

    const rewardEquipment: Equipment = {
      ...randomEq,
      id: `eq_drop_${Date.now()}`,
      name: `★ 強化${randomEq.name}`,
      sockets: new Array(randomEq.maxSockets).fill(null),
    };

    const rewardGem: Gem = {
      ...randomGem,
      id: `gem_drop_${Date.now()}`,
    };

    const drops = {
      equipment: (isMidBoss || isStageFinalBoss || Math.random() < 0.4) ? rewardEquipment : undefined,
      gem: (isMidBoss || isStageFinalBoss || Math.random() < 0.5) ? rewardGem : undefined,
      gold: monster.goldReward,
      exp: monster.expReward,
    };

    setLastDrops(drops);
    onRewardReceived(drops);

    if (isStageFinalBoss) {
      // 通關第 12 波大首領！
      setIsFighting(false);
      onStageClear(currentStageIndex);
      addLog(`🏆【關卡大勝】擊破 ${monster.name}！第 ${currentStageIndex + 1} 關全部通關！下一關卡已成功解鎖！`, 'defeat');
      setVictoryModalOpen(true);
    } else {
      // 推進下一波敵人 (Wave 1~11)
      addLog(`✨ 擊敗第 ${currentWaveIndex + 1} 波敵人！準備迎戰下一波！`, 'defeat');
      // 波次勝利恢復生命：中場首領 50%，普通波次 30%，確保平均隨機輪次足以通關
      const healPercent = isMidBoss ? 0.5 : 0.3;
      setCurrentHp((prev) => Math.min(heroStats.maxHp, prev + heroStats.maxHp * healPercent));

      onWaveAdvance(currentWaveIndex + 1);
    }
  };

  const handleDefeat = () => {
    setIsFighting(false);
    sounds.playDefeat();
    addLog(`💀 英雄倒下了... 可隨時點選【選關畫面】或【變更裝備】強化後再戰！`, 'defeat');
    setDefeatModalOpen(true);
  };

  const handleProceedNextStage = () => {
    setVictoryModalOpen(false);
    if (currentStageIndex < stages.length - 1) {
      onWaveAdvance(0);
      setCurrentHp(heroStats.maxHp);
      if (autoAdvance) {
        setTimeout(() => setIsFighting(true), 350);
      }
    }
  };

  const handleReviveAndRetry = () => {
    setDefeatModalOpen(false);
    setCurrentHp(heroStats.maxHp);
    const stage = stages[currentStageIndex];
    if (stage) {
      const mon = stage.enemies[currentWaveIndex] || stage.enemies[0];
      setMonster({ ...mon, hp: mon.maxHp, statusEffects: [] });
    }
    setHeroMeter(0);
    setMonsterMeter(0);
  };

  const isMidBossWave = currentWaveIndex === 5;
  const isFinalBossWave = currentWaveIndex === 11;

  return (
    <div className="flex flex-col bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Banner & Compact Controls */}
      <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onOpenStageSelect}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 border border-slate-700 transition-colors shrink-0"
            title="開啟12關卡地圖進度選關"
          >
            <Map className="w-3.5 h-3.5 text-amber-400" />
            <span>地圖</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-200 truncate">
              第 {currentStageIndex + 1} 關 · 波次 {currentWaveIndex + 1}/12
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-amber-300 font-semibold truncate">{monster.name}</span>
          </div>

          {isFinalBossWave ? (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-950 text-red-400 border border-red-800 shrink-0 animate-pulse">
              關底大首領
            </span>
          ) : isMidBossWave ? (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-orange-950 text-orange-400 border border-orange-800 shrink-0">
              中場首領
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setBattleSpeed((prev) => (prev === 1 ? 2 : 1))}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700 transition-colors"
          >
            <FastForward className="w-3 h-3 text-amber-400" />
            <span>{battleSpeed}x</span>
          </button>

          <button
            onClick={() => setAutoAdvance((prev) => !prev)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
              autoAdvance
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            自動進關: {autoAdvance ? '開' : '關'}
          </button>

          {isFighting ? (
            <button
              onClick={() => setIsFighting(false)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-colors"
            >
              <Pause className="w-3 h-3" />
              <span>暫停</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentHp <= 0) setCurrentHp(heroStats.maxHp);
                setIsFighting(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
            >
              <Play className="w-3 h-3" />
              <span>自動戰鬥</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Visual Arena: Extended to 230px for spacious reading and animations */}
      <div className="relative w-full h-[230px] overflow-hidden select-none">
        <img
          src="/src/assets/images/game_dungeon_arena_1794023186202.jpg"
          alt="地下城戰鬥競技場"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/60" />

        {/* 技能型冷卻儀表列 (Skill Cooldown HUD Bar) */}
        {heroStats.activeSkills.length > 0 && (
          <div className="absolute top-2 inset-x-4 z-20 flex items-center justify-center gap-2 pointer-events-none">
            {heroStats.activeSkills.map((sk) => {
              const remaining = skillCdMap[sk.gemId] || 0;
              const isReady = remaining <= 0;
              const percent = Math.min(100, Math.max(0, ((sk.cooldown - remaining) / sk.cooldown) * 100));

              return (
                <div
                  key={sk.gemId}
                  className={`px-2.5 py-1 rounded-lg border backdrop-blur-md flex items-center gap-1.5 text-xs font-mono transition-all ${
                    isReady
                      ? 'bg-purple-950/90 border-purple-400 text-purple-200 shadow-[0_0_12px_#a855f7] scale-105'
                      : 'bg-slate-950/80 border-slate-700 text-slate-400'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isReady ? 'text-amber-300 animate-spin' : 'text-slate-500'}`} />
                  <span className="font-bold">{sk.name}</span>
                  {isReady ? (
                    <span className="text-amber-300 font-black animate-pulse">必定觸發!</span>
                  ) : (
                    <span>{remaining.toFixed(1)}s</span>
                  )}
                  {!isReady && (
                    <div className="w-10 h-1.5 rounded-full bg-slate-800 overflow-hidden ml-1">
                      <div className="h-full bg-purple-500 transition-all duration-75" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Numbers */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
            className={`absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 font-black font-mono transition-all animate-bounce drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${
              ft.type === 'crit'
                ? 'text-amber-300 text-lg font-extrabold scale-110'
                : ft.type === 'burn'
                ? 'text-red-400 text-xs'
                : ft.type === 'poison'
                ? 'text-emerald-400 text-xs'
                : ft.type === 'lightning'
                ? 'text-yellow-300 text-sm font-bold'
                : ft.type === 'heal'
                ? 'text-green-300 text-sm'
                : 'text-white text-sm'
            }`}
          >
            {ft.text}
          </div>
        ))}

        {/* Dual Combatants */}
        <div className="relative z-10 w-full h-full px-6 py-3 flex items-center justify-between">
          {/* Hero */}
          <div
            className={`flex flex-col items-center transition-transform duration-150 ${
              heroAttacking ? 'translate-x-4 scale-105' : ''
            } ${heroHurt ? '-translate-x-1 brightness-150' : ''}`}
          >
            <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-emerald-400/90 shadow-xl bg-slate-950">
              <img
                src="/src/assets/images/game_hero_knight_1794023187832.jpg"
                alt="英雄戰士"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center mt-1.5">
              <div className="w-24 h-2.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (currentHp / heroStats.maxHp) * 100))}%` }}
                />
              </div>
              <div className="w-24 h-1.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${heroMeter}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-300 font-mono font-semibold">
                {Math.round(currentHp)} / {heroStats.maxHp} HP
              </span>
            </div>
          </div>

          {/* VS Center */}
          <div className="text-center pointer-events-none px-2 py-1 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xl font-black text-amber-400 font-cinzel">VS</span>
            <div className="text-[10px] text-slate-300 font-mono">
              波次 {currentWaveIndex + 1}/12
            </div>
          </div>

          {/* Monster */}
          <div
            className={`flex flex-col items-center transition-transform duration-150 ${
              monsterAttacking ? '-translate-x-4 scale-105' : ''
            } ${monsterHurt ? 'translate-x-1 brightness-200' : ''}`}
          >
            <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-red-500/90 shadow-xl bg-slate-950 flex items-center justify-center">
              {isFinalBossWave && currentStageIndex === 11 ? (
                <img
                  src="/src/assets/images/game_boss_dragon_1794023187023.jpg"
                  alt="終極滅世龍皇"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl select-none">{monster.avatar}</span>
              )}
            </div>
            <div className="text-center mt-1.5">
              <div className="w-24 h-2.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, (monster.hp / monster.maxHp) * 100))}%` }}
                />
              </div>
              <div className="w-24 h-1.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden mt-0.5">
                <div
                  className="h-full rounded-full bg-red-400 transition-all duration-75"
                  style={{ width: `${monsterMeter}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-300 font-mono font-semibold">
                {Math.round(monster.hp)} / {monster.maxHp} HP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Log: Extended to 110px for comfortable reading space */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
          <span>📜 即時戰況記錄</span>
          <span className="text-[9px] text-slate-500 font-mono">自動滾動</span>
        </div>
        <div
          ref={logContainerRef}
          className="h-28 overflow-y-auto rounded-lg bg-slate-900/90 border border-slate-800 p-2 font-mono text-xs space-y-1"
        >
          {battleLogs.slice(-15).map((log) => (
            <div key={log.id} className="flex items-start gap-1.5 leading-snug text-slate-300">
              <span className="text-slate-500 text-[10px] shrink-0 font-medium">{log.time}</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Victory Modal for Stage Clear (12th enemy cleared) */}
      {victoryModalOpen && lastDrops && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border-2 border-amber-500 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-3">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-1 animate-bounce" />
              <h3 className="text-lg font-black text-amber-300 font-cinzel">
                第 {currentStageIndex + 1} 關 全通大勝利！
              </h3>
              <p className="text-xs text-slate-300">
                恭喜擊敗關底首領【{monster.name}】，通關本關全部 12 名敵人！
              </p>
            </div>

            <div className="space-y-2 mb-4 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>金幣與經驗：</span>
                <span className="text-amber-400 font-bold font-mono">+{lastDrops.gold} 金幣 / +{lastDrops.exp} EXP</span>
              </div>
              {lastDrops.gem && (
                <div className="p-2 rounded bg-slate-900 border border-slate-700 flex items-center justify-between">
                  <span className="font-bold text-white">{lastDrops.gem.name}</span>
                  <span className="text-[10px] text-amber-300 font-medium">已入寶石行囊</span>
                </div>
              )}
              {lastDrops.equipment && (
                <div className="p-2 rounded bg-slate-900 border border-slate-700 flex items-center justify-between">
                  <span className="font-bold text-white">{lastDrops.equipment.name}</span>
                  <span className="text-[10px] text-sky-300 font-medium">已入庫存背包</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setVictoryModalOpen(false);
                    onOpenStageSelect();
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>開啟選關畫面</span>
                </button>
                {currentStageIndex < stages.length - 1 ? (
                  <button
                    onClick={handleProceedNextStage}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>前進第 {currentStageIndex + 2} 關</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setVictoryModalOpen(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-400 text-slate-950"
                  >
                    已破通全部12關！
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Defeat Modal */}
      {defeatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border-2 border-red-600 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-3">
              <Skull className="w-10 h-10 text-red-500 mx-auto mb-1" />
              <h3 className="text-lg font-black text-red-400 font-cinzel">戰鬥失敗！</h3>
              <p className="text-xs text-slate-300 mt-1">
                於第 {currentStageIndex + 1} 關第 {currentWaveIndex + 1} 波倒下。可隨時【滿血再戰】或【返回選關】挑選其它已解鎖關卡！
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDefeatModalOpen(false);
                  onOpenStageSelect();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1"
              >
                <Map className="w-3.5 h-3.5 text-amber-400" />
                <span>返回選關畫面</span>
              </button>
              <button
                onClick={handleReviveAndRetry}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-1 shadow-md"
              >
                <RotateCcw className="w-4 h-4" />
                <span>滿血原地再戰</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
