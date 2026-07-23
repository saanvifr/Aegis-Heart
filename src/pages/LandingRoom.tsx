import React from 'react';
import { HolographicChamber } from '../components/3D/HolographicChamber';
import { 
  Sparkles, Activity, Sliders, Shield, Cpu, ArrowRight, 
  Layers, CheckCircle2, Lock, Zap, FileText 
} from 'lucide-react';

interface LandingRoomProps {
  onStartAssessment: () => void;
  onNavigate: (room: string) => void;
}

export const LandingRoom: React.FC<LandingRoomProps> = ({
  onStartAssessment,
  onNavigate,
}) => {
  const features = [
    {
      icon: Cpu,
      title: '3D Digital Twin',
      desc: 'Real-time WebGL interactive anatomical heart twin reflecting arterial strain & rhythm.',
      room: 'dashboard',
    },
    {
      icon: Activity,
      title: 'ML Risk Engine',
      desc: 'Ensemble trained on Kaggle Indian Population data with multi-model metric auto-selection.',
      room: 'assessment',
    },
    {
      icon: Sliders,
      title: 'Lifestyle Sandbox',
      desc: 'Real-time risk simulation sliders updating heart state & biometric deltas instantly.',
      room: 'simulator',
    },
    {
      icon: Layers,
      title: 'SHAP Explainability',
      desc: 'Transparent machine learning feature attributions showing positive and negative drivers.',
      room: 'analytics',
    },
    {
      icon: Zap,
      title: 'Space-Grade Telemetry',
      desc: 'Custom glassmorphic charts, BP trends, BMI trajectories, and population metrics.',
      room: 'analytics',
    },
    {
      icon: FileText,
      title: 'Clinical PDF Export',
      desc: 'One-click downloadable clinical reports with patient data and risk recommendations.',
      room: 'reports',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center">
      
      {/* HERO SECTION */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[75vh] py-8">
        
        {/* Hero Left Content */}
        <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[color:var(--glass-border)] border border-[var(--accent-cyan)]/30 text-[var(--accent-cyan)] text-xs font-mono-num mb-6 shadow-[0_0_15px_rgba(0,245,255,0.15)]">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>2045 PREVENTIVE CARDIOVASCULAR INTELLIGENCE</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-[color:var(--text-main)] mb-4 leading-[1.08]">
            Predict.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--purple-glow)] to-[var(--danger-rose)]">
              Simulate.
            </span>{' '}
            Prevent.
          </h1>

          <p className="text-[color:var(--text-muted)] text-base sm:text-lg mb-8 max-w-xl font-light leading-relaxed">
            Welcome to the command center of futuristic biomedical science. Powered by Kaggle Indian Population Machine Learning models, 3D Digital Twin visualization, and explainable SHAP attributions.
          </p>

          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onStartAssessment}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-bold bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--purple-glow)] to-[var(--danger-rose)] text-[color:var(--text-main)] hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(0,245,255,0.35)] cursor-pointer w-full sm:w-auto"
            >
              <Activity className="w-5 h-5 animate-pulse" />
              <span>START RISK ASSESSMENT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center gap-2 px-7 py-4 rounded-full text-sm font-semibold glass-panel border border-white/20 text-[color:var(--text-main)] hover:border-[var(--accent-cyan)]/50 transition-all cursor-pointer w-full sm:w-auto"
            >
              <span>EXPLORE COMMAND CENTER</span>
            </button>
          </div>

          {/* Quick HUD Highlights */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-[color:var(--glass-border)] w-full font-mono-num text-xs">
            <div>
              <span className="text-[var(--accent-cyan)] font-bold text-lg block">94.8%</span>
              <span className="text-[color:var(--text-muted)]">ML ROC-AUC</span>
            </div>
            <div>
              <span className="text-[var(--green-healthy)] font-bold text-lg block">3,200+</span>
              <span className="text-[color:var(--text-muted)]">INDIAN RECORDS</span>
            </div>
            <div>
              <span className="text-[var(--purple-glow)] font-bold text-lg block">60 FPS</span>
              <span className="text-[color:var(--text-muted)]">3D WEBGL TWIN</span>
            </div>
          </div>
        </div>

        {/* Hero Right: 3D Holographic Heart Centerpiece */}
        <div className="lg:col-span-6 relative w-full h-[450px] sm:h-[520px] flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent-cyan)]/15 via-[var(--purple-glow)]/10 to-transparent rounded-full blur-3xl" />
          <HolographicChamber riskState="healthy" riskScore={18.5} />
        </div>

      </div>

      {/* FEATURE GRID SECTION */}
      <div className="w-full mt-20 pt-10 border-t border-[color:var(--glass-border)]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[color:var(--text-main)] mb-3">
            BIOMEDICAL COMMAND CAPABILITIES
          </h2>
          <p className="text-xs font-mono-num text-[color:var(--text-muted)] uppercase tracking-widest">
            ENGINEERED WITH JARVIS + APPLE VISION PRO + NOTHING OS DESIGN LANGUAGE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(feat.room)}
                className="glass-panel-interactive p-6 rounded-3xl flex flex-col items-start cursor-pointer group"
              >
                <div className="p-3 rounded-2xl bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[color:var(--text-main)] mb-2 group-hover:text-[var(--accent-cyan)] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-[color:var(--text-muted)] leading-relaxed font-mono-num mb-4">
                  {feat.desc}
                </p>
                <div className="mt-auto flex items-center gap-1.5 text-xs text-[var(--accent-cyan)] font-mono-num font-semibold">
                  <span>LAUNCH MODULE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MANDATORY MEDICAL DISCLAIMER BANNER */}
      <div className="w-full mt-16 p-6 rounded-3xl glass-panel border border-[var(--danger-rose)]/40 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[var(--danger-rose)]/5">
        <div className="p-3 rounded-full bg-[var(--danger-rose)]/20 text-[var(--danger-rose)]">
          <Shield className="w-6 h-6" />
        </div>
        <div className="text-xs font-mono-num text-[color:var(--text-muted)] leading-relaxed">
          <strong className="text-[var(--danger-rose)] uppercase tracking-wider block mb-1">
            MANDATORY MEDICAL DISCLAIMER
          </strong>
          Aegis Heart provides preventive cardiovascular risk assessments powered by machine learning for educational and informational purposes only. It is not a medical device and must not be used as a substitute for diagnosis, treatment, or advice from a qualified healthcare professional.
        </div>
      </div>

    </div>
  );
};
