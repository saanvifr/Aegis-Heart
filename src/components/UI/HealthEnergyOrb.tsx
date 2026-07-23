import React from 'react';

interface HealthEnergyOrbProps {
  score: number; // 0 to 100
  label?: string;
}

export const HealthEnergyOrb: React.FC<HealthEnergyOrbProps> = ({ score, label = "BIOMETRIC HEALTH INDEX" }) => {
  const getOrbColor = () => {
    if (score >= 75) return 'from-[var(--green-healthy)] via-[var(--accent-cyan)] to-[var(--purple-glow)]';
    if (score >= 45) return 'from-[var(--warning-amber)] via-[#FF9100] to-[var(--purple-glow)]';
    return 'from-[var(--danger-rose)] via-[#FF3D71] to-[var(--purple-glow)]';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Outer glowing pulsing atmosphere */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${getOrbColor()} opacity-40 blur-xl animate-pulse-slow`} />

        {/* Animated Fluid Orb Sphere */}
        <div className={`relative w-28 h-28 rounded-full bg-gradient-to-tr ${getOrbColor()} p-1 shadow-2xl flex items-center justify-center overflow-hidden border border-white/20`}>
          {/* Inner animated liquid motion mesh */}
          <div className="absolute inset-0 bg-[color:var(--bg-dark)]/70 rounded-full backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold font-heading text-[color:var(--text-main)]">{score}</span>
            <span className="text-[9px] font-mono-num text-[var(--accent-cyan)] tracking-widest uppercase">/ 100 PTS</span>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] font-mono-num text-[color:var(--text-muted)] uppercase tracking-widest text-center">{label}</p>
    </div>
  );
};
