import React, { useState, useEffect } from 'react';
import { Target, Plus, X, CheckCircle, Zap, Dumbbell, Salad, BedDouble, Brain, Heart, Trophy } from 'lucide-react';
import { api } from '../hooks/useApi';

interface Goal {
  id: string; title: string; description: string;
  target: number; current: number; unit: string;
  category: string; xp: number; completed: boolean;
  created: string; completedAt?: string;
}

const CATEGORIES = [
  { id: 'fitness',   label: 'Fitness',    icon: Dumbbell, color: '#E879A0' },
  { id: 'nutrition', label: 'Nutrition',  icon: Salad,    color: '#4ADE80' },
  { id: 'sleep',     label: 'Sleep',      icon: BedDouble, color: '#8B5CF6' },
  { id: 'mental',    label: 'Mental',     icon: Brain,    color: '#38BDF8' },
  { id: 'medical',   label: 'Medical',    icon: Heart,    color: '#FB923C' },
];

const DEFAULT_GOALS: Goal[] = [
  { id: '1', title: 'Walk 10,000 steps daily', description: 'Cardio baseline for heart health', target: 10000, current: 6800, unit: 'steps', category: 'fitness', xp: 200, completed: false, created: '2026-07-15' },
  { id: '2', title: 'Drink 2.5L water daily', description: 'Hydration for optimal performance', target: 2500, current: 2500, unit: 'ml', category: 'nutrition', xp: 150, completed: true, created: '2026-07-10', completedAt: '2026-07-20' },
  { id: '3', title: 'Sleep 8 hours per night', description: 'Quality rest for cardiac recovery', target: 8, current: 6.5, unit: 'hours', category: 'sleep', xp: 150, completed: false, created: '2026-07-12' },
  { id: '4', title: 'Meditate 10 min daily', description: 'Reduce cortisol and stress levels', target: 30, current: 18, unit: 'sessions', category: 'mental', xp: 100, completed: false, created: '2026-07-01' },
];

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [showCreate, setShowCreate] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target: 100, current: 0, unit: '', category: 'fitness', xp: 100 });
  const [toastMsg, setToastMsg] = useState('');

  const toast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const activeGoals    = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  const handleCreate = () => {
    if (!newGoal.title) return;
    const g: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      completed: false,
      created: new Date().toISOString().split('T')[0],
    };
    setGoals(prev => [g, ...prev]);
    setShowCreate(false);
    setNewGoal({ title: '', description: '', target: 100, current: 0, unit: '', category: 'fitness', xp: 100 });
    toast('🎯 Goal created! +25 XP');
    api.post('/api/goals', g).catch(() => {});
  };

  const handleComplete = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: true, current: g.target, completedAt: new Date().toISOString().split('T')[0] } : g));
    const goal = goals.find(g => g.id === id);
    toast(`🏆 Goal completed! +${goal?.xp || 200} XP`);
  };

  const handleProgress = (id: string, delta: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, current: Math.min(g.current + delta, g.target) } : g));
  };

  const handleDelete = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const getCat = (id: string) => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--purple-glow)]/10 border border-[var(--purple-glow)]/30 text-[var(--purple-glow)] text-xs font-mono-num mb-2">
            <Target className="w-3.5 h-3.5" /> GOALS & PROGRESS
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Health Goals</h1>
          <p className="text-[color:var(--text-muted)] text-sm mt-1">{activeGoals.length} active · {completedGoals.length} completed</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {toastMsg && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[var(--green-healthy)]/15 border border-[var(--green-healthy)]/30 text-[var(--green-healthy)] text-sm font-mono-num animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Goals', value: activeGoals.length, icon: Target, color: 'var(--accent-cyan)' },
          { label: 'Completed', value: completedGoals.length, icon: CheckCircle, color: 'var(--green-healthy)' },
          { label: 'Total XP Earned', value: completedGoals.reduce((s, g) => s + g.xp, 0), icon: Zap, color: 'var(--purple-glow)' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-panel rounded-2xl p-4 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
              <p className="font-heading text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--bg-dark)]/80 backdrop-blur-xl">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-lg mx-4 animate-fadeIn border border-[var(--accent-cyan)]/20">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg text-[color:var(--text-main)]">Create New Goal</h3>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-[color:var(--card-hover)] text-[color:var(--text-muted)] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <input value={newGoal.title} onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))} placeholder="Goal title..."
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-2.5 text-[color:var(--text-main)] text-sm focus:border-[var(--accent-cyan)] outline-none" />
              <input value={newGoal.description} onChange={e => setNewGoal(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)..."
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-2.5 text-[color:var(--text-main)] text-sm focus:border-[var(--accent-cyan)] outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-1 block">Target Value</label>
                  <input type="number" value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: +e.target.value }))}
                    className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-2.5 text-[color:var(--text-main)] text-sm focus:border-[var(--accent-cyan)] outline-none" />
                </div>
                <div>
                  <label className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-1 block">Unit</label>
                  <input value={newGoal.unit} onChange={e => setNewGoal(p => ({ ...p, unit: e.target.value }))} placeholder="steps, ml, hours..."
                    className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-2.5 text-[color:var(--text-main)] text-sm focus:border-[var(--accent-cyan)] outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-2 block">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <button key={cat.id} onClick={() => setNewGoal(p => ({ ...p, category: cat.id }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-num border transition-all cursor-pointer ${
                          newGoal.category === cat.id ? 'border-current bg-current/10' : 'border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
                        }`} style={{ color: newGoal.category === cat.id ? cat.color : undefined, borderColor: newGoal.category === cat.id ? cat.color : undefined }}>
                        <Icon className="w-3 h-3" /> {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleCreate}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer">
                Create Goal (+25 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-xl text-[color:var(--text-main)] mb-4">Active Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeGoals.map(goal => {
            const cat = getCat(goal.category);
            const Icon = cat.icon;
            const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            return (
              <div key={goal.id} className="glass-panel-interactive rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl" style={{ background: `${cat.color}18` }}>
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--text-main)]">{goal.title}</p>
                      <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">{cat.label} · {goal.xp} XP</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(goal.id)} className="p-1 rounded-lg hover:bg-[color:var(--card-hover)] text-[color:var(--text-subtle)] cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[color:var(--text-muted)] font-mono-num">{goal.current} / {goal.target} {goal.unit}</span>
                    <span className="font-bold" style={{ color: cat.color }}>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[color:var(--glass-border)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleProgress(goal.id, Math.ceil(goal.target * 0.1))}
                    className="flex-1 py-1.5 rounded-lg text-xs font-mono-num border border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all cursor-pointer">
                    +10% Progress
                  </button>
                  <button onClick={() => handleComplete(goal.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono-num bg-[var(--green-healthy)]/15 text-[var(--green-healthy)] border border-[var(--green-healthy)]/30 hover:bg-[var(--green-healthy)]/25 transition-all cursor-pointer">
                    <CheckCircle className="w-3 h-3" /> Done
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="font-heading font-bold text-xl text-[color:var(--text-main)] mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--warning-amber)]" /> Completed Goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedGoals.map(goal => {
              const cat = getCat(goal.category);
              const Icon = cat.icon;
              return (
                <div key={goal.id} className="glass-panel rounded-2xl p-5 opacity-75">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[var(--green-healthy)]/15">
                      <CheckCircle className="w-4 h-4 text-[var(--green-healthy)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[color:var(--text-main)] line-through opacity-70">{goal.title}</p>
                      <p className="text-[10px] text-[var(--green-healthy)] font-mono-num">Completed {goal.completedAt} · +{goal.xp} XP</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
