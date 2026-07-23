import React, { useState } from 'react';
import { Clock, Calendar, ArrowRight, Activity, ChevronRight, ShieldAlert, CheckCircle } from 'lucide-react';

export interface TimelineEntry {
  id: string;
  date: string;
  riskPercentage: number;
  riskCategory: string;
  bmi: number;
  bp: string;
  cholesterol: number;
  topFactor: string;
  notes: string;
}

interface TimelineTunnelProps {
  entries: TimelineEntry[];
  onSelectEntry?: (entry: TimelineEntry) => void;
}

export const TimelineTunnel: React.FC<TimelineTunnelProps> = ({ entries, onSelectEntry }) => {
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(entries[0] || null);
  const [compareEntry, setCompareEntry] = useState<TimelineEntry | null>(entries[1] || null);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Horizontal Scrolling Futuristic Tunnel */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-thin">
        {entries.map((item, idx) => {
          const isSelected = selectedEntry?.id === item.id;
          const isCompare = compareEntry?.id === item.id;
          const isHigh = item.riskPercentage > 60;
          const isMed = item.riskPercentage >= 25 && item.riskPercentage <= 60;

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedEntry(item);
                if (onSelectEntry) onSelectEntry(item);
              }}
              className={`min-w-[280px] p-5 rounded-3xl glass-panel-interactive border cursor-pointer relative overflow-hidden transition-all duration-300 ${
                isSelected
                  ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 shadow-[0_0_30px_rgba(0,245,255,0.2)] scale-[1.03]'
                  : isCompare
                  ? 'border-[var(--purple-glow)] bg-[var(--purple-glow)]/10'
                  : 'border-[color:var(--glass-border)]'
              }`}
            >
              {/* Sequence Node Tag */}
              <div className="flex items-center justify-between mb-3 text-xs font-mono-num">
                <span className="text-[color:var(--text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                  {item.date}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[color:var(--glass-border)] text-[color:var(--text-muted)] border border-[color:var(--glass-border)]">
                  #{entries.length - idx}
                </span>
              </div>

              {/* Risk Score */}
              <div className="mb-4">
                <p className="text-[10px] font-mono-num text-[color:var(--text-muted)] uppercase">RISK SCORE</p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-bold font-heading ${
                      isHigh ? 'text-[var(--danger-rose)]' : isMed ? 'text-[var(--warning-amber)]' : 'text-[var(--green-healthy)]'
                    }`}
                  >
                    {item.riskPercentage}%
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)] font-mono-num">{item.riskCategory}</span>
                </div>
              </div>

              {/* Mini Biometrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-num pt-3 border-t border-[color:var(--glass-border)] text-[color:var(--text-muted)]">
                <div>
                  <span className="text-[color:var(--text-muted)] text-[10px] block">BP:</span>
                  <strong>{item.bp}</strong>
                </div>
                <div>
                  <span className="text-[color:var(--text-muted)] text-[10px] block">BMI:</span>
                  <strong>{item.bmi}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Selected Assessment & Delta Comparison Panel */}
      {selectedEntry && (
        <div className="glass-panel p-6 rounded-3xl border border-[var(--accent-cyan)]/30 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h4 className="font-heading font-bold text-lg text-[color:var(--text-main)]">
                ASSESSMENT LOG MATRIX — {selectedEntry.date}
              </h4>
            </div>
            <p className="text-xs text-[color:var(--text-muted)] font-mono-num mb-4">{selectedEntry.notes}</p>
            <div className="space-y-2 text-xs font-mono-num">
              <div className="flex justify-between p-2 rounded-xl bg-[color:var(--glass-border)]">
                <span className="text-[color:var(--text-muted)]">Cholesterol Level:</span>
                <span className="text-[color:var(--text-main)] font-bold">{selectedEntry.cholesterol} mg/dL</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[color:var(--glass-border)]">
                <span className="text-[color:var(--text-muted)]">Primary Risk Driver:</span>
                <span className="text-[var(--warning-amber)] font-bold">{selectedEntry.topFactor}</span>
              </div>
            </div>
          </div>

          {/* Past vs Present Comparison */}
          {compareEntry && compareEntry.id !== selectedEntry.id && (
            <div className="border-t md:border-t-0 md:border-l border-[color:var(--glass-border)] pt-4 md:pt-0 md:pl-6">
              <h5 className="font-heading font-bold text-sm text-[var(--purple-glow)] mb-3 uppercase tracking-wider">
                TRAJECTORY COMPARISON ({selectedEntry.date} VS {compareEntry.date})
              </h5>
              <div className="space-y-3 font-mono-num text-xs">
                <div className="flex justify-between items-center p-2 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20">
                  <span>Risk Score Shift:</span>
                  <span className="font-bold text-[var(--accent-cyan)]">
                    {selectedEntry.riskPercentage - compareEntry.riskPercentage > 0 ? '+' : ''}
                    {(selectedEntry.riskPercentage - compareEntry.riskPercentage).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-[color:var(--glass-border)]">
                  <span>BMI Trajectory:</span>
                  <span>
                    {selectedEntry.bmi} (vs {compareEntry.bmi})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
