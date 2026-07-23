import React, { useState } from 'react';
import { GlassPanel } from '../components/UI/GlassPanel';
import { Clock, Calendar as CalendarIcon, BookOpen, Plus, Smile, Droplets, Moon, Check } from 'lucide-react';

export const CalendarJournalPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(21);
  const [mood, setMood] = useState('Optimal');
  const [waterLiters, setWaterLiters] = useState(2.5);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [journalNotes, setJournalNotes] = useState('Completed morning 5km jog. Felt energetic with zero angina symptoms.');
  const [savedLogs, setSavedLogs] = useState<any[]>([
    { day: 21, mood: 'Optimal', water: 2.5, sleep: 7.5, notes: 'Completed morning 5km jog. Zero symptoms.' },
    { day: 20, mood: 'Normal', water: 2.0, sleep: 7.0, notes: 'Routine workday. Balanced diet.' },
    { day: 19, mood: 'Stressed', water: 1.5, sleep: 6.0, notes: 'High workload, slight tension.' },
  ]);

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = { day: selectedDay, mood, water: waterLiters, sleep: sleepHours, notes: journalNotes };
    setSavedLogs((prev) => [newLog, ...prev.filter((l) => l.day !== selectedDay)]);
  };

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] text-xs font-mono-num mb-3 border border-[var(--accent-cyan)]/30">
          <Clock className="w-3.5 h-3.5" />
          <span>SMART HEALTH CALENDAR & DAILY DIGITAL JOURNAL</span>
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[color:var(--text-main)]">
          HEALTH CALENDAR & JOURNAL
        </h2>
        <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">
          Track daily mood, hydration, sleep duration, and clinical symptoms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Interactive Monthly Calendar */}
        <GlassPanel glow="cyan" title="July 2026 Calendar" subtitle="Interactive Health Tracker" icon={CalendarIcon} className="lg:col-span-6">
          <div className="grid grid-cols-7 gap-2 text-center font-mono-num text-xs mt-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="text-[color:var(--text-muted)] font-bold py-1">{d}</div>
            ))}
            {daysInMonth.map((d) => {
              const hasLog = savedLogs.some((l) => l.day === d);
              const isSelected = selectedDay === d;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent-cyan)] text-[#000000] border-[var(--accent-cyan)] shadow-[0_0_15px_var(--accent-cyan)]'
                      : hasLog
                      ? 'bg-[var(--green-healthy)]/20 text-[var(--green-healthy)] border-[var(--green-healthy)]/40'
                      : 'bg-[color:var(--glass-border)] text-[color:var(--text-muted)] border-[color:var(--glass-border)] hover:border-white/30'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </GlassPanel>

        {/* Right: Daily Journal Entry Form */}
        <GlassPanel glow="purple" title={`Daily Journal — July ${selectedDay}, 2026`} subtitle="Log Biometrics & Symptoms" icon={BookOpen} className="lg:col-span-6">
          <form onSubmit={handleSaveJournal} className="space-y-4 font-mono-num text-xs">
            <div>
              <label className="text-[color:var(--text-muted)] block mb-1">MOOD & ENERGY STATE</label>
              <div className="grid grid-cols-3 gap-2">
                {['Optimal', 'Normal', 'Stressed'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-2 rounded-xl border text-xs font-semibold ${
                      mood === m ? 'bg-[var(--accent-cyan)]/20 border-[var(--accent-cyan)] text-[var(--accent-cyan)]' : 'bg-[color:var(--glass-border)] border-[color:var(--glass-border)] text-[color:var(--text-muted)]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[color:var(--text-muted)] block mb-1">HYDRATION (LITERS)</label>
                <input
                  type="number"
                  step="0.5"
                  value={waterLiters}
                  onChange={(e) => setWaterLiters(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)] outline-none focus:border-[var(--accent-cyan)]"
                />
              </div>

              <div>
                <label className="text-[color:var(--text-muted)] block mb-1">SLEEP DURATION (HOURS)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)] outline-none focus:border-[var(--accent-cyan)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[color:var(--text-muted)] block mb-1">DAILY CLINICAL NOTES & SYMPTOMS</label>
              <textarea
                rows={3}
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] text-[color:var(--text-main)] outline-none focus:border-[var(--accent-cyan)] text-xs resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-[color:var(--text-main)] hover:opacity-90 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,245,255,0.3)]"
            >
              SAVE DAILY JOURNAL ENTRY
            </button>
          </form>
        </GlassPanel>

      </div>

    </div>
  );
};
