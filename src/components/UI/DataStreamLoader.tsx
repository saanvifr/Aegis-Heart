import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Sparkles, Activity } from 'lucide-react';

interface DataStreamLoaderProps {
  onComplete: () => void;
}

export const DataStreamLoader: React.FC<DataStreamLoaderProps> = ({ onComplete }) => {
  const steps = [
    'Initializing Aegis Cardiovascular Core...',
    'Connecting Kaggle Indian Population Model...',
    'Reading Hemodynamic Bio-indicators & BP...',
    'Evaluating Multi-Factor Lifestyle Stressors...',
    'Executing Scikit-Learn / XGBoost ML Ensemble...',
    'Calculating SHAP Feature Impact Vectors...',
    'Synthesizing 3D Digital Twin Biomarker State...',
    'Assessment Matrix Complete.',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 4000; // 4 seconds total
    const intervalTime = 60;
    const increment = (100 / (totalDuration / intervalTime));

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }

        // Calculate step index proportional to progress
        const stepIdx = Math.min(
          Math.floor((next / 100) * steps.length),
          steps.length - 1
        );
        setCurrentStepIndex(stepIdx);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete, steps.length]);

  return (
    <div className="fixed inset-0 z-50 bg-[color:var(--bg-dark)]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-fadeIn">
      {/* High-tech HUD Matrix Container */}
      <div className="w-full max-w-xl glass-panel p-8 rounded-3xl border border-[var(--accent-cyan)]/30 shadow-[0_0_50px_rgba(0,245,255,0.15)] flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Animated Radial Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,255,0.1)_0,transparent_70%)] pointer-events-none" />

        {/* Central Holographic Spinner Core */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full border-2 border-[var(--accent-cyan)]/20 border-t-[var(--accent-cyan)] animate-spin flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--purple-glow)]/30 border-b-[var(--purple-glow)] animate-spin-reverse flex items-center justify-center">
              <Activity className="w-8 h-8 text-[var(--accent-cyan)] animate-pulse" />
            </div>
          </div>
        </div>

        <h3 className="font-heading text-2xl font-bold text-[color:var(--text-main)] mb-2 tracking-wide">
          DIAGNOSTIC SCAN IN PROGRESS
        </h3>
        <p className="text-xs font-mono-num text-[var(--accent-cyan)] mb-6">
          AEGIS BIOMEDICAL ENGINE v4.5 // ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>

        {/* Diagnostic Progress Percentage Bar */}
        <div className="w-full bg-[color:var(--glass-border)] rounded-full h-3 mb-6 p-0.5 border border-[color:var(--glass-border)] relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--purple-glow)] to-[var(--danger-rose)] rounded-full transition-all duration-100 ease-out shadow-[0_0_15px_rgba(0,245,255,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="w-full flex items-center justify-between text-xs font-mono-num text-[color:var(--text-muted)] mb-6">
          <span>PROGRESS: {Math.round(progress)}%</span>
          <span>PHASE {currentStepIndex + 1} / {steps.length}</span>
        </div>

        {/* Flowing Sequential HUD Log Terminal */}
        <div className="w-full bg-[color:var(--bg-dark)]/80 rounded-2xl p-4 border border-[color:var(--glass-border)] text-left font-mono-num text-xs space-y-2 max-h-40 overflow-y-auto">
          {steps.slice(0, currentStepIndex + 1).map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 ${
                idx === currentStepIndex ? 'text-[var(--accent-cyan)] font-semibold' : 'text-[color:var(--text-muted)]'
              }`}
            >
              {idx === currentStepIndex ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-cyan)]" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-healthy)]" />
              )}
              <span>{msg}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
