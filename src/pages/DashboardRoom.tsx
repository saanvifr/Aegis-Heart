import React, { useState, useEffect } from 'react';
import { HolographicChamber } from '../components/3D/HolographicChamber';
import { RiskRing } from '../components/UI/RiskRing';
import { MetricCapsule } from '../components/UI/MetricCapsule';
import { GlassPanel } from '../components/UI/GlassPanel';
import { ShapFactorChart } from '../components/Charts/CustomGlassCharts';
import { XPProgressBar } from '../components/UI/XPProgressBar';
import { StreakBadge } from '../components/UI/StreakBadge';
import { HeartAgeReveal } from '../components/AI/HeartAgeReveal';
import { LiveECGStrip } from '../components/UI/LiveECGStrip';
import {
  Heart, Activity, Flame, ShieldAlert, Cpu,
  Sparkles, Sliders, Droplets, BedDouble, Brain,
  Target, Trophy, ArrowRight, Plus, CheckCircle, RefreshCw
} from 'lucide-react';
import { AssessmentFormData } from './AssessmentRoom';
import { useAuth } from '../context/AuthContext';
import { api } from '../hooks/useApi';

interface PredictionResult {
  risk_percentage: number;
  risk_category: string;
  confidence_score: number;
  health_score?: number;
  digital_twin_state: 'healthy' | 'warning' | 'critical';
  recommendation: string;
  shap_factors: Array<{ feature: string; impact_percentage: number; direction: 'increase' | 'decrease'; title: string; description: string }>;
}

interface DashboardRoomProps {
  formData: AssessmentFormData;
  prediction: PredictionResult | null;
  onNavigate: (room: string) => void;
}

// Daily Check-In Modal
const DailyCheckInModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ sleep_hours: 7, water_ml: 1500, mood: 3, stress_level: 5, exercise_minutes: 30, systolic_bp: 120, diastolic_bp: 80, weight_kg: 70 });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/health-logs/checkin', form);
    } catch { /* Offline — save locally */ }
    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--bg-dark)]/85 backdrop-blur-2xl">
      <div className="glass-panel rounded-2xl p-6 w-full max-w-lg mx-4 animate-fadeIn border border-[var(--accent-cyan)]/25 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-xl bg-[var(--accent-cyan)]/15"><Heart className="w-5 h-5 text-[var(--accent-cyan)]" /></div>
          <div>
            <h3 className="font-heading font-bold text-[color:var(--text-main)]">Daily Health Check-In</h3>
            <p className="text-xs text-[color:var(--text-muted)] font-mono-num">+50 XP for completing today's log</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Sleep */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5" />Sleep Hours</label>
              <span className="text-xs font-bold text-[var(--accent-cyan)]">{form.sleep_hours}h</span>
            </div>
            <input type="range" min={3} max={12} step={0.5} value={form.sleep_hours} onChange={e => setForm(p => ({ ...p, sleep_hours: +e.target.value }))} className="w-full" />
          </div>

          {/* Water */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" />Water Intake</label>
              <span className="text-xs font-bold text-[var(--accent-cyan)]">{form.water_ml}ml</span>
            </div>
            <input type="range" min={0} max={4000} step={250} value={form.water_ml} onChange={e => setForm(p => ({ ...p, water_ml: +e.target.value }))} className="w-full" />
          </div>

          {/* Mood */}
          <div>
            <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase mb-2 flex items-center gap-1.5 block"><Brain className="w-3.5 h-3.5" />Today's Mood</label>
            <div className="flex gap-2">
              {[{ v: 1, e: '😞' }, { v: 2, e: '😕' }, { v: 3, e: '😐' }, { v: 4, e: '😊' }, { v: 5, e: '🤩' }].map(m => (
                <button key={m.v} onClick={() => setForm(p => ({ ...p, mood: m.v }))}
                  className={`flex-1 py-2 rounded-xl text-xl border transition-all cursor-pointer ${form.mood === m.v ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 scale-110' : 'border-[color:var(--glass-border)] hover:scale-105'}`}>
                  {m.e}
                </button>
              ))}
            </div>
          </div>

          {/* Stress */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-xs text-[color:var(--text-muted)] font-mono-num uppercase">Stress Level</label>
              <span className="text-xs font-bold text-[var(--accent-cyan)]">{form.stress_level}/10</span>
            </div>
            <input type="range" min={1} max={10} value={form.stress_level} onChange={e => setForm(p => ({ ...p, stress_level: +e.target.value }))} className="w-full" />
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            {([['exercise_minutes', 'Exercise (min)', 'min'], ['weight_kg', 'Weight', 'kg']] as const).map(([field, label, unit]) => (
              <div key={field}>
                <label className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-1 block">{label}</label>
                <input type="number" value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: +e.target.value }))}
                  className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-xl px-3 py-2 text-sm text-[color:var(--text-main)] focus:border-[var(--accent-cyan)] outline-none" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[color:var(--glass-border)] text-[color:var(--text-muted)] text-sm hover:border-[var(--accent-cyan)]/40 transition-all cursor-pointer">Skip</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white font-semibold text-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-60">
            {saving ? 'Saving...' : 'Save (+50 XP)'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick Action Tile
const QuickTile: React.FC<{ icon: React.FC<any>; label: string; sub: string; color: string; onClick: () => void }> = ({ icon: Icon, label, sub, color, onClick }) => (
  <button onClick={onClick}
    className="glass-panel-interactive p-4 rounded-2xl flex flex-col items-start gap-2 cursor-pointer group w-full text-left">
    <div className="p-2 rounded-xl transition-transform group-hover:scale-110" style={{ background: `${color}18` }}>
      <Icon className="w-4 h-4" style={{ color }} />
    </div>
    <div>
      <p className="text-xs font-semibold text-[color:var(--text-main)]">{label}</p>
      <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">{sub}</p>
    </div>
  </button>
);

export const DashboardRoom: React.FC<DashboardRoomProps> = ({ formData, prediction, onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [showCheckin, setShowCheckin] = useState(false);
  const [checkinDone, setCheckinDone] = useState(false);
  const [dashData, setDashData] = useState<any>(null);
  const [loadingDash, setLoadingDash] = useState(true);

  // Merge API prediction with local prediction (local takes priority as newest)
  const apiPrediction = dashData?.latest_prediction;
  const activePrediction = prediction ?? apiPrediction;

  const riskPct    = activePrediction?.risk_percentage ?? 18.5;
  const category   = activePrediction?.risk_category ?? 'Low Risk';
  const confidence = activePrediction?.confidence_score ?? 94.8;
  const twinState  = activePrediction?.digital_heart_state ?? activePrediction?.digital_twin_state ?? 'healthy';
  const healthScore = activePrediction?.health_score ?? Math.round(100 - riskPct * 0.85);

  const defaultShap = [
    { feature: 'Systolic_BP', impact_percentage: 18.5, direction: 'increase' as const, title: 'Systolic Blood Pressure', description: 'Elevates cardiovascular strain.' },
    { feature: 'Exercise_Hours', impact_percentage: 12.0, direction: 'decrease' as const, title: 'Aerobic Exercise', description: 'Mitigates cardiac workload.' },
  ];
  const shapFactors = activePrediction?.shap_factors ?? defaultShap;

  useEffect(() => {
    const fetchDash = async () => {
      setLoadingDash(true);
      const { data } = await api.get('/api/dashboard/overview');
      if (data) {
        setDashData(data);
        // Use server-authoritative today_checkin status
        if (data.today_checkin) {
          setCheckinDone(true);
        } else {
          // Show check-in prompt after 1.5s
          setTimeout(() => setShowCheckin(true), 1500);
        }
      } else {
        // Offline fallback: use localStorage
        const done = localStorage.getItem('aegis_checkin_' + new Date().toDateString());
        if (!done) setTimeout(() => setShowCheckin(true), 1500);
        else setCheckinDone(true);
      }
      setLoadingDash(false);
    };
    fetchDash();
  }, []);

  const handleCheckinSaved = () => {
    setCheckinDone(true);
    localStorage.setItem('aegis_checkin_' + new Date().toDateString(), '1');
    // Refresh user XP/streak after checkin
    refreshUser().catch(() => {});
  };

  const streak = dashData?.user?.streak ?? user?.streak_days ?? 0;
  const xp     = dashData?.user?.xp ?? user?.xp ?? 0;
  const level  = dashData?.user?.level ?? user?.level ?? 'Beginner';

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 max-w-7xl mx-auto">
      {showCheckin && <DailyCheckInModal onClose={() => setShowCheckin(false)} onSave={handleCheckinSaved} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[color:var(--text-muted)] text-sm font-mono-num mb-0.5">{greeting}, {user?.name?.split(' ')[0] ?? 'Researcher'}</p>
          <h1 className="font-heading text-3xl font-extrabold text-[color:var(--text-main)]">Cardiovascular Dashboard</h1>
          <p className="text-[color:var(--text-muted)] text-sm mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge streak={streak} />
          {!checkinDone ? (
            <button onClick={() => setShowCheckin(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white text-xs font-semibold shadow-lg hover:opacity-90 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Daily Check-In
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--green-healthy)]/15 border border-[var(--green-healthy)]/30 text-[var(--green-healthy)] text-xs font-mono-num">
              <CheckCircle className="w-3.5 h-3.5" /> Checked In Today
            </div>
          )}
          <button onClick={() => onNavigate('assessment')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] text-xs font-mono-num hover:bg-[var(--accent-cyan)]/10 transition-all cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Re-Assess
          </button>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-6">
        <XPProgressBar xp={xp} level={level} />
      </div>

      {/* Stat Capsules */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCapsule label="RISK SCORE" value={`${riskPct.toFixed(1)}%`} icon={ShieldAlert} statusColor={riskPct < 25 ? 'green' : riskPct < 60 ? 'amber' : 'red'} trend={category} />
        <MetricCapsule label="HEALTH SCORE" value={healthScore} unit="/100" icon={Heart} statusColor="cyan" subtext="AI Generated" />
        <MetricCapsule label="BLOOD PRESSURE" value={`${formData.Systolic_BP}/${formData.Diastolic_BP}`} unit="mmHg" icon={Activity} statusColor={formData.Systolic_BP > 140 ? 'red' : 'purple'} subtext="Hemodynamic" />
        <MetricCapsule label="CHOLESTEROL" value={formData.Cholesterol} unit="mg/dL" icon={Flame} statusColor="amber" subtext="Serum Lipid" />
      </div>

      {/* Live ECG Strip */}
      <div className="glass-panel rounded-2xl p-4 mb-8">
        <LiveECGStrip riskScore={riskPct} showStats />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* 3D Heart Twin */}
        <GlassPanel glow="cyan" className="lg:col-span-7 h-[460px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading font-bold text-lg text-[color:var(--text-main)]">3D Digital Heart Twin</h3>
              <p className="text-xs text-[color:var(--text-muted)] font-mono-num">PARAMETRIC GEOMETRY · REAL-TIME WEBGL</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-mono-num border ${
              twinState === 'critical' ? 'bg-[var(--danger-rose)]/15 border-[var(--danger-rose)]/30 text-[var(--danger-rose)]' :
              twinState === 'warning'  ? 'bg-[var(--warning-amber)]/15 border-[var(--warning-amber)]/30 text-[var(--warning-amber)]' :
              'bg-[var(--green-healthy)]/15 border-[var(--green-healthy)]/30 text-[var(--green-healthy)]'
            }`}>{twinState.toUpperCase()}</span>
          </div>
          <div className="flex-1 min-h-0">
            <HolographicChamber riskState={twinState} riskScore={riskPct} />
          </div>
        </GlassPanel>

        {/* Right column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <GlassPanel glow="purple">
            <RiskRing percentage={riskPct} category={category} confidence={confidence} />
          </GlassPanel>

          {/* Heart Age Reveal — the showstopper */}
          <HeartAgeReveal
            chronologicalAge={formData.Age}
            riskScore={riskPct}
            bmi={formData.BMI}
            systolicBP={formData.Systolic_BP}
            smoking={formData.Smoking === 1}
            exercise={formData.Exercise_Hours_Per_Week ?? 3.5}
            sleepHours={formData.Sleep_Hours_Per_Day ?? 7}
            cholesterol={formData.Cholesterol}
          />

          <GlassPanel title="AI Feature Attribution" subtitle="SHAP Explainability" icon={Cpu}>
            <ShapFactorChart factors={shapFactors} />
          </GlassPanel>
        </div>
      </div>

      {/* AI Recommendation */}
      <GlassPanel glow="green" title="AI Clinical Recommendation" icon={Sparkles} className="mb-8">
        <p className="text-sm text-[color:var(--text-muted)] leading-relaxed">
          {prediction?.recommendation || 'Based on your biometrics, maintain regular cardiovascular exercise (150 min/week), optimize sleep to 7–8 hours, and schedule routine preventive screening.'}
        </p>
      </GlassPanel>

      {/* Quick Nav Grid */}
      <div>
        <h2 className="font-heading font-bold text-xl text-[color:var(--text-main)] mb-4">Health Modules</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Droplets,  label: 'Water',       sub: 'Hydration',   color: '#38BDF8', room: 'water'   },
            { icon: BedDouble, label: 'Sleep',        sub: 'Rest Quality',color: '#8B5CF6', room: 'sleep'   },
            { icon: Brain,     label: 'Mood',         sub: 'Wellness',    color: '#E879A0', room: 'mood'    },
            { icon: Target,    label: 'Goals',        sub: 'Progress',    color: '#4ADE80', room: 'goals'   },
            { icon: Trophy,    label: 'Achievements', sub: 'Badges & XP', color: '#F59E0B', room: 'achievements' },
            { icon: Sliders,   label: 'Simulate',     sub: 'Lifestyle',   color: '#FB923C', room: 'simulator'},
          ].map(t => <QuickTile key={t.room} icon={t.icon} label={t.label} sub={t.sub} color={t.color} onClick={() => onNavigate(t.room)} />)}
        </div>
      </div>
    </div>
  );
};
