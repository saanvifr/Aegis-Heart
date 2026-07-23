import React from 'react';

interface RiskRingProps {
  percentage: number;
  category: string;
  confidence?: number;
  size?: number;
}

export const RiskRing: React.FC<RiskRingProps> = ({
  percentage,
  category,
  confidence = 94.2,
  size = 260,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getTheme = () => {
    if (percentage < 25) {
      return {
        color: 'var(--accent-cyan)',
        glow: 'rgba(0, 245, 255, 0.4)',
        badgeBg: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/40',
        text: 'LOW CARDIOVASCULAR RISK',
      };
    }
    if (percentage < 60) {
      return {
        color: 'var(--warning-amber)',
        glow: 'rgba(255, 193, 7, 0.4)',
        badgeBg: 'bg-[var(--warning-amber)]/10 text-[var(--warning-amber)] border-[var(--warning-amber)]/40',
        text: 'MODERATE RISK DETECTED',
      };
    }
    return {
      color: 'var(--danger-rose)',
      glow: 'rgba(255, 23, 68, 0.5)',
      badgeBg: 'bg-[var(--danger-rose)]/10 text-[var(--danger-rose)] border-[var(--danger-rose)]/40',
      text: 'CRITICAL HIGH RISK STRAIN',
    };
  };

  const theme = getTheme();

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Outer Rotating Futuristic HUD Calibration Ring */}
      <div 
        style={{ width: size + 40, height: size + 40 }}
        className="absolute rounded-full border border-dashed border-[color:var(--glass-border)] animate-spin-slow pointer-events-none"
      />

      {/* Main SVG Circular Ring */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Glowing Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 16px ${theme.glow})`,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center Circular HUD Stats Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <span className="text-[10px] font-mono-num text-[color:var(--text-muted)] uppercase tracking-widest mb-1">
            CARDIO RISK INDEX
          </span>
          <div className="flex items-baseline justify-center font-heading">
            <span className="text-5xl font-extrabold text-[color:var(--text-main)] tracking-tighter" style={{ color: theme.color }}>
              {percentage.toFixed(1)}
            </span>
            <span className="text-xl font-bold ml-0.5" style={{ color: theme.color }}>%</span>
          </div>
          <span className="text-[10px] font-mono-num text-[color:var(--text-muted)] mt-1">
            CONFIDENCE: <strong className="text-[color:var(--text-main)]">{confidence}%</strong>
          </span>
        </div>
      </div>

      {/* Category Pill Tag */}
      <div className={`mt-5 px-4 py-1.5 rounded-full text-xs font-mono-num font-bold uppercase tracking-wider border shadow-md ${theme.badgeBg}`}>
        {category} — {theme.text}
      </div>
    </div>
  );
};
