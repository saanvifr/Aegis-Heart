import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'red' | 'green' | 'none';
  title?: string;
  subtitle?: string;
  icon?: any;
  headerAction?: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  glow = 'none',
  title,
  subtitle,
  icon: Icon,
  headerAction,
}) => {
  const glowClasses: Record<string, string> = {
    cyan: 'border-[var(--accent-cyan)]/30 shadow-[0_0_30px_rgba(255,90,0,0.12)]',
    purple: 'border-[var(--purple-glow)]/30 shadow-[0_0_30px_rgba(242,242,242,0.12)]',
    red: 'border-[var(--danger-rose)]/30 shadow-[0_0_30px_rgba(255,59,48,0.15)]',
    green: 'border-[var(--green-healthy)]/30 shadow-[0_0_30px_rgba(50,215,75,0.12)]',
    none: 'border-[color:var(--glass-border)]',
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 ${glowClasses[glow]} ${className}`}>
      {/* Decorative Cybernetic Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[var(--accent-cyan)]/50 rounded-tl-md pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[var(--accent-cyan)]/50 rounded-tr-md pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[var(--accent-cyan)]/50 rounded-bl-md pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[var(--accent-cyan)]/50 rounded-br-md pointer-events-none" />

      {(title || subtitle || Icon) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[color:var(--glass-border)]">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-[color:var(--glass-border)] text-[var(--accent-cyan)] border border-[color:var(--glass-border)]">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h4 className="font-heading font-bold text-lg text-[color:var(--text-main)] tracking-wide">{title}</h4>}
              {subtitle && <p className="text-xs text-[color:var(--text-muted)] font-mono-num">{subtitle}</p>}
            </div>
          </div>
          {headerAction}
        </div>
      )}

      {children}
    </div>
  );
};
