import React, { useState } from 'react';
import { Gift, Sparkles, Wand2, Heart, RotateCcw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { sounds } from '../services/sound';

interface TestingToolsProps {
  onAddRandomEquipment: () => void;
  onAddRandomGem: () => void;
  onAutoEquipGodSet: () => void;
  onFullHeal: () => void;
  onResetAll: () => void;
  onUnlockNextStage?: () => void;
}

export const TestingTools: React.FC<TestingToolsProps> = ({
  onAddRandomEquipment,
  onAddRandomGem,
  onAutoEquipGodSet,
  onFullHeal,
  onResetAll,
  onUnlockNextStage,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="relative flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs">
      <div className="flex items-center gap-1.5 text-slate-300 font-bold shrink-0">
        <Wand2 className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline">測試工具</span>
      </div>

      <div className="flex flex-wrap items-center gap-1 shrink-0">
        <button
          onClick={() => {
            onAddRandomEquipment();
            sounds.playEquip();
          }}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors"
          title="庫存增加隨機裝備"
        >
          <Gift className="w-3 h-3 inline mr-1 text-sky-400" />
          <span>+裝備</span>
        </button>

        <button
          onClick={() => {
            onAddRandomGem();
            sounds.playSocket();
          }}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
          title="行囊增加隨機寶石"
        >
          <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
          <span>+寶石</span>
        </button>

        {onUnlockNextStage && (
          <button
            onClick={() => {
              onUnlockNextStage();
              sounds.playVictory();
            }}
            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-colors"
            title="測試解鎖下一關"
          >
            <span>+解鎖下關</span>
          </button>
        )}

        <button
          onClick={() => {
            onAutoEquipGodSet();
            sounds.playVictory();
          }}
          className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors"
          title="一鍵全套神裝與極品寶石"
        >
          <span>一鍵滿配神裝</span>
        </button>

        <button
          onClick={() => {
            onFullHeal();
            sounds.playVictory();
          }}
          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors"
          title="滿血復活"
        >
          <Heart className="w-3 h-3 inline mr-0.5 text-emerald-400" />
          <span>滿血</span>
        </button>

        <button
          onClick={() => {
            if (confirm('確定重置所有數據？')) {
              onResetAll();
            }
          }}
          className="p-1 rounded text-slate-400 hover:text-red-300 transition-colors"
          title="重置為初始狀態"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            showGuide ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          title="測試驗證指南"
        >
          <HelpCircle className="w-3.5 h-3.5 inline mr-0.5" />
          <span>驗證說明</span>
        </button>
      </div>

      {/* Guide Dropdown Popover */}
      {showGuide && (
        <div className="absolute right-0 top-full mt-1.5 w-96 p-3 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 text-[11px] leading-relaxed space-y-1.5">
          <div className="font-bold text-amber-300 flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>核心驗證指南</span>
          </div>
          <p className="text-slate-200">
            <strong>1. 選關畫面與關卡解鎖：</strong>
            點選上方「選關地圖」可檢視 12 個關卡。初始僅解鎖第 1 關，通關上一關卡才能解鎖下一關；未解鎖關卡呈灰色且不可交互！
          </p>
          <p className="text-slate-200">
            <strong>2. 關卡血量梯度成長：</strong>
            每關敵兵血量隨關卡遞增（第1關 ~160 HP 至第12關 ~5000+ HP，首領高達萬點血量）。
          </p>
          <p className="text-slate-200">
            <strong>3. 平均隨機輪次通關平衡：</strong>
            每次擊破敵人波次均自動回復 30%~50% 生命；配合技能型（CD到必觸發）與被動型寶珠（無CD機率連擊/吸血/霜甲/荊棘），平均裝備即可順暢通關！
          </p>
          <p className="text-slate-200">
            <strong>4. 寶石拖曳鑲嵌與拆卸：</strong>
            寶石行囊位於裝備正上方，按住寶石拖曳至孔位即可鑲嵌；點擊孔位 100% 完好拆卸保留。
          </p>
        </div>
      )}
    </div>
  );
};
