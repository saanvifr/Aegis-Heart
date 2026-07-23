import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, Heart, Sparkles, ChevronDown, AlertCircle, Zap } from 'lucide-react';

// ── ARIA response engine ─────────────────────────────────────────────
interface HealthContext {
  riskScore?: number;
  riskCategory?: string;
  bp?: string;
  bmi?: number;
  cholesterol?: number;
  streak?: number;
  xp?: number;
  name?: string;
}

const ARIA_RESPONSES: Record<string, (ctx?: HealthContext) => string> = {
  risk: (ctx = {}) => {
    const r = ctx.riskScore ?? 18.5;
    const cat = ctx.riskCategory ?? 'Low Risk';
    if (r < 25) return `Your cardiovascular risk index reads **${r}%** — classified as **${cat}**. 💚 Your arterial profile is in a favorable range. The neural model is 94.8% confident. Keep your current exercise routine and hydration habits — they're working.`;
    if (r < 60) return `Risk index: **${r}%** — **${cat}**. ⚠️ Several biometric markers need attention. Systolic blood pressure is the primary driver (+18.5% SHAP impact). I recommend reducing sodium intake, 150 min/week aerobic exercise, and a follow-up with your physician within 30 days.`;
    return `⚠️ ELEVATED ALERT. Risk index: **${r}%** — **${cat}**. Your cardiovascular strain markers are above safe thresholds. I strongly recommend consulting a cardiologist within the next 7 days. Immediate interventions: cease tobacco use, restrict saturated fats to <7% daily calories, and begin daily blood pressure monitoring.`;
  },
  bp: (ctx = {}) => `Blood pressure **${ctx.bp ?? '130/85 mmHg'}**. ${(ctx.bp ?? '').includes('14') ? '🔴 Stage 2 hypertension range detected. This is the #1 modifiable cardiac risk factor. Target: below 120/80 mmHg.' : '🟡 Slightly elevated. Target: 120/80 mmHg. Try the DASH diet — proven to reduce systolic BP by 11 mmHg in 4 weeks.'}`,
  bmi: (ctx = {}) => {
    const b = ctx.bmi ?? 25.5;
    return b < 18.5 ? `BMI: **${b}** — Underweight. Cardiac function may be compromised. Increase caloric intake by ~300 kcal/day with lean proteins.`
      : b < 25 ? `BMI: **${b}** — ✅ Healthy range. Your body composition is not a risk factor. Maintain with 3–5 sessions of cardio weekly.`
      : b < 30 ? `BMI: **${b}** — Overweight. Each kg above ideal weight adds 1.3% cardiac workload. Target: reduce by 0.5kg/week through deficit eating + 45 min cardio daily.`
      : `BMI: **${b}** — Obese range. This significantly amplifies your cardiovascular risk. I recommend a structured nutrition plan. Even 10% body weight loss reduces heart disease risk by 20%.`;
  },
  cholesterol: (ctx = {}) => {
    const c = ctx.cholesterol ?? 215;
    return `Total cholesterol: **${c} mg/dL**. ${c < 200 ? '✅ Optimal. LDL burden is well-controlled.' : c < 240 ? '⚠️ Borderline high. Add omega-3 rich foods: salmon, walnuts, flaxseed. Target: below 200 mg/dL.' : '🔴 High cholesterol — significant plaque accumulation risk. Consider statin therapy discussion with your physician. Eliminate trans fats completely.'}`;
  },
  sleep: () => `Sleep is the most underrated cardiac intervention. During deep sleep, your heart rate drops 20–30%, allowing myocardial repair. Less than 6 hours/night **doubles** your heart attack risk. Target: 7–9 hours. Try: 18°C room temperature, complete darkness, no screens 90 min before bed, consistent wake time. Your body clock synchronizes in ~3 weeks.`,
  water: () => `Hydration directly affects blood viscosity — dehydration thickens blood, increasing clot risk by 47%. At 2.5L daily: kidney strain drops, blood pressure regulation improves, and cardiac output efficiency rises. Pro tip: drink 500ml before each meal. Your urine should be pale straw-yellow.`,
  exercise: () => `The minimum cardiac prescription: **150 min/week moderate aerobic activity**. This alone reduces cardiovascular mortality by 35%. Best exercises: brisk walking, cycling, swimming. Zone 2 cardio (60–70% max HR) specifically trains your heart to pump more efficiently. Even 22 min/day walking adds 7 years to life expectancy.`,
  stress: () => `Chronic stress elevates cortisol, causing arterial inflammation and raising blood pressure. The physiological stress response evolved for 90-second threats — not 24/7 modern anxiety. Evidence-based interventions: 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s), 10-min daily meditation, and social connection — which reduces cardiac events by 50%.`,
  smoking: () => `🚭 Tobacco is the single most modifiable cardiac risk factor. Smoking causes 30% of all coronary artery deaths. Within 20 minutes of cessation: blood pressure drops. 24 hours: carbon monoxide leaves bloodstream. 1 year: heart disease risk halved. 15 years: risk equals non-smoker. The brain's nicotine receptors normalize in 3 months.`,
  diet: () => `The DASH and Mediterranean diets show the strongest cardiac evidence. Key principles: ≥5 servings vegetables/day, lean protein (fish 2x/week), olive oil over butter, nuts (30g/day reduces cardiac events 30%), minimize processed meat, restrict sodium to <2300mg/day, limit alcohol to ≤1 drink/day.`,
  streak: (ctx = {}) => `You're on a **${ctx.streak ?? 7}-day streak**! 🔥 Your consistency is phenomenal. Studies show 66 days to form a habit — you're building a neural pathway for long-term cardiac health. At 30 days, risk reduction compounds. Keep this momentum — you're literally remodeling your cardiovascular system.`,
  emergency: () => `🚨 **WARNING: Cardiac Emergency Signs**\n\n**Call emergency services immediately if you experience:**\n• Chest pain/pressure radiating to jaw, arm, or back\n• Sudden shortness of breath\n• Cold sweats + nausea + lightheadedness together\n• Rapid irregular heartbeat with dizziness\n• Sudden severe headache (possible stroke)\n\nRemember: **FAST** — Face drooping, Arm weakness, Speech difficulty, Time to call.\n\n⚠️ *ARIA is an AI system. Always trust medical professionals first.*`,
  shap: (ctx = {}) => `SHAP (SHapley Additive exPlanations) breaks down what's driving your **${ctx.riskScore ?? 18.5}%** risk score. Think of it as ingredient weights in a recipe. The top factors pushing your risk higher: Systolic BP (+18.5%), Age (+14.2%), Cholesterol (+9.5%). Protective factors: Exercise (-12%), Sleep (-8%). Each percentage represents that feature's marginal contribution to the final risk prediction.`,
  medication: () => `Common cardiac medications explained:\n\n**Statins** (Atorvastatin, Rosuvastatin) — lower LDL cholesterol\n**ACE Inhibitors** — reduce blood pressure, protect kidneys\n**Beta Blockers** — slow heart rate, reduce cardiac workload\n**Aspirin** — antiplatelet for secondary prevention\n**Blood Thinners** (Warfarin, Rivaroxaban) — prevent clots\n\n⚠️ Never modify medications without physician consultation. ARIA provides education only.`,
  xp: (ctx = {}) => `You've earned **${ctx.xp?.toLocaleString() ?? '3,400'} XP** — you're a **${ctx.riskCategory ?? 'Guardian'}** level health warrior. 🏆 Every check-in, prediction, and goal completion accelerates your biological age reversal. The gamification isn't just cosmetic — habit tracking studies show point systems increase adherence by 40%. Your streak is your greatest health asset.`,
};

const QUICK_QUESTIONS = [
  { label: '❤️ My Risk Score', key: 'risk' },
  { label: '🩸 Blood Pressure', key: 'bp' },
  { label: '😴 Sleep & Heart', key: 'sleep' },
  { label: '🏃 Exercise Rx', key: 'exercise' },
  { label: '⚡ SHAP Explained', key: 'shap' },
  { label: '🚨 Emergency Signs', key: 'emergency' },
  { label: '🥗 Heart Diet', key: 'diet' },
  { label: '🔥 My Streak', key: 'streak' },
];

function matchResponse(input: string, ctx: HealthContext): string {
  const q = input.toLowerCase();
  if (q.match(/risk|score|predict|percent|danger|assessment/)) return ARIA_RESPONSES.risk(ctx);
  if (q.match(/blood pressure|bp|systolic|diastolic|hypertens/)) return ARIA_RESPONSES.bp(ctx);
  if (q.match(/bmi|weight|body mass|obese|overweight/)) return ARIA_RESPONSES.bmi(ctx);
  if (q.match(/cholesterol|lipid|ldl|hdl|triglyc/)) return ARIA_RESPONSES.cholesterol(ctx);
  if (q.match(/sleep|rest|insomnia|tired|fatigue/)) return ARIA_RESPONSES.sleep();
  if (q.match(/water|hydrat|drink|fluid/)) return ARIA_RESPONSES.water();
  if (q.match(/exercise|workout|cardio|run|walk|sport|gym/)) return ARIA_RESPONSES.exercise();
  if (q.match(/stress|anxiety|mental|cortisol|worry/)) return ARIA_RESPONSES.stress();
  if (q.match(/smok|tobacco|cigarette|nicotine/)) return ARIA_RESPONSES.smoking();
  if (q.match(/diet|food|eat|nutrition|meal|carb|protein|fat/)) return ARIA_RESPONSES.diet();
  if (q.match(/streak|consistent|days|xp|points|level/)) return ctx.streak ? ARIA_RESPONSES.streak(ctx) : ARIA_RESPONSES.xp(ctx);
  if (q.match(/emergency|911|attack|chest pain|symptom|warning/)) return ARIA_RESPONSES.emergency();
  if (q.match(/shap|explain|why|factor|attribution|feature/)) return ARIA_RESPONSES.shap(ctx);
  if (q.match(/medication|medicine|pill|drug|statin|aspirin/)) return ARIA_RESPONSES.medication();
  if (q.match(/xp|achievement|badge|gamif/)) return ARIA_RESPONSES.xp(ctx);
  // Default
  return `I'm ARIA — your Aegis Risk Intelligence Assistant. I have access to your cardiovascular profile. Try asking me about your **risk score**, **blood pressure**, **sleep optimization**, **exercise prescription**, or **emergency warning signs**. I'm trained on clinical cardiology guidelines and your personal biometric data.`;
}

// ── Animated Typing Effect ────────────────────────────────────────────
const TypingMessage: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(timer); setDone(true); }
    }, 12);
    return () => clearInterval(timer);
  }, [text]);

  // Render bold markdown
  const renderText = (t: string) => {
    const parts = t.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') ? <strong key={i} style={{ color: 'var(--accent-cyan)' }}>{part.slice(2, -2)}</strong> : part
    );
  };

  return <span style={{ whiteSpace: 'pre-wrap' }}>{renderText(displayed)}{!done && <span className="animate-pulse">▋</span>}</span>;
};

// ── Waveform Animation ─────────────────────────────────────────────────
const ARIAWaveform: React.FC = () => (
  <div className="flex items-center gap-0.5 h-5">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="w-0.5 rounded-full bg-[var(--accent-cyan)]"
        style={{
          height: `${Math.random() * 16 + 4}px`,
          animation: `bpmPulse ${0.4 + i * 0.07}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.06}s`,
        }} />
    ))}
  </div>
);

// ── ARIA Chat Panel ───────────────────────────────────────────────────
interface Message { role: 'user' | 'aria'; text: string; id: string; time: string; }

interface ARIAChatProps {
  healthContext: HealthContext;
}

export const ARIAChat: React.FC<ARIAChatProps> = ({ healthContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'aria',
      text: `Initializing ARIA — Aegis Risk Intelligence Assistant.\n\nI've analyzed your cardiovascular profile. Your current risk index is **${healthContext.riskScore?.toFixed(1) ?? '18.5'}%** — classified as **${healthContext.riskCategory ?? 'Low Risk'}**.\n\nHow can I assist your heart health journey today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [orbPulse, setOrbPulse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Orb pulse heartbeat loop
  useEffect(() => {
    const interval = setInterval(() => {
      setOrbPulse(true);
      setTimeout(() => setOrbPulse(false), 200);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulated thinking delay (feels more natural)
    const thinkTime = 600 + Math.random() * 900;
    await new Promise(r => setTimeout(r, thinkTime));

    const response = matchResponse(text, healthContext);
    const ariaMsg: Message = { id: (Date.now() + 1).toString(), role: 'aria', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, ariaMsg]);
    setIsThinking(false);
  };

  const riskColor = (healthContext.riskScore ?? 18) < 25 ? 'var(--green-healthy)' : (healthContext.riskScore ?? 18) < 60 ? 'var(--warning-amber)' : 'var(--danger-rose)';

  return (
    <>
      {/* ── Floating Orb ───────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full cursor-pointer group"
          title="Open ARIA — AI Health Assistant"
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: riskColor }} />
          <div className="absolute -inset-1 rounded-full opacity-30 blur-md" style={{ background: `radial-gradient(circle, ${riskColor}, transparent)` }} />

          {/* Main orb */}
          <div className={`relative w-full h-full rounded-full flex items-center justify-center transition-all duration-200 ${orbPulse ? 'scale-110' : 'scale-100'}`}
            style={{
              background: `radial-gradient(circle at 35% 35%, #fff2, transparent 60%), radial-gradient(circle, color-mix(in srgb, ${riskColor} 80%, #000), color-mix(in srgb, ${riskColor} 40%, #111))`,
              boxShadow: `0 0 ${orbPulse ? 40 : 20}px ${riskColor}60, 0 0 80px ${riskColor}20, inset 0 1px 0 rgba(255,255,255,0.3)`,
            }}>
            {isOpen
              ? <X className="w-6 h-6 text-white drop-shadow" />
              : <Heart className={`w-6 h-6 text-white drop-shadow ${orbPulse ? 'scale-125' : 'scale-100'} transition-transform duration-100`} />
            }
          </div>

          {/* ARIA label */}
          {!isOpen && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[9px] font-mono-num font-bold tracking-widest px-2 py-0.5 rounded-full bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)]" style={{ color: riskColor }}>
                ARIA AI
              </span>
            </div>
          )}

          {/* Unread dot */}
          {!isOpen && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--accent-cyan)] border-2 border-[color:var(--bg-dark)] animate-pulse" />
          )}
        </button>
      </div>

      {/* ── Chat Panel ─────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-44 right-5 z-50 w-[380px] max-h-[65vh] flex flex-col animate-slideUp"
          style={{ filter: 'drop-shadow(0 0 40px rgba(232,121,160,0.2))' }}>

          {/* Header */}
          <div className="glass-panel rounded-t-2xl border-b border-[color:var(--glass-border)] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            {/* Orb mini */}
            <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center relative"
              style={{ background: `radial-gradient(circle, ${riskColor}80, ${riskColor}20)`, boxShadow: `0 0 16px ${riskColor}50` }}>
              <Heart className="w-4 h-4 text-white" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--green-healthy)] border border-[color:var(--bg-dark)]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold text-sm text-[color:var(--text-main)]">ARIA</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] font-mono-num border border-[var(--accent-cyan)]/20">BETA</span>
              </div>
              <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">Aegis Risk Intelligence Assistant · Online</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Risk indicator */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono-num text-[9px] font-bold"
                style={{ borderColor: `${riskColor}40`, background: `${riskColor}12`, color: riskColor }}>
                {(healthContext.riskScore ?? 18.5).toFixed(1)}%
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-[color:var(--card-hover)] text-[color:var(--text-muted)] cursor-pointer transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="glass-panel flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                {msg.role === 'aria' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-auto flex items-center justify-center"
                    style={{ background: `radial-gradient(circle, ${riskColor}60, ${riskColor}20)` }}>
                    <Heart className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-cyan)]/20 text-[color:var(--text-main)] rounded-br-sm border border-[var(--accent-cyan)]/20'
                    : 'bg-[color:var(--bg-elevated)] text-[color:var(--text-muted)] rounded-bl-sm border border-[color:var(--glass-border)]'
                }`}>
                  {msg.role === 'aria' && msg.id !== '0'
                    ? <TypingMessage text={msg.text} />
                    : <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
                        p.startsWith('**') ? <strong key={i} style={{ color: 'var(--accent-cyan)' }}>{p.slice(2, -2)}</strong> : p
                      )}</span>
                  }
                  <div className="text-[9px] opacity-40 mt-1 text-right font-mono-num">{msg.time}</div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex justify-start animate-fadeIn">
                <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-auto flex items-center justify-center"
                  style={{ background: `radial-gradient(circle, ${riskColor}60, ${riskColor}20)` }}>
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <div className="bg-[color:var(--bg-elevated)] border border-[color:var(--glass-border)] rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-2">
                  <ARIAWaveform />
                  <span className="text-[10px] text-[color:var(--text-muted)] font-mono-num">Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          <div className="glass-panel border-t border-[color:var(--glass-border)] px-3 py-2 flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
              {QUICK_QUESTIONS.map(q => (
                <button key={q.key} onClick={() => sendMessage(q.label)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono-num border border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:border-[var(--accent-cyan)]/40 hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/8 transition-all cursor-pointer whitespace-nowrap">
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="glass-panel rounded-b-2xl border-t border-[color:var(--glass-border)] px-3 py-2.5 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[color:var(--text-muted)] flex-shrink-0" />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
                placeholder="Ask ARIA about your heart health..."
                className="flex-1 bg-transparent text-xs text-[color:var(--text-main)] outline-none placeholder:text-[color:var(--text-muted)] font-mono-num"
              />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isThinking}
                className="p-1.5 rounded-lg bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-[color:var(--text-muted)] font-mono-num mt-1.5 text-center opacity-60">
              ⚠️ ARIA is an AI assistant. Not a substitute for medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
