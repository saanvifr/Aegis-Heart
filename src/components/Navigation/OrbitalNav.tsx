import React, { useState, useRef, useEffect } from 'react';
import {
  Activity, Shield, Sliders, BarChart3, Clock, FileText,
  User, LogIn, LogOut, Sparkles, Cpu, Menu, X,
  Sun, Moon, Zap, Droplets, Brain, Target, Trophy,
  HeartPulse, Palette, UtensilsCrossed, BedDouble, ChevronDown
} from 'lucide-react';
import { useAuth, ThemeMode } from '../../context/AuthContext';

interface OrbitalNavProps {
  currentRoom: string;
  onNavigate: (room: string) => void;
  user?: { name: string; email: string } | null;
  onOpenAuth: () => void;
}

const THEMES: { id: ThemeMode; label: string; color: string }[] = [
  { id: 'dark',    label: 'Noir Rose',  color: '#E879A0' },
  { id: 'light',   label: 'Warm Blush', color: '#DB2777' },
  { id: 'cyber',   label: 'Cyber',      color: '#00E5FF' },
  { id: 'aurora',  label: 'Aurora',     color: '#8B5CF6' },
  { id: 'medical', label: 'Medical',    color: '#0066CC' },
];

export const OrbitalNav: React.FC<OrbitalNavProps> = ({
  currentRoom, onNavigate, user, onOpenAuth,
}) => {
  const [isOrbitalMenuOpen, setIsOrbitalMenuOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme, logout } = useAuth();
  const themeRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setIsThemePickerOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const primaryRooms = [
    { id: 'landing',    label: 'Home',       icon: Sparkles },
    { id: 'assessment', label: 'Assess',     icon: Activity },
    { id: 'dashboard',  label: 'Dashboard',  icon: Cpu },
    { id: 'simulator',  label: 'Simulate',   icon: Sliders },
  ];

  const allRooms = [
    { id: 'landing',      label: 'Home',          icon: Sparkles,      group: 'Core' },
    { id: 'assessment',   label: 'Risk Assessment',icon: Activity,      group: 'Core' },
    { id: 'dashboard',    label: 'Dashboard',      icon: Cpu,           group: 'Core' },
    { id: 'simulator',    label: 'Lifestyle Sim',  icon: Sliders,       group: 'Core' },
    { id: 'analytics',    label: 'Analytics',      icon: BarChart3,     group: 'Core' },
    { id: 'water',        label: 'Water Tracker',  icon: Droplets,      group: 'Health' },
    { id: 'sleep',        label: 'Sleep Tracker',  icon: BedDouble,     group: 'Health' },
    { id: 'mood',         label: 'Mood Journal',   icon: Brain,         group: 'Health' },
    { id: 'nutrition',    label: 'Nutrition Log',  icon: UtensilsCrossed, group: 'Health' },
    { id: 'goals',        label: 'Goals',          icon: Target,        group: 'Progress' },
    { id: 'achievements', label: 'Achievements',   icon: Trophy,        group: 'Progress' },
    { id: 'missions',     label: 'Missions',       icon: Zap,           group: 'Progress' },
    { id: 'timeline',     label: 'Health Timeline',icon: Clock,         group: 'History' },
    { id: 'mllab',        label: 'ML Lab',         icon: Cpu,           group: 'Lab' },
    { id: 'lab',          label: 'Heart Lab',      icon: HeartPulse,    group: 'Lab' },
    { id: 'reports',      label: 'PDF Report',     icon: FileText,      group: 'Lab' },
    { id: 'doctor',       label: 'Doctor View',    icon: Shield,        group: 'Admin' },
    { id: 'admin',        label: 'Admin Core',     icon: Shield,        group: 'Admin' },
  ];

  const groups = ['Core', 'Health', 'Progress', 'History', 'Lab', 'Admin'];

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <>
      {/* ── Top Floating Command Bar ─────────────────────────────── */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-6xl">
        <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl">

          {/* Logo */}
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--danger-rose)] via-[var(--purple-glow)] to-[var(--accent-cyan)] animate-spin-slow opacity-90" />
              <div className="absolute inset-[2px] bg-[color:var(--bg-dark)] rounded-[10px] z-10" />
              <HeartPulse className="relative z-20 w-4 h-4 text-[var(--accent-cyan)] group-hover:scale-110 transition-transform" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-extrabold text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--text-main)] to-[var(--accent-cyan)] whitespace-nowrap">
                AEGIS HEART
              </span>
              <div className="text-[9px] text-[color:var(--text-muted)] font-mono-num whitespace-nowrap -mt-0.5">
                CARDIOVASCULAR OS v4.5
              </div>
            </div>
          </div>

          {/* Desktop Nav Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-[color:var(--glass-border)] p-1 rounded-xl">
            {primaryRooms.map((room) => {
              const Icon = room.icon;
              const isActive = currentRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => onNavigate(room.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] hover:bg-[color:var(--card-hover)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{room.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Theme Picker */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl glass-panel border border-[color:var(--glass-border)] text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] transition-all text-xs cursor-pointer"
                title="Switch Theme"
              >
                <div className="w-3 h-3 rounded-full" style={{ background: currentTheme.color }} />
                <span className="hidden sm:inline font-mono-num text-[10px]">{currentTheme.label}</span>
                <Palette className="w-3.5 h-3.5" />
              </button>
              {isThemePickerOpen && (
                <div className="absolute top-full right-0 mt-2 glass-panel rounded-xl p-2 shadow-xl border border-[color:var(--glass-border)] z-50 min-w-[150px] animate-fadeIn">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setIsThemePickerOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                        theme === t.id
                          ? 'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]'
                          : 'text-[color:var(--text-muted)] hover:bg-[color:var(--card-hover)] hover:text-[color:var(--text-main)]'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                      <span className="font-mono-num">{t.label}</span>
                      {theme === t.id && <span className="ml-auto text-[8px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User / Auth */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-[color:var(--glass-border)] text-xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[var(--accent-cyan)] to-[var(--purple-glow)] flex items-center justify-center text-white font-bold text-[10px]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-[color:var(--text-main)] font-medium max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[color:var(--text-muted)]" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 glass-panel rounded-xl p-2 shadow-xl border border-[color:var(--glass-border)] z-50 min-w-[180px] animate-fadeIn">
                    <div className="px-3 py-2 border-b border-[color:var(--glass-border)] mb-1">
                      <p className="text-xs font-semibold text-[color:var(--text-main)]">{user.name}</p>
                      <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num">{user.email}</p>
                    </div>
                    <button onClick={() => { onNavigate('achievements'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--card-hover)] hover:text-[color:var(--text-main)] transition-all">
                      <Trophy className="w-3.5 h-3.5" /> Achievements
                    </button>
                    <button onClick={() => { onNavigate('goals'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[color:var(--text-muted)] hover:bg-[color:var(--card-hover)] hover:text-[color:var(--text-main)] transition-all">
                      <Target className="w-3.5 h-3.5" /> My Goals
                    </button>
                    <div className="border-t border-[color:var(--glass-border)] mt-1 pt-1">
                      <button
                        onClick={() => { logout(); onNavigate('landing'); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--danger-rose)] hover:bg-[var(--danger-rose)]/10 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] text-white hover:opacity-90 transition-all shadow-lg cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setIsOrbitalMenuOpen(!isOrbitalMenuOpen)}
              className="w-9 h-9 rounded-xl glass-panel border border-[var(--accent-cyan)]/30 flex items-center justify-center text-[var(--accent-cyan)] cursor-pointer hover:bg-[var(--accent-cyan)]/10 transition-all"
              title="All Modules"
            >
              {isOrbitalMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Full-Screen Module Matrix ────────────────────────────── */}
      {isOrbitalMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[color:var(--bg-dark)]/90 backdrop-blur-2xl flex items-center justify-center animate-fadeIn">
          <div className="relative w-full max-w-4xl px-6 py-8 overflow-y-auto max-h-screen">
            <div className="text-center mb-8">
              <h3 className="font-heading text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--purple-glow)] tracking-widest uppercase">
                Aegis OS — Module Matrix
              </h3>
              <p className="text-xs text-[color:var(--text-muted)] font-mono-num mt-1">SELECT A MODULE TO NAVIGATE</p>
            </div>

            {groups.map(group => {
              const groupRooms = allRooms.filter(r => r.group === group);
              return (
                <div key={group} className="mb-6">
                  <p className="text-[10px] text-[color:var(--text-muted)] font-mono-num uppercase tracking-widest mb-3 px-1">
                    — {group} —
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {groupRooms.map((room) => {
                      const Icon = room.icon;
                      const isActive = currentRoom === room.id;
                      return (
                        <button
                          key={room.id}
                          onClick={() => { onNavigate(room.id); setIsOrbitalMenuOpen(false); }}
                          className={`glass-panel-interactive p-4 rounded-2xl flex flex-col items-center gap-2.5 text-center ${
                            isActive ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10' : ''
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${isActive ? 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]' : 'bg-[color:var(--glass-border)] text-[color:var(--text-muted)]'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-semibold ${isActive ? 'text-[var(--accent-cyan)]' : 'text-[color:var(--text-muted)]'}`}>
                            {room.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="text-center mt-6">
              <button
                onClick={() => setIsOrbitalMenuOpen(false)}
                className="px-6 py-2 rounded-full text-xs font-mono-num text-[color:var(--text-muted)] hover:text-[color:var(--text-main)] glass-panel border border-[color:var(--glass-border)] transition-all"
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
