import React, { useState } from 'react';
import { Search, X, Sparkles, Cpu, Activity, Sliders, Shield, BookOpen, Clock, FileText } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (room: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const items = [
    { id: 'dashboard', title: 'Command Center Dashboard', category: 'Module', icon: Cpu },
    { id: 'lab', title: '3D Digital Heart Inspection Lab', category: 'Laboratory', icon: Sparkles },
    { id: 'mllab', title: 'Machine Learning Research Lab', category: 'Intelligence', icon: Activity },
    { id: 'missions', title: 'Gamified Health Missions & Levels', category: 'Gamification', icon: Shield },
    { id: 'calendar', title: 'Smart Calendar & Daily Digital Journal', category: 'Tracking', icon: Clock },
    { id: 'simulator', title: 'Real-Time Lifestyle Sandbox', category: 'Simulation', icon: Sliders },
    { id: 'doctor', title: 'Doctor Clinical Patient Dashboard', category: 'Clinical', icon: BookOpen },
    { id: 'admin', title: 'Biomedical Admin Core & Dataset Export', category: 'System', icon: FileText },
  ];

  const filtered = items.filter(
    (i) => i.title.toLowerCase().includes(query.toLowerCase()) || i.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-[color:var(--bg-dark)]/80 backdrop-blur-2xl flex items-start justify-center pt-24 p-4 animate-fadeIn">
      <div className="w-full max-w-xl glass-panel p-6 rounded-3xl border border-[var(--accent-cyan)]/30 shadow-[0_0_50px_rgba(0,245,255,0.2)]">
        
        <div className="flex items-center gap-3 pb-4 border-b border-[color:var(--glass-border)]">
          <Search className="w-5 h-5 text-[var(--accent-cyan)]" />
          <input
            type="text"
            autoFocus
            placeholder="Search Aegis OS commands, labs, reports, or patients... (Ctrl + K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none font-mono-num text-sm text-[color:var(--text-main)] placeholder-gray-500"
          />
          <button onClick={onClose} className="p-1 rounded-full text-[color:var(--text-muted)] hover:text-[color:var(--text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-80 overflow-y-auto font-mono-num text-xs">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-[color:var(--glass-border)] hover:bg-[var(--accent-cyan)]/10 hover:border-[var(--accent-cyan)]/40 border border-[color:var(--glass-border)] flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[color:var(--glass-border)] text-[var(--accent-cyan)] group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[color:var(--text-main)] block">{item.title}</span>
                    <span className="text-[10px] text-[color:var(--text-muted)]">{item.category}</span>
                  </div>
                </div>
                <span className="text-[10px] text-[var(--accent-cyan)] opacity-0 group-hover:opacity-100 transition-opacity">
                  LAUNCH ↵
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
