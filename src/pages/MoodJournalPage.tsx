import React, { useState } from 'react';
import { Brain, Smile, Frown, Meh, Plus, Tag, Quote } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../hooks/useApi';

const MOODS = [
  { value: 1, emoji: '😞', label: 'Terrible', color: '#F43F5E' },
  { value: 2, emoji: '😕', label: 'Bad',      color: '#FB923C' },
  { value: 3, emoji: '😐', label: 'Okay',     color: '#FBBF24' },
  { value: 4, emoji: '😊', label: 'Good',     color: '#4ADE80' },
  { value: 5, emoji: '🤩', label: 'Amazing',  color: '#E879A0' },
];

const TAGS = ['Work', 'Family', 'Health', 'Exercise', 'Social', 'Sleep', 'Food', 'Relaxation'];

const QUOTES = [
  '"Take care of your body. It\'s the only place you have to live." — Jim Rohn',
  '"The greatest wealth is health." — Virgil',
  '"An apple a day keeps the doctor away." — Proverb',
  '"He who has health has hope; and he who has hope has everything." — Arabian Proverb',
];

const weeklyMoodData = [
  { day: 'Mon', mood: 3 }, { day: 'Tue', mood: 4 }, { day: 'Wed', mood: 2 },
  { day: 'Thu', mood: 4 }, { day: 'Fri', mood: 5 }, { day: 'Sat', mood: 4 }, { day: 'Sun', mood: 3 },
];

interface JournalEntry { date: string; mood: number; stress: number; content: string; tags: string[]; }

export const MoodJournalPage: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [stress, setStress] = useState<number>(5);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([
    { date: 'Yesterday', mood: 4, stress: 4, content: 'Had a great workout. Felt energized all day.', tags: ['Exercise', 'Health'] },
    { date: '2 days ago', mood: 3, stress: 6, content: 'Work was stressful but managed to relax in the evening.', tags: ['Work', 'Relaxation'] },
  ]);
  const [saved, setSaved] = useState(false);

  const currentMood = MOODS.find(m => m.value === selectedMood)!;
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const handleSave = () => {
    const entry: JournalEntry = {
      date: 'Today', mood: selectedMood, stress,
      content: content || `Feeling ${currentMood.label.toLowerCase()} today.`,
      tags: selectedTags,
    };
    setEntries(prev => [entry, ...prev]);
    setSaved(true);
    setContent(''); setSelectedTags([]);
    setTimeout(() => setSaved(false), 3000);
    api.post('/api/health-logs/checkin', { mood: selectedMood, stress_level: stress }).catch(() => {});
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] text-xs font-mono-num mb-2">
          <Brain className="w-3.5 h-3.5" /> MOOD & MENTAL WELLNESS
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Mood Journal</h1>
        <p className="text-[color:var(--text-muted)] text-sm mt-1">Emotional wellbeing is the foundation of heart health.</p>
      </div>

      {saved && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-[var(--green-healthy)]/15 border border-[var(--green-healthy)]/30 text-[var(--green-healthy)] text-sm font-mono-num animate-fadeIn">
          ✓ Journal entry saved! +25 XP earned.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Selector */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-heading font-bold text-[color:var(--text-main)] mb-4">How are you feeling today?</h3>
            <div className="flex gap-3 justify-between">
              {MOODS.map(m => (
                <button key={m.value} onClick={() => setSelectedMood(m.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedMood === m.value
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 scale-105'
                      : 'border-[color:var(--glass-border)] hover:border-[var(--accent-cyan)]/40 hover:scale-102'
                  }`}
                  style={{ borderColor: selectedMood === m.value ? m.color : undefined,
                           background: selectedMood === m.value ? `${m.color}15` : undefined }}>
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-[10px] font-mono-num font-semibold" style={{ color: selectedMood === m.value ? m.color : 'var(--text-muted)' }}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Mood indicator */}
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[color:var(--card-hover)] border border-[color:var(--glass-border)]">
              <span className="text-2xl">{currentMood.emoji}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: currentMood.color }}>Feeling {currentMood.label}</p>
                <p className="text-xs text-[color:var(--text-muted)] font-mono-num">Mood score: {selectedMood}/5</p>
              </div>
            </div>
          </div>

          {/* Stress + Journal */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase">Stress Level</label>
                <span className="text-sm font-bold text-[var(--accent-cyan)]">{stress}/10</span>
              </div>
              <input type="range" min={1} max={10} value={stress} onChange={e => setStress(+e.target.value)}
                className="w-full accent-[var(--accent-cyan)]" />
              <div className="flex justify-between text-[10px] text-[color:var(--text-muted)] font-mono-num mt-1">
                <span>Calm</span><span>Moderate</span><span>Very Stressed</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-2 block">Today's Journal Entry</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={4}
                placeholder="What's on your mind? How did your day go? Any health wins?"
                className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-4 py-3 text-[color:var(--text-main)] text-sm resize-none focus:border-[var(--accent-cyan)] outline-none transition-colors placeholder:text-[color:var(--text-muted)]" />
              <div className="text-right text-[10px] text-[color:var(--text-muted)] font-mono-num mt-1">{content.length}/500</div>
            </div>

            <div className="mt-4">
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-mono-num border transition-all cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)] text-[var(--accent-cyan)]'
                        : 'border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:border-[var(--accent-cyan)]/40'
                    }`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSave}
              className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer">
              Save Journal Entry
            </button>
          </div>
        </div>

        {/* Right: Charts + History */}
        <div className="space-y-6">
          {/* Mood Chart */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="font-heading font-bold text-[color:var(--text-main)] text-sm mb-3">7-Day Mood Trend</h3>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={weeklyMoodData}>
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[1, 5]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 11 }} />
                <Line type="monotone" dataKey="mood" stroke="var(--accent-cyan)" strokeWidth={2.5} dot={{ fill: 'var(--accent-cyan)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Inspirational Quote */}
          <div className="glass-panel rounded-2xl p-5 border border-[var(--accent-cyan)]/20">
            <Quote className="w-5 h-5 text-[var(--accent-cyan)] mb-3 opacity-60" />
            <p className="text-xs text-[color:var(--text-muted)] italic leading-relaxed">{quote}</p>
          </div>

          {/* Recent Entries */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="font-heading font-bold text-[color:var(--text-main)] text-sm mb-3">Recent Entries</h3>
            <div className="space-y-3">
              {entries.map((e, i) => {
                const mood = MOODS.find(m => m.value === e.mood)!;
                return (
                  <div key={i} className="p-3 rounded-xl bg-[color:var(--card-hover)] border border-[color:var(--glass-border)]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{mood.emoji}</span>
                        <span className="text-xs font-semibold" style={{ color: mood.color }}>{mood.label}</span>
                      </div>
                      <span className="text-[10px] text-[color:var(--text-muted)] font-mono-num">{e.date}</span>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)] line-clamp-2">{e.content}</p>
                    {e.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {e.tags.map(t => <span key={t} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] font-mono-num">{t}</span>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
