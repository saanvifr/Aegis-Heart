// src/pages/WaterTrackerPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Droplets, Plus, Target, TrendingUp, Award, Lightbulb, Minus } from 'lucide-react';
import { api } from '../hooks/useApi';

const DAILY_GOAL = 2500;

interface WaterEntry {
  date: string;
  ml: number;
}

const tips = [
  'Start your day with 500ml of water before breakfast.',
  'Set hourly reminders — small sips add up fast.',
  'Drink a glass before every meal to aid digestion.',
  'Carry a reusable 1L bottle and aim to refill it 2-3x.',
  'Flavor water with lemon or mint to make it more appealing.',
  'Increase intake by 500ml per 30 min of exercise.',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-panel rounded-xl px-3 py-2 text-xs font-mono-num border border-[var(--glass-border)]">
        <p className="text-[var(--text-muted)]">{label}</p>
        <p className="text-[var(--accent-cyan)] font-bold">{payload[0].value} ml</p>
      </div>
    );
  }
  return null;
};

export const WaterTrackerPage: React.FC = () => {
  const [intake, setIntake] = useState(0);
  const [weeklyData, setWeeklyData] = useState<WaterEntry[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/api/health-logs/today');
        if (res) {
          setIntake(res.water_ml ?? 0);
        }
        const { data: trends } = await api.get('/api/health-logs/trends/weekly');
        if (trends?.dates) {
          const days = trends.dates.map((d: string, i: number) => ({ date: d.slice(-5), ml: trends.water?.[i] ?? 0 }));
          setWeeklyData(days);
        }
      } catch {
        // Fallback mock data
        const saved = localStorage.getItem('water_intake_' + today);
        setIntake(saved ? parseInt(saved) : 0);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setWeeklyData(days.map((d, i) => ({
          date: d,
          ml: [1800, 2200, 2500, 1600, 2800, 2100, 0][i] ?? 0,
        })));
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const addWater = async (ml: number) => {
    const newIntake = Math.min(intake + ml, 5000);
    setIntake(newIntake);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    localStorage.setItem('water_intake_' + today, String(newIntake));
    api.post('/api/water-tracker/log', { ml, date: today }).catch(() => {});
  };

  const resetIntake = () => {
    setIntake(0);
    localStorage.setItem('water_intake_' + today, '0');
  };

  const handleCustomAdd = () => {
    const val = parseInt(customInput);
    if (val > 0 && val <= 2000) {
      addWater(val);
      setCustomInput('');
      setShowCustom(false);
    }
  };

  const percent = Math.min((intake / DAILY_GOAL) * 100, 100);
  const glasses = Math.floor(intake / 250);
  const avgWeekly = weeklyData.length
    ? Math.round(weeklyData.reduce((s, d) => s + d.ml, 0) / weeklyData.length)
    : 0;

  const fillColor =
    percent < 40
      ? 'var(--danger-rose)'
      : percent < 70
      ? 'var(--warning-amber)'
      : 'var(--accent-cyan)';

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-5 h-5 text-[var(--accent-cyan)]" />
              <span className="text-xs font-mono-num text-[var(--text-muted)] uppercase tracking-widest">
                Hydration Command
              </span>
            </div>
            <h1 className="font-heading text-4xl font-extrabold text-[var(--text-main)]">
              Water Tracker
            </h1>
          </div>
          <button
            onClick={resetIntake}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-xs font-mono-num text-[var(--text-muted)] hover:text-[var(--danger-rose)] border border-[var(--glass-border)] transition-all"
          >
            <Minus className="w-3.5 h-3.5" /> Reset Today
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Water Bottle Visual */}
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-3xl p-8 flex flex-col items-center gap-6">
              <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase tracking-widest">
                Today's Intake
              </p>

              {/* Animated Water Bottle SVG */}
              <div className="relative w-32 h-64">
                <svg viewBox="0 0 100 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Bottle neck */}
                  <rect x="35" y="0" width="30" height="20" rx="6" fill="none"
                    stroke="var(--glass-border)" strokeWidth="2" />
                  {/* Bottle body outline */}
                  <path d="M15 30 Q10 35 10 45 L10 175 Q10 190 25 190 L75 190 Q90 190 90 175 L90 45 Q90 35 85 30 Z"
                    fill="none" stroke="var(--glass-border)" strokeWidth="2" />
                  {/* Cap on neck */}
                  <rect x="33" y="18" width="34" height="14" rx="4" fill="var(--accent-cyan)" opacity="0.6" />

                  {/* Water fill - animated */}
                  <clipPath id="bottleClip">
                    <path d="M15 30 Q10 35 10 45 L10 175 Q10 190 25 190 L75 190 Q90 190 90 175 L90 45 Q90 35 85 30 Z" />
                  </clipPath>
                  <motion.rect
                    x="10" width="80"
                    clipPath="url(#bottleClip)"
                    style={{ fill: fillColor, opacity: 0.75 }}
                    initial={{ y: 190, height: 0 }}
                    animate={{ y: 190 - (160 * percent / 100), height: 160 * percent / 100 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Wave effect */}
                  <motion.path
                    clipPath="url(#bottleClip)"
                    style={{ fill: fillColor, opacity: 0.4 }}
                    animate={{
                      d: [
                        `M10 ${190 - (160 * percent / 100)} Q30 ${188 - (160 * percent / 100)} 50 ${190 - (160 * percent / 100)} Q70 ${192 - (160 * percent / 100)} 90 ${190 - (160 * percent / 100)} L90 190 L10 190 Z`,
                        `M10 ${192 - (160 * percent / 100)} Q30 ${190 - (160 * percent / 100)} 50 ${188 - (160 * percent / 100)} Q70 ${190 - (160 * percent / 100)} 90 ${192 - (160 * percent / 100)} L90 190 L10 190 Z`,
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  {/* Bubble particles */}
                  {ripple && Array.from({ length: 4 }).map((_, i) => (
                    <motion.circle
                      key={i}
                      cx={30 + i * 15}
                      cy={190 - (160 * percent / 100) + 10}
                      r={2}
                      fill="white"
                      opacity={0.6}
                      initial={{ y: 0, opacity: 0.6 }}
                      animate={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.1 }}
                    />
                  ))}

                  {/* Percentage text */}
                  <text x="50" y="110" textAnchor="middle" fontSize="20" fontWeight="bold"
                    fill="var(--text-main)" fontFamily="Outfit, sans-serif">
                    {Math.round(percent)}%
                  </text>
                  <text x="50" y="128" textAnchor="middle" fontSize="8"
                    fill="var(--text-muted)" fontFamily="JetBrains Mono, monospace">
                    {intake}ml
                  </text>
                </svg>

                {/* Glow below */}
                <div
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full blur-xl opacity-60 transition-all"
                  style={{ background: fillColor }}
                />
              </div>

              {/* Progress bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-mono-num text-[var(--text-muted)]">
                  <span>{intake} ml consumed</span>
                  <span>Goal: {DAILY_GOAL} ml</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--glass-border)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${fillColor}, var(--accent-cyan))` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs font-mono-num text-[var(--text-muted)]">
                  <span>{glasses} / 8 glasses</span>
                  <span className="flex gap-1 ml-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span key={i} style={{ color: i < glasses ? 'var(--accent-cyan)' : 'var(--glass-border)' }}>●</span>
                    ))}
                  </span>
                </div>
              </div>

              {/* Add Buttons */}
              <div className="w-full space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addWater(250)}
                    className="glass-panel-interactive rounded-2xl py-3 flex flex-col items-center gap-1 border border-[var(--accent-cyan)]/30 hover:border-[var(--accent-cyan)]/60 transition-all"
                  >
                    <span className="text-2xl">🥃</span>
                    <span className="text-xs font-mono-num text-[var(--accent-cyan)] font-bold">+250 ml</span>
                    <span className="text-[10px] font-mono-num text-[var(--text-muted)]">Glass</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => addWater(500)}
                    className="glass-panel-interactive rounded-2xl py-3 flex flex-col items-center gap-1 border border-[var(--purple-glow)]/30 hover:border-[var(--purple-glow)]/60 transition-all"
                  >
                    <span className="text-2xl">🍶</span>
                    <span className="text-xs font-mono-num text-[var(--purple-glow)] font-bold">+500 ml</span>
                    <span className="text-[10px] font-mono-num text-[var(--text-muted)]">Bottle</span>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showCustom ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="number"
                        placeholder="Custom ml..."
                        value={customInput}
                        onChange={e => setCustomInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCustomAdd()}
                        className="flex-1 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-3 py-2 text-sm font-mono-num text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-cyan)]/50 placeholder-[var(--text-muted)]"
                      />
                      <button
                        onClick={handleCustomAdd}
                        className="px-4 py-2 rounded-xl text-sm font-mono-num font-bold text-white transition-all"
                        style={{ background: 'var(--accent-cyan)' }}
                      >
                        Add
                      </button>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowCustom(true)}
                      className="w-full glass-panel-interactive rounded-xl py-2 flex items-center justify-center gap-2 text-xs font-mono-num text-[var(--text-muted)] border border-[var(--glass-border)] hover:text-[var(--accent-cyan)] transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Custom Amount
                    </button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Today's Intake", value: `${intake}ml`, icon: Droplets, color: 'var(--accent-cyan)' },
                { label: 'Weekly Avg', value: `${avgWeekly}ml`, icon: TrendingUp, color: 'var(--purple-glow)' },
                { label: 'Goal Progress', value: `${Math.round(percent)}%`, icon: Target, color: 'var(--green-healthy)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass-panel rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <p className="font-heading font-bold text-xl text-[var(--text-main)]">{value}</p>
                  <p className="text-[10px] font-mono-num text-[var(--text-muted)] uppercase">{label}</p>
                </div>
              ))}
            </div>

            {/* Weekly Chart */}
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-[var(--accent-cyan)]" />
                <h3 className="font-heading font-bold text-lg text-[var(--text-main)]">Weekly History</h3>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barSize={28}>
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0, 3000]} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={DAILY_GOAL} stroke="var(--accent-cyan)" strokeDasharray="4 4" strokeOpacity={0.5} />
                  <Bar dataKey="ml" fill="var(--accent-cyan)" radius={[6, 6, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] font-mono-num text-[var(--text-muted)] text-center mt-2">
                — — Goal line: {DAILY_GOAL}ml
              </p>
            </div>

            {/* Hydration Tips */}
            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-[var(--warning-amber)]" />
                <h3 className="font-heading font-bold text-lg text-[var(--text-main)]">Hydration Tips</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-[var(--glass-border)]/30">
                    <Award className="w-4 h-4 mt-0.5 text-[var(--warning-amber)] shrink-0" />
                    <p className="text-xs font-mono-num text-[var(--text-muted)] leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
