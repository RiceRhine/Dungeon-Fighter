import React from 'react';
import { LogOut, ArrowLeft, ShieldCheck } from 'lucide-react';
import { sounds } from '../services/sound';

interface QuitScreenProps {
  onReturnToTitle: () => void;
}

export const QuitScreen: React.FC<QuitScreenProps> = ({ onReturnToTitle }) => {
  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 select-none">
      <div className="max-w-md w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <LogOut className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold font-cinzel text-white mb-2">
          遊戲已安全退出
        </h2>

        <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 mb-4 font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>進度與寶石已完整保存</span>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          若您的瀏覽器已阻止網頁自動關閉，您現在可以隨時直接關閉此瀏覽器分頁或視窗。
        </p>

        <button
          onClick={() => {
            sounds.playSocket();
            onReturnToTitle();
          }}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>返回標題畫面</span>
        </button>
      </div>
    </div>
  );
};
