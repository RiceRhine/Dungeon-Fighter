import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../services/sound';

export const AudioControls: React.FC = () => {
  const [muted, setMuted] = useState(sounds.isMuted());

  const handleToggle = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sounds.playSocket();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-500 transition-colors whitespace-nowrap shrink-0"
      title={muted ? '開啟音效' : '靜音'}
      aria-label="音效切換"
    >
      {muted ? (
        <>
          <VolumeX className="w-3.5 h-3.5 text-red-400" />
          <span>音效: 關閉</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>音效: 開啟</span>
        </>
      )}
    </button>
  );
};
