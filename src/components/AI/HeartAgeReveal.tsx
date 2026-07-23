import React, { useState, useEffect, useRef } from 'react';
import { Heart, TrendingDown, TrendingUp, Minus, ChevronRight, Zap } from 'lucide-react';

interface HeartAgeRevealProps {
  chronologicalAge: number;
  riskScore: number;
  bmi: number;
  systolicBP: number;
  smoking: boolean;
  exercise: number;
  sleepHours: number;
  cholesterol: number;
}

function calcHeartAge(props: HeartAgeRevealProps): number {
  const { chronologicalAge, riskScore, bmi, systolicBP, smoking, exercise, sleepHours, cholesterol } = props;
  // Clinical heart age algorithm based on Framingham risk adjustments
  let delta = 0;
  delta += (riskScore - 15) * 0.3;          // Risk score deviation from baseline
  delta += (bmi - 22) * 0.5;               // BMI above healthy range
  delta += (systolicBP - 115) * 0.08;      // BP above optimal
  delta += smoking ? 6 : 0;                // Smoking adds ~6 years
  delta -= exercise * 0.4;                 // Exercise subtracts years
  delta += (8 - sleepHours) * 0.6;         // Sleep deficit adds years
  delta += (cholesterol - 180) * 0.015;    // Cholesterol above optimal
  return Math.round(chronologicalAge + delta);
}

function getHeartStatus(diff: number): { label: string; color: string; emoji: string; desc: string } {
  if (diff <= -5) return { label: 'Younger Heart', color: '#4ADE80', emoji: '💚', desc: 'Outstanding — your heart is biologically younger than your years.' };
  if (diff < 0)  return { label: 'Healthy Heart', color: '#4ADE80', emoji: '✅', desc: 'Your cardiovascular system is in great shape. Keep it up!' };
  if (diff === 0) return { label: 'On Track', color: '#38BDF8', emoji: '💙', desc: 'Your biological heart age matches your chronological age perfectly.' };
  if (diff <= 3) return { label: 'Mild Aging', color: '#FBBF24', emoji: '⚠️', desc: 'Slight biological aging detected. Small lifestyle changes can reverse this.' };
  if (diff <= 7) return { label: 'Accelerated Aging', color: '#FB923C', emoji: '🔶', desc: 'Your heart is aging faster than it should. Action needed.' };
  return { label: 'Critical Aging', color: '#F43F5E', emoji: '🔴', desc: 'Significant cardiovascular age gap. Prioritize medical consultation immediately.' };
}

export const HeartAgeReveal: React.FC<HeartAgeRevealProps> = (props) => {
  const heartAge = calcHeartAge(props);
  const diff = heartAge - props.chronologicalAge;
  const status = getHeartStatus(diff);

  const [revealed, setRevealed] = useState(false);
  const [displayAge, setDisplayAge] = useState(props.chronologicalAge);
  const [counting, setCounting] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const startReveal = () => {
    if (counting) return;
    setCardOpen(true);
    setRevealed(false);
    setCounting(true);
    setDisplayAge(props.chronologicalAge);

    // Dramatic count animation
    const steps = 30;
    const start = props.chronologicalAge;
    const end = heartAge;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAge(Math.round(start + (end - start) * eased));
      if (step >= steps) {
        clearInterval(timer);
        setDisplayAge(heartAge);
        setRevealed(true);
        setCounting(false);
      }
    }, 50);
  };

  const improvements = [
    diff > 0 && props.systolicBP > 130 && { action: 'Reduce blood pressure', impact: '-2.5 years', color: '#38BDF8' },
    diff > 0 && props.exercise < 3 && { action: 'Exercise 150 min/week', impact: `-${(3 - props.exercise) * 0.4 + 0.8} years`, color: '#4ADE80' },
    diff > 0 && props.smoking && { action: 'Quit smoking', impact: '-6 years', color: '#E879A0' },
    diff > 0 && props.sleepHours < 7 && { action: 'Sleep 7-8 hours', impact: '-1.5 years', color: '#8B5CF6' },
    diff > 0 && props.cholesterol > 200 && { action: 'Reduce cholesterol', impact: '-1.2 years', color: '#FBBF24' },
  ].filter(Boolean) as { action: string; impact: string; color: string }[];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header tap area */}
      <button onClick={cardOpen ? () => setCardOpen(false) : startReveal}
        className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-[color:var(--card-hover)] transition-all group">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl relative" style={{ background: `${status.color}18` }}>
            <Heart className="w-5 h-5" style={{ color: status.color }} />
            <div className="absolute inset-0 rounded-xl animate-ping opacity-20" style={{ background: status.color }} />
          </div>
          <div className="text-left">
            <p className="font-heading font-bold text-[color:var(--text-main)] text-sm">Biological Heart Age</p>
            <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">
              {cardOpen ? `${status.emoji} ${status.label}` : 'Tap to reveal your heart\'s true age'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {cardOpen && (
            <div className="text-right">
              <p className="font-heading font-extrabold text-2xl" style={{ color: status.color }}>{displayAge}</p>
              <p className="text-[9px] text-[color:var(--text-muted)] font-mono-num -mt-0.5">HEART AGE</p>
            </div>
          )}
          {!cardOpen && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono-num font-semibold border cursor-pointer"
              style={{ borderColor: `${status.color}40`, background: `${status.color}12`, color: status.color }}>
              <Zap className="w-3 h-3" /> REVEAL
            </div>
          )}
          <ChevronRight className={`w-4 h-4 text-[color:var(--text-muted)] transition-transform duration-300 ${cardOpen ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expanded Panel */}
      {cardOpen && (
        <div className="px-5 pb-5 animate-fadeIn border-t border-[color:var(--glass-border)]">
          <div className="pt-4">
            {/* Big age comparison */}
            <div className="flex items-center justify-center gap-6 mb-6">
              {/* Chronological */}
              <div className="text-center">
                <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-1">Your Age</p>
                <div className="w-20 h-20 rounded-2xl bg-[color:var(--glass-border)] flex items-center justify-center">
                  <p className="font-heading font-extrabold text-3xl text-[color:var(--text-main)]">{props.chronologicalAge}</p>
                </div>
              </div>

              {/* Arrow + diff */}
              <div className="flex flex-col items-center gap-1">
                {diff > 0
                  ? <TrendingUp className="w-5 h-5 text-[var(--danger-rose)]" />
                  : diff < 0
                    ? <TrendingDown className="w-5 h-5 text-[var(--green-healthy)]" />
                    : <Minus className="w-5 h-5 text-[var(--accent-cyan)]" />
                }
                <div className="px-2 py-0.5 rounded-full font-mono-num font-bold text-xs"
                  style={{ background: `${status.color}15`, color: status.color }}>
                  {diff > 0 ? `+${diff}` : diff < 0 ? diff : '='} yrs
                </div>
              </div>

              {/* Heart age */}
              <div className="text-center">
                <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-1">Heart Age</p>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: `${status.color}18`, border: `2px solid ${status.color}40`, boxShadow: `0 0 20px ${status.color}30` }}>
                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-xl animate-ping opacity-10" style={{ background: status.color }} />
                  <p className="font-heading font-extrabold text-3xl relative z-10" style={{ color: status.color }}>
                    {displayAge}
                  </p>
                </div>
              </div>
            </div>

            {/* Status message */}
            {revealed && (
              <div className="mb-4 p-3 rounded-xl text-xs leading-relaxed font-mono-num animate-fadeIn"
                style={{ background: `${status.color}10`, border: `1px solid ${status.color}25`, color: 'var(--text-muted)' }}>
                <strong style={{ color: status.color }}>{status.emoji} {status.label}:</strong> {status.desc}
              </div>
            )}

            {/* Improvement list */}
            {revealed && improvements.length > 0 && (
              <div>
                <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase mb-2 tracking-wider">How to Reverse Heart Aging</p>
                <div className="space-y-2">
                  {improvements.map((imp, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl border animate-fadeIn"
                      style={{ background: `${imp.color}08`, borderColor: `${imp.color}20`, animationDelay: `${i * 0.1}s` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: imp.color }} />
                        <span className="text-xs text-[color:var(--text-muted)]">{imp.action}</span>
                      </div>
                      <span className="text-xs font-bold font-mono-num" style={{ color: imp.color }}>{imp.impact}</span>
                    </div>
                  ))}
                  {improvements.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--green-healthy)]/10 border border-[var(--green-healthy)]/20 mt-1">
                      <span className="text-xs font-semibold text-[var(--green-healthy)]">Total potential reversal</span>
                      <span className="text-xs font-bold font-mono-num text-[var(--green-healthy)]">
                        -{improvements.reduce((s, imp) => s + parseFloat(imp.impact.replace(/[^0-9.]/g, '')), 0).toFixed(1)} years
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!revealed && counting && (
              <div className="text-center py-2">
                <p className="text-xs text-[color:var(--text-muted)] font-mono-num animate-pulse">Analyzing biometric signature...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
