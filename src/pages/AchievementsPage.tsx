import React, { useState } from 'react';
import { Trophy, Zap, Star, Lock, Shield, Heart, Flame, Droplets, BedDouble, Brain, Target, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Badge {
  id: string; name: string; desc: string; icon: React.FC<any>;
  color: string; earned: boolean; earnedDate?: string; xp: number; rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const RARITY_COLORS = { common: '#94A3B8', rare: '#38BDF8', epic: '#A855F7', legendary: '#F59E0B' };

const ALL_BADGES: Badge[] = [
  { id: 'first_login',    name: 'First Step',       desc: 'Logged into Aegis Heart for the first time',   icon: Star,     color: '#E879A0', earned: true,  earnedDate: '2026-07-01', xp: 50,  rarity: 'common' },
  { id: 'first_predict',  name: 'Risk Scout',        desc: 'Completed your first risk assessment',          icon: Activity, color: '#38BDF8', earned: true,  earnedDate: '2026-07-02', xp: 100, rarity: 'common' },
  { id: 'streak_7',       name: '7-Day Warrior',     desc: 'Maintained a 7-day health streak',              icon: Flame,    color: '#FB923C', earned: true,  earnedDate: '2026-07-08', xp: 200, rarity: 'rare' },
  { id: 'hydration_hero', name: 'Hydration Hero',    desc: 'Hit water goal 5 days in a row',                icon: Droplets, color: '#06D6A0', earned: true,  earnedDate: '2026-07-10', xp: 150, rarity: 'rare' },
  { id: 'sleep_master',   name: 'Sleep Master',      desc: 'Achieved 8h sleep for a full week',             icon: BedDouble,color: '#8B5CF6', earned: true,  earnedDate: '2026-07-14', xp: 200, rarity: 'rare' },
  { id: 'goal_crusher',   name: 'Goal Crusher',      desc: 'Completed your first health goal',              icon: Target,   color: '#4ADE80', earned: true,  earnedDate: '2026-07-15', xp: 200, rarity: 'rare' },
  { id: 'heart_warrior',  name: 'Heart Warrior',     desc: 'Used Aegis Heart for 30 consecutive days',      icon: Heart,    color: '#F43F5E', earned: false, xp: 500, rarity: 'epic' },
  { id: 'streak_30',      name: '30-Day Champion',   desc: 'Maintained a 30-day health streak',             icon: Flame,    color: '#F59E0B', earned: false, xp: 500, rarity: 'epic' },
  { id: 'stress_buster',  name: 'Stress Buster',     desc: 'Logged mood for 14 consecutive days',           icon: Brain,    color: '#A855F7', earned: false, xp: 300, rarity: 'rare' },
  { id: 'predict_10',     name: 'Risk Analyst',      desc: 'Completed 10 risk assessments',                 icon: Shield,   color: '#38BDF8', earned: false, xp: 300, rarity: 'rare' },
  { id: 'predict_50',     name: 'ML Master',         desc: 'Completed 50 risk assessments',                 icon: Shield,   color: '#A855F7', earned: false, xp: 1000, rarity: 'legendary' },
  { id: 'legend',         name: 'Cardiovascular Legend', desc: 'Maintained perfect heart health for 90 days', icon: Trophy, color: '#F59E0B', earned: false, xp: 2000, rarity: 'legendary' },
];

const LEVELS = [
  { name: 'Beginner',  min: 0,     max: 999,   color: '#94A3B8' },
  { name: 'Explorer',  min: 1000,  max: 2499,  color: '#38BDF8' },
  { name: 'Guardian',  min: 2500,  max: 4999,  color: '#4ADE80' },
  { name: 'Warrior',   min: 5000,  max: 9999,  color: '#A855F7' },
  { name: 'Champion',  min: 10000, max: 99999, color: '#F59E0B' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Arjun M.',   xp: 8450, level: 'Warrior',  badge: '⚔️' },
  { rank: 2, name: 'Priya S.',   xp: 6200, level: 'Warrior',  badge: '🏹' },
  { rank: 3, name: 'You',        xp: 3400, level: 'Guardian', badge: '🛡️', isUser: true },
  { rank: 4, name: 'Vikram R.',  xp: 2100, level: 'Explorer', badge: '🔭' },
  { rank: 5, name: 'Sneha K.',   xp: 1650, level: 'Explorer', badge: '🌟' },
];

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const xp = user?.xp ?? 3400;
  const currentLevel = LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const xpProgress = nextLevel ? ((xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const filtered = ALL_BADGES.filter(b => filter === 'all' ? true : filter === 'earned' ? b.earned : !b.earned);
  const earned = ALL_BADGES.filter(b => b.earned);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--warning-amber)]/15 border border-[var(--warning-amber)]/30 text-[var(--warning-amber)] text-xs font-mono-num mb-2">
          <Trophy className="w-3.5 h-3.5" /> ACHIEVEMENTS & XP
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Achievement Vault</h1>
        <p className="text-[color:var(--text-muted)] text-sm mt-1">{earned.length} of {ALL_BADGES.length} badges unlocked</p>
      </div>

      {/* Level Card */}
      <div className="glass-panel rounded-2xl p-6 mb-8 border border-[color:var(--glass-border)] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(ellipse at 80% 50%, ${currentLevel.color}, transparent)` }} />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: `${currentLevel.color}20`, border: `2px solid ${currentLevel.color}40` }}>
            {currentLevel.name === 'Beginner' ? '🌱' : currentLevel.name === 'Explorer' ? '🔭' : currentLevel.name === 'Guardian' ? '🛡️' : currentLevel.name === 'Warrior' ? '⚔️' : '👑'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <span className="font-heading text-2xl font-extrabold" style={{ color: currentLevel.color }}>{currentLevel.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono-num font-semibold" style={{ background: `${currentLevel.color}20`, color: currentLevel.color }}>
                Level {LEVELS.indexOf(currentLevel) + 1}
              </span>
            </div>
            <p className="text-[color:var(--text-muted)] text-sm mb-3">{xp.toLocaleString()} XP {nextLevel ? `· ${(nextLevel.min - xp).toLocaleString()} to ${nextLevel.name}` : '· MAX LEVEL'}</p>
            <div className="h-3 rounded-full bg-[color:var(--glass-border)] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${xpProgress}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel?.color || currentLevel.color})` }} />
            </div>
            {nextLevel && <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num mt-1">{Math.round(xpProgress)}% to {nextLevel.name}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Zap className="w-5 h-5 text-[var(--warning-amber)]" />
            <span className="font-heading text-3xl font-extrabold text-[var(--warning-amber)]">{xp.toLocaleString()}</span>
            <span className="text-xs text-[color:var(--text-muted)] font-mono-num">XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badge Gallery */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-xl text-[color:var(--text-main)]">Badges</h2>
            <div className="flex gap-2">
              {(['all', 'earned', 'locked'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono-num capitalize transition-all cursor-pointer ${
                    filter === f ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]'
                  }`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map(badge => {
              const Icon = badge.icon;
              const rarityColor = RARITY_COLORS[badge.rarity];
              return (
                <div key={badge.id}
                  className={`glass-panel rounded-2xl p-4 text-center transition-all ${badge.earned ? 'hover:scale-[1.02]' : 'opacity-50 grayscale'}`}
                  style={{ borderColor: badge.earned ? `${badge.color}30` : undefined }}>
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 ${badge.earned ? '' : 'bg-[color:var(--glass-border)]'}`}
                    style={{ background: badge.earned ? `${badge.color}20` : undefined,
                             boxShadow: badge.earned ? `0 0 20px ${badge.color}30` : undefined }}>
                    {badge.earned ? <Icon className="w-7 h-7" style={{ color: badge.color }} /> : <Lock className="w-7 h-7 text-[color:var(--text-muted)]" />}
                  </div>
                  <p className="text-xs font-semibold text-[color:var(--text-main)] mb-1">{badge.name}</p>
                  <p className="text-[10px] text-[color:var(--text-muted)] mb-2 leading-relaxed">{badge.desc}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[9px] font-mono-num px-1.5 py-0.5 rounded-full" style={{ background: `${rarityColor}20`, color: rarityColor }}>{badge.rarity}</span>
                    <span className="text-[9px] font-mono-num text-[var(--warning-amber)]">+{badge.xp} XP</span>
                  </div>
                  {badge.earned && badge.earnedDate && (
                    <p className="text-[9px] text-[var(--green-healthy)] font-mono-num mt-1">✓ {badge.earnedDate}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="font-heading font-bold text-xl text-[color:var(--text-main)] mb-4">Leaderboard</h2>
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            {LEADERBOARD.map(entry => (
              <div key={entry.rank}
                className={`flex items-center gap-3 p-3 rounded-xl ${entry.isUser ? 'bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20' : 'bg-[color:var(--card-hover)]'}`}>
                <span className="font-heading font-bold text-lg w-6 text-center" style={{ color: entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#94A3B8' : entry.rank === 3 ? '#FB923C' : 'var(--text-muted)' }}>
                  {entry.rank}
                </span>
                <span className="text-2xl">{entry.badge}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${entry.isUser ? 'text-[var(--accent-cyan)]' : 'text-[color:var(--text-main)]'}`}>{entry.name}</p>
                  <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">{entry.level}</p>
                </div>
                <span className="text-xs font-bold text-[var(--warning-amber)] font-mono-num">{entry.xp.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
