import React, { useState } from 'react';
import { StageConfig } from '../types/game';
import { X, Trophy, Lock, CheckCircle2, ChevronRight, Skull, Swords, Flame, Sparkles, ShieldAlert, Heart } from 'lucide-react';
import { sounds } from '../services/sound';

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: StageConfig[];
  currentStageIndex: number;
  currentWaveIndex: number;
  unlockedStageMax: number;
  onSelectStage: (stageIndex: number) => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  onClose,
  stages,
  currentStageIndex,
  currentWaveIndex,
  unlockedStageMax,
  onSelectStage,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked'>('all');

  if (!isOpen) return null;

  const handlePickStage = (idx: number) => {
    // 嚴格規則：未解鎖關卡不可交互
    if (idx + 1 > unlockedStageMax) return;
    onSelectStage(idx);
    sounds.playEquip();
    onClose();
  };

  const displayedStages = stages.filter((stg, idx) => {
    if (filterMode === 'unlocked') {
      return idx + 1 <= unlockedStageMax;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="max-w-5xl w-full rounded-2xl bg-slate-900 border border-slate-700 p-4 sm:p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/50 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-cinzel">
                  地下城選關地圖 (Stage Selection)
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  全 12 關卡
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                規則：必須通關上一關卡才能解鎖下一關卡 · 未解鎖關卡呈現灰色不可點選 · 越後面關卡敵人血量顯著提升！
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="關閉選關畫面"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Sub-bar & Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 my-2 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 text-xs">
          <div className="flex items-center gap-3 font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500">當前進度：</span>
              <span className="text-amber-400 font-bold">第 {unlockedStageMax} / 12 關已解鎖</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-slate-500">挑戰中：</span>
              <span className="text-sky-400 font-bold">
                第 {currentStageIndex + 1} 關 (波次 {currentWaveIndex + 1}/12)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              全部關卡 (12)
            </button>
            <button
              onClick={() => setFilterMode('unlocked')}
              className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                filterMode === 'unlocked'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              已解鎖關卡 ({unlockedStageMax})
            </button>
          </div>
        </div>

        {/* 12-Stage Cards Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-1 min-h-0">
          {displayedStages.map((stg) => {
            const idx = stg.stageNumber - 1;
            const isUnlocked = idx + 1 <= unlockedStageMax;
            const isCurrent = idx === currentStageIndex;
            const isCleared = idx + 1 < unlockedStageMax;

            // HP display calculations
            const minHp = stg.minionHpRange?.min || stg.enemies[0]?.hp || 160;
            const maxHp = stg.minionHpRange?.max || stg.enemies[10]?.hp || 280;
            const midBossHp = stg.bossHpRange?.mid || stg.enemies[5]?.hp || 450;
            const finalBossHp = stg.bossHpRange?.final || stg.enemies[11]?.hp || 750;

            // Health bar fill percentage for visual scaling indication (from stage 1 to stage 12)
            const hpScalePercent = Math.min(100, Math.round((stg.stageNumber / 12) * 100));

            // 未解鎖呈現灰色且不可交互
            if (!isUnlocked) {
              return (
                <div
                  key={stg.stageNumber}
                  className="relative rounded-xl border border-slate-800/80 bg-slate-950/70 p-3.5 flex flex-col justify-between grayscale brightness-75 contrast-75 opacity-45 cursor-not-allowed select-none"
                >
                  <div>
                    {/* Header with Padlock */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                        <span>STAGE {stg.stageNumber}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-medium">
                        未解鎖
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-400 mb-0.5 truncate">
                      {stg.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 truncate mb-2.5">
                      {stg.subTitle}
                    </p>

                    {/* Lock Prompt */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-500 mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>需先通關第 {stg.stageNumber - 1} 關關底首領方可解鎖！</span>
                    </div>

                    {/* Subdued HP Preview */}
                    <div className="space-y-1 text-[10px] text-slate-600 font-mono">
                      <div className="flex items-center justify-between">
                        <span>預估敵兵生命：</span>
                        <span>{minHp} ~ {maxHp} HP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>預估首領生命：</span>
                        <span>中場 ~{midBossHp} / 關底 ~{finalBossHp} HP</span>
                      </div>
                    </div>
                  </div>

                  {/* Disabled Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                    <span>血量難度係數：+{hpScalePercent}%</span>
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      不可挑戰
                    </span>
                  </div>
                </div>
              );
            }

            // 已解鎖或挑戰中的關卡 (全彩、發光與支援交互)
            return (
              <div
                key={stg.stageNumber}
                onClick={() => handlePickStage(idx)}
                className={`group relative rounded-xl border p-3.5 flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                  isCurrent
                    ? 'border-amber-400 bg-gradient-to-b from-amber-950/40 to-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/80 hover:brightness-110'
                    : isCleared
                    ? 'border-emerald-800/80 bg-slate-950/90 hover:border-emerald-600 hover:bg-slate-900 shadow-sm'
                    : 'border-sky-800/80 bg-slate-950/90 hover:border-sky-500 hover:bg-slate-900 shadow-sm'
                }`}
              >
                <div>
                  {/* Top Bar of Stage Card */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black font-mono tracking-wider text-amber-400 flex items-center gap-1">
                      <span>STAGE {stg.stageNumber}</span>
                      {isCurrent && <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />}
                    </span>

                    <div>
                      {isCurrent ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                          <Swords className="w-3 h-3" />
                          <span>正在挑戰 (第{currentWaveIndex + 1}波)</span>
                        </span>
                      ) : isCleared ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>已通關 ★★★</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-700 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>新解鎖可挑戰</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stage Name & Subtitle */}
                  <h4 className="text-sm font-bold text-white mb-0.5 truncate group-hover:text-amber-300 transition-colors">
                    {stg.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mb-2.5">
                    {stg.subTitle}
                  </p>

                  {/* 敵人血量指標展示 (關卡越後面血量顯著增加) */}
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] space-y-1 mb-2 font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>敵兵血量：</span>
                      </span>
                      <span className="font-bold text-rose-300">
                        {minHp.toLocaleString()} ~ {maxHp.toLocaleString()} HP
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-orange-300">
                      <span className="flex items-center gap-1">
                        <Skull className="w-3 h-3 text-orange-400" />
                        <span>中場首領 (W6)：</span>
                      </span>
                      <span className="font-bold">
                        ~{midBossHp.toLocaleString()} HP
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-red-300">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" />
                        <span>關底大王 (W12)：</span>
                      </span>
                      <span className="font-black text-amber-300">
                        ~{finalBossHp.toLocaleString()} HP
                      </span>
                    </div>

                    {/* HP scaling progress indicator */}
                    <div className="pt-1 mt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                        <span>血量強度階梯</span>
                        <span className="text-amber-400">階梯 {stg.stageNumber} / 12</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600 transition-all duration-300"
                          style={{ width: `${hpScalePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 12 Wave Dots Bar */}
                  <div className="mb-2">
                    <div className="grid grid-cols-12 gap-0.5 bg-slate-900/90 p-1 rounded border border-slate-800">
                      {stg.enemies.map((enemy, eIdx) => {
                        const isWaveReached = isCurrent ? eIdx <= currentWaveIndex : isCleared;
                        const isMid = eIdx === 5; // Wave 6 (Mid-Boss)
                        const isFinal = eIdx === 11; // Wave 12 (Final Boss)

                        return (
                          <div
                            key={eIdx}
                            className={`h-4 rounded flex items-center justify-center text-[8px] transition-colors ${
                              isMid
                                ? 'bg-orange-950 border border-orange-600 text-orange-300 font-bold'
                                : isFinal
                                ? 'bg-red-950 border border-red-600 text-red-300 font-bold'
                                : isWaveReached
                                ? 'bg-emerald-500/40 text-emerald-200'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                            title={`第 ${eIdx + 1} 波: ${enemy.name}`}
                          >
                            {isMid ? '首' : isFinal ? '王' : eIdx + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    推薦攻擊：{stg.recommendedAtk}+
                  </span>

                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                      isCurrent
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : isCleared
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-sky-600 hover:bg-sky-500 text-white'
                    }`}
                  >
                    <span>{isCurrent ? '繼續挑戰' : isCleared ? '再次挑戰' : '進入挑戰'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            提示：擊敗第 12 波關底大首領即可自動解鎖下一關卡！
          </div>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            關閉選關畫面
          </button>
        </div>
      </div>
    </div>
  );
};
