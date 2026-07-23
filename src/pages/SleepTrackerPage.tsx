import React, { useState, useEffect } from 'react';
import { BedDouble, Moon, Star, TrendingUp, Clock, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { api } from '../hooks/useApi';

const QUALITY_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Amazing'];
const QUALITY_COLORS = ['', '#F43F5E', '#FB923C', '#FBBF24', '#4ADE80', '#E879A0'];

interface SleepEntry {
  date: string;
  bedtime: string;
  wake_time: string;
  hours: number;
  quality: number;
  notes: string;
}

function calcHours(bed: string, wake: string): number {
  if (!bed || !wake) return 0;
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let diff = (wh * 60 + wm) - (bh * 60 + bm);
  if (diff < 0) diff += 24 * 60;
  return Math.round((diff / 60) * 10) / 10;
}

const SleepScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r = 52, circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? 'var(--green-healthy)' : score >= 60 ? 'var(--warning-amber)' : 'var(--danger-rose)';
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="text-center z-10">
        <p className="font-heading font-extrabold text-2xl" style={{ color }}>{score}</p>
        <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">SLEEP SCORE</p>
      </div>
    </div>
  );
};

export const SleepTrackerPage: React.FC = () => {
  const [bedtime, setBedtime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const hours = calcHours(bedtime, wakeTime);

  // Seed with sample data
  useEffect(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sample: SleepEntry[] = days.map((d, i) => ({
      date: d,
      bedtime: '22:30',
      wake_time: '06:30',
      hours: 6.5 + Math.random() * 2.5,
      quality: Math.floor(3 + Math.random() * 2),
      notes: '',
    }));
    setEntries(sample);
  }, []);

  const avgHours = entries.length ? entries.reduce((s, e) => s + e.hours, 0) / entries.length : 0;
  const sleepScore = Math.round(Math.min(100, (avgHours / 8) * 60 + (quality / 5) * 40));

  const handleLog = () => {
    const entry: SleepEntry = {
      date: new Date().toLocaleDateString('en', { weekday: 'short' }),
      bedtime, wake_time: wakeTime, hours, quality, notes,
    };
    setEntries(prev => [entry, ...prev.slice(0, 6)]);
    setSaved(true);
    setShowForm(false);
    setTimeout(() => setSaved(false), 3000);
    // Try API
    api.post('/api/health-logs/checkin', { sleep_hours: hours }).catch(() => {});
  };

  const chartData = entries.slice(0, 7).reverse().map(e => ({ name: e.date, hours: +e.hours.toFixed(1), quality: e.quality }));

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--purple-glow)]/10 border border-[var(--purple-glow)]/30 text-[var(--purple-glow)] text-xs font-mono-num mb-2">
            <Moon className="w-3.5 h-3.5" /> SLEEP TRACKER
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Sleep Intelligence</h1>
          <p className="text-[color:var(--text-muted)] text-sm mt-1">Track your rest, optimize your heart health.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all cursor-pointer">
          <Plus className="w-4 h-4" /> Log Sleep
        </button>
      </div>

      {saved && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[var(--green-healthy)]/15 border border-[var(--green-healthy)]/30 text-[var(--green-healthy)] text-sm font-mono-num animate-fadeIn">
          ✓ Sleep logged successfully! +50 XP earned.
        </div>
      )}

      {/* Log Form */}
      {showForm && (
        <div className="glass-panel rounded-2xl p-6 mb-8 animate-fadeIn border border-[var(--purple-glow)]/20">
          <h3 className="font-heading font-bold text-lg text-[color:var(--text-main)] mb-5">Log Last Night's Sleep</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-2 block">Bedtime</label>
              <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-3 text-[color:var(--text-main)] font-mono-num text-sm focus:border-[var(--accent-cyan)] outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-2 block">Wake Time</label>
              <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-3 text-[color:var(--text-main)] font-mono-num text-sm focus:border-[var(--accent-cyan)] outline-none transition-colors" />
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[var(--accent-cyan)]/8 border border-[var(--accent-cyan)]/20 text-center">
            <span className="font-heading text-2xl font-bold text-[var(--accent-cyan)]">{hours}h</span>
            <span className="text-xs text-[color:var(--text-muted)] font-mono-num ml-2">total sleep</span>
          </div>

          <div className="mt-5">
            <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-3 block">Sleep Quality</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    quality === q ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]' : 'border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:border-[var(--accent-cyan)]/40'
                  }`}>
                  <div className="text-lg mb-0.5">{'⭐'.repeat(q)}</div>
                  <div>{QUALITY_LABELS[q]}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-2 block">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Dreams, disturbances, how you feel..."
              className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-3 text-[color:var(--text-main)] text-sm resize-none focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
          </div>

          <button onClick={handleLog}
            className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer">
            Save Sleep Entry
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Avg Sleep', value: `${avgHours.toFixed(1)}h`, icon: BedDouble, color: 'var(--accent-cyan)', sub: 'per night' },
          { label: 'Sleep Score', value: `${sleepScore}`, icon: Star, color: 'var(--purple-glow)', sub: 'out of 100' },
          { label: 'Best Night', value: `${Math.max(...entries.map(e => e.hours), 0).toFixed(1)}h`, icon: TrendingUp, color: 'var(--green-healthy)', sub: 'this week' },
          { label: 'Sleep Debt', value: `${Math.max(0, 8 - avgHours).toFixed(1)}h`, icon: Clock, color: 'var(--warning-amber)', sub: 'to recover' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-panel rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase">{stat.label}</span>
              </div>
              <p className="font-heading text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Chart + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <h3 className="font-heading font-bold text-[color:var(--text-main)] mb-4">Weekly Sleep Duration</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 12, color: 'var(--text-main)' }} />
              <ReferenceLine y={8} stroke="var(--green-healthy)" strokeDasharray="4 4" label={{ value: '8h goal', fill: 'var(--green-healthy)', fontSize: 10 }} />
              <Bar dataKey="hours" fill="var(--accent-cyan)" radius={[6, 6, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
          <SleepScoreRing score={sleepScore} />
          <div className="text-center">
            <p className="text-sm font-semibold text-[color:var(--text-main)]">
              {sleepScore >= 80 ? '😴 Excellent Sleep' : sleepScore >= 60 ? '🌙 Good Sleep' : '⚠️ Needs Improvement'}
            </p>
            <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">Based on duration & quality</p>
          </div>
        </div>
      </div>

      {/* Sleep Tips */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h3 className="font-heading font-bold text-[color:var(--text-main)]">Sleep Optimization Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tip: 'Consistent schedule', desc: 'Sleep and wake at the same time every day, even weekends.', icon: '🕙' },
            { tip: 'Cool dark room', desc: 'Optimal sleep temperature is 65–68°F (18–20°C). Block all light.', icon: '🌙' },
            { tip: 'No screens 1hr before', desc: 'Blue light suppresses melatonin. Use night mode or blue-light glasses.', icon: '📱' },
          ].map(t => (
            <div key={t.tip} className="p-4 rounded-xl bg-[color:var(--card-hover)] border border-[color:var(--glass-border)]">
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="text-sm font-semibold text-[color:var(--text-main)] mb-1">{t.tip}</p>
              <p className="text-xs text-[color:var(--text-muted)]">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
