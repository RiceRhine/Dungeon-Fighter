import React from 'react';
import { Gem } from '../types/game';
import { Flame, Shield, Heart, Zap, Sparkles, Skull, Crosshair, Droplet, ShieldAlert, ShieldCheck, Activity, Hourglass, Sword } from 'lucide-react';

interface GemIconProps {
  gem: Gem;
  size?: 'sm' | 'md' | 'lg';
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, gem: Gem) => void;
  onClick?: () => void;
  className?: string;
}

export const GemIcon: React.FC<GemIconProps> = ({
  gem,
  size = 'md',
  draggable = false,
  onDragStart,
  onClick,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-13 h-13 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const renderIcon = () => {
    const iconClass = `${iconSizes[size]} text-white drop-shadow`;

    switch (gem.icon) {
      case 'Sword':
        return <Sword className={iconClass} />;
      case 'Shield':
        return <Shield className={iconClass} />;
      case 'Heart':
        return <Heart className={iconClass} />;
      case 'Zap':
        return <Zap className={`${iconClass} animate-pulse`} />;
      case 'Crosshair':
        return <Crosshair className={iconClass} />;
      case 'Droplet':
        return <Droplet className={iconClass} />;
      case 'ShieldAlert':
        return <ShieldAlert className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'Activity':
        return <Activity className={iconClass} />;
      case 'Flame':
        return <Flame className={`${iconClass} text-red-200 animate-pulse`} />;
      case 'Skull':
        return <Skull className={iconClass} />;
      case 'Hourglass':
        return <Hourglass className={iconClass} />;
      case 'Sparkles':
      default:
        return <Sparkles className={`${iconClass} text-purple-200`} />;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (draggable) {
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'GEM', gemId: gem.id }));
      e.dataTransfer.effectAllowed = 'copyMove';
      if (onDragStart) {
        onDragStart(e, gem);
      }
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onClick={onClick}
      style={{
        backgroundColor: `${gem.colorHex}25`,
        borderColor: gem.borderColor,
        boxShadow: `0 0 10px ${gem.colorHex}44`,
      }}
      className={`relative inline-flex items-center justify-center rounded-lg border-2 transition-transform duration-150 active:scale-95 cursor-grab active:cursor-grabbing select-none ${
        sizeClasses[size]
      } ${className}`}
      title={`${gem.name} [${gem.category === 'stat' ? '數值型' : gem.category === 'passive' ? '被動型' : '技能型'}]: ${gem.specialEffect.name} - ${gem.specialEffect.description}`}
    >
      {renderIcon()}
      {gem.tier > 1 && (
        <span className="absolute -bottom-1 -right-1 px-1 bg-slate-900 border border-slate-700 text-[8px] font-bold rounded text-amber-300">
          T{gem.tier}
        </span>
      )}
    </div>
  );
};
