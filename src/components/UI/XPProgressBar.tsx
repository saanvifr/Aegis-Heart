// src/components/UI/XPProgressBar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface XPProgressBarProps {
  xp: number;
  level?: string;
  compact?: boolean;
}

interface LevelInfo {
  name: string;
  minXp: number;
  maxXp: number;
  color: string;
}

function getLevelInfo(xp: number): LevelInfo {
  if (xp < 1000)  return { name: 'Beginner',  minXp: 0,     maxXp: 1000,  color: 'var(--text-muted)' };
  if (xp < 2500)  return { name: 'Explorer',  minXp: 1000,  maxXp: 2500,  color: 'var(--accent-cyan)' };
  if (xp < 5000)  return { name: 'Guardian',  minXp: 2500,  maxXp: 5000,  color: 'var(--purple-glow)' };
  if (xp < 10000) return { name: 'Warrior',   minXp: 5000,  maxXp: 10000, color: 'var(--green-healthy)' };
  return           { name: 'Champion', minXp: 10000, maxXp: 15000, color: 'var(--warning-amber)' };
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ xp, compact = false }) => {
  const levelInfo = getLevelInfo(xp);
  const progress = Math.min(
    ((xp - levelInfo.minXp) / (levelInfo.maxXp - levelInfo.minXp)) * 100,
    100
  );
  const remaining = levelInfo.maxXp - xp;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4" style={{ color: levelInfo.color }} />
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-[var(--glass-border)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${levelInfo.color}, var(--accent-cyan))` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>
        <span className="text-xs font-mono-num text-[var(--text-muted)]">{xp.toLocaleString()} XP</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${levelInfo.color}22`, border: `1px solid ${levelInfo.color}44` }}
          >
            <Star className="w-4 h-4" style={{ color: levelInfo.color }} />
          </div>
          <div>
            <p className="font-heading font-bold text-sm text-[var(--text-main)]">{levelInfo.name}</p>
            <p className="text-[10px] font-mono-num text-[var(--text-muted)] uppercase tracking-widest">Current Level</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono-num font-bold text-lg text-[var(--text-main)]">{xp.toLocaleString()}</p>
          <p className="text-[10px] font-mono-num text-[var(--text-muted)]">Total XP</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-3 rounded-full bg-[var(--glass-border)] overflow-hidden relative">
          <motion.div
            className="h-full rounded-full relative"
            style={{ background: `linear-gradient(90deg, ${levelInfo.color}, var(--accent-cyan))` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
          </motion.div>
        </div>
        <div className="flex justify-between text-[10px] font-mono-num text-[var(--text-muted)]">
          <span>{levelInfo.minXp.toLocaleString()} XP</span>
          <span>{remaining > 0 ? `${remaining.toLocaleString()} XP to next level` : 'MAX LEVEL'}</span>
          <span>{levelInfo.maxXp.toLocaleString()} XP</span>
        </div>
      </div>
    </div>
  );
};
