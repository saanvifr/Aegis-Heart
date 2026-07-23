// src/components/UI/StreakBadge.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  streak: number;
  compact?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ streak, compact = false }) => {
  const isHot = streak >= 7;
  const isFire = streak >= 30;

  const flameColor = isFire
    ? 'var(--danger-rose)'
    : isHot
    ? 'var(--purple-glow)'
    : 'var(--warning-amber)';

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full metric-capsule">
        <motion.div
          animate={isHot ? { scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
        >
          <Flame className="w-4 h-4" style={{ color: flameColor }} />
        </motion.div>
        <span className="font-mono-num font-bold text-sm text-[var(--text-main)]">{streak}</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-4 flex items-center gap-4">
      <motion.div
        className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
        style={{ background: `${flameColor}15`, border: `1px solid ${flameColor}30` }}
        animate={isHot ? { boxShadow: [`0 0 15px ${flameColor}30`, `0 0 35px ${flameColor}60`, `0 0 15px ${flameColor}30`] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.div
          animate={isHot ? { scale: [1, 1.25, 1], rotate: [0, -10, 10, -5, 0] } : {}}
          transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 1.2 }}
        >
          <Flame className="w-7 h-7" style={{ color: flameColor }} />
        </motion.div>
        {isFire && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-mono-num font-bold text-white"
            style={{ background: 'var(--danger-rose)' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            🔥
          </motion.div>
        )}
      </motion.div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="font-heading font-extrabold text-3xl text-[var(--text-main)]">{streak}</span>
          <span className="text-sm font-mono-num text-[var(--text-muted)]">day streak</span>
        </div>
        <p className="text-[10px] font-mono-num uppercase tracking-widest" style={{ color: flameColor }}>
          {isFire ? '🔥 ON FIRE!' : isHot ? '⚡ HOT STREAK' : 'Keep it up!'}
        </p>
      </div>
    </div>
  );
};
