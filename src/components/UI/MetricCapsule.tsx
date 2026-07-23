import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCapsuleProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  statusColor?: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  subtext?: string;
  trend?: string;
}

export const MetricCapsule: React.FC<MetricCapsuleProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  statusColor = 'cyan',
  subtext,
  trend,
}) => {
  const colorMap = {
    cyan: 'text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30 bg-[var(--accent-cyan)]/10 shadow-[0_0_15px_rgba(255,90,0,0.15)]',
    green: 'text-[var(--green-healthy)] border-[var(--green-healthy)]/30 bg-[var(--green-healthy)]/10 shadow-[0_0_15px_rgba(50,215,75,0.15)]',
    amber: 'text-[var(--warning-amber)] border-[var(--warning-amber)]/30 bg-[var(--warning-amber)]/10 shadow-[0_0_15px_rgba(255,159,10,0.15)]',
    red: 'text-[var(--danger-rose)] border-[var(--danger-rose)]/30 bg-[var(--danger-rose)]/10 shadow-[0_0_15px_rgba(255,59,48,0.15)]',
    purple: 'text-[var(--purple-glow)] border-[var(--purple-glow)]/30 bg-[var(--purple-glow)]/10 shadow-[0_0_15px_rgba(242,242,242,0.15)]',
  };

  const iconBgMap = {
    cyan: 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]',
    green: 'bg-[var(--green-healthy)]/20 text-[var(--green-healthy)]',
    amber: 'bg-[var(--warning-amber)]/20 text-[var(--warning-amber)]',
    red: 'bg-[var(--danger-rose)]/20 text-[var(--danger-rose)]',
    purple: 'bg-[var(--purple-glow)]/20 text-[var(--purple-glow)]',
  };

  return (
    <div className="glass-panel-interactive px-5 py-3.5 rounded-full flex items-center justify-between border border-[color:var(--glass-border)] shadow-lg group hover:scale-[1.02] transition-transform">
      <div className="flex items-center gap-3.5">
        <div className={`p-2.5 rounded-full ${iconBgMap[statusColor]} transition-transform group-hover:rotate-12`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-mono-num text-[color:var(--text-muted)] uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-heading text-[color:var(--text-main)] tracking-tight">{value}</span>
            {unit && <span className="text-xs text-[color:var(--text-muted)] font-mono-num">{unit}</span>}
          </div>
        </div>
      </div>

      {(subtext || trend) && (
        <div className="text-right pl-2 border-l border-[color:var(--glass-border)] hidden sm:block">
          {trend && <div className={`text-xs font-mono-num font-semibold ${colorMap[statusColor].split(' ')[0]}`}>{trend}</div>}
          {subtext && <div className="text-[10px] text-[color:var(--text-muted)] font-mono-num">{subtext}</div>}
        </div>
      )}
    </div>
  );
};
