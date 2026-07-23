import React, { useState } from 'react';
import { Activity, Heart, Target, Trophy, Droplets, BedDouble, Brain, Filter } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'prediction' | 'checkin' | 'goal' | 'achievement' | 'water' | 'sleep' | 'mood';
  title: string;
  summary: string;
  value?: string;
  color: string;
}

const TYPE_CONFIG = {
  prediction:  { icon: Activity, color: '#E879A0', label: 'Risk Assessment' },
  checkin:     { icon: Heart,    color: '#38BDF8', label: 'Daily Check-In' },
  goal:        { icon: Target,   color: '#4ADE80', label: 'Goal' },
  achievement: { icon: Trophy,   color: '#F59E0B', label: 'Achievement' },
  water:       { icon: Droplets, color: '#06D6A0', label: 'Hydration' },
  sleep:       { icon: BedDouble,color: '#8B5CF6', label: 'Sleep' },
  mood:        { icon: Brain,    color: '#E879A0', label: 'Mood' },
};

const SAMPLE_EVENTS: TimelineEvent[] = [
  { id: '1', date: 'Today',       time: '09:14', type: 'prediction',  title: 'Risk Assessment Completed', summary: 'Low cardiovascular risk detected.', value: '18.5% risk',  color: '#E879A0' },
  { id: '2', date: 'Today',       time: '08:30', type: 'checkin',     title: 'Morning Check-In',           summary: 'Sleep 7h · Water 500ml · Mood Good', value: '+50 XP',    color: '#38BDF8' },
  { id: '3', date: 'Yesterday',   time: '20:00', type: 'achievement', title: 'Badge Unlocked: 7-Day Warrior', summary: 'Maintained a 7-day health streak!', value: '+200 XP', color: '#F59E0B' },
  { id: '4', date: 'Yesterday',   time: '15:30', type: 'goal',        title: 'Goal Completed: 2.5L Water',  summary: 'Reached daily hydration target.',   value: '+150 XP',   color: '#4ADE80' },
  { id: '5', date: 'Yesterday',   time: '07:45', type: 'checkin',     title: 'Morning Check-In',            summary: 'Sleep 8h · Water 2500ml · Mood Amazing', value: '+50 XP', color: '#38BDF8' },
  { id: '6', date: '2 days ago',  time: '21:00', type: 'sleep',       title: 'Sleep Logged',                summary: '8.5h sleep, Quality: Amazing', value: '8.5h',        color: '#8B5CF6' },
  { id: '7', date: '2 days ago',  time: '13:00', type: 'prediction',  title: 'Risk Assessment Completed',  summary: 'Medium risk — blood pressure elevated.', value: '38.2% risk', color: '#FBBF24' },
  { id: '8', date: '3 days ago',  time: '09:00', type: 'mood',        title: 'Mood Logged: Amazing 🤩',    summary: 'Great energy, low stress.', value: '5/5',            color: '#E879A0' },
  { id: '9', date: '5 days ago',  time: '11:00', type: 'achievement', title: 'Badge: Hydration Hero',       summary: 'Hit water goal 5 days in a row!', value: '+150 XP',   color: '#F59E0B' },
  { id: '10', date: '7 days ago', time: '08:30', type: 'checkin',     title: 'Morning Check-In',            summary: 'Sleep 6h · Water 1500ml · Mood Okay', value: '+50 XP', color: '#38BDF8' },
];

export const TimelineRoom: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = ['all', 'prediction', 'checkin', 'goal', 'achievement'];
  const events = activeFilter === 'all' ? SAMPLE_EVENTS : SAMPLE_EVENTS.filter(e => e.type === activeFilter);

  // Group by date
  const groups = events.reduce<Record<string, TimelineEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] text-xs font-mono-num mb-2">
          <Activity className="w-3.5 h-3.5" /> HEALTH TIMELINE
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Health Timeline</h1>
        <p className="text-[color:var(--text-muted)] text-sm mt-1">Every prediction, check-in, goal and achievement in chronological order.</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <Filter className="w-4 h-4 text-[color:var(--text-muted)]" />
        {filters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono-num capitalize transition-all cursor-pointer border ${
              activeFilter === f
                ? 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)]'
                : 'border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:border-[var(--accent-cyan)]/30 hover:text-[color:var(--text-main)]'
            }`}>{f === 'all' ? 'All Events' : TYPE_CONFIG[f as keyof typeof TYPE_CONFIG]?.label ?? f}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(groups).map(([date, dateEvents]) => (
          <div key={date}>
            {/* Date label */}
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 rounded-full bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-xs font-mono-num text-[color:var(--text-muted)] uppercase tracking-wider">
                {date}
              </div>
              <div className="flex-1 h-px bg-[color:var(--glass-border)]" />
            </div>

            {/* Events for this date */}
            <div className="relative pl-8 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-3 top-0 bottom-0 w-px bg-[color:var(--glass-border)]" />

              {dateEvents.map(event => {
                const config = TYPE_CONFIG[event.type];
                const Icon = config.icon;
                return (
                  <div key={event.id} className="relative animate-fadeIn">
                    {/* Node */}
                    <div className="absolute -left-5 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: config.color, background: `${config.color}20` }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
                    </div>

                    {/* Card */}
                    <div className="glass-panel-interactive rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${config.color}18` }}>
                            <Icon className="w-4 h-4" style={{ color: config.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold text-[color:var(--text-main)]">{event.title}</p>
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-mono-num" style={{ background: `${config.color}18`, color: config.color }}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-xs text-[color:var(--text-muted)]">{event.summary}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {event.value && (
                            <p className="text-xs font-bold font-mono-num" style={{ color: config.color }}>{event.value}</p>
                          )}
                          <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num mt-0.5">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-[color:var(--text-muted)] font-mono-num text-sm">No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
