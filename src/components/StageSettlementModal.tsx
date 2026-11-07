import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  ChevronRight,
  Map,
  RotateCcw,
  X,
  Activity,
  Award,
  BarChart3,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Flame,
  Skull,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { StageSettlementData, DamageSourceCategory } from '../types/game';

interface StageSettlementModalProps {
  isOpen: boolean;
  settlement: StageSettlementData | null;
  hasNextStage: boolean;
  onProceedNext: () => void;
  onReplayStage: () => void;
  onOpenStageSelect: () => void;
  onClose: () => void;
}

export const StageSettlementModal: React.FC<StageSettlementModalProps> = ({
  isOpen,
  settlement,
  hasNextStage,
  onProceedNext,
  onReplayStage,
  onOpenStageSelect,
  onClose,
}) => {
  const [filterCategory, setFilterCategory] = useState<DamageSourceCategory | 'all'>('all');

  if (!isOpen || !settlement) return null;

  const filteredSources = settlement.damageSources.filter((s) => {
    if (filterCategory === 'all') return true;
    return s.category === filterCategory;
  });

  const getCategoryBadgeClass = (category: DamageSourceCategory) => {
    switch (category) {
      case 'basic':
        return 'bg-amber-950/70 text-amber-300 border-amber-700/60';
      case 'skill':
        return 'bg-purple-950/70 text-purple-300 border-purple-700/60';
      case 'passive':
        return 'bg-sky-950/70 text-sky-300 border-sky-700/60';
      case 'dot':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60';
      case 'reflect':
        return 'bg-rose-950/70 text-rose-300 border-rose-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-[0_0_8px_#f59e0b] shrink-0">
          1
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-950 font-black text-[11px] flex items-center justify-center shadow-sm shrink-0">
          2
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[11px] flex items-center justify-center shadow-sm shrink-0">
          3
        </span>
      );
    }
    return (
      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 font-bold text-[11px] flex items-center justify-center shrink-0">
        {index + 1}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full my-auto rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)] p-5 sm:p-6 text-white max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/60 z-10"
          title="關閉結算"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Victory Header */}
        <div className="text-center pb-4 border-b border-slate-800/90 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 font-cinzel tracking-wider">
            第 {settlement.stageNumber} 關 · 通關大捷結算
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 text-xs">
            <span className="text-amber-300 font-bold">
              【{settlement.stageName}】
            </span>
            <span className="text-slate-500">·</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/70 text-emerald-300 text-[11px] font-semibold">
              ✓ 擊破關底首領【{settlement.bossName}】
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 font-mono text-[11px]">
              12/12 敵人全清剿
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 select-text">
          {/* 4 Summary Stat KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-medium">
                <Swords className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>關卡總輸出</span>
              </div>
              <div className="text-lg font-black text-amber-300 font-mono">
                {settlement.totalDamageDealt.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                DPS: {settlement.dps.toLocaleString()} /秒
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-medium">
                <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>通關總耗時</span>
              </div>
              <div className="text-lg font-black text-sky-300 font-mono">
                {settlement.battleDurationSeconds.toFixed(1)}s
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                共 {settlement.totalAttacks} 次主動揮砍
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-medium">
                <Crosshair className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>實戰暴擊率</span>
              </div>
              <div className="text-lg font-black text-rose-300 font-mono">
                {settlement.totalAttacks > 0
                  ? ((settlement.critCount / settlement.totalAttacks) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                暴擊 {settlement.critCount} 次
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-medium">
                <Heart className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>吸血與治癒</span>
              </div>
              <div className="text-lg font-black text-emerald-300 font-mono">
                +{settlement.totalHealing.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                承傷: {settlement.totalDamageTaken.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 🎯 核心需求：各種造成傷害來源與其在總傷的比例長條圖 (Stacked Proportion Bar) */}
          <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>各傷害來源總傷分佈長條圖 (100%)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                共 {settlement.damageSources.length} 種傷害來源
              </span>
            </div>

            {/* Stacked Multi-Color Segment Bar */}
            <div className="h-4 w-full rounded-lg bg-slate-950 overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
              {settlement.damageSources.map((source) => {
                if (source.percentage <= 0) return null;
                return (
                  <div
                    key={source.id}
                    style={{ width: `${Math.max(1.5, source.percentage)}%`, backgroundColor: source.colorHex }}
                    className="h-full rounded-sm transition-all relative group/bar"
                    title={`${source.name}: ${source.totalDamage.toLocaleString()} (${source.percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="text-slate-400 text-[10px] font-medium mr-1">篩選分類:</span>
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                全部來源
              </button>
              <button
                onClick={() => setFilterCategory('basic')}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors ${
                  filterCategory === 'basic'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-800/80 text-amber-300/80 border-slate-700'
                }`}
              >
                🗡️ 基礎攻擊
              </button>
              <button
                onClick={() => setFilterCategory('skill')}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors ${
                  filterCategory === 'skill'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800/80 text-purple-300/80 border-slate-700'
                }`}
              >
                ⏳ 技能寶珠
              </button>
              <button
                onClick={() => setFilterCategory('passive')}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors ${
                  filterCategory === 'passive'
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-slate-800/80 text-sky-300/80 border-slate-700'
                }`}
              >
                🎲 被動寶珠
              </button>
              <button
                onClick={() => setFilterCategory('dot')}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors ${
                  filterCategory === 'dot'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-800/80 text-emerald-300/80 border-slate-700'
                }`}
              >
                🔥 狀態 DoT
              </button>
            </div>
          </div>

          {/* 💎 核心需求：傷害來源排行列表與在總傷的比例 (Damage Breakdown List) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>傷害來源明細與總傷佔比排行榜</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                依輸出貢獻降冪排序
              </span>
            </div>

            {filteredSources.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                無此分類的傷害記錄
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSources.map((source, index) => {
                  return (
                    <div
                      key={source.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm space-y-2"
                    >
                      {/* Top Row: Rank, Icon, Name, Category, Total Damage & Percentage */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {getRankBadge(index)}
                          <span className="text-base shrink-0">{source.icon}</span>
                          <span className="font-bold text-white text-xs sm:text-sm truncate">
                            {source.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getCategoryBadgeClass(
                              source.category
                            )}`}
                          >
                            {source.categoryLabel}
                          </span>
                        </div>

                        {/* Damage & Percentage */}
                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div>
                            <div className="text-xs sm:text-sm font-black font-mono text-white">
                              {source.totalDamage.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              命中 {source.hitCount} 次 · 單擊最高 {source.maxHit.toLocaleString()}
                            </div>
                          </div>

                          <div
                            className="px-2 py-1 rounded-lg font-black font-mono text-xs sm:text-sm border shrink-0 text-center min-w-[58px]"
                            style={{
                              backgroundColor: `${source.colorHex}20`,
                              borderColor: `${source.colorHex}60`,
                              color: source.colorHex,
                            }}
                          >
                            {source.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* Visual Progress Bar for this source's proportion */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(1, source.percentage)}%`,
                            backgroundColor: source.colorHex,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 戰利品掉落結算 (Rewards) */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>關卡通關獎勵掉落</span>
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">
                +{settlement.rewards.gold} 金幣 / +{settlement.rewards.exp} EXP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {settlement.rewards.gem ? (
                <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: settlement.rewards.gem.colorHex }}
                    />
                    <div>
                      <div className="font-bold text-white text-xs">
                        {settlement.rewards.gem.name}
                      </div>
                      <div className="text-[10px] text-amber-300 font-mono">
                        {settlement.rewards.gem.category === 'stat'
                          ? '數值型寶石'
                          : settlement.rewards.gem.category === 'skill'
                          ? '技能型寶珠'
                          : '被動型寶珠'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                    已入行囊
                  </span>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-500 text-[11px] flex items-center justify-center">
                  本次未掉落額外寶石
                </div>
              )}

              {settlement.rewards.equipment ? (
                <div className="p-2 rounded-lg bg-slate-950 border border-sky-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white text-xs">
                        {settlement.rewards.equipment.name}
                      </div>
                      <div className="text-[10px] text-sky-300 font-mono">
                        {settlement.rewards.equipment.type === 'weapon'
                          ? '武器'
                          : settlement.rewards.equipment.type === 'armor'
                          ? '防具'
                          : '飾品'}{' '}
                        · {settlement.rewards.equipment.maxSockets} 鑲嵌孔
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 font-bold border border-sky-800">
                    已在庫存
                  </span>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-500 text-[11px] flex items-center justify-center">
                  本次未掉落額外裝備
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <button
              onClick={onOpenStageSelect}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              title="開啟選關畫面查看全部12關地圖"
            >
              <Map className="w-3.5 h-3.5" />
              <span>開啟選關畫面</span>
            </button>

            <button
              onClick={onReplayStage}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              title="再次挑戰本關卡"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重戰本關</span>
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {hasNextStage ? (
              <button
                onClick={onProceedNext}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse"
              >
                <span>前進第 {settlement.stageNumber + 1} 關</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black bg-amber-400 text-slate-950"
              >
                🎉 已破通全部 12 關大圓滿！
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
