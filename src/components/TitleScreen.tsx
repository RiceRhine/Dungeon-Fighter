import React, { useState, useEffect } from 'react';
import { storageService, SaveData } from '../services/storage';
import { Play, Sparkles, LogOut, RotateCcw, Volume2, VolumeX, Shield, Swords } from 'lucide-react';
import { sounds } from '../services/sound';

interface TitleScreenProps {
  onContinueGame: () => void;
  onNewGame: () => void;
  onExitGame: () => void;
  onOpenStageSelect?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onContinueGame,
  onNewGame,
  onExitGame,
  onOpenStageSelect,
}) => {
  const [saveInfo, setSaveInfo] = useState<SaveData | null>(null);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState(false);
  const [muted, setMuted] = useState(sounds.isMuted());

  useEffect(() => {
    const save = storageService.loadSaveGame();
    setSaveInfo(save);
  }, []);

  const handleSoundToggle = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sounds.playSocket();
    }
  };

  const handleStartNewGame = () => {
    if (saveInfo) {
      setShowConfirmNewGame(true);
    } else {
      sounds.playEquip();
      onNewGame();
    }
  };

  const handleConfirmNewGame = () => {
    setShowConfirmNewGame(false);
    sounds.playEquip();
    onNewGame();
  };

  const handleExit = () => {
    sounds.playUnsocket();
    // 嘗試調用瀏覽器原生關閉網頁
    try {
      window.close();
    } catch {
      // ignore
    }
    onExitGame();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-slate-950 select-none">
      {/* Background Arena Image with Atmospheric Scrim */}
      <img
        src="/src/assets/images/game_dungeon_arena_1794023186202.jpg"
        alt="標題畫面背景"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover scale-105 filter brightness-75 contrast-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/80" />

      {/* Top Controls: Sound switch */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={handleSoundToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-xs"
        >
          {muted ? (
            <>
              <VolumeX className="w-4 h-4 text-red-400" />
              <span>音效: 關閉</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>音效: 開啟</span>
            </>
          )}
        </button>
      </div>

      {/* Main Title Center Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full px-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Glowing Logo Icon */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-[0_0_35px_rgba(245,158,11,0.5)] border border-amber-300/60 mb-4 animate-bounce">
          <Sparkles className="w-10 h-10 text-slate-950" />
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl font-black font-cinzel tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-2">
          GemForge
        </h1>
        <h2 className="text-lg sm:text-xl font-bold text-amber-300 tracking-widest font-cinzel mb-2">
          寶石鑲嵌自動戰鬥
        </h2>

        {/* Core Rules Tagline */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-8 font-mono">
          <span>數值型</span>
          <span>·</span>
          <span>被動型 (無CD概率)</span>
          <span>·</span>
          <span>技能型 (帶CD必觸發)</span>
        </div>

        {/* Menu Buttons Group */}
        <div className="w-full max-w-xs flex flex-col gap-2.5">
          {/* 1. 繼續遊戲 (若無存檔則隱藏) */}
          {saveInfo && (
            <button
              onClick={() => {
                sounds.playVictory();
                onContinueGame();
              }}
              className="group relative w-full py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex flex-col items-center justify-center gap-0.5"
            >
              <div className="flex items-center gap-2 text-base">
                <Play className="w-4 h-4 fill-slate-950" />
                <span>繼續遊戲</span>
              </div>
              <span className="text-[10px] font-mono font-medium text-amber-950/80">
                第 {saveInfo.currentStageIndex + 1} 關 · 已解鎖至第 {saveInfo.unlockedStageMax || 1} 關
              </span>
            </button>
          )}

          {/* 1.5 關卡選擇 (選關畫面) */}
          {saveInfo && onOpenStageSelect && (
            <button
              onClick={() => {
                sounds.playEquip();
                onOpenStageSelect();
              }}
              className="w-full py-2.5 px-5 rounded-xl font-bold text-xs bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>🗺️ 關卡選擇 (選關畫面)</span>
            </button>
          )}

          {/* 2. 新遊戲 (開新存檔) */}
          <button
            onClick={handleStartNewGame}
            className={`w-full py-3 px-5 rounded-xl font-bold text-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 ${
              saveInfo
                ? 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700 hover:border-slate-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] text-base'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>新遊戲 (開新存檔)</span>
          </button>

          {/* 3. 退出 (關閉網頁) */}
          <button
            onClick={handleExit}
            className="w-full py-2.5 px-5 rounded-xl font-medium text-xs bg-slate-900/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800/60 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>退出 (關閉網頁)</span>
          </button>
        </div>

        {/* Footer Credit */}
        <div className="mt-10 text-[11px] text-slate-500 font-mono">
          <span>HTML5 遊戲工程師製作 · 純前端無後端架構 · 存檔自動保留</span>
        </div>
      </div>

      {/* Confirm Overwrite Save Modal */}
      {showConfirmNewGame && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl bg-slate-900 border border-amber-500/80 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center">
            <RotateCcw className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">覆蓋現有存檔？</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              偵測到您已有進度存檔（{saveInfo?.savedAt}）。開新遊戲將會重置進度並建立新存檔，確定要開始新遊戲嗎？
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfirmNewGame(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmNewGame}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                確認開啟新存檔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
