import React from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[color:var(--bg-dark)]/60 backdrop-blur-md flex justify-end animate-fadeIn">
      <div className="w-full max-w-sm h-full glass-panel border-l border-[color:var(--glass-border)] p-6 flex flex-col justify-between shadow-2xl">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[color:var(--glass-border)] mb-6">
            <div className="flex items-center gap-2 text-[color:var(--text-main)] font-heading font-bold">
              <Bell className="w-5 h-5 text-[var(--accent-cyan)]" />
              <span>NOTIFICATION STREAM</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 font-mono-num text-xs">
            {notifications.map((n) => (
              <div key={n.id} className="p-3.5 rounded-2xl bg-[color:var(--glass-border)] border border-[color:var(--glass-border)] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--accent-cyan)] uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> SYSTEM ALERT
                  </span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">{n.time}</span>
                </div>
                <p className="text-gray-200 leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[color:var(--glass-border)] text-center font-mono-num text-[10px] text-[color:var(--text-muted)]">
          AEGIS OS TELEMETRY NOTIFICATION FEED
        </div>
      </div>
    </div>
  );
};
