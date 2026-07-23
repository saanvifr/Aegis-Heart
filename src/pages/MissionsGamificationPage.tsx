import React, { useState } from 'react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { Award, Zap, CheckCircle2, Shield, Flame, Activity, Sparkles, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MissionsGamificationPage: React.FC = () => {
  const { user } = useAuth();

  const [missions, setMissions] = useState([
    { id: '1', title: 'Walk 8,000 Steps Today', xp: 250, completed: true, icon: Flame },
    { id: '2', title: 'Maintain 2.5L Hydration Intake', xp: 150, completed: true, icon: Activity },
    { id: '3', title: 'Sleep Before 11:00 PM', xp: 200, completed: false, icon: Sparkles },
    { id: '4', title: 'Complete Risk Sandbox Simulation', xp: 300, completed: false, icon: Zap },
    { id: '5', title: 'Execute Weekly Cardio Scan', xp: 500, completed: false, icon: Shield },
  ]);

  const achievements = [
    { title: 'First Assessment', desc: 'Completed inaugural cardiovascular risk scan.', date: '2026-01-15', unlocked: true },
    { title: 'Healthy Month', desc: 'Maintained low risk index for 30 consecutive days.', date: '2026-02-15', unlocked: true },
    { title: 'Hydration King', desc: 'Logged 2.5L daily water intake for 14 days.', date: '2026-03-10', unlocked: true },
    { title: 'Risk Reduced', desc: 'Reduced cardio risk score by >15% via lifestyle.', date: '2026-04-01', unlocked: true },
    { title: 'Consistency Master', desc: 'Logged health journal for 21 straight days.', date: '2026-05-20', unlocked: true },
    { title: 'Fitness Hero', desc: 'Exceeded 5 hours of aerobic exercise per week.', date: '2026-06-12', unlocked: true },
    { title: 'Perfect Sleep', desc: 'Achieved 8 hours sleep cycle for 7 consecutive days.', date: '2026-07-04', unlocked: true },
    { title: 'Aegis Elite Candidate', desc: 'Reached Level 4 Health Guardian status.', date: '2026-07-20', unlocked: true },
    { title: 'Cardio Champion', desc: 'Reach 10,000 Total Lifetime XP.', date: 'Locked', unlocked: false },
  ];

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const currentLevel = user?.level || 'Health Guardian';
  const xp = user?.xp || 3400;
  const nextLevelXp = 5000;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-3 border border-[var(--accent-cyan)]/30">
          <Trophy className="w-3.5 h-3.5" />
          <span>GAMIFIED HEALTH MISSIONS & LEVEL PROGRESSION</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[color:var(--text-main)]">
          HEALTH MISSIONS & ACHIEVEMENTS
        </h2>
        <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">
          Earn XP, unlock achievement badges, and elevate your Aegis Health Level
        </p>
      </div>

      {/* Level Banner */}
      <GlassPanel glow="cyan" className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-tr from-[var(--accent-cyan)] to-[var(--purple-glow)] text-[color:var(--text-main)] shadow-[0_0_25px_rgba(0,245,255,0.4)]">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono-num text-[color:var(--text-muted)] uppercase block">CURRENT HEALTH LEVEL</span>
            <h3 className="font-heading text-2xl font-extrabold text-[color:var(--text-main)] tracking-wide">{currentLevel}</h3>
            <p className="text-xs font-mono-num text-[var(--accent-cyan)]">{xp} / {nextLevelXp} TOTAL XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full md:w-1/2">
          <div className="flex justify-between text-xs font-mono-num text-[color:var(--text-muted)] mb-1">
            <span>LEVEL PROGRESSION</span>
            <span>{Math.round((xp / nextLevelXp) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-[color:var(--glass-border)] rounded-full overflow-hidden border border-[color:var(--glass-border)] p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--purple-glow)] to-[var(--green-healthy)] rounded-full shadow-[0_0_15px_rgba(0,245,255,0.6)] transition-all duration-500"
              style={{ width: `${(xp / nextLevelXp) * 100}%` }}
            />
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Daily Missions */}
        <GlassPanel glow="purple" title="Daily Health Missions" subtitle="Earn XP by Completing Tasks" icon={Zap} className="lg:col-span-5 space-y-3">
          {missions.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => toggleMission(m.id)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  m.completed ? 'bg-[var(--green-healthy)]/10 border-[var(--green-healthy)]/40 text-[var(--green-healthy)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
                }`}
              >
                <div className="flex items-center gap-3 font-mono-num text-xs">
                  <Icon className="w-4 h-4" />
                  <span className={m.completed ? 'line-through opacity-80' : ''}>{m.title}</span>
                </div>
                <span className="text-xs font-bold font-mono-num px-2.5 py-0.5 rounded-full bg-[color:var(--glass-border)] text-[var(--accent-cyan)]">
                  +{m.xp} XP
                </span>
              </div>
            );
          })}
        </GlassPanel>

        {/* Right: Achievement Badges Grid */}
        <GlassPanel glow="cyan" title="Unlocked Achievement Badges" subtitle="30+ Milestone Trophies" icon={Trophy} className="lg:col-span-7">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-left font-mono-num text-xs flex flex-col justify-between transition-all ${
                  ach.unlocked
                    ? 'bg-[color:var(--glass-border)] border-[var(--accent-cyan)]/30 text-[color:var(--text-main)] shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                    : 'bg-white/[0.02] border-[color:var(--glass-border)] text-gray-600 opacity-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className={`w-4 h-4 ${ach.unlocked ? 'text-[var(--green-healthy)]' : 'text-gray-600'}`} />
                    <span className="font-bold">{ach.title}</span>
                  </div>
                  <p className="text-[10px] text-[color:var(--text-muted)] leading-relaxed mb-3">{ach.desc}</p>
                </div>
                <span className="text-[9px] text-[var(--accent-cyan)]">{ach.date}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

      </div>

    </div>
  );
};
