import React, { useState } from 'react';
import { 
  Cpu, Sparkles, Activity, Award, Clock, Sliders, 
  BookOpen, Search, Bell, Sun, Moon, Zap, Palette 
} from 'lucide-react';
import { useAuth, ThemeMode } from '../../context/AuthContext';
import { SearchModal } from './SearchModal';
import { NotificationDrawer } from './NotificationDrawer';

interface AegisOSDockProps {
  currentRoom: string;
  onNavigate: (room: string) => void;
}

export const AegisOSDock: React.FC<AegisOSDockProps> = ({ currentRoom, onNavigate }) => {
  const { theme, setTheme, notifications } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const dockApps = [
    { id: 'dashboard', label: 'Command Core', icon: Cpu },
    { id: 'lab', label: '3D Heart Lab', icon: Sparkles },
    { id: 'mllab', label: 'ML Research Lab', icon: Activity },
    { id: 'missions', label: 'Missions & Levels', icon: Award },
    { id: 'calendar', label: 'Calendar & Journal', icon: Clock },
    { id: 'simulator', label: 'Lifestyle Sandbox', icon: Sliders },
    { id: 'doctor', label: 'Doctor Core', icon: BookOpen },
  ];

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['dark', 'cyber', 'aurora', 'light', 'medical'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <>
      {/* Floating Bottom OS Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          
          {/* Main App Launch Icons */}
          {dockApps.map((app) => {
            const Icon = app.icon;
            const isActive = currentRoom === app.id;
            return (
              <button
                key={app.id}
                onClick={() => onNavigate(app.id)}
                className={`relative group p-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-tr from-[var(--accent-cyan)]/30 to-[var(--purple-glow)]/30 text-[var(--accent-cyan)] scale-110 shadow-[0_0_20px_rgba(0,245,255,0.4)] border border-[var(--accent-cyan)]/50'
                    : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[color:var(--glass-border)] hover:scale-110'
                }`}
                title={app.label}
              >
                <Icon className="w-5 h-5" />
                
                {/* Hover Tooltip Pill */}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[color:var(--bg-dark)]/90 border border-[color:var(--glass-border)] text-[10px] font-mono-num text-[color:var(--text-main)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {app.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)]" />
                )}
              </button>
            );
          })}

          <div className="w-[1px] h-6 bg-white/15 mx-1" />

          {/* Theme Switcher Button */}
          <button
            onClick={cycleTheme}
            className="p-2.5 rounded-full text-[color:var(--text-muted)] hover:text-[var(--accent-cyan)] hover:bg-[color:var(--glass-border)] transition-all cursor-pointer relative group"
            title={`Current Theme: ${theme.toUpperCase()} (Click to Cycle)`}
          >
            <Palette className="w-5 h-5 text-[var(--purple-glow)]" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[color:var(--bg-dark)]/90 border border-[color:var(--glass-border)] text-[10px] font-mono-num text-[color:var(--text-main)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              THEME: {theme.toUpperCase()}
            </span>
          </button>

          {/* Global Search Button [Ctrl + K] */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 rounded-full text-[color:var(--text-muted)] hover:text-[var(--accent-cyan)] hover:bg-[color:var(--glass-border)] transition-all cursor-pointer relative group"
            title="Global Search (Ctrl + K)"
          >
            <Search className="w-5 h-5 text-[var(--accent-cyan)]" />
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[color:var(--bg-dark)]/90 border border-[color:var(--glass-border)] text-[10px] font-mono-num text-[color:var(--text-main)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              SEARCH [CTRL+K]
            </span>
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="p-2.5 rounded-full text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[color:var(--glass-border)] transition-all cursor-pointer relative group"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger-rose)] animate-ping" />
            )}
          </button>

        </div>
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={onNavigate}
      />

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </>
  );
};
